import { useEffect, useState, useRef } from "react";
import "./style.css";
import Trash from "../../assets/trashh.svg";
import api from "../../services/api";

function Home() {
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [isLoggedUser, setIsLoggedUser] = useState(false);
  const [loggedUserData, setLoggedUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [activeSection, setActiveSection] = useState("register");
  const [menuOpen, setMenuOpen] = useState(false);

  const inputName = useRef();
  const inputAge = useRef();
  const inputEmail = useRef();
  const inputPassword = useRef();

  const loginEmail = useRef();
  const loginPassword = useRef();

  const adminEmail = useRef();
  const adminPassword = useRef();

  function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function maskEmail(email) {
    if (!email || !email.includes("@")) return "";

    const [name, domain] = email.split("@");
    const domainParts = domain.split(".");
    const domainName = domainParts[0] || "";
    const extension = domainParts.slice(1).join(".");

    const maskedName =
      name.length <= 2
        ? `${name[0] || ""}***`
        : `${name.slice(0, 2)}***${name.length > 4 ? name.slice(-1) : ""}`;

    const maskedDomain =
      domainName.length <= 2
        ? `${domainName[0] || ""}***`
        : `${domainName.slice(0, 1)}****`;

    return `${maskedName}@${maskedDomain}${extension ? `.${extension}` : ""}`;
  }

  async function getUsers() {
    const token = localStorage.getItem("user_token");

    if (!token) {
      setUsers([]);
      return;
    }

    try {
      const response = await api.get("/usuarios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data);
    } catch (error) {
      console.log(error);
      setUsers([]);
      setErrorMessage(error.response?.data?.message || "Erro ao buscar usuários.");
    }
  }

  async function checkUserLogin() {
    const token = localStorage.getItem("user_token");

    if (!token) {
      setIsLoggedUser(false);
      setLoggedUserData(null);
      return;
    }

    try {
      const response = await api.get("/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsLoggedUser(true);
      setLoggedUserData(response.data);
    } catch (error) {
      localStorage.removeItem("user_token");
      setIsLoggedUser(false);
      setLoggedUserData(null);
    }
  }

  async function checkAdmin() {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      setIsAdmin(false);
      setAdminData(null);
      return;
    }

    try {
      const response = await api.get("/admin/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsAdmin(true);
      setAdminData(response.data);
    } catch (error) {
      localStorage.removeItem("admin_token");
      setIsAdmin(false);
      setAdminData(null);
    }
  }

  async function createUsers() {
    const name = inputName.current.value.trim();
    const age = inputAge.current.value;
    const email = inputEmail.current.value.trim().toLowerCase();
    const password = inputPassword.current.value.trim();

    if (!name || !age || !email || !password) {
      setErrorMessage("Preencha todos os campos.");
      setSuccessMessage("");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Digite um e-mail válido.");
      setSuccessMessage("");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha precisa ter pelo menos 6 caracteres.");
      setSuccessMessage("");
      return;
    }

    try {
      setLoading(true);

      await api.post("/usuarios", {
        name,
        age,
        email,
        password,
      });

      inputName.current.value = "";
      inputAge.current.value = "";
      inputEmail.current.value = "";
      inputPassword.current.value = "";

      setSuccessMessage("Usuário cadastrado com sucesso!");
      setErrorMessage("");
      setActiveSection("login");
    } catch (error) {
      console.log(error);
      setErrorMessage(error.response?.data?.message || "Erro ao cadastrar usuário.");
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  }

  async function loginUser() {
    const email = loginEmail.current.value.trim().toLowerCase();
    const password = loginPassword.current.value.trim();

    if (!email || !password) {
      setErrorMessage("Preencha e-mail e senha.");
      setSuccessMessage("");
      return;
    }

    try {
      setLoginLoading(true);

      const response = await api.post("/login", {
        email,
        password,
      });

      localStorage.setItem("user_token", response.data.token);
      setIsLoggedUser(true);
      setLoggedUserData(response.data.user);

      loginEmail.current.value = "";
      loginPassword.current.value = "";

      await getUsers();

      setSuccessMessage("Login realizado com sucesso!");
      setErrorMessage("");
      setActiveSection("users");
    } catch (error) {
      console.log(error);
      setErrorMessage(error.response?.data?.message || "Erro ao fazer login.");
      setSuccessMessage("");
    } finally {
      setLoginLoading(false);
    }
  }

  function logoutUser() {
    localStorage.removeItem("user_token");
    setIsLoggedUser(false);
    setLoggedUserData(null);
    setUsers([]);
    setSuccessMessage("Usuário saiu da conta.");
    setErrorMessage("");
  }

  async function loginAdmin() {
    const email = adminEmail.current.value.trim().toLowerCase();
    const password = adminPassword.current.value.trim();

    if (!email || !password) {
      setErrorMessage("Preencha e-mail e senha do administrador.");
      setSuccessMessage("");
      return;
    }

    try {
      setAdminLoading(true);

      const response = await api.post("/admin/login", {
        email,
        password,
      });

      localStorage.setItem("admin_token", response.data.token);
      setIsAdmin(true);
      setAdminData(response.data.admin);

      adminEmail.current.value = "";
      adminPassword.current.value = "";

      setSuccessMessage("Administrador logado com sucesso!");
      setErrorMessage("");
    } catch (error) {
      console.log(error);
      setErrorMessage(error.response?.data?.message || "Erro ao fazer login.");
      setSuccessMessage("");
    } finally {
      setAdminLoading(false);
    }
  }

  function logoutAdmin() {
    localStorage.removeItem("admin_token");
    setIsAdmin(false);
    setAdminData(null);
    setSuccessMessage("Administrador saiu da conta.");
    setErrorMessage("");
  }

  async function deleteUsers(id) {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      setErrorMessage("Somente o administrador pode deletar usuários.");
      setSuccessMessage("");
      return;
    }

    try {
      await api.delete(`/usuarios/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await getUsers();

      setSuccessMessage("Usuário deletado com sucesso!");
      setErrorMessage("");
    } catch (error) {
      console.log(error);
      setErrorMessage(error.response?.data?.message || "Erro ao deletar usuário.");
      setSuccessMessage("");
    }
  }

  useEffect(() => {
    checkUserLogin();
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isLoggedUser) {
      getUsers();
    }
  }, [isLoggedUser]);

  useEffect(() => {
    if (!errorMessage) return;

    setShowError(true);

    const hideTimer = setTimeout(() => setShowError(false), 2500);
    const removeTimer = setTimeout(() => setErrorMessage(""), 3000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [errorMessage]);

  useEffect(() => {
    if (!successMessage) return;

    setShowSuccess(true);

    const hideTimer = setTimeout(() => setShowSuccess(false), 2500);
    const removeTimer = setTimeout(() => setSuccessMessage(""), 3000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [successMessage]);

  return (
    <div className="layout">
      <div className="toast-container">
        {errorMessage && (
          <div className={`toast-message toast-error ${showError ? "show" : "hide"}`}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className={`toast-message toast-success ${showSuccess ? "show" : "hide"}`}>
            {successMessage}
          </div>
        )}
      </div>

      <button
        className="menu-toggle"
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Painel</h2>
          <button
            className="close-menu"
            type="button"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        <button
          className={activeSection === "register" ? "menu-button active" : "menu-button"}
          type="button"
          onClick={() => {
            setActiveSection("register");
            setMenuOpen(false);
          }}
        >
          Cadastrar
        </button>

        <button
          className={activeSection === "login" ? "menu-button active" : "menu-button"}
          type="button"
          onClick={() => {
            setActiveSection("login");
            setMenuOpen(false);
          }}
        >
          Login
        </button>

        <button
          className={activeSection === "users" ? "menu-button active" : "menu-button"}
          type="button"
          onClick={() => {
            setActiveSection("users");
            setMenuOpen(false);
          }}
        >
          Usuários
        </button>

        <button
          className={activeSection === "admin" ? "menu-button active" : "menu-button"}
          type="button"
          onClick={() => {
            setActiveSection("admin");
            setMenuOpen(false);
          }}
        >
          Administrador
        </button>
      </aside>

      {menuOpen && (
        <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <main className="content">
        <h1>Cadastro de Usuários</h1>

        {activeSection === "register" && (
          <section className="section-box">
            <h2 className="section-title">Cadastrar Usuário</h2>

            <form>
              <input ref={inputName} placeholder="Nome" />
              <input ref={inputAge} placeholder="Idade" type="number" />
              <input ref={inputEmail} placeholder="Email" type="email" />
              <input ref={inputPassword} placeholder="Senha" type="password" />

              <button type="button" onClick={createUsers} disabled={loading}>
                {loading ? "Carregando..." : "Cadastrar"}
              </button>
            </form>
          </section>
        )}

        {activeSection === "login" && (
          <section className="section-box">
            <div className="admin-box">
              <h2 className="section-subtitle">Login do Usuário</h2>

              {!isLoggedUser ? (
                <>
                  <input ref={loginEmail} placeholder="Seu e-mail" />
                  <input ref={loginPassword} type="password" placeholder="Sua senha" />

                  <button
                    type="button"
                    className="admin-button"
                    onClick={loginUser}
                    disabled={loginLoading}
                  >
                    {loginLoading ? "Entrando..." : "Entrar"}
                  </button>
                </>
              ) : (
                <div className="admin-card">
                  <p className="admin-status">
                    Logado como: <span>{loggedUserData?.name}</span>
                  </p>

                  <p className="admin-role-line">
                    E-mail: <span>{maskEmail(loggedUserData?.email)}</span>
                  </p>

                  <p className="admin-role-line">
                    Tipo: <span>{loggedUserData?.role}</span>
                  </p>

                  <button type="button" className="logout-button" onClick={logoutUser}>
                    Sair do usuário
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === "users" && (
          <section className="section-box">
            {!isLoggedUser ? (
              <div className="empty-box">
                <p>Faça login com seu usuário para ver a lista.</p>
              </div>
            ) : (
              <>
                <div className="users-header">
                  <h2 className="section-title">Lista de Usuários</h2>
                  <p className="users-count">Total: {users.length}</p>
                </div>

                {users.length === 0 ? (
                  <div className="empty-box">
                    <p>Nenhum usuário cadastrado ainda.</p>
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="card">
                      <div>
                        <p>
                          Nome: <span>{user.name}</span>
                        </p>
                        <p>
                          Idade: <span>{user.age}</span>
                        </p>
                        <p>
                          E-mail: <span className="blur-email strong-blur">{maskEmail(user.email)}</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteUsers(user.id)}
                        className="delete-btn"
                        disabled={!isAdmin}
                        title={isAdmin ? "Deletar usuário" : "Somente admin pode deletar"}
                      >
                        <img src={Trash} alt="Deletar usuário" />
                      </button>
                    </div>
                  ))
                )}
              </>
            )}
          </section>
        )}

        {activeSection === "admin" && (
          <section className="section-box">
            <div className="admin-box">
              <h2 className="section-subtitle">Área do Administrador</h2>

              {!isAdmin ? (
                <>
                  <input ref={adminEmail} placeholder="E-mail do administrador" />
                  <input ref={adminPassword} type="password" placeholder="Senha do administrador" />

                  <button
                    type="button"
                    className="admin-button"
                    onClick={loginAdmin}
                    disabled={adminLoading}
                  >
                    {adminLoading ? "Entrando..." : "Entrar como admin"}
                  </button>
                </>
              ) : (
                <div className="admin-card">
                  <p className="admin-status">
                    Logado como: <span>{adminData?.name}</span>
                  </p>

                  <p className="admin-email-line">
                    E-mail:
                    <span className="blur-email strong-blur">
                      {maskEmail(adminData?.email)}
                    </span>
                  </p>

                  <p className="admin-role-line">
                    Tipo: <span>{adminData?.role}</span>
                  </p>

                  <button type="button" className="logout-button" onClick={logoutAdmin}>
                    Sair do admin
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Home;