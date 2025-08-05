// src/features/profiles/profilesService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL + "/api/profiles";

const getProfiles = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

const createProfile = async (profileData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(API_URL + "/new", profileData, config);
  return response.data;
};

const updateProfile = async (id, profileData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${API_URL}/${id}`, profileData, config);
  return response.data;
};

const deleteProfile = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  await axios.delete(`${API_URL}/${id}`, config);
};

const profilesService = {
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
};
export default profilesService;
