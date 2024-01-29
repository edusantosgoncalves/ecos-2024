const {
  USER_LOGIN,
  USER_PWD,
  DB_MICROSERVICE_BASE,
} = require("../Credentials");

const axios = require("axios");

async function updateEnvironmentStatus(environmentId, status) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/environment/${environmentId}/status/${status}`;

  // * Fazendo requisição
  try {
    await axios.put(url, {
      headers: {
        "service-login": USER_LOGIN,
        "service-pwd": USER_PWD,
      },
    });
    return true;
  } catch (e) {
    return false;
  }
}

async function updateEnvironmentMiningData(environmentId, miningData, status) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/environment/${environmentId}/miningdata`;

  // * Fazendo requisição
  try {
    const req = await axios.post(
      url,
      {
        mining_data: miningData,
        status: status,
      },
      {
        headers: {
          "service-login": USER_LOGIN,
          "service-pwd": USER_PWD,
        },
      }
    );
    console.log(req.status);
    return true;
  } catch (e) {
    return false;
  }
}

async function getEnvironmentMiningData(environmentId, userId, userToken) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/environment/${environmentId}/miningdata`;

  // * Fazendo requisição
  try {
    const req = await axios.get(url, {
      headers: {
        "user-id": userId,
        "user-token": userToken,
      },
    });
    return req.data;
  } catch (e) {
    return null;
  }
}

async function getEnvironmentRepos(environmentId, userId, userToken) {
  // * Definindo url
  const url = `${DB_MICROSERVICE_BASE}/environment/${environmentId}`;

  // * Fazendo requisição
  try {
    const req = await axios.get(url, {
      headers: {
        "user-id": userId,
        "user-token": userToken,
      },
    });
    return req.data;
  } catch (e) {
    return null;
  }
}

module.exports = {
  updateEnvironmentStatus,
  updateEnvironmentMiningData,
  getEnvironmentMiningData,
  getEnvironmentRepos,
};
