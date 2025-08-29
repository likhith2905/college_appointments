const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const Availability = require("../models/availability");
const Appointment = require("../models/appointment");

const router = express.Router();

// Add availability slot (Professor only)
router.post("/", auth, requireRole(["professor"]), async (req, res) => {
    try {
        const { date, startTime, endTime } = req.body;
        const professorId = req.user._id;

        // Validate required fields
        if (!date || !startTime || !endTime) {
            return res.status(400).json({ message: "Date, start time, and end time are required" });
        }

        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            return res.status(400).json({ message: "Time must be in HH:MM format" });
        }

        // Check if end time is after start time
        if (startTime >= endTime) {
            return res.status(400).json({ message: "End time must be after start time" });
        }

        // Check if date is in the future
        const appointmentDate = new Date(date);
        if (appointmentDate < new Date().setHours(0, 0, 0, 0)) {
            return res.status(400).json({ message: "Cannot add availability for past dates" });
        }

        // Check for overlapping availability
        const existingAvailability = await Availability.findOne({
            professorId,
            date: appointmentDate,
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        if (existingAvailability) {
            return res.status(400).json({ message: "Time slot overlaps with existing availability" });
        }

        const availability = new Availability({
            professorId,
            date: appointmentDate,
            startTime,
            endTime
        });

        await availability.save();

        res.status(201).json({
            message: "Availability slot added successfully",
            availability
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "This time slot already exists" });
        }
        res.status(500).json({ error: error.message });
    }
});

// Get professor's availability
router.get("/professor/:professorId", auth, async (req, res) => {
    try {
        const { professorId } = req.params;
        const { date } = req.query;

        let query = { professorId, isAvailable: true };
        
        if (date) {
            const searchDate = new Date(date);
            query.date = {
                $gte: searchDate,
                $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
            };
        }

        const availability = await Availability.find(query).sort({ date: 1, startTime: 1 });

        res.json(availability);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all available slots for a professor (for students)
router.get("/available/:professorId", auth, requireRole(["student"]), async (req, res) => {
    try {
        const { professorId } = req.params;
        const { date } = req.query;

        let query = { professorId, isAvailable: true };
        
        if (date) {
            const searchDate = new Date(date);
            query.date = {
                $gte: searchDate,
                $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
            };
        }

        // Get available slots
        const availability = await Availability.find(query).sort({ date: 1, startTime: 1 });

        // Filter out slots that are already booked
        const availableSlots = [];
        for (const slot of availability) {
            const isBooked = await Appointment.findOne({
                professorId,
                date: slot.date,
                startTime: slot.startTime,
                status: { $ne: "cancelled" }
            });

            if (!isBooked) {
                availableSlots.push(slot);
            }
        }

        res.json(availableSlots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove availability slot (Professor only)
router.delete("/:id", auth, requireRole(["professor"]), async (req, res) => {
    try {
        const { id } = req.params;
        const availability = await Availability.findById(id);

        if (!availability) {
            return res.status(404).json({ message: "Availability slot not found" });
        }

        if (availability.professorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Can only delete your own availability slots" });
        }

        // Check if there are any appointments for this slot
        const appointment = await Appointment.findOne({
            professorId: availability.professorId,
            date: availability.date,
            startTime: availability.startTime,
            status: "scheduled"
        });

        if (appointment) {
            return res.status(400).json({ message: "Cannot delete slot with scheduled appointment" });
        }

        await Availability.findByIdAndDelete(id);

        res.json({ message: "Availability slot removed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
