const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const Appointment = require("../models/appointment");
const Availability = require("../models/availability");

const router = express.Router();

// Book an appointment (Student only)
router.post("/", auth, requireRole(["student"]), async (req, res) => {
    try {
        const { professorId, date, startTime, endTime, notes } = req.body;
        const studentId = req.user._id;

        // Validate required fields
        if (!professorId || !date || !startTime || !endTime) {
            return res.status(400).json({ message: "Professor ID, date, start time, and end time are required" });
        }

        // Check if professor exists and is actually a professor
        const User = require("../models/user");
        const professor = await User.findById(professorId);
        if (!professor || professor.role !== "professor") {
            return res.status(400).json({ message: "Invalid professor ID" });
        }

        // Check if the time slot is available
        const availability = await Availability.findOne({
            professorId,
            date: new Date(date),
            startTime,
            endTime,
            isAvailable: true
        });

        if (!availability) {
            return res.status(400).json({ message: "Time slot is not available" });
        }

        // Check if the slot is already booked
        const existingAppointment = await Appointment.findOne({
            professorId,
            date: new Date(date),
            startTime,
            status: { $ne: "cancelled" }
        });

        if (existingAppointment) {
            return res.status(400).json({ message: "Time slot is already booked" });
        }

        // Check if student already has an appointment at this time
        const studentConflict = await Appointment.findOne({
            studentId,
            date: new Date(date),
            startTime,
            status: { $ne: "cancelled" }
        });

        if (studentConflict) {
            return res.status(400).json({ message: "You already have an appointment at this time" });
        }

        // Create the appointment
        const appointment = new Appointment({
            studentId,
            professorId,
            date: new Date(date),
            startTime,
            endTime,
            notes: notes || ""
        });

        await appointment.save();

        res.status(201).json({
            message: "Appointment booked successfully",
            appointment
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Appointment already exists" });
        }
        res.status(500).json({ error: error.message });
    }
});

// Get student's appointments
router.get("/student", auth, requireRole(["student"]), async (req, res) => {
    try {
        const appointments = await Appointment.find({ 
            studentId: req.user._id,
            status: { $ne: "cancelled" }
        })
        .populate("professorId", "name email")
        .sort({ date: 1, startTime: 1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get professor's appointments
router.get("/professor", auth, requireRole(["professor"]), async (req, res) => {
    try {
        const appointments = await Appointment.find({ 
            professorId: req.user._id,
            status: { $ne: "cancelled" }
        })
        .populate("studentId", "name email")
        .sort({ date: 1, startTime: 1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel appointment (Professor can cancel any appointment, Student can only cancel their own)
router.patch("/:id/cancel", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Check permissions
        if (req.user.role === "student" && appointment.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Can only cancel your own appointments" });
        }

        if (req.user.role === "professor" && appointment.professorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Can only cancel appointments with you" });
        }

        if (appointment.status === "cancelled") {
            return res.status(400).json({ message: "Appointment is already cancelled" });
        }

        appointment.status = "cancelled";
        await appointment.save();

        res.json({
            message: "Appointment cancelled successfully",
            appointment
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Complete appointment (Professor only)
router.patch("/:id/complete", auth, requireRole(["professor"]), async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (appointment.professorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Can only complete appointments with you" });
        }

        if (appointment.status === "cancelled") {
            return res.status(400).json({ message: "Cannot complete a cancelled appointment" });
        }

        if (appointment.status === "completed") {
            return res.status(400).json({ message: "Appointment is already completed" });
        }

        appointment.status = "completed";
        await appointment.save();

        res.json({
            message: "Appointment marked as completed",
            appointment
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get appointment by ID
router.get("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id)
            .populate("studentId", "name email")
            .populate("professorId", "name email");

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Check if user has access to this appointment
        if (req.user.role === "student" && appointment.studentId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (req.user.role === "professor" && appointment.professorId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
