const http = require("http");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const initSocket = require("./socket");
const app = require("./app");

dotenv.config();
connectDB();

const server = http.createServer(app);

// Init Socket.io
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`RoomiQ server running on port ${PORT}`));
