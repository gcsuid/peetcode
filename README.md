# PeetCode

PeetCode is a full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js). It features a code review and problem-submission platform.

## 🚀 Tech Stack

- **Frontend:** React (Vite), Tailwind CSS (implied/likely), React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT, bcryptjs
- **Containerization:** Docker, Docker Compose

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/)
- [MongoDB](https://www.mongodb.com/try/download/community) (if running locally without Docker)

## 🛠️ Installation & Setup

### Option 1: Using Docker (Recommended)

The easiest way to run the application is using Docker Compose. This essentially provides a one-command setup for the database, backend, and frontend.

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd peetcode
    ```

2.  **Start the application:**
    ```bash
    docker-compose up --build
    ```
    This command will:
    - Build the Docker images for the client and server.
    - Start the MongoDB service.
    - Start the backend server on `http://localhost:5000`.
    - Start the frontend client on `http://localhost:5173`.

3.  **Access the application:**
    - Frontend: [http://localhost:5173](http://localhost:5173)
    - Backend API: [http://localhost:5000](http://localhost:5000)

4.  **Stop the application:**
    Press `Ctrl+C` in the terminal or run:
    ```bash
    docker-compose down
    ```

---

### Option 2: Manual Setup

If you prefer to run the services individually on your machine:

#### 1. Database Setup
Ensure your local MongoDB instance is running.
- Default URI expected: `mongodb://127.0.0.1:27017/peetcode`

#### 2. Backend Setup (`/server`)

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` directory with the following variables:
    ```env
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/peetcode
    JWT_SECRET=your_secret_key
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```

#### 3. Frontend Setup (`/client`)

1.  Navigate to the client directory:
    ```bash
    cd ../client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```
peetcode/
├── client/                 # React Frontend
│   ├── src/                # Source files
│   ├── public/             # Static assets
│   ├── Dockerfile          # Client Docker config
│   └── vite.config.js      # Vite config
├── server/                 # Express Backend
│   ├── config/             # Database config
│   ├── controllers/        # Route controllers
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── Dockerfile          # Server Docker config
├── docker-compose.yml      # Docker Orchestration
└── README.md               # Project Documentation
```

## 🔗 API Endpoints

- **Auth**: `/api/auth` (Register, Login)
- **Problems**: `/api/problems` (CRUD operations for problems)
- **Reviews**: `/api/reviews` (Code reviews)
