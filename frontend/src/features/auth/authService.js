import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL + "/api/users";

const register = async (userData) => {
  const response = await axios.post(API_URL, {
    ...userData,
    email: userData.email.toLowerCase(), // normalize email here too
  });
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(API_URL + "/login", {
    ...userData,
    email: userData.email.toLowerCase(), // normalize email here too
  });
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
const logout = () => localStorage.removeItem("user");

const authService = {
  register,
  logout,
  login,
};

export default authService;
