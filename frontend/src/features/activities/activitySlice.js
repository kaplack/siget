import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import activityService from "./activityService";

// Async thunk to fetch activities by project
export const fetchActivitiesByProject = createAsyncThunk(
  "activities/fetchByProject",
  async (projectId, thunkAPI) => {
    try {
      return await activityService.getActivitiesByProject(projectId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const activitySlice = createSlice({
  name: "activities",
  initialState: {
    data: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    setActivities: (state, action) => {
      state.data = action.payload;
    },
    clearActivities: (state) => {
      state.data = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivitiesByProject.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchActivitiesByProject.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchActivitiesByProject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Error al cargar actividades";
      });
  },
});

export const { setActivities, clearActivities } = activitySlice.actions;
export default activitySlice.reducer;
