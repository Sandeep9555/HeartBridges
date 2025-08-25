 # HeartBridge – Dating Application

**HeartBridge** is a modern, production-ready dating platform built with the **MERN stack**, enabling users to find meaningful connections and chat instantly. Designed for scalability, it features **JWT-based authentication**, **Redis-optimized real-time communication**, and robust **RESTful APIs** — all wrapped in a sleek, responsive UI.

## 🚀 Live Demo
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)]([https://your-live-link.com)](https://heartbridges-frontend.onrender.com)

## 📸 Screenshots

### 💬 Chat
![Chat](https://raw.githubusercontent.com/Sandeep9555/HeartBridge/main/src/screenshot/chat.png)

### 🔗 Connection
![Connection](https://raw.githubusercontent.com/Sandeep9555/HeartBridge/main/src/screenshot/conection.png)

### 📩 Connection Request
![Connection Request](https://raw.githubusercontent.com/Sandeep9555/HeartBridge/main/src/screenshot/connection%20request.png)

### 📰 Feed
![Feed](https://raw.githubusercontent.com/Sandeep9555/HeartBridge/main/src/screenshot/feed.png)

### 📑 Menu
![Menu](https://raw.githubusercontent.com/Sandeep9555/HeartBridge/main/src/screenshot/menu.png)

### 👤 Profile
![Profile](https://raw.githubusercontent.com/Sandeep9555/HeartBridge/main/src/screenshot/profile.js.png)


---

## 🚀 Key Features

- 🔐 **Secure Authentication**: JWT-based login/signup with cookie sessions and bcrypt hashing.
- 👤 **User Profiles**: Create/edit profiles with photos and personal info.
- 📰 **Smart Feed**: Explore profiles and send personalized connection requests.
- 💌 **Connection Requests**: Send, accept, reject — with real-time status updates.
- 💬 **Real-Time Chat**: Instant messaging powered by **Socket.io + Redis**, with delivery status and presence tracking.
- 🛠 **Profile Management**: Edit profile data and manage account settings.
- 🔁 **Password Reset**: Secure recovery with email verification.
- 🔔 **Live Notifications**: Alerts for messages and connection activity.
- ⚙️ **Optimized REST APIs**: Clean, scalable APIs for user, chat, and feed management.

---
- **Frontend**: React.js, Vite, Tailwind CSS, Daisy UI, React Router, Redux Toolkit
- **Backend**: Node.js, Express.js, MongoDB (with Mongoose), JWT, Socket.io
- **Authentication**: JWT (JSON Web Tokens), bcrypt for password hashing, cookie-parser for cookie management
- **Real-time Communication**: Socket.io
- **Testing**: Postman for API testing

## Installation

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/HeartBridge.git
   cd HeartBridge/frontend

2. Install dependencies:
   ```bash 
      npm install

3. Start the frontend development server:
   ```bash
   npm run dev

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd HeartBridge/backend

2. Install dependencies:
   ```bash
   npm install

3. Create a .env file in the backend folder and add your environment variables:
   ```bash
   JWT_SECRET_KEY=your-secret-key
   DB_URI=mongodb://localhost:27017/heartBridge
   PORT=7777

4. Start the backend server:
   ```bash
   npm start

## API Documentation

### Auth Routes

- **POST/signup**: Register a new user.
- **POST/login**: Login with email and password, returns JWT token.
- **POST/logout**: Logout and clear the JWT token from cookies.

### Profile Routes

- **GET /profile/view**: View your profile.
- **PATCH /profile/edit**: View your profile.
- **PATCH /profile/password**: View your profile.


### Connection Request Routes

- **POST /request/send/:status/:userId**:  Send a connection request to another user with status (interested, rejected, ignored).
- **POST /request/review/:status/:requestId**: Review a received connection request.

### User Routes

- **GET /user/requests/received**
: Get all received connection requests.
- **GET /user/connections**: Get all accepted connections.
- **GET /user/feed**: 
 Get the list of users in the feed.

### Message Routes

- **POST/message/send**: Post all the msg to the DataBase.
- **POST/message/conversation**: Post all the msg to the user(Receiver). 

### Real-time Chat:
HeartBridge uses Socket.io to implement real-time chat. Once logged in, users can send and receive messages instantly. The system handles connections, message delivery, and displays chat notifications.


