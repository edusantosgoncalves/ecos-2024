// ! Registrando dados do usuário logado no locationStore
export const registerLoggedUser = async (userId, userToken, userName) => {
  // . Registrando dados no localStorage
  localStorage.setItem("SECO_24_user-id", userId);
  localStorage.setItem("SECO_24_user-token", userToken);
  localStorage.setItem("SECO_24_user-name", userName);
  return true;
};

// ! Verifica se existe dados para o usuário logado registrados no locationStore
export const verifyLoggedUser = async () => {
  // . Verificando se há dados no localStorage
  let userId = null;
  let userToken = null;
  let userName = null;

  try {
    userId = localStorage.getItem("SECO_24_user-id");
    userToken = localStorage.getItem("SECO_24_user-token");
    userName = localStorage.getItem("SECO_24_user-name");
  } catch (e) {}

  // . Se não houver dados, retorne null
  if (userId === null || userToken === null || userName === null) {
    return null;
  }

  // . Retornando os dados formatados para o componente
  return { userId: userId, userToken: userToken, userName: userName };
};

// ! Remove os dados do usuário logado do locationStore
export const removeLoggedUser = async () => {
  // . Removendo dados do localStorage
  localStorage.removeItem("SECO_24_user-id");
  localStorage.removeItem("SECO_24_user-token");
  localStorage.removeItem("SECO_24_user-name");

  return true;
};
