const EnvironmentRepository = require("../repository/Environment");
const UserRepository = require("../repository/User");
const APIRequests = require("./APIRequests");
const EnvironmentUtils = require("../utils/Environment");

class Environment {
  static async getAll() {
    try {
      const users = await EnvironmentRepository.getAll();

      return users.length !== 0 ? users : null;
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getById(id) {
    try {
      return await EnvironmentRepository.getById(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getByUserId(userId) {
    try {
      return await EnvironmentRepository.getByUserId(userId);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async create(environment) {
    // * Check if user exists and is active
    const user = await UserRepository.getById(environment.user_id);

    if (!user) {
      return -2;
    }
    if (user.status !== "active") {
      return -3;
    }

    // * Check if the type is organization and the name was provided
    if (
      environment.mining_type === "organization" &&
      !environment.organization_name
    ) {
      return -4;
    }

    // * Create the environment
    let newEnvironment = null;
    try {
      newEnvironment = await EnvironmentRepository.create(environment);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!newEnvironment) {
      return newEnvironment;
    }

    // * Sending e-mail to the user
    const subject = `SECO - RCR: ${environment.name} created`;
    let emailText = `<br/>${user.name}, your environment was created and the mining starts soon!\n`;
    emailText += `<br/><strong>Environment name</strong>: ${environment.name}\n`;
    emailText += `<br/><strong>Mining type</strong>: ${environment.mining_type}\n`;
    emailText += `<br/><strong>Repositories</strong>: ${environment.repos.join(
      ", "
    )}\n`;
    if (environment.mining_type === "organization") {
      emailText += `<br/><strong>Organization name</strong>: ${environment.organization_name}\n`;
    }
    emailText += `<br/><strong>Details</strong>: ${environment.details}\n`;

    try {
      await APIRequests.sendEmail(user.email, subject, emailText);
    } catch (e) {
      console.log(e);
    }

    return newEnvironment;
  }

  static async updateStatus(id, status) {
    try {
      return await EnvironmentRepository.updateStatus(id, status);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async updateMiningData(id, miningData) {
    try {
      await EnvironmentRepository.updateMining(
        id,
        miningData.mining_data,
        miningData.status
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * Sending e-mail to the user
    const environmentUser =
      await EnvironmentRepository.getCreatedUserEmailByEnvironmentId(id);

    const subject = `SECO - RCR: ${environmentUser.name} mining done`;
    let emailText = `<br/>The mining data for your environment ${environmentUser.name} is done!\n`;
    emailText += `<br/>You need to log on the system to request the topics generation.\n`;

    try {
      await APIRequests.sendEmail(
        environmentUser.User.email,
        subject,
        emailText
      );
    } catch (e) {
      console.log(e);
    }

    return true;
  }

  static async updateTopicData(id, topicData) {
    try {
      await EnvironmentRepository.updateTopics(
        id,
        topicData.topic_data,
        topicData.status
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * Sending e-mail to the user
    const environmentUser =
      await EnvironmentRepository.getCreatedUserEmailByEnvironmentId(id);

    const subject = `SECO - RCR: ${environmentUser.name} topics generation done`;
    let emailText = `<br/>The topics for your environment ${environmentUser.name} were generated!\n`;
    emailText += `<br/>You can log on the system to read them.\n`;

    try {
      await APIRequests.sendEmail(
        environmentUser.User.email,
        subject,
        emailText
      );
    } catch (e) {
      console.log(e);
    }

    return true;
  }

  static async updateDefinitionData(id, newDefinitionData) {
    // * Obtaining definition data if exists

    let definitionData = null;
    try {
      definitionData = await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (definitionData === false) return false;

    // * If definition data does not exists, create it
    if (!definitionData) {
      definitionData = { rcrs: [], status: "elaborating", closing_date: None };
    }

    // * Updating definition data
    // . Check if there is an id at the rcrs array
    let newId = 1;
    for (const rcr of definitionData.rcrs) {
      newId = rcr.id + 1;
    }

    newDefinitionData["id"] = newId;
    definitionData.rcrs.push(newDefinitionData);

    // * Updating the environment
    try {
      await EnvironmentRepository.updateDefinition(id, definitionData);
    } catch (e) {
      console.log(e);
      return -1;
    }

    return true;
  }

  static async updateDefinitionDataWithStatus(id, closingDate, status) {
    // * Obtaining definition data if exists
    let definitionData = null;
    try {
      definitionData = await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * If does not exists, return it
    if (!definitionData) return definitionData;

    // * Otherwise, update its closingDate and status
    definitionData.status = status;
    definitionData.closing_date = closingDate;

    // * Updating the environment
    try {
      await EnvironmentRepository.updateDefinition(
        id,
        definitionData,
        "waiting_rcr_voting"
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    return true;
  }

  static async updatePriorityData(id, newPriorityData) {
    /*// * Obtaining priority data if exists
    let priorityData = null;
    try {
      priorityData = await EnvironmentRepository.getPriorityData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (priorityData === false) return false;

    // * If priority data does not exists, create it
    if (!priorityData) {
      priorityData = { issues: [], status: "elaborating", closing_date: None };
    }

    // * Updating priority data
    // . Check if there is an id at the issues array
    let newId = 1;
    for (const issue of priorityData.issues) {
      newId = issue.id + 1;
    }

    newPriorityData["id"] = newId;
    priorityData.issues.push(newPriorityData);
*/
    // * Updating the environment
    try {
      await EnvironmentRepository.updatePriority(id, newPriorityData);

      //await EnvironmentRepository.updatePriority(id, priorityData);
    } catch (e) {
      console.log(e);
      return -1;
    }

    return true;
  }

  static async updatePriorityDataWithStatus(id, closingDate, status) {
    // * Obtaining priority data if exists
    let priorityData = null;
    try {
      priorityData = await EnvironmentRepository.getPriorityData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    // * If does not exists, return it
    if (!priorityData) return priorityData;

    // * Otherwise, update its closingDate and status
    priorityData.status = status;
    priorityData.closing_date = closingDate;

    // * Updating the environment
    try {
      await EnvironmentRepository.updatePriority(
        id,
        priorityData,
        "waiting_rcr_priority"
      );
    } catch (e) {
      console.log(e);
      return -1;
    }

    return true;
  }

  static async updateFinalData(id) {
    // !! IMPLEMENTAR... (sera gatilho ou nao?)
  }

  static async getMiningData(id) {
    try {
      return await EnvironmentRepository.getMiningData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getTopicData(id) {
    try {
      return await EnvironmentRepository.getTopicData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getDefinitionData(id) {
    try {
      return await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getPriorityData(id) {
    try {
      return await EnvironmentRepository.getPriorityData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getFinalData(id) {
    try {
      return await EnvironmentRepository.getFinalRcr(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getVotingUsersByEnvironmentId(id) {
    try {
      return await EnvironmentRepository.getVotingUsers(id);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  static async getDefinitionRCRByEnvironmentIdAndIssueId(id, issueId) {
    let definitionData = null;
    try {
      definitionData = await EnvironmentRepository.getDefinitionData(id);
    } catch (e) {
      console.log(e);
      return -1;
    }

    if (!definitionData) return definitionData;

    let rcrsFounded = [];
    for (const rcr of definitionData.rcrs) {
      if (rcr.mainIssue === issueId || rcr.relatedToIssues.includes(issueId)) {
        delete rcr.relatedToIssues;
        rcrsFounded.push(rcr);
      }
    }

    return rcrsFounded;
  }

  static async getPriorityRCRByEnvironmentIdAndIssueId(id, issueId) {
    // * TODO
  }
}

module.exports = Environment;
