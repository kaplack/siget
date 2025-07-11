// src/features/activities/activitySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import activityService from "./activityService";
import { act } from "react";

// Get activities by project ID
export const getActivitiesByProject = createAsyncThunk(
  "activities/getByProject",
  async ({ projectId, tipoVersion = "" }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await activityService.getActivitiesByProject(
        projectId,
        token,
        tipoVersion
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create a new activity
export const createActivity = createAsyncThunk(
  "activities/create",
  async (activityData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await activityService.createActivity(activityData, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add a new activity version
export const addActivityVersion = createAsyncThunk(
  "activities/addVersion",
  async (versionData, thunkAPI) => {
    try {
      return await activityService.addActivityVersion(versionData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk for activity draft update
export const updateDraftActivity = createAsyncThunk(
  "activities/updateDraftActivity",
  async ({ activityId, data }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await activityService.updateDraftActivity(activityId, data, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Thunk for activity draft delete
export const deleteDraftActivity = createAsyncThunk(
  "activities/deleteDraftActivity",
  async (activityId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await activityService.deleteDraftActivity(activityId, token);
      return activityId; // Return the ID of the deleted activity
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Thunk for activity draft delete
export const setBaselineForProject = createAsyncThunk(
  "activities/setBaseLine",
  async (projectId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      console.log("sliceToken", token);
      const response = await activityService.setBaselineForProject(
        projectId,
        token
      );
      return response; // Return the ID of the deleted activity
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Add a new activity version
export const addTrackingVersion = createAsyncThunk(
  "activities/addVersion",
  async ({ activityId, versionData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await activityService.addTrackingVersion(
        activityId,
        versionData,
        token
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// import activities from Excel file
export const importarActividadesExcel = createAsyncThunk(
  "activities/importarExcel",
  async ({ projectId, file }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await activityService.importActivitiesFromExcel(
        projectId,
        file,
        token
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// delete all activities by projectId
export const deleteAllActivitiesByProject = createAsyncThunk(
  "activities/deleteAllActivitiesByProject",
  async (projectId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await activityService.deleteAllActivitiesByProject(
        projectId,
        token
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  activities: [],
  activity: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

const activitySlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    resetActivityState: (state) => {
      state.activities = [];
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getActivitiesByProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getActivitiesByProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activities = action.payload;
      })
      .addCase(getActivitiesByProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // CREATE
      .addCase(createActivity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activities.push(action.payload);
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ADD VERSION
      .addCase(addActivityVersion.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addActivityVersion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // puedes elegir si guardar o no la versión en un array
      })
      .addCase(addActivityVersion.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // UPDATE DRAFT ACTIVITY
      .addCase(updateDraftActivity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateDraftActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(updateDraftActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // IMPORT ACTIVITIES FROM EXCEL
      .addCase(importarActividadesExcel.pending, (state) => {
        state.isLoading = true;
        state.isError = null;
      })
      .addCase(importarActividadesExcel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(importarActividadesExcel.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // DELETE AL ACTIVITIES BY PROJECT
      .addCase(deleteAllActivitiesByProject.fulfilled, (state, action) => {
        state.message = action.payload.message;
      })
      .addCase(deleteAllActivitiesByProject.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetActivityState } = activitySlice.actions;
export default activitySlice.reducer;
