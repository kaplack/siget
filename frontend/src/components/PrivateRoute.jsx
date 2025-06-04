import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";

const isTokenExpired = (token) => {
  try {
    if (!token) return true;

    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload));

    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return true;
  }
};

const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const [authenticated, setAuthenticated] = useState(!!user); // Convertir a booleano

  const dispatch = useDispatch();
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  // Vigilar cambios en el usuario autenticado
  useEffect(() => {
    //console.log("Token:", token);

    if (isTokenExpired(token)) {
      dispatch(logout()); // Acción para limpiar el estado global de Redux
      setAuthenticated(false);
    } else {
      setAuthenticated(!!user);
    }
  }, [user, token, dispatch]);

  if (authenticated) return children;

  return <Navigate to="/" />;
};

export default PrivateRoute;
