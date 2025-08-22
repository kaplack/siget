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
  "projects/getUserProjects",
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

export const getAllProjects = createAsyncThunk(
  "projects/getAll",
  async (_, thunkAPI) => {
    try {
      //console.log("Fetching projects...");
      const token = thunkAPI.getState().auth.user.token;
      return await projectService.getAllProjects(token);
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

// Update a project
export const updateProject = createAsyncThunk(
  "projects/update",
  async ({ id, updatedData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const response = await projectService.updateProject(
        id,
        updatedData,
        token
      );
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

// Delete a project by id
export const deleteUserProject = createAsyncThunk(
  "project/deleteProject",
  async (projectId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const response = await projectService.deleteUserProject(projectId, token);
      return response; // puede retornar projectId si es suficiente
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Delete a project by id
export const annulUserProject = createAsyncThunk(
  "project/annulProject",
  async (projectId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      //console.log("token: ", token);
      //console.log("Anulando proyecto con ID:", projectId);
      const response = await projectService.annulUserProject(projectId, token);
      return response; // puede retornar projectId si es suficiente
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
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
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.project = action.payload; // actualiza el proyecto editado
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      //Get user projects
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
        state.projects = [];
      })

      //Get all projects
      .addCase(getAllProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.projects = action.payload;
      })
      .addCase(getAllProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.projects = [];
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
      })
      // Delete project
      .addCase(deleteUserProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUserProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = "Proyecto eliminado correctamente";
        const deletedId = action.payload.id || action.payload; // por si solo devuelve el ID
        state.projects = state.projects.filter((p) => p.id !== deletedId);
      })
      .addCase(deleteUserProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Error al eliminar proyecto";
      })

      // annul project
      .addCase(annulUserProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(annulUserProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = "Proyecto anulado correctamente";
      })
      .addCase(annulUserProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Error al anular proyecto";
      });
  },
});

export const { reset } = projectSlice.actions;
export default projectSlice.reducer;
