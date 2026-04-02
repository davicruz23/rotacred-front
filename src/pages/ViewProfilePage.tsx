import { useEffect, useState } from "react";
import api from "../services/api";

type Usuario = {
  id: number;
  name: string;
  cpf: string;
  position: string;
};

const avatarColors = [
  { bg: "#E6F1FB", color: "#0C447C" },
  { bg: "#E1F5EE", color: "#085041" },
  { bg: "#FAEEDA", color: "#633806" },
  { bg: "#FBEAF0", color: "#72243E" },
  { bg: "#EAF3DE", color: "#27500A" },
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const positionBadgeStyle = (position: string): React.CSSProperties => {
  const map: Record<string, React.CSSProperties> = {
    ADMIN: { background: "#E6F1FB", color: "#185FA5" },
    ADMINISTRADOR: { background: "#E6F1FB", color: "#185FA5" },
    COBRADOR: { background: "#FAEEDA", color: "#854F0B" },
  };
  return {
    display: "inline-block",
    padding: "3px 9px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    ...(map[position?.toUpperCase()] ?? {
      background: "#EAF3DE",
      color: "#3B6D11",
    }),
  };
};

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
    padding: "14px 18px",
    borderBottom: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1a1a1a",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 13,
  },

  th: {
    textAlign: "left" as const,
    padding: "9px 12px",
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    borderBottom: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
    whiteSpace: "nowrap" as const,
  },

  td: {
    padding: "10px 12px",
    borderBottom: "0.5px solid #e0e0e0",
    color: "#1a1a1a",
    verticalAlign: "middle" as const,
  },

  tdMuted: {
    padding: "10px 12px",
    borderBottom: "0.5px solid #e0e0e0",
    color: "#aaa",
    fontSize: 12,
    verticalAlign: "middle" as const,
  },

  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  keyBtn: {
    border: "0.5px solid #B5D4F4",
    borderRadius: 6,
    padding: "5px 10px",
    fontSize: 13,
    color: "#185FA5",
    background: "#E6F1FB",
    cursor: "pointer",
  },

  overlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  modalBox: {
    background: "#fff",
    border: "0.5px solid #e0e0e0",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
  },

  modalHead: {
    padding: "14px 18px",
    borderBottom: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1a1a1a",
  },

  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 16,
    color: "#aaa",
    cursor: "pointer",
    lineHeight: 1,
    padding: 0,
  },

  modalBody: {
    padding: 18,
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
  },

  field: { display: "flex", flexDirection: "column" as const, gap: 5 },

  label: {
    fontSize: 11,
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

  modalFoot: {
    padding: "12px 18px",
    borderTop: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
  },

  cancelBtn: {
    padding: "7px 16px",
    borderRadius: 8,
    border: "0.5px solid #d0d0d0",
    background: "#fff",
    fontSize: 13,
    cursor: "pointer",
    color: "#1a1a1a",
  },

  saveBtn: {
    padding: "7px 16px",
    borderRadius: 8,
    border: "none",
    background: "#185FA5",
    color: "#E6F1FB",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  emptyCell: {
    padding: "24px 0",
    textAlign: "center" as const,
    color: "#aaa",
    fontSize: 13,
  },
};

const ViewProfilePage = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await api.get("/user/all");
      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao listar usuários", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert("Preencha todos os campos");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }
    try {
      await api.patch(`/user/${selectedUserId}/password`, {
        password: newPassword,
      });
      alert("Senha atualizada com sucesso!");
      setShowModal(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Erro ao atualizar senha", error);
      alert("Erro ao atualizar senha");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={S.page}>
      <div className="row g-4">
        <div className="col-12">
          <div style={S.card}>
            <div style={S.cardHead}>
              <div style={S.cardTitle}>Lista de usuários</div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>ID</th>
                    <th style={S.th}>Nome</th>
                    <th style={S.th}>CPF</th>
                    <th style={S.th}>Função</th>
                    <th style={S.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={S.emptyCell}>
                        Carregando...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={S.emptyCell}>
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    users.map((u, idx) => (
                      <tr
                        key={u.id}
                        onMouseEnter={(e) =>
                          (e.currentTarget as HTMLTableRowElement)
                            .querySelectorAll("td")
                            .forEach((td) => (td.style.background = "#f8f9fa"))
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget as HTMLTableRowElement)
                            .querySelectorAll("td")
                            .forEach((td) => (td.style.background = ""))
                        }
                      >
                        <td style={S.tdMuted}>{u.id}</td>
                        <td style={S.td}>
                          <div style={S.nameCell}>
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                background:
                                  avatarColors[idx % avatarColors.length].bg,
                                color:
                                  avatarColors[idx % avatarColors.length].color,
                                fontSize: 11,
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(u.name)}
                            </div>
                            {u.name}
                          </div>
                        </td>
                        <td style={S.tdMuted}>{u.cpf}</td>
                        <td style={S.td}>
                          <span style={positionBadgeStyle(u.position)}>
                            {u.position}
                          </span>
                        </td>
                        <td style={{ ...S.td, textAlign: "right" }}>
                          <button
                            style={S.keyBtn}
                            title="Alterar senha"
                            onClick={() => {
                              setSelectedUserId(u.id);
                              setShowModal(true);
                            }}
                          >
                            🔑
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHead}>
              <span style={S.modalTitle}>Alterar senha</span>
              <button style={S.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div style={S.modalBody}>
              <div style={S.field}>
                <label style={S.label}>Nova senha</label>
                <input
                  type="password"
                  style={S.input}
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div style={S.field}>
                <label style={S.label}>Confirmar senha</label>
                <input
                  type="password"
                  style={S.input}
                  placeholder="Confirme a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={S.modalFoot}>
              <button style={S.cancelBtn} onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button style={S.saveBtn} onClick={handleUpdatePassword}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProfilePage;
