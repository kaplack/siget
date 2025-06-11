import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import activityReducer from "../features/activities/activitySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    activities: activityReducer,
  },
});
