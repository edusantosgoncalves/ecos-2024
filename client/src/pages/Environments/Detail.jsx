import {
  TextField,
  Button,
  Link,
  Typography,
  Box,
  CircularProgress,
  Backdrop,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Badge,
} from "@mui/material";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { PopUpError } from "../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";
import { DiffAddedIcon } from "@primer/octicons-react";

// ! Importações de componentes criados
import theme from "../../components/MuiTheme.jsx";
import SideBar from "../../components/SideBar.jsx";
import { IssueCard } from "./Issues/IssueCard.jsx";
import { SuccessButton } from "../../components/Buttons.jsx";

// ! Importações de códigos
import { verifyLoggedUser } from "../../api/Auth.jsx";
import {
  setIssueDataToLocalStorage,
  getEnvironmentIdFromUrl,
  getTopicData,
} from "../../api/Environments.jsx";

const EnvironmentDetail = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.title = "ECOS-IC: My Environments";

    // . Função para obter os topicos
    const getDetails = async (userId, userToken) => {
      // . Obtendo o id do ambiente
      const environmentId = getEnvironmentIdFromUrl();
      if (environmentId === null) {
        // . Voltar a página anterior
        redirect("/my-environments");
        return;
      }

      // . Armazenando o id do ambiente
      setEnvironmentId(environmentId);

      // . Obtendo os ambientes do usuário
      const response = await getTopicData(userId, userToken, environmentId);

      // . Verificando se ocorreu algum erro
      if (response.error) {
        setIsLoading(false);
        activeErrorDialog(
          `${response.error.code}: Getting environment detail`,
          response.error.message,
          response.status
        );
        return;
      }

      // . Armazenando os ambientes
      setTopics(response);
      setIsLoading(false);
    };

    // . Verificando se o usuário está logado e obtendo seus dados
    const checkUser = async () => {
      const verifyUser = await verifyLoggedUser();

      // . Se não houver usuário logado, redireciona para a página de login
      if (verifyUser === null) {
        redirect("/");
        return;
      }

      // . Obtendo os ambientes do usuário
      await getDetails(verifyUser.userId, verifyUser.userToken);
    };

    // . Executando a função
    checkUser();
  }, []);

  // ! Variáveis e funções para manipulação dos Dialogs
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoginError, setHasLoginError] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const activeErrorDialog = (code, msg, status) => {
    try {
      code = code.toUpperCase();
    } catch (e) {}

    setErrorCode(code);
    setErrorMessage(`${status}:\n${msg}`);
    setHasLoginError(true);
  };

  const closeErrorDialog = () => {
    setHasLoginError(false);
  };

  // ! Funções para manipulação de dados na página
  const [environmentId, setEnvironmentId] = useState(""); // . Armazena o id do ambiente [UUID]
  const [topics, setTopics] = useState([
    { id: null, issues: "", name: "", topic: "" },
  ]); // . Armazena os ambientes do usuário
  const [actualTopic, setActualTopic] = useState(0); // . Armazena o ambiente atual

  // . Função para mudar o topico atual (SELECT)
  const changeTopic = (event) => {
    setActualTopic(event.target.value);
  };

  // . Função para ir a pagina da issue
  const goToissueDetail = (issue, topic) => {
    setIssueDataToLocalStorage(issue, topic);
    redirect(`/environment/${environmentId}/issue/${issue.id}`);
  };

  // . Declarando elementos da página
  const pageContent = () => {
    return (
      <Box className="ContainerMyEnvironments">
        <Box
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1.5em",
          }}
        >
          <SuccessButton
            icon={<DiffAddedIcon size={18} />}
            message={"New environment"}
            width={"200px"}
            height={"30px"}
            uppercase={false}
          />
        </Box>
        <FormControl
          fullWidth
          id="areaSlcTopic"
          className="ContainerMyEnvironments"
        >
          <InputLabel id="slcTopicLbl">Topic</InputLabel>
          <Select
            labelId="slcTopicLbl"
            id="slcTopic"
            value={actualTopic}
            label="Topic"
            onChange={(e) => changeTopic(e)}
          >
            {topics.map((env) => {
              return (
                <MenuItem
                  key={`MnItSlcTopic-${env.id}`}
                  value={env.id}
                  style={{ whiteSpace: "normal" }}
                >
                  {env.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <Box
          className="ContainerEnvironments"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            margin: "0.5em 0.3em",
          }}
        >
          {topics.length !== 0 && topics[actualTopic].issues !== ""
            ? topics[actualTopic].issues.map((issue) => {
                return (
                  <IssueCard
                    key={`EnvCard-${issue.id}`}
                    id={issue.id}
                    issue={issue}
                    onClick={() => goToissueDetail(issue, topics[actualTopic])}
                  />
                );
              })
            : ""}
        </Box>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <SideBar pageContent={pageContent} isLoading={isLoading} />
      <Backdrop
        sx={{
          background: "rgba(0,0,0,0.5)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={isLoading}
      >
        <CircularProgress sx={{ color: "#0084fe" }} />
      </Backdrop>
      <PopUpError
        open={hasLoginError}
        close={closeErrorDialog}
        title={errorCode}
        message={errorMessage}
      />
    </ThemeProvider>
  );
};

export default EnvironmentDetail;
