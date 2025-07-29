import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import {
  setMessages,
  addMessage,
  setSelectedConnection,
  setConnections,
  clearMessages,
  updateMessageDeliveryStatus,
} from "../../utils/messageSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import socket from "../Socket";

const Messages = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const connections = useSelector((state) => state.connections);
  const messagesByConnection = useSelector(
    (state) => state.messages.messagesByConnection
  );
  const selectedConnectionId = useSelector(
    (state) => state.messages.selectedConnectionId
  );

  const [messageContent, setMessageContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);

  const isSenderMessage = (message) =>
    (typeof message.sender === "string" && message.sender === user._id) ||
    (typeof message.sender === "object" && message.sender._id === user._id);

  const messages = messagesByConnection[selectedConnectionId] || [];
  const selectedConnection = connections.find(
    (connection) => connection._id === selectedConnectionId
  );

  useEffect(() => {
    if (user?._id) {
      dispatch(clearMessages());

      const fetchConnections = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/connections`, {
            withCredentials: true,
          });
          dispatch(setConnections(response.data));
        } catch (error) {
          console.error("Error fetching connections:", error);
        }
      };

      fetchConnections();
    }
  }, [user?._id, dispatch]);

  useEffect(() => {
    if (selectedConnectionId) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/message/conversation?receiverId=${selectedConnectionId}`,
            { withCredentials: true }
          );
          dispatch(
            setMessages({
              connectionId: selectedConnectionId,
              messages: response.data,
            })
          );

          scrollToBottom();
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      fetchMessages();
    }
  }, [selectedConnectionId, dispatch]);

  useEffect(() => {
    if (user?._id) {
      const emitOnline = () => {
        socket.emit("userOnline", user._id);
        socket.emit("getOnlineUsers");
      };

      emitOnline();
      socket.on("connect", emitOnline);

      const handleReceiveMessage = (message) => {
        const connectionId =
          message.sender === user._id ||
          (typeof message.sender === "object" &&
            message.sender._id === user._id)
            ? message.receiver._id || message.receiver
            : message.sender._id || message.sender;

        dispatch(addMessage({ connectionId, message }));

        if (connectionId === selectedConnectionId) {
          scrollToBottom();
        } else {
          const sender = connections.find((c) => c._id === connectionId);
          toast.info(`New message from ${sender?.firstName || "Someone"}`, {
            position: "bottom-left",
            autoClose: 3000,
          });
        }
      };

      socket.on("receive_message", handleReceiveMessage);
      socket.on("message_delivered", ({ messageId, receiverId }) => {
        const connectionId =
          receiverId === user._id ? selectedConnectionId : receiverId;

        dispatch(
          updateMessageDeliveryStatus({
            connectionId,
            messageId,
            status: true,
          })
        );
      });
      socket.on("userOnlineStatus", (status) => {
        setOnlineStatus((prevStatus) => ({
          ...prevStatus,
          [status.userId]: status.isOnline,
        }));
      });
      socket.on("typing", ({ senderId, isTyping }) => {
        if (senderId === selectedConnectionId) {
          setIsTyping(isTyping);
        }
      });
      socket.on("user_now_online_notification", ({ userId }) => {
        const user = connections.find((c) => c._id === userId);
        if (user) {
          toast.info(`${user.firstName} is now online`, {
            position: "bottom-left",
            autoClose: 3000,
          });
        }
      });
      socket.on("online_users_list", (onlineUsers) => {
        const updatedStatus = {};
        connections.forEach((c) => {
          updatedStatus[c._id] = onlineUsers.includes(c._id);
        });
        setOnlineStatus(updatedStatus);
      });

      return () => {
        socket.off("receive_message", handleReceiveMessage);
        socket.off("message_delivered");
        socket.off("userOnlineStatus");
        socket.off("typing");
        socket.off("online_users_list");
        socket.off("connect", emitOnline);
        socket.off("user_now_online_notification");
      };
    }
  }, [user?._id, selectedConnectionId, dispatch]);

  useEffect(() => {
    if (messageContent.trim()) {
      socket.emit("typing", {
        senderId: user._id,
        receiverId: selectedConnectionId,
        isTyping: true,
      });

      const timeout = setTimeout(() => {
        socket.emit("typing", {
          senderId: user._id,
          receiverId: selectedConnectionId,
          isTyping: false,
        });
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [messageContent, user._id, selectedConnectionId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      const messageList = document.querySelector(".messages-list");
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    }, 100);
  };

  const handleSendMessage = async (type = "text", content = messageContent) => {
    if (!content || !selectedConnectionId || !user?._id) return;

    const newMessage = {
      sender: user._id,
      receiver: selectedConnectionId,
      content,
      messageType: type,
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/message/send`,
        newMessage,
        { withCredentials: true }
      );
      const savedMessage = response.data;

      socket.emit("send_message", savedMessage);

      dispatch(
        addMessage({
          connectionId: selectedConnectionId,
          message: savedMessage,
        })
      );

      setMessageContent("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessageContent((prev) => prev + emoji.native);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(`${BASE_URL}/upload/image`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = res.data.url;
      handleSendMessage("image", imageUrl);
    } catch (error) {
      console.error("Image upload failed", error);
    }
  };

  const handleSelectConnection = (connectionId) => {
    dispatch(setSelectedConnection(connectionId));
  };

  if (!user) {
    return <div>Please log in to see messages.</div>;
  }

  return (
    <div className="flex h-screen bg-pink-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold">Chats</h2>
        </div>
        {connections?.length > 0 ? (
          connections.map((connection) => (
            <div
              key={connection._id}
              onClick={() => handleSelectConnection(connection._id)}
              className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-pink-100 ${
                selectedConnectionId === connection._id ? "bg-pink-200" : ""
              }`}
            >
              <img
                src={connection.photoUrl}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800 text-lg">
                    {connection.firstName} {connection.lastName}
                  </h4>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      onlineStatus[connection._id]
                        ? "bg-pink-500"
                        : "bg-gray-400"
                    }`}
                  />
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {connection.about}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="p-4 text-gray-500">No connections available.</p>
        )}
      </div>

      {/* Chat window */}
      <div className="w-2/3 flex flex-col relative">
        {/* Chat header */}
        <div className="px-6 py-4 bg-pink-100 border-b flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {selectedConnection
                ? `${selectedConnection.firstName} ${selectedConnection.lastName}`
                : "Select a chat"}
            </h3>
            {selectedConnectionId && (
              <p className="text-sm text-gray-600">
                {onlineStatus[selectedConnectionId] ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="messages-list flex-1 overflow-y-auto px-6 py-4 space-y-2 bg-[#e5ddd5]">
          {messages?.length > 0 ? (
            messages.map((message) => {
              const isSender = isSenderMessage(message);
              const time = new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={message._id}
                  className={`flex ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-xl px-4 py-2 max-w-sm text-sm ${
                      isSender
                        ? "bg-pink-300 text-right text-black"
                        : "bg-white text-left text-black"
                    }`}
                  >
                    {message.messageType === "image" ? (
                      <img
                        src={message.content}
                        alt="Sent"
                        className="max-w-xs rounded-md"
                      />
                    ) : (
                      <p>{message.content}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-1 flex justify-end gap-1">
                      <span>{time}</span>
                      <span>
                        {isSender &&
                          (message.read ? (
                            <span className="text-pink-600">✔✔</span>
                          ) : message.deliveryStatus ? (
                            <span className="text-yellow-500">✔✔</span>
                          ) : (
                            <span className="text-yellow-500">✔</span>
                          ))}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center">No messages yet...</p>
          )}
        </div>

        {/* Typing indicator */}
        {isTyping && selectedConnectionId && (
          <div className="px-6 py-2 text-sm text-gray-600 italic">
            Typing...
          </div>
        )}

        {/* Input bar */}
        <div className="p-4 bg-white border-t flex gap-2 items-center sticky bottom-0">
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-xl"
          >
            😊
          </button>

          <input
            type="file"
            hidden
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button onClick={() => fileInputRef.current.click()}>📷</button>

          <textarea
            rows="1"
            className="flex-grow border rounded-full p-3 resize-none outline-none text-sm bg-gray-100"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type a message..."
          />
          <button
            onClick={() => handleSendMessage("text")}
            className="bg-pink-500 text-white px-5 py-2 rounded-full hover:bg-pink-600"
          >
            Send
          </button>
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 z-50">
            <Picker data={data} onEmojiSelect={handleEmojiSelect} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
