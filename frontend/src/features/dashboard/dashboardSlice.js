import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import dashboardService from "./dashboardService";

// Async thunk to fetch dashboard data
export const getDashboard = createAsyncThunk(
  "dashboard/getDashboard",
  async (_, thunkAPI) => {
    try {
      return await dashboardService.getDashboard();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Error desconocido"
      );
    }
  }
);

// Async thunk to fetch dashboard data
export const getAgreements = createAsyncThunk(
  "dashboard/getAgreements",
  async (_, thunkAPI) => {
    try {
      return await dashboardService.getAgreements();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Error desconocido"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    data: null,
    dinamicData: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetDashboard: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //DASHBOARD HEADER
      .addCase(getDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al cargar el dashboard";
      })

      //DINAMIC DATA
      .addCase(getAgreements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAgreements.fulfilled, (state, action) => {
        state.loading = false;
        state.dinamicData = action.payload;
      })
      .addCase(getAgreements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al cargar el dashboard";
      });
  },
});

export const { resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
