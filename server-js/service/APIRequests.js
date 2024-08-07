const config = require("../config.js");
const axios = require("axios");

class APIRequests {
  /**
   * Sends an email using the specified parameters.
   * @param {string} to - The recipient's email address.
   * @param {string} subject - The subject of the email.
   * @param {string} text - The content of the email.
   * @returns {boolean} - True if the email was sent successfully, or false otherwise.
   */
  static async sendEmail(to, subject, text) {
    // * Defining url
    const url = `${config.apiMicroserviceBase}/email/send`;

    // * Making request
    try {
      await axios.post(
        url,
        { to: to, subject: subject, text: text },
        {
          headers: {
            "service-login": config.servicesLogin,
            "service-pwd": config.servicesPassword,
          },
        }
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Makes a request to the mining API endpoint.
   * @param {string} environmentId - The environment ID.
   * @param {Array<string>} repos - The list of repositories.
   * @param {string} filter_type - The filter type that will be applied.
   * @param {Array<string>} keywords - The list of keywords.
   * @param {uuidv4} user_id - The user_id of the environment.
   * @returns {boolean} - True if the request is successful, or false otherwise.
   */
  static async requestMining(
    environmentId,
    repos,
    filter_type,
    keywords,
    rcr_keywords,
    mining_filter_date_since,
    mining_filter_date_until,
    mining_issues_status,
    user_id
  ) {
    // * Defining url
    const url = `${config.apiMicroserviceBase}/github/mining/repos`;

    // * Making request
    try {
      await axios.post(
        url,
        {
          environment_id: environmentId,
          repos: repos,
          filter_type: filter_type,
          keywords: keywords,
          user_id: user_id,
          rcr_keywords: rcr_keywords,
          mining_filter_date_since: mining_filter_date_since,
          mining_filter_date_until: mining_filter_date_until,
          mining_issues_status: mining_issues_status,
        },
        {
          headers: {
            "service-login": config.servicesLogin,
            "service-pwd": config.servicesPassword,
          },
        }
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Makes a request to the topics API endpoint.
   * @param {string} environmentId - The environment ID.
   * @returns {boolean} - True if the request is successful, or false otherwise.
   */
  static async requestTopics(environmentId) {
    // * Defining url
    const url = `${config.apiMicroserviceBase}/request/topics`;

    // * Making request
    try {
      await axios.post(
        url,
        { environment_id: environmentId },
        {
          headers: {
            "service-login": config.servicesLogin,
            "service-pwd": config.servicesPassword,
          },
        }
      );
      return true;
    } catch (e) {
      return false;
    }
  }
}

module.exports = APIRequests;
