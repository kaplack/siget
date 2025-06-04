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

export const getProjects = createAsyncThunk(
  "projects/getAll",
  async (_, thunkAPI) => {
    try {
      return await projectService.getProjects();
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
      .addCase(getProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.projects = action.payload;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.projects = null;
      });
  },
});

export const { reset } = projectSlice.actions;
export default projectSlice.reducer;
