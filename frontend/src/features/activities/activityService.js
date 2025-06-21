// src/features/activities/activityService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL + "/api/activities/";

// Get activities by projectId
const getActivitiesByProject = async (projectId, token, tipoVersion) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const url = tipoVersion
    ? `${API_URL}project/${projectId}/${tipoVersion}`
    : `${API_URL}project/${projectId}`;
  const response = await axios.get(url, config);
  return response.data;
};

// Create a new activity
const createActivity = async (activityData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(API_URL, activityData, config);
  return response.data;
};

// Add a new version to an existing activity
const addActivityVersion = async (versionData) => {
  const response = await axios.post(`${API_URL}version`, versionData);
  return response.data;
};

export const updateDraftActivity = async (activityId, data, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await axios.patch(`${API_URL}draft/${activityId}`, data, config);
  return res.data;
};

export const deleteDraftActivity = async (activityId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await axios.delete(`${API_URL}${activityId}`, config);
  return res.data;
};

export const setBaselineForProject = async (projectId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await axios.post(
    `${API_URL}project/${projectId}/set-baseline`,
    config
  );
  return res.data;
};

/*********************************************/
/*  TRACKING                                 */
/*********************************************/

// Add a new version to an existing activity
const addTrackingVersion = async (activityId, versionData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(
    `${API_URL}${activityId}/tracking`,
    versionData,
    config
  );
  return response.data;
};

const activityService = {
  getActivitiesByProject,
  createActivity,
  addActivityVersion,
  updateDraftActivity,
  deleteDraftActivity,
  setBaselineForProject,
  addTrackingVersion,
};

export default activityService;
