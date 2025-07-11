import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL + "/api/dashboard";

// Fetch dashboard data from backend
const getDashboard = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Fetch dashboard data from backend
const getAgreements = async () => {
  const response = await axios.get(API_URL + "/agreement");
  return response.data;
};

const dashboardService = {
  getDashboard,
  getAgreements,
};

export default dashboardService;
