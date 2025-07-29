import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
  name: "connection",
  initialState: [], // Changed initial state to an array to store multiple connections
  reducers: {
    addConnections: (state, action) => {
      return action.payload; // Replace the state with the new list of connections
    },
    addConnection: (state, action) => {
      state.push(action.payload); // Add a single connection
    },
    removeConnection: (state, action) => {
      return state.filter((connection) => connection._id !== action.payload); // Remove a specific connection
    },
  },
});

export const { addConnections, addConnection, removeConnection } =
  connectionSlice.actions;

export default connectionSlice.reducer;
