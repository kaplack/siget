import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import profilesService from "./profilesService";

const initialState = {
  profiles: [],
  isLoading: false,
  isError: false,
  message: "",
};

// Async thunks for CRUD operations
export const getProfiles = createAsyncThunk(
  "profiles/getAll",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await profilesService.getProfiles(token);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error fetching profiles";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createProfile = createAsyncThunk(
  "profiles/create",
  async (profileData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await profilesService.createProfile(profileData, token);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error creating profile";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "profiles/update",
  async ({ id, profileData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      return await profilesService.updateProfile(id, profileData, token);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error updating profile";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteProfile = createAsyncThunk(
  "profiles/delete",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await profilesService.deleteProfile(id, token);
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error deleting profile";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const profileSlice = createSlice({
  name: "profiles",
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfiles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profiles = action.payload;
      })
      .addCase(getProfiles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profiles.push(action.payload);
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profiles = state.profiles.map((profile) =>
          profile.id === action.payload.id ? action.payload : profile
        );
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profiles = state.profiles.filter(
          (profile) => profile.id !== action.payload
        );
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = profileSlice.actions;
export default profileSlice.reducer;
