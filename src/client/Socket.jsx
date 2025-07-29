// socket.jsx
import { io } from "socket.io-client";
import { BASE_URL } from "./utils/constants";

// ✅ Singleton pattern
let socket;

if (!socket) {
  socket = io(BASE_URL, {
    withCredentials: true,
    transports: ["websocket"],
  });

  socket.connect(); // ✅ this ensures connection opens
}

export default socket;
