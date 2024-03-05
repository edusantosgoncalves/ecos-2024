const EnvironmentRepository = require("../repository/Environment");
const VotingUserRepository = require("../repository/VotingUser");
const EnvironmentUtils = require("../utils/Environment");
const APIRequests = require("./APIRequests");

async function updateEnvironmentsVotingStatus() {
  // . Getting all the environments that has the status "waiting_rcr_voting" and the closing_date is less than the current date
  let environments = null;
  try {
    environments =
      await EnvironmentRepository.getDefinitionVoteExpiredEnvironments();
  } catch (e) {
    console.log(e);
    return -1;
  }

  if (environments.length === 0) {
    console.log("CRON: No environments to update definition vote status");
    return false;
  }

  // . Updating the status of the environments
  for (const environment of environments) {
    const definitionData = environment.definition_data;

    // . Getting the votes for the environment
    let votes = null;

    try {
      votes = await VotingUserRepository.getDefinitionVotesOfEnvironment(
        environment.id
      );
    } catch (e) {
      console.log(
        `CRON: Error getting the votes for the environment with ID ${environment.id}`
      );
      continue;
    }

    if (votes === null) {
      console.log(
        `CRON: Error getting the votes for the environment with ID ${environment.id}`
      );
      continue;
    }

    // . Joining all object from the arrays inside votes array into a single array
    votes = votes.flat();

    // . Joining the definition data with the votes
    const priorityData = EnvironmentUtils.joinDefinitionDataWithVotes(
      definitionData,
      votes
    );

    // . Updating the status of the environment and defining priority RCRs
    let updated = null;
    try {
      updated = await EnvironmentRepository.updatePriority(
        environment.id,
        priorityData,
        "rcr_voting_done"
      );
    } catch (e) {
      console.log(e);
      continue;
    }

    if (updated === -1) {
      console.log(
        `CRON: Error updating the status of the environment with ID ${environmentId}`
      );
      continue;
    }

    // . Ending the status of the definitionData for the environment
    let definitionDataUpdated = null;
    try {
      definitionDataUpdated =
        await EnvironmentRepository.endDefinitionVoteForEnvironment(
          environment.id
        );
    } catch (e) {
      console.log(e);
    }

    if (definitionDataUpdated === -1) {
      console.log(
        `CRON: Error ending the definitionData status for the environment with ID ${environmentId}`
      );
    }

    // . Sending the email to the user who created the environment
    const subject = `SECO - RCR: ${environment.name} definition rcr voting completed`;
    let emailText = `The RCR voting for your environment ${environment.name} was completed and processed!`;
    emailText += `<br/>You can log on the system to see the results.\n`;

    try {
      await APIRequests.sendEmail(environment.User.email, subject, emailText);
    } catch (e) {
      console.log(e);
      continue;
    }
  }

  return true;
}

module.exports = { updateEnvironmentsVotingStatus };