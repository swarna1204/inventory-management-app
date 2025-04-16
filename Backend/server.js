const express = require("express");
const app = express();
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const itemRoutes = require('./routes/itemRoutes'); // Import itemRoutes once

dotenv.config();
connectDB();

// Configuring the CORS to allow requests from both localhost:5173 and localhost:5174 
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow requests from both frontend ports
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
    credentials: true, // Allow credentials if needed (cookies, authorization headers)
}));
app.options('*', cors()); // Allow preflight requests for all routes

// Parse incoming JSON data
app.use(express.json());

// ✅ Custom Helmet configuration for enhanced security
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://trusted-cdn.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https://your-image-source.com"], // Adjust domain
            connectSrc: ["'self'", "http://localhost:5000"], //  API/backend origin
        },
    },
    referrerPolicy: { policy: "no-referrer" },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
}));

// Logging middleware for development
app.use(morgan("dev"));

// Use itemRoutes for all item-related API routes
app.use('/api/items', itemRoutes);

// Basic route to check if server is running
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
});

// Set up the server to listen on the correct port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
