const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
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
        required: true,
        validate: {
            validator: function(v) {
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: "Start time must be in HH:MM format"
        }
    },
    endTime: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: "End time must be in HH:MM format"
        }
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index to ensure unique availability slots per professor
availabilitySchema.index({ professorId: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

module.exports = mongoose.model("Availability", availabilitySchema);
