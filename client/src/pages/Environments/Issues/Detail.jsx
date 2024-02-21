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
import { PopUpError } from "../../../components/PopUp.jsx";
import { useNavigate } from "react-router-dom";
import { DiffAddedIcon, BookIcon } from "@primer/octicons-react";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";

// ! Importações de componentes criados
import theme from "../../../components/MuiTheme.jsx";
import SideBar from "../../../components/SideBar.jsx";
import { IssueCardForDetailedIssue } from "./IssueCardForDetailedIssue.jsx";
import { SuccessButton } from "../../../components/Buttons.jsx";
import { IssueModalDetail } from "./IssueModalDetail.jsx";
import { RequestRCRPopUp } from "../RCR/RequestPopUp.jsx";
import { ListAssociatedRCRsPopUp } from "../RCR/ListAssociatedRCRsIssue.jsx";

// ! Importações de códigos
import { verifyLoggedUser } from "../../../api/Auth.jsx";
import {
  getEnvironmentIdAndIssueIdFromUrl,
  getEnvironmentNameFromLocalStorage,
  getIssueDataFromLocalStorage,
  getDefinitionRCRsByEnvironmentIdAndIssueId,
} from "../../../api/Environments.jsx";

const IssueDetail = () => {
  // ! Instanciando o useNavigate para redirecionar o usuário pra alguma página
  const redirect = useNavigate();

  // ! Executado ao iniciar o componente
  useEffect(() => {
    // . Mudando nome da página
    document.body.style.background = "white";

    // . Função para obter a issue selecionada junto ao seu topico e as issues relacionadas a ela
    const getDetails = async (loggedUser) => {
      // . Obtendo o id do ambiente
      const data = getEnvironmentIdAndIssueIdFromUrl();

      // . Voltar a página anterior
      if (data === null) {
        redirect("/my-environments");
        return;
      }

      // . Armazenando o id do ambiente
      setEnvironmentId(data.environmentId);

      // . Obtendo o nome do ambiente
      const environmentName = getEnvironmentNameFromLocalStorage();

      if (environmentName === null) {
        redirect("/my-environments");
        return;
      }

      setEnvironmentName(environmentName);

      document.title = `SECO-RCR: ${environmentName}`;

      // . Obtendo os dados de topico e da issue
      const response = getIssueDataFromLocalStorage(
        data.issueId,
        data.environmentId
      );

      // . Verificando se ocorreu algum erro
      if (response === null) {
        setIsLoading(false);
        activeErrorDialog(
          `${response.error.code}: Getting issue detail`,
          response.error.message,
          response.status
        );
        return;
      }

      //. Obtendo as RCRs de prioridade
      const priorityRCRs = await getDefinitionRCRsByEnvironmentIdAndIssueId(
        loggedUser.userId,
        loggedUser.userToken,
        data.environmentId,
        data.issueId
      );

      // . Verificando se ocorreu algum erro
      if (priorityRCRs.error) {
        setIsLoading(false);
        activeErrorDialog(
          `${priorityRCRs.error.code}: Getting rcrs associated with issue`,
          priorityRCRs.error.message,
          priorityRCRs.status
        );
        return;
      }
      console.log(priorityRCRs);
      // . Armazenando as RCRs associadas
      setRcrAssociated(priorityRCRs);

      // . Armazenando os ambientes
      const { issueData, relatedToIssues, topic } = response;
      setRelatedToIssues(relatedToIssues);
      setIssueDetailed(issueData);
      setTopicData(topic);
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

      // . Obtendo a issue selecionada e o topico dela
      await getDetails(verifyUser);
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
  const [environmentName, setEnvironmentName] = useState(""); // . Armazena o nome do ambiente [String]
  const [topicData, setTopicData] = useState({ id: null, name: "" }); // . Armazena os dados do topico [Object]
  const [rcrAssociated, setRcrAssociated] = useState([]); // . Armazena as RCRs associadas [Array]
  const [environmentId, setEnvironmentId] = useState(""); // . Armazena o id do ambiente [UUID]
  const [relatedToIssues, setRelatedToIssues] = useState([
    { id: null, repo: "", body: "", tags: "", score: "", relatedToScore: "" },
  ]); // . Armazena as issues relacionadas
  const [issueDetailed, setIssueDetailed] = useState({
    id: null,
    repo: "",
    body: "",
    tags: "",
    score: "",
  }); // . Armazena a issue mãe
  const [issueModal, setIssueModal] = useState({
    id: null,
    issueId: "",
    repo: "",
    body: "",
    tags: "",
    score: "",
    relatedToScore: "",
  }); // . Armazena o estado do modal [Boolean]

  const goBackToEnvironmentPage = () => {
    redirect(`/environment/${environmentId}`);
  };

  // ! Variáveis e funções para manipulação do Dialog de Issue
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  const openIssueOnModal = (issue) => {
    setIssueModal(issue);
    setIssueModalOpen(true);
  };

  const closeIssueModal = () => {
    setIssueModalOpen(false);
  };

  // ! Variáveis e funções para manipulação do Dialog de Criacao de RCR
  const [rcrModalOpen, setRcrModalOpen] = useState(false);

  const openRcrModal = () => {
    setRcrModalOpen(true);
  };

  const closeRcrModal = () => {
    setRcrModalOpen(false);
  };

  // ! Variáveis e funções para manipulação do Dialog de Lista de RCR
  const [rcrListModalOpen, setRcrListModalOpen] = useState(false);

  const openListRcrModal = () => {
    setRcrListModalOpen(true);
  };

  const closeListRcrModal = () => {
    setRcrListModalOpen(false);
  };

  // . Declarando elementos da página
  const pageContent = () => {
    return (
      <Box className="ContainerIssue">
        <Box className="ContainerTitle">
          <Box
            style={{ display: "flex", padding: "0.2em", alignItems: "center" }}
          >
            <ArrowCircleLeftIcon
              className="BackButton"
              onClick={() => {
                goBackToEnvironmentPage();
              }}
            />
            <Typography
              variant="h5"
              style={{ textDecoration: "underline", marginLeft: "1em" }}
            >
              {environmentName}
            </Typography>
          </Box>
          <Box style={{ display: "flex", flexDirection: "row" }}>
            <SuccessButton
              icon={<BookIcon size={18} />}
              message={"List associated RCRs"}
              width={"200px"}
              height={"30px"}
              uppercase={false}
              marginRight={"2em"}
              backgroundColor={"#b3def5"}
              visibility={rcrAssociated.length > 0 ? "visible" : "hidden"}
              action={openListRcrModal}
            />
            <SuccessButton
              icon={<DiffAddedIcon size={18} />}
              message={"Register RCR"}
              width={"200px"}
              height={"30px"}
              uppercase={false}
              marginRight={"2em"}
              backgroundColor={"#9fff64"}
              action={openRcrModal}
            />
          </Box>
        </Box>
        <Typography variant="h6">{topicData.name}</Typography>
        <Box className="ContainerMainIssueDetail">
          <Box className="SubContainerMainIssueDetail1">
            <Typography>
              <strong> Topic: </strong>
              {issueDetailed.topicNum}
            </Typography>
            <Typography>
              <strong> Issue: </strong>
              {`#${issueDetailed.id}`}
            </Typography>
            <Typography>
              <strong> Repository: </strong>
              {issueDetailed.repo}
            </Typography>
            <Typography>
              <strong> Topic Score: </strong>
              {issueDetailed.score}
            </Typography>
          </Box>
          <Box className="SubContainerMainIssueDetail2">
            <strong>Content:</strong>
            <Typography variant="body2">{issueDetailed.body}</Typography>{" "}
          </Box>
        </Box>
        <Box className="ContainerRelatedToIssues">
          <Typography variant="h6">Related to:</Typography>
          <Box className="ContainerEnvironments">
            {relatedToIssues.map((issue, index) => (
              <IssueCardForDetailedIssue
                key={`issue-${issue.id}`}
                issue={issue}
                environmentId={environmentId}
                onClick={() => {
                  openIssueOnModal(issue);
                }}
              />
            ))}
          </Box>
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
      <IssueModalDetail
        open={issueModalOpen}
        close={closeIssueModal}
        closeMessage={"Back"}
        issue={issueModal}
      />
      <RequestRCRPopUp
        open={rcrModalOpen}
        close={closeRcrModal}
        relatedTo={relatedToIssues}
        environmentId={environmentId}
        topicNum={issueDetailed.topicNum}
        mainIssue={issueDetailed}
      />
      <ListAssociatedRCRsPopUp
        open={rcrListModalOpen}
        close={closeListRcrModal}
        rcrs={rcrAssociated}
        mainIssueId={issueDetailed.id}
      />
    </ThemeProvider>
  );
};

export default IssueDetail;
