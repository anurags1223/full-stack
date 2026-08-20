import { createSlice } from "@reduxjs/toolkit";

const activitySlice = createSlice({
  name: "activity",
  initialState: {
    logs: [
      {
        id: "store-ready",
        message: "Normalized store initialized",
        actionType: "store/configured",
        time: Date.now(),
      },
    ],
  },
  reducers: {
    activityLogged(state, action) {
      state.logs.unshift(action.payload);
      state.logs = state.logs.slice(0, 8);
    },
  },
});

export const { activityLogged } = activitySlice.actions;
export default activitySlice.reducer;
