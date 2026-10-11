
import OtherAuthOptions from "../components/auth/OtherAuthOptions";
import AuthForm from "../components/forms/AuthForm";
import { useAppSelector } from "../redux/hooks";
import AuthTopLogo from "../components/auth/AuthTopLogo";

const LoginPage = () => {
  const darkMode = useAppSelector((state) => state.theme.isDark);

  const features = [
    {
      icon: "bi-credit-card-2-front",
      title: "Gestão de crediário",
      description: "Gerencie vendas, parcelas e recebimentos.",
    },
    {
      icon: "bi-people",
      title: "Clientes e vendedores",
      description: "Centralize informações da sua operação.",
    },
    {
      icon: "bi-geo-alt",
      title: "Vendas externas",
      description: "Organize as atividades da equipe em campo.",
    },
    {
      icon: "bi-bar-chart-line",
      title: "Painel administrativo",
      description: "Acompanhe os resultados do negócio.",
    },
  ];

  return (
    <main
      className={`container-fluid p-0 ${darkMode ? "dark-theme" : "light-theme"
        }`}
      style={{
        minHeight: "100vh",
        backgroundColor: darkMode ? "#0b1426" : "#ffffff",
      }}
    >
      <div className="row g-0" style={{ minHeight: "100vh" }}>
        {/* PAINEL ESQUERDO */}
        <section
          className="col-lg-6 d-none d-lg-flex flex-column justify-content-between position-relative overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, #06142f 0%, #092a62 60%, #1255ad 100%)",
            padding: "clamp(32px, 4vw, 72px)",
            color: "#ffffff",
          }}
        >
          {/* Elementos decorativos */}
          <div
            className="position-absolute rounded-circle"
            style={{
              width: 400,
              height: 400,
              top: -200,
              right: -180,
              background: "rgba(59, 158, 255, 0.12)",
              pointerEvents: "none",
            }}
          />

          <div
            className="position-absolute rounded-circle"
            style={{
              width: 350,
              height: 350,
              bottom: -220,
              left: -180,
              background: "rgba(0, 194, 255, 0.1)",
              pointerEvents: "none",
            }}
          />

          {/* Marca */}
          {/* <div
            className="d-flex align-items-center gap-3 position-relative"
            style={{ zIndex: 1 }}
          >
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "linear-gradient(135deg, #39d5ff, #1265ed)",
                fontSize: 24,
              }}
            >
              <i className="bi bi-geo-alt-fill" />
            </div>

            <span
              style={{
                fontSize: 29,
                fontWeight: 800,
                letterSpacing: "-1px",
              }}
            >
              Rota<span style={{ color: "#48caff" }}>Cred</span>
            </span>
          </div> */}

          {/* Apresentação */}
          <div className="position-relative" style={{ zIndex: 1 }}>
            <div
              className="d-inline-flex align-items-center gap-2 mb-4"
              style={{
                padding: "9px 15px",
                borderRadius: 30,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.07)",
                fontSize: 12,
                color: "#c5e5ff",
                fontWeight: 600,
              }}
            >
              <i
                className="bi bi-stars"
                style={{ color: "#4ad2ff" }}
              />
              Plataforma de gestão inteligente
            </div>

            <h1
              style={{
                fontSize: "clamp(34px, 3.5vw, 56px)",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-1.8px",
                marginBottom: 22,
                color: "#ffffff",
              }}
            >
              Sua operação mais
              <br />
              organizada.
              <br />
              <span style={{ color: "#4acbff" }}>
                Seu negócio mais forte.
              </span>
            </h1>

            <p
              style={{
                fontSize: 15,
                lineHeight: 1.85,
                color: "#b9cce6",
                maxWidth: 500,
                marginBottom: 32,
              }}
            >
              Simplifique a gestão do seu crediário. Controle
              vendas, clientes, parcelas e cobranças em um
              único lugar, com mais organização e praticidade.
            </p>

            {/* Funcionalidades */}
            <div
              className="d-flex flex-column gap-3"
              style={{ maxWidth: 510 }}
            >
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="d-flex align-items-center gap-3"
                  style={{
                    padding: "14px 18px",
                    borderRadius: 15,
                    background: "rgba(255,255,255,0.055)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "rgba(42,143,255,0.17)",
                      color: "#63caff",
                      fontSize: 21,
                    }}
                  >
                    <i className={`bi ${feature.icon}`} />
                  </div>

                  <div className="flex-grow-1">
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#ffffff",
                        marginBottom: 3,
                      }}
                    >
                      {feature.title}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: "#b2c5df",
                      }}
                    >
                      {feature.description}
                    </div>
                  </div>

                  <i
                    className="bi bi-check-circle"
                    style={{ color: "#55caff", fontSize: 17 }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Rodapé esquerdo */}
          <div
            className="d-flex align-items-center gap-2 position-relative"
            style={{
              zIndex: 1,
              color: "#a8bfdb",
              fontSize: 12,
            }}
          >
            <i className="bi bi-shield-check" />
            Tecnologia para uma gestão mais eficiente.
          </div>
        </section>



        {/* PAINEL DIREITO */}
        <section
          className="col-12 col-lg-6 d-flex align-items-center justify-content-center"
          style={{
            background: darkMode ? "#0b1426" : "#f4f7fc",
            minHeight: "100vh",
            padding: "32px 24px",
          }}
        >
          <div
            className="d-flex flex-column align-items-center justify-content-center w-100"
            style={{
              maxWidth: 540,
              minHeight: "calc(100vh - 64px)",
              gap: 24,
            }}
          >
            {/* CARD DE LOGIN */}
            <div
              className="w-100"
              style={{
                background: darkMode ? "#111e33" : "#ffffff",
                border: darkMode
                  ? "1px solid #263752"
                  : "1px solid #e7edf5",
                borderRadius: 20,
                padding: "clamp(24px, 3vw, 44px)",
                boxShadow: darkMode
                  ? "0 20px 60px rgba(0,0,0,0.2)"
                  : "0 20px 60px rgba(29, 65, 120, 0.08)",
              }}
            >
              {/* LOGO */}
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  marginBottom: 28,
                }}
              >
                <AuthTopLogo />
              </div>

              {/* IDENTIFICAÇÃO */}
              <div
                className="d-flex align-items-center gap-2 mb-3"
                style={{
                  color: "#2783f6",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 2,
                    background: "#2783f6",
                  }}
                />
                PAINEL ADMINISTRATIVO
              </div>

              {/* TÍTULO */}
              <h2
                style={{
                  fontSize: "clamp(26px, 2.5vw, 34px)",
                  fontWeight: 800,
                  letterSpacing: "-1px",
                  color: darkMode ? "#ffffff" : "#12294b",
                  marginBottom: 12,
                }}
              >
                Bem-vindo de volta!
              </h2>

              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: darkMode ? "#a7b6cd" : "#7c8ba1",
                  marginBottom: 30,
                }}
              >
                Acesse sua conta para gerenciar vendas,
                clientes, crediário e cobranças.
              </p>

              {/* FORMULÁRIO ORIGINAL */}
              <AuthForm />

              <div style={{ marginTop: 20 }}>
                <OtherAuthOptions />
              </div>
            </div>

            {/* RODAPÉ FORA DO CARD */}
            <div
              className="d-flex justify-content-center align-items-center flex-wrap gap-3"
              style={{
                fontSize: 11,
                color: darkMode ? "#8293ad" : "#96a2b5",
                textAlign: "center",
              }}
            >
              <span>
                © {new Date().getFullYear()} RotaCred.
                Todos os direitos reservados.
              </span>

              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-lock" />
                Acesso seguro
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
