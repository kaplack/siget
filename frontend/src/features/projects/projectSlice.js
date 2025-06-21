import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import projectService from "./projectService";

const user = JSON.parse(localStorage.getItem("user"));

const initialState = {
  projects: [],
  project: {},
  isError: false,
  isLoading: false,
  message: "",
};

export const createProject = createAsyncThunk(
  "projects/create",
  async (project, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await projectService.createProject(project, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getUserProjects = createAsyncThunk(
  "projects/getAll",
  async (_, thunkAPI) => {
    try {
      //console.log("Fetching projects...");
      const token = thunkAPI.getState().auth.user.token;
      return await projectService.getUserProjects(token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getProject = createAsyncThunk(
  "projects/getProject",
  async (projectId, thunkAPI) => {
    try {
      //console.log("Fetching projects...");
      const token = thunkAPI.getState().auth.user.token;
      return await projectService.getProject(projectId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isLoading = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE PROJECT
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.project = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.project = null;
      })

      //Get all projects
      .addCase(getUserProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.projects = action.payload;
      })
      .addCase(getUserProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.projects = null;
      })

      //Get project by Id
      .addCase(getProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.project = action.payload;
      })
      .addCase(getProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.project = null;
      });
  },
});

export const { reset } = projectSlice.actions;
export default projectSlice.reducer;
