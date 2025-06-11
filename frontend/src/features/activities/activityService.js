import axios from "axios"; // Asegúrate de que esta ruta es correcta

const API_URL = process.env.REACT_APP_API_URL + "/api/activities";

// Get all activities by project ID (solo versiones vigentes)
const getActivitiesByProject = async (projectId) => {
  const res = await axios.get(`${API_URL}/project/${projectId}`);
  return res.data;
};

const activityService = {
  getActivitiesByProject,
};

export default activityService;
