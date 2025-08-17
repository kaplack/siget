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

const getUsers = async (token, thunkAPI) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await axios.get(`${API_URL}?includeInactive=true`, config);
  return res.data;
};

const getUserById = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await axios.get(`${API_URL}/${userId}`, config);
  return res.data;
};

const updateUser = async (userId, userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await axios.put(`${API_URL}/${userId}`, userData, config);
  if (res.data) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id === userId) {
      localStorage.setItem("user", JSON.stringify({ ...user, ...res.data }));
    }
  }
  return res.data;
};

const changePassword = async (userId, passwordData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  console.log("Changing password for user:", userId, passwordData);
  const res = await axios.patch(
    `${API_URL}/${userId}/password`,
    { newPassword: passwordData },
    config
  );
  return res.data;
};

const changeEmail = async (userId, newEmail, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  console.log("Changing email for user:", userId, newEmail);
  const res = await axios.patch(
    `${API_URL}/${userId}/email`,
    { newEmail },
    config
  );
  return res.data;
};

const assignProfile = async (userId, profileId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await axios.patch(
    `${API_URL}/${userId}/profile`,
    { profileId },
    config
  );
  return res.data;
};

const activateUser = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await axios.patch(`${API_URL}/${userId}/activate`, {}, config);
  return res.data;
};

const deactivateUser = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await axios.patch(`${API_URL}/${userId}/deactivate`, {}, config);
  return res.data;
};

const delUser = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await axios.delete(`${API_URL}/${userId}`, config);
  return res.data;
};

const adminCreateUser = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(API_URL + "/admin", userData, config);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const authService = {
  register,
  logout,
  login,
  getUsers,
  getUserById,
  adminCreateUser,
  delUser,
  updateUser,
  changePassword,
  changeEmail,
  assignProfile,
  activateUser,
  deactivateUser,
};

export default authService;
