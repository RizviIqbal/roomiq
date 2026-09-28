const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Robust CORS middleware supporting production Vercel domains and local dev
const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin === clientOrigin ||
      origin === "http://localhost:5173" ||
      origin === "https://roomiq-seven.vercel.app" ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth",        require("./routes/authRoutes"));
app.use("/api/houses",      require("./routes/houseRoutes"));
app.use("/api/matching",    require("./routes/matchingRoutes"));
app.use("/api/expenses",    require("./routes/expenseRoutes"));
app.use("/api/chores",      require("./routes/choreRoutes"));
app.use("/api/rules",       require("./routes/ruleRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/complaints",  require("./routes/complaintRoutes"));
app.use("/api/shopping",    require("./routes/shoppingRoutes"));
app.use("/api/dashboard",   require("./routes/dashboardRoutes"));
app.use("/api/noticeboard", require("./routes/noticeboardRoutes"));
app.use("/api/activities",  require("./routes/activityRoutes"));
app.use("/api/chat",        require("./routes/chatRoutes"));
app.use("/api/upload",      require("./routes/uploadRoutes"));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

module.exports = app;
