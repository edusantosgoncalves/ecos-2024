from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

# Importando dependencias locais
from schemas.User import UserResponse, UserRequest, AuthRequest, AuthResponse
from service.User import User as userService
from validations.Auth import Auth as authValidator
from utils.Error import error


router_user = APIRouter(prefix="/user", tags=["User"])

msg_404 = {"en-US": "User not found!", "pt-BR": "Usuário não encontrado!"}
msg_500 = {"en-US": "Internal server error!", "pt-BR": "Erro interno do servidor!"}

@router_user.get("/", response_model=list[UserResponse])
async def get_all(request: Request):
    """# ! Verificando autenticação
    auth = authValidator().validate(request)
    if auth is False:
        return JSONResponse(
            [
                error(
                    "auth",
                    "Authentication failed!",
                )
            ],
            status_code=401,
        )
    """
    # ! Obtendo todos os usuários
    users = await userService().get_all()

    # ! Validando retorno
    if not users:  # * Se não houver usuários (None)
        return JSONResponse(
            [
                error(
                    "user",
                    "Users not found!",
                )
            ],
            status_code=404,
        )

    if users == -1:  # * Se ocorrer erro na obtenção
        return JSONResponse(
            [
                error(
                    "user",
                    msg_500['en-US'],
                )
            ],
            status_code=500,
        )

    # ! Retornando usuários
    return users


@router_user.get("/{id}", response_model=UserResponse)
async def get_by_id(id: str, request: Request):
    """# ! Verificando autenticação
    auth = authValidator().validate(request)
    if auth is False:
        return JSONResponse(
            [
                error(
                    "auth",
                    "Authentication failed!",
                )
            ],
            status_code=401,
        )
    """
    # ! Obtendo usuário por id
    user = await userService().get_by_id(id)

    # ! Validando retorno
    if not user:  # * Se não houver usuário (None)
        return JSONResponse(
            [
                error(
                    "user",
                    msg_404,
                )
            ],
            status_code=404,
        )

    if user == -1:
        return JSONResponse(
            [
                error(
                    "user",
                    msg_500['en-US'],
                )
            ],
            status_code=500,
        )

    # ! Retornando usuário
    return user


@router_user.post("/", response_model=UserResponse)
async def create(user: UserRequest):
    # ! Criando usuário
    user = await userService().create(user)

    # ! Validando retorno
    if not user:  # * Se não houver usuário (None)
        return JSONResponse(
            [
                error(
                    "user",
                    "User not created!",
                )
            ],
            status_code=404,
        )

    if user == -1:
        return JSONResponse(
            [
                error(
                    "user",
                    msg_500['en-US'],
                )
            ],
            status_code=500,
        )
    if user == -2:
        return JSONResponse(
            [
                error(
                    "user",
                    "Invalid e-mail!",
                )
            ],
            status_code=422,
        )

    # ! Retornando usuário
    return user


@router_user.post("/{id}/activate")
async def activate(id: str):
    # ! Ativando usuário
    user = await userService().activate(id)

    # ! Validando retorno
    if user is False:  # * Se não houver usuário (None)
        return JSONResponse(
            [
                error(
                    "user",
                    msg_404,
                )
            ],
            status_code=404,
        )

    if user is None:
        return JSONResponse(
            [
                error(
                    "user",
                    "User already active!",
                )
            ],
            status_code=400,
        )

    if user == -1:
        return JSONResponse(
            [
                error(
                    "user",
                    msg_500['en-US'],
                )
            ],
            status_code=500,
        )


@router_user.post("/auth", response_model=AuthResponse)
async def authenticate(user_auth: AuthRequest):
    # ! Autenticando usuário
    user_auth = await userService().authenticate(user_auth)

    # ! Validando retorno
    if user_auth is None:  # * Se não houver usuário (None)
        return JSONResponse(
            [
                error(
                    "password",
                    "Wrong password!",
                )
            ],
            status_code=401,
        )

    if user_auth is False:
        return JSONResponse(
            [
                error(
                    "user",
                    "User not found!",
                )
            ],
            status_code=404,
        )

    if user_auth == -1:
        return JSONResponse(
            [
                error(
                    "user",
                    msg_500['en-US'],
                )
            ],
            status_code=500,
        )

    # ! Retornando usuário
    return user_auth


@router_user.delete("/{id}")
async def inactivate(id: str):
    """# ! Verificando autenticação
    auth = authValidator().validate(request)
    if auth is False:
        return JSONResponse(
            [
                error(
                    "auth",
                    "Authentication failed!",
                )
            ],
            status_code=401,
        )
    """

    # ! Inativando usuário
    user = await userService().inactivate(id)

    # ! Validando retorno
    if not user:  # * Se não houver usuário (None)
        return JSONResponse(
            [
                error(
                    "user",
                    msg_404,
                )
            ],
            status_code=404,
        )

    if user == -1:
        return JSONResponse(
            [
                error(
                    "user",
                    "Internal server error!",
                )
            ],
            status_code=500,
        )

@router_user.put("/{id}", response_model=UserResponse)
async def update(id: str, user: UserRequest):
    # ! Atualizando usuário
    user = await userService().update(user, id)

    # ! Validando retorno
    if not user:
        return JSONResponse(
            [
                error(
                    "user",
                    msg_404,
                )
            ],
            status_code=404,
        )

    if user == -1:
        return JSONResponse(
            [
                error(
                    "user",
                    msg_500['en-US'],
                )
            ],
            status_code=500,
        )

    if user == -2:
        return JSONResponse(
            [
                error(
                    "user",
                    "Invalid e-mail!",
                )
            ],
            status_code=422,
        )

    if user == -3:
        return JSONResponse(
            [
                error(
                    "user",
                    msg_500['en-US'],
                )
            ],
            status_code=422,
        )

    # ! Retornando usuário
    return user

@router_user.post("/sendEmail")
async def send_email():
    # ! Enviando e-mail
    email = await userService().test_email_sender()

    # ! Retornando usuário
    return email