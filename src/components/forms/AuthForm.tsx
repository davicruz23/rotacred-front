
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

type Props = {
  register?: boolean;
};

const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  return numbers
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})\.(\d{3})(\d)/, ".$1.$2-$3");
};

const isValidCPF = (value: string): boolean => {
  const cpf = value.replace(/\D/g, "");

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  for (let digit = 9; digit < 11; digit++) {
    let sum = 0;

    for (let i = 0; i < digit; i++) {
      sum += Number(cpf[i]) * (digit + 1 - i);
    }

    const remainder = (sum * 10) % 11;
    const expectedDigit = remainder === 10 ? 0 : remainder;

    if (expectedDigit !== Number(cpf[digit])) {
      return false;
    }
  }

  return true;
};

// Bloqueia emojis comuns, incluindo sequências com
// modificadores, bandeiras e caracteres de composição.
const containsEmoji = (value: string): boolean => {
  return /[\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}\u200D\uFE0F\u20E3]/u.test(
    value
  );
};

const AuthForm = ({ register = false }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cpfTouched, setCpfTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const navigate = useNavigate();

  const cpfNumbers = username.replace(/\D/g, "");

  const cpfIsValid = register
    ? username.trim().length > 0
    : isValidCPF(cpfNumbers);

  const passwordIsValid =
    password.trim().length > 0 && !containsEmoji(password);

  const isFormValid =
    cpfIsValid && passwordIsValid && !loading;

  const handleCPFChange = (value: string) => {
    setUsername(register ? value : formatCPF(value));
    setError("");
  };

  const handlePasswordChange = (value: string) => {
    if (containsEmoji(value)) {
      return;
    }

    setPassword(value);
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setCpfTouched(true);
    setPasswordTouched(true);

    if (!cpfIsValid || !passwordIsValid || loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        cpf: register ? username : cpfNumbers,
        password,
      });

      const token = response.data.token;

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userRole = payload.role;

      const allowedRoles = [
        "ROLE_SUPERADMIN",
        "ROLE_FUNCIONARIO",
      ];

      if (!allowedRoles.includes(userRole)) {
        setError(
          "Seu usuário não tem permissão para acessar este sistema."
        );
        return;
      }

      localStorage.setItem("token", token);

      api.defaults.headers.common["Authorization"] =
        `Bearer ${token}`;

      navigate("/inicio");
    } catch (err: unknown) {
      console.error(err);

      const apiError = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setError(
        apiError.response?.data?.message ||
        "CPF ou senha inválidos. Verifique seus dados."
      );
    } finally {
      setLoading(false);
    }
  };

  const showCPFError =
    cpfTouched && !register && !cpfIsValid && cpfNumbers.length > 0;

  const showPasswordError =
    passwordTouched && !passwordIsValid;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* CPF */}
      <div className="mb-4">
        <label
          htmlFor="login-cpf"
          className="form-label fw-semibold"
        >
          {register ? "Nome completo" : "CPF"}
        </label>

        <div className="input-group">
          <span className="input-group-text">
            <i className="fa-regular fa-user" />
          </span>

          <input
            id="login-cpf"
            type="text"
            className={`form-control ${showCPFError ? "is-invalid" : ""
              }`}
            placeholder={
              register ? "Nome completo" : "000.000.000-00"
            }
            value={username}
            inputMode={register ? "text" : "numeric"}
            autoComplete={register ? "name" : "username"}
            maxLength={register ? undefined : 14}
            onChange={(e) => handleCPFChange(e.target.value)}
            onBlur={() => setCpfTouched(true)}
            aria-invalid={showCPFError}
            aria-describedby={
              showCPFError ? "login-cpf-error" : undefined
            }
            disabled={loading}
            required
          />
        </div>

        {showCPFError && (
          <small
            id="login-cpf-error"
            className="text-danger d-block mt-2"
          >
            <i className="fa-solid fa-circle-exclamation me-1" />
            {cpfNumbers.length < 11
              ? "O CPF deve conter 11 dígitos."
              : "Informe um CPF válido."}
          </small>
        )}
      </div>

      {/* SENHA */}
      <div className="mb-4">
        <label
          htmlFor="login-password"
          className="form-label fw-semibold"
        >
          Senha
        </label>

        <div className="position-relative">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fa-regular fa-lock" />
            </span>

            <input
              id="login-password"
              type={passwordVisible ? "text" : "password"}
              className={`form-control rounded-end ${showPasswordError ? "is-invalid" : ""
                }`}
              placeholder="Digite sua senha"
              value={password}
              autoComplete="current-password"
              onChange={(e) =>
                handlePasswordChange(e.target.value)
              }
              onBlur={() => setPasswordTouched(true)}
              aria-invalid={showPasswordError}
              aria-describedby={
                showPasswordError
                  ? "login-password-error"
                  : undefined
              }
              disabled={loading}
              required
              style={{ paddingRight: 45 }}
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setPasswordVisible((prev) => !prev)
            }
            aria-label={
              passwordVisible ? "Ocultar senha" : "Mostrar senha"
            }
            aria-pressed={passwordVisible}
            className="btn border-0 position-absolute"
            style={{
              right: 5,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 5,
              color: "#64748b",
            }}
          >
            <i
              className={`fa-regular ${passwordVisible ? "fa-eye-slash" : "fa-eye"
                }`}
            />
          </button>
        </div>

        {showPasswordError && (
          <small
            id="login-password-error"
            className="text-danger d-block mt-2"
          >
            Informe sua senha.
          </small>
        )}
      </div>

      {/* ERRO DA API */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="fa-solid fa-triangle-exclamation me-2" />
          {error}
        </div>
      )}

      {/* BOTÃO */}
      <button
        type="submit"
        className="btn btn-primary w-100 login-btn"
        disabled={!isFormValid}
        style={{
          minHeight: 46,
          borderRadius: 9,
          fontWeight: 600,
          background: isFormValid ? "#1769ed" : "#639ef7",
          border: "none",
          transition: "all 0.2s ease",
        }}
      >
        {loading ? (
          <>
            <i className="fa-solid fa-spinner fa-spin me-2" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </button>
    </form>
  );
};

export default AuthForm;
