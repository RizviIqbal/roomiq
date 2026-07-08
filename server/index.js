const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const initSocket = require("./socket");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Init Socket.io
initSocket(server);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth",        require("./routes/authRoutes"));
app.use("/api/houses",      require("./routes/houseRoutes"));
app.use("/api/expenses",    require("./routes/expenseRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/upload",      require("./routes/uploadRoutes"));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`RoomiQ server running on port ${PORT}`));
