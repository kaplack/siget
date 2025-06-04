import { useState, useEffect } from "react";
import { FaSignInAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login, reset } from "../features/auth/authSlice";
import Spinner from "../components/Spinner";
import logo from "../assets/images/Logo_OEDI.png";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (user) {
      navigate("/app/dashboard");
    }
    return () => {
      dispatch(reset());
    };
  }, [isError, user, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    dispatch(login(userData));
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div
      className="container d-flex justify-content-center align-items-center flex-column"
      style={{ minHeight: "100vh" }}
    >
      <div
        class
        className="text-center mb-5"
        style={{
          width: "100%",
        }}
      >
        <img
          src={logo}
          alt="Logo"
          className="img-fluid mb-4"
          style={{ maxWidth: "200px" }}
        />
        {/* <h2 className="text-center mb-4">Sistema de Gestión de Proyectos</h2> */}
      </div>
      <div
        className="card p-4 shadow"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h1 className="text-center mb-3">
          <FaSignInAlt /> Ingresar
        </h1>
        <p className="text-center mb-4">Accede a tu cuenta</p>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Ingrese su email"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </div>
        </form>

        <div className="text-center">
          <small>
            No tienes una cuenta? <a href="/register">Regístrate aquí</a>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;
