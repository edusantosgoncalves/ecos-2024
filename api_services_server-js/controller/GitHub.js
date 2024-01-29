// * Importando as bibliotecas
const { Router } = require("express");
const router = Router();

// * Importando módulos
const validation = require("../validations/Mining");
const { validate_service_user } = require("../service/Auth");

// * Importando classe GitHubRequests
const GitHubRequest = require("../service/GitHubRequest");
// * Instanciando classe
const gitHubRequest = new GitHubRequest();

// ! Rota de solicitação de mineração
router.post("/api/github/mining/repos", async (req, res) => {
  // !! LOG
  console.log(`${req.method} ${req.url} - ${new Date().toLocaleString()}`);

  // * Obtendo dados da requisição
  const { body, headers } = req;

  // * Validando variáveis
  const valid = await validation(headers, body);

  // * Se for inválido, retorne erro
  if (!valid) {
    return res.status(400).json({ error: "Invalid request." });
  }

  // * Se for válido, autentique o usuário de serviço
  if (
    !validate_service_user(headers["service-login"], headers["service-pwd"])
  ) {
    return res.status(401).json({ error: "Invalid service credentials." });
  }

  // * Obtendo repos e environment_id
  const { repos, environment_id } = body;

  // * Adicionando requisição na fila
  await gitHubRequest.addQueue(repos, environment_id);

  return res.status(200).json({ message: "Mining request received." });
});

// ! Rota de obtencao de repositorios a partir de uma organizacao
router.get("/api/github/organization/:org/repos", async (req, res) => {
  // !! LOG

  console.log(`${req.method} ${req.url} - ${new Date().toLocaleString()}`);

  // * Obtendo dados da requisição
  const { params } = req;

  // * Obtendo organização
  let org = null;
  try {
    org = params.org;
  } catch (e) {
    return res.status(400).json({ error: "Invalid organization." });
  }

  // * Obtendo repositórios da organização
  const repos = await gitHubRequest.searchOrganizationRepos(org);

  // * Se não houver repositórios, retorne erro
  if (repos === null) {
    return res.status(400).json({ error: "Invalid organization." });
  }

  // * Se houver repositórios, retorne-os

  return res.status(200).json({ repos: repos });
});

module.exports = router;
