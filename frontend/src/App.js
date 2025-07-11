import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";

import Register from "./pages/Register";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import NewProject from "./pages/NewProject";

import Dashboard from "./pages/Dashboard";
import Convenios from "./components/dashboard/Convenios";
import Avance from "./components/dashboard/Avance";
import "bootstrap/dist/css/bootstrap.min.css";

import Admin from "./pages/Admin";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ProjectSchedule from "./pages/ProjectSchedule";
import ProjectBaseLine from "./pages/BaseLine";
import ProjectList from "./pages/ProjectList";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import EditProject from "./pages/EditProject";

function App() {
  const theme = createTheme();
  return (
    <ThemeProvider theme={theme}>
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
              <Route path="dashboard/*" element={<Dashboard />}>
                <Route path="convenios" element={<Convenios />} />
                <Route path="avance" element={<Avance />} />
                <Route index element={<Navigate to="convenios" />} />
              </Route>

              <Route path="project/new" element={<NewProject />} />
              <Route path="project/edit/:id" element={<EditProject />} />
              <Route
                path="project-list/:projectId/tracking"
                element={<ProjectSchedule />}
              />
              <Route
                path="project-list/:projectId/base-line"
                element={<ProjectBaseLine />}
              />
              <Route path="admin" element={<Admin />} />
              <Route path="project-list" element={<ProjectList />} />
            </Route>
          </Routes>
        </Router>
        <ToastContainer />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
