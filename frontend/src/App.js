import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";

import Register from "./pages/Register";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import NewProject from "./pages/NewProject";
import ListaProyectos from "./pages/ListaProyectos"; // lo agrego como ejemplo
import Dashboard from "./pages/Dashboard"; // lo agrego como ejemplo
import "bootstrap/dist/css/bootstrap.min.css";
import Program from "./pages/Program"; // lo agrego como ejemplo
import Admin from "./pages/Admin"; // lo agrego como ejemplo

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
