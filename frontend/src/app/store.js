import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import activityReducer from "../features/activities/activitySlice";
import projectReducer from "../features/projects/projectSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import profilesReducer from "../features/profiles/profilesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    activities: activityReducer,
    dashboard: dashboardReducer,
    profiles: profilesReducer,
  },
});
