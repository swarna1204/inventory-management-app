const express = require("express");
const app = express();
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const itemRoutes = require('./routes/itemRoutes');

dotenv.config();
connectDB();

// ✅ UPDATED: More permissive CORS configuration for debugging
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'https://fullstackinventorymanagement.netlify.app',
        'https://inventory-management-app-otbf.onrender.com' // Add your own backend for internal calls
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    credentials: true,
    optionsSuccessStatus: 200 // Support legacy browsers
}));

// Handle preflight requests
app.options('*', cors());

// Parse incoming JSON data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Simplified Helmet configuration for better compatibility
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for now to avoid conflicts
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Logging middleware
app.use(morgan("combined"));

// ✅ NEW: Health check route
app.get("/health", (req, res) => {
    res.status(200).json({
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ✅ NEW: Wake-up endpoint to prevent cold starts
app.get("/wake", (req, res) => {
    res.status(200).json({
        message: "Server is awake",
        timestamp: new Date().toISOString()
    });
});

// Basic route to check if server is running
app.get("/", (req, res) => {
    res.status(200).json({
        message: "API is running...",
        timestamp: new Date().toISOString(),
        endpoints: {
            health: "/health",
            wake: "/wake",
            items: "/api/items"
        }
    });
});

// ✅ NEW: CORS debugging route
app.get("/cors-test", (req, res) => {
    res.status(200).json({
        message: "CORS test successful",
        origin: req.get('Origin'),
        headers: req.headers,
        timestamp: new Date().toISOString()
    });
});

// Use itemRoutes for all item-related API routes
app.use('/api/items', itemRoutes);

// ✅ IMPROVED: 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        message: `Route ${req.originalUrl} not found`,
        availableRoutes: [
            'GET /',
            'GET /health',
            'GET /wake',
            'GET /cors-test',
            'GET /api/items',
            'POST /api/items',
            'PUT /api/items/:id',
            'DELETE /api/items/:id'
        ]
    });
});

// ✅ IMPROVED: Enhanced error handler middleware
app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    // Handle different types of errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: "Validation Error",
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            message: "Invalid ID format"
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            message: "Duplicate entry"
        });
    }

    // Default error response
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Set up the server to listen on the correct port
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ✅ NEW: Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});