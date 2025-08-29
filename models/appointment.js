const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    professorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["scheduled", "completed", "cancelled"],
        default: "scheduled"
    },
    notes: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

// Compound index to ensure unique appointments per student, professor, date, and time
appointmentSchema.index({ studentId: 1, professorId: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
