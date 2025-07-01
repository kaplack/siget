import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL + "/api/projects";

// Create new project
const createProject = async (data, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(API_URL, data, config);
  return response.data;
};

// Get user projects
const getUserProjects = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL + "/user", config);
  return response.data;
};

// Get project by Id
const getProject = async (projectId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL + "/project/" + projectId, config);
  return response.data;
};

const updateProject = async (id, updatedData, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const res = await axios.put(`${API_URL}/project/${id}`, updatedData, config);
  return res.data;
};

const deleteUserProject = async (projectId, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await axios.delete(`${API_URL}/delete/${projectId}`, config);
  return response.data;
};

const projectService = {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
  deleteUserProject,
};
export default projectService;
export { createProject, getUserProjects };
