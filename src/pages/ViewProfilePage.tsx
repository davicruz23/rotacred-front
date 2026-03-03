import { useEffect, useState } from "react";
import api from "../services/api";

type Usuario = {
  id: number;
  name: string;
  cpf: string;
  position: string;
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
    <div className="row g-4">
      <div className="col-12">
        <div className="dashboard-breadcrumb">
          <h6 className="mb-0">Usuários do sistema</h6>
        </div>
      </div>

      <div className="col-12">
        <div className="card full-height">
          <div className="card-header-area mb-3 flex-wrap">
            <h5 className="fw-medium">Lista de Usuários</h5>
          </div>

          <div className="table-responsive">
            <table className="table w-100">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Função</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-3">
                      Carregando...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-3">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.cpf}</td>
                      <td>{u.position}</td>
                      <td>
                        <div className="btn-box">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            title="Alterar senha"
                            onClick={() => {
                              setSelectedUserId(u.id);
                              setShowModal(true);
                            }}
                          >
                            <i className="fa-light fa-key"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {showModal && (
              <div
                className="modal d-block"
                tabIndex={-1}
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Alterar Senha</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowModal(false)}
                      ></button>
                    </div>

                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">Nova Senha</label>
                        <input
                          type="password"
                          className="form-control"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Confirmar Senha</label>
                        <input
                          type="password"
                          className="form-control"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowModal(false)}
                      >
                        Cancelar
                      </button>

                      <button
                        className="btn btn-primary"
                        onClick={handleUpdatePassword}
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfilePage;
