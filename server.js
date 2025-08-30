const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const availabilityRoutes = require("./routes/availability");
const appointmentRoutes = require("./routes/appointments");

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/appointments", appointmentRoutes);

// Connect to MongoDB only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect("mongodb://127.0.0.1:27017/collegeAppointments", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log("✅ MongoDB connected"))
      .catch(err => console.error("❌ MongoDB connection error:", err));
}

// Start server only if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app; // Export for testing
