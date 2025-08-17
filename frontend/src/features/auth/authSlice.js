import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

const user = JSON.parse(localStorage.getItem("user"));

const initialState = {
  user: user ? user : null,
  users: [],
  userById: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

//REGISTER
export const register = createAsyncThunk(
  "auth/register",
  async (user, thunkAPI) => {
    try {
      return await authService.register(user);
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

//Login
export const login = createAsyncThunk("auth/login", async (user, thunkAPI) => {
  try {
    return await authService.login(user);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

//Logout user
export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

// Get users
export const getUsers = createAsyncThunk(
  "auth/getUsers",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await authService.getUsers(token);
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

// Get user by ID
export const getUserById = createAsyncThunk(
  "auth/getUserById",
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await authService.getUserById(userId, token);
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

export const adminCreateUser = createAsyncThunk(
  "auth/adminCreateUser",
  async (userData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await authService.adminCreateUser(userData, token);
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

// Update user
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async ({ userId, userData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await authService.updateUser(userId, userData, token);
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

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ userId, passwordData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await authService.changePassword(userId, passwordData, token);
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

export const changeEmail = createAsyncThunk(
  "auth/changeEmail",
  async ({ userId, newEmail }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await authService.changeEmail(userId, newEmail, token);
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

export const assignProfile = createAsyncThunk(
  "auth/assignProfile",
  async ({ userId, profileId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await authService.assignProfile(userId, profileId, token);
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

export const activateUser = createAsyncThunk(
  "auth/activateUser",
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await authService.activateUser(userId, token);
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

export const deactivateUser = createAsyncThunk(
  "auth/deactivateUser",
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await authService.deactivateUser(userId, token);
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

export const delUser = createAsyncThunk(
  "auth/delUser",
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await authService.delUser(userId, token);
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

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        //state.user = action.payload;
        state.message =
          "Usuario registrado exitosamente. Por favor, inicie sesión.";
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })

      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })

      // get users
      .addCase(getUsers.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(getUsers.fulfilled, (s, a) => {
        s.isLoading = false;
        s.users = a.payload || [];
      })
      .addCase(getUsers.rejected, (s, a) => {
        s.isLoading = false;
        s.isError = true;
        s.message = a.payload;
      })

      // get users by id
      .addCase(getUserById.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(getUserById.fulfilled, (s, a) => {
        s.isLoading = false;
        s.userById = a.payload || [];
      })
      .addCase(getUserById.rejected, (s, a) => {
        s.isLoading = false;
        s.isError = true;
        s.message = a.payload;
      })

      // update user
      .addCase(updateUser.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (s, a) => {
        s.isLoading = false;
        s.userById = a.payload || [];
      })
      .addCase(updateUser.rejected, (s, a) => {
        s.isLoading = false;
        s.isError = true;
        s.message = a.payload;
      })

      // del User
      .addCase(delUser.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(delUser.fulfilled, (s, a) => {
        s.isLoading = false;
        s.message = a.payload.message || "User deleted successfully";
      })
      .addCase(delUser.rejected, (s, a) => {
        s.isLoading = false;
        s.isError = true;
        s.message = a.payload;
      })

      // change password
      .addCase(changePassword.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(changePassword.fulfilled, (s, a) => {
        s.isLoading = false;
        s.message = a.payload.message || "Password updated successfully";
      })
      .addCase(changePassword.rejected, (s, a) => {
        s.isLoading = false;
        s.isError = true;
        s.message = a.payload;
      })
      // change email
      .addCase(changeEmail.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(changeEmail.fulfilled, (s, a) => {
        s.isLoading = false;
        s.message = a.payload.message || "Email updated successfully";
      })
      .addCase(changeEmail.rejected, (s, a) => {
        s.isLoading = false;
        s.isError = true;
        s.message = a.payload;
      })
      // assign profile
      .addCase(assignProfile.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(assignProfile.fulfilled, (s, a) => {
        s.isLoading = false;
        s.message = a.payload.message || "Profile assigned successfully";
      })
      .addCase(assignProfile.rejected, (s, a) => {
        s.isLoading = false;
        s.isError = true;
        s.message = a.payload;
      })
      // activate profile
      .addCase(activateUser.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(activateUser.fulfilled, (s, a) => {
        s.isLoading = false;
        s.message = a.payload.message || "User activated successfully";
      })
      .addCase(activateUser.rejected, (s, a) => {
        s.isLoading = false;
        s.isError = true;
        s.message = a.payload;
      })
      // deactivate profile
      .addCase(deactivateUser.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(deactivateUser.fulfilled, (s, a) => {
        s.isLoading = false;
        s.message = a.payload.message || "User deactivated successfully";
      })
      .addCase(deactivateUser.rejected, (s, a) => {
        s.isLoading = false;
        s.isError = true;
        s.message = a.payload;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
