import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    connections: [],
    messagesByConnection: {},
    selectedConnectionId: null,
  },
  reducers: {
    setConnections(state, action) {
      state.connections = action.payload;
    },

    setMessages(state, action) {
      const { connectionId, messages } = action.payload;

      // Map messages to include local deliveryStatus and read flags
      state.messagesByConnection[connectionId] = messages.map((msg) => ({
        ...msg,
        deliveryStatus: msg.delivered || false,
        read: msg.read || false,
      }));
    },

    addMessage(state, action) {
      const { connectionId, message } = action.payload;

      if (!state.messagesByConnection[connectionId]) {
        state.messagesByConnection[connectionId] = [];
      }

      const exists = state.messagesByConnection[connectionId].some(
        (msg) => msg._id === message._id
      );

      if (!exists) {
        state.messagesByConnection[connectionId].push({
          ...message,
          deliveryStatus: message.delivered || false,
          read: message.read || false,
        });
      }
    },

    setSelectedConnection(state, action) {
      state.selectedConnectionId = action.payload;
    },

    updateMessageReadStatus(state, action) {
      const { connectionId, messageId } = action.payload;
      const messages = state.messagesByConnection[connectionId];
      const message = messages?.find((msg) => msg._id === messageId);

      if (message) {
        message.read = true;
      }
    },

    updateMessageDeliveryStatus(state, action) {
      const { connectionId, messageId, status } = action.payload;
      const messages = state.messagesByConnection[connectionId];
      const message = messages?.find((msg) => msg._id === messageId);

      if (message) {
        message.deliveryStatus = status;
      }
    },

    clearMessages(state) {
      state.messagesByConnection = {};
      state.selectedConnectionId = null;
    },
  },
});

export const {
  setConnections,
  setMessages,
  addMessage,
  setSelectedConnection,
  updateMessageReadStatus,
  updateMessageDeliveryStatus,
  clearMessages,
} = messageSlice.actions;

export default messageSlice.reducer;
