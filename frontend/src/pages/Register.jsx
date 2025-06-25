import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { register } from "../features/auth/authSlice";
import logo from "../assets/images/Logo_OEDI.png";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
  });

  const { name, email, password, password2 } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isError, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (user) {
      navigate("/");
    }
  }, [isError, user, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    const userData = {
      name,
      email: email.toLowerCase(), // Normalize email to lowercase
      password,
    };

    try {
      // Unwrap lets you handle errors with try/catch instead of .catch()
      await dispatch(register(userData)).unwrap();
      toast.success("Usuario registrado exitosamente");
    } catch (error) {
      toast.error(error.message || "Error al registrar usuario");
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center flex-column py-5"
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
          <FaUser /> Registrarse
        </h1>
        <p className="text-center mb-4">Crea tu cuenta</p>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Nombre de usuario
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Ingresa tu nombre"
              required
            />
          </div>

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
              placeholder="Ingresa tu email"
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
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password2" className="form-label">
              Confirmar contraseña
            </label>
            <input
              type="password"
              className="form-control"
              id="password2"
              name="password2"
              value={password2}
              onChange={onChange}
              placeholder="Confirma tu contraseña"
              required
            />
          </div>

          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-primary">
              Registrarse
            </button>
          </div>
        </form>

        <div className="text-center">
          <small>
            ¿Ya tienes cuenta? <a href="/">Ingresa aquí</a>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Register;
