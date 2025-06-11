import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";

import Register from "./pages/Register";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import NewProject from "./pages/NewProject";
import ListaProyectos from "./pages/ListaProyectos";
import Dashboard from "./pages/Dashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import Program from "./pages/Program";
import Admin from "./pages/Admin";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/register" element={<Register />} />

          <Route
            path="/app"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="project/new" element={<NewProject />} />
            <Route path="project/program" element={<Program />} />
            <Route path="proyectos" element={<ListaProyectos />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer />
    </LocalizationProvider>
  );
}

export default App;
