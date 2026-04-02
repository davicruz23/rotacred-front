import { useState } from "react";
import api from "../services/api";

const S: Record<string, React.CSSProperties> = {
  page: { padding: "0 4px" },

  card: {
    background: "#fff",
    border: "0.5px solid #e0e0e0",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
  },

  cardHead: {
    padding: "16px 20px",
    borderBottom: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1a1a1a",
    margin: 0,
  },

  cardSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 3,
  },

  cardBody: { padding: 20 },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },

  field: { display: "flex", flexDirection: "column" as const, gap: 5 },

  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#888",
  },

  input: {
    border: "0.5px solid #d0d0d0",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: "#1a1a1a",
    background: "#fff",
    outline: "none",
    width: "100%",
  },

  select: {
    border: "0.5px solid #d0d0d0",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: "#1a1a1a",
    background: "#fff",
    outline: "none",
    width: "100%",
  },

  divider: {
    border: "none",
    borderTop: "0.5px solid #e0e0e0",
    margin: "4px 0 16px",
  },

  alertSuccess: {
    background: "#EAF3DE",
    color: "#3B6D11",
    border: "0.5px solid #C0DD97",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
  },

  alertError: {
    background: "#FCEBEB",
    color: "#A32D2D",
    border: "0.5px solid #F7C1C1",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
  },
};

const getSubmitBtnStyle = (disabled: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "11px",
  borderRadius: 8,
  border: "none",
  background: disabled ? "#f1f1f1" : "#185FA5",
  color: disabled ? "#aaa" : "#E6F1FB",
  fontSize: 14,
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
});

const CreateUsersPage = () => {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [position, setPosition] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post("/user", { name, cpf, password, position });
      setMessage("Usuário criado com sucesso!");
      setIsError(false);
      setName("");
      setCpf("");
      setPassword("");
      setPosition("");
    } catch (error) {
      console.error("Erro ao criar usuário", error);
      setMessage("Erro ao criar usuário.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div className="row g-4">
        <div className="col-12">
          <div style={S.card}>
            <div style={S.cardHead}>
              <div style={S.cardTitle}>Novo usuário</div>
              <div style={S.cardSub}>
                Preencha os campos abaixo para cadastrar um novo usuário
              </div>
            </div>

            <div style={S.cardBody}>
              {message && (
                <div style={isError ? S.alertError : S.alertSuccess}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={S.grid}>
                  <div style={S.field}>
                    <label style={S.label}>Nome</label>
                    <input
                      type="text"
                      style={S.input}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome completo"
                      required
                    />
                  </div>

                  <div style={S.field}>
                    <label style={S.label}>CPF</label>
                    <input
                      type="text"
                      style={S.input}
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>

                  <div style={S.field}>
                    <label style={S.label}>Senha</label>
                    <input
                      type="password"
                      style={S.input}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite a senha"
                      required
                    />
                  </div>

                  <div style={S.field}>
                    <label style={S.label}>Função</label>
                    <select
                      style={S.select}
                      value={position}
                      onChange={(e) => setPosition(Number(e.target.value))}
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value={2}>Funcionário</option>
                      <option value={3}>Vendedor</option>
                      <option value={4}>Cobrador</option>
                      <option value={5}>Fiscal</option>
                    </select>
                  </div>
                </div>

                <hr style={S.divider} />

                <button
                  type="submit"
                  style={getSubmitBtnStyle(loading)}
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Criar usuário"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUsersPage;
