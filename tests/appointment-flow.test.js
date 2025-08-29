const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/user");
const Availability = require("../models/availability");
const Appointment = require("../models/appointment");

describe("College Appointment System - Complete User Flow", () => {
    let studentA1, studentA2, professorP1;
    let studentA1Token, studentA2Token, professorP1Token;
    let availabilitySlot, appointment1, appointment2;

    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect("mongodb://127.0.0.1:27017/collegeAppointments_test");
        
        // Clear test data
        await User.deleteMany({});
        await Availability.deleteMany({});
        await Appointment.deleteMany({});
    });

    afterAll(async () => {
        // Clean up and close connection
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    describe("User Registration and Authentication", () => {
        test("1. Student A1 should register successfully", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Student A1",
                    email: "studenta1@college.edu",
                    password: "password123",
                    role: "student"
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("✅ User registered successfully");
            expect(response.body.userId).toBeDefined();
        });

        test("2. Professor P1 should register successfully", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Professor P1",
                    email: "professorp1@college.edu",
                    password: "password123",
                    role: "professor"
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("✅ User registered successfully");
            expect(response.body.userId).toBeDefined();
        });

        test("3. Student A2 should register successfully", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Student A2",
                    email: "studenta2@college.edu",
                    password: "password123",
                    role: "student"
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("✅ User registered successfully");
            expect(response.body.userId).toBeDefined();
        });

        test("4. Student A1 should authenticate successfully", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "studenta1@college.edu",
                    password: "password123"
                });

            expect(response.status).toBe(200);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.role).toBe("student");
            expect(response.body.user.name).toBe("Student A1");

            studentA1Token = response.body.token;
            studentA1 = response.body.user;
        });

        test("5. Professor P1 should authenticate successfully", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "professorp1@college.edu",
                    password: "password123"
                });

            expect(response.status).toBe(200);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.role).toBe("professor");
            expect(response.body.user.name).toBe("Professor P1");

            professorP1Token = response.body.token;
            professorP1 = response.body.user;
        });

        test("6. Student A2 should authenticate successfully", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "studenta2@college.edu",
                    password: "password123"
                });

            expect(response.status).toBe(200);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.role).toBe("student");
            expect(response.body.user.name).toBe("Student A2");

            studentA2Token = response.body.token;
            studentA2 = response.body.user;
        });
    });

    describe("Professor Availability Management", () => {
        test("7. Professor P1 should specify available time slots", async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);

            const response = await request(app)
                .post("/api/availability")
                .set("Authorization", `Bearer ${professorP1Token}`)
                .send({
                    date: tomorrow.toISOString(),
                    startTime: "09:00",
                    endTime: "10:00"
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Availability slot added successfully");
            expect(response.body.availability).toBeDefined();

            availabilitySlot = response.body.availability;
        });

        test("8. Professor P1 should add another time slot", async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(10, 0, 0, 0);

            const response = await request(app)
                .post("/api/availability")
                .set("Authorization", `Bearer ${professorP1Token}`)
                .send({
                    date: tomorrow.toISOString(),
                    startTime: "10:00",
                    endTime: "11:00"
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Availability slot added successfully");
        });
    });

    describe("Student Viewing Available Slots", () => {
        test("9. Student A1 should view available time slots for Professor P1", async () => {
            const response = await request(app)
                .get(`/api/availability/available/${professorP1.id}`)
                .set("Authorization", `Bearer ${studentA1Token}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].professorId).toBe(professorP1.id);
        });
    });

    describe("Appointment Booking", () => {
        test("10. Student A1 should book appointment with Professor P1 for time T1", async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);

            const response = await request(app)
                .post("/api/appointments")
                .set("Authorization", `Bearer ${studentA1Token}`)
                .send({
                    professorId: professorP1.id,
                    date: tomorrow.toISOString(),
                    startTime: "09:00",
                    endTime: "10:00",
                    notes: "Need help with calculus homework"
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Appointment booked successfully");
            expect(response.body.appointment).toBeDefined();
            expect(response.body.appointment.studentId).toBe(studentA1.id);
            expect(response.body.appointment.professorId).toBe(professorP1.id);

            appointment1 = response.body.appointment;
        });

        test("11. Student A2 should book appointment with Professor P1 for time T2", async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(10, 0, 0, 0);

            const response = await request(app)
                .post("/api/appointments")
                .set("Authorization", `Bearer ${studentA2Token}`)
                .send({
                    professorId: professorP1.id,
                    date: tomorrow.toISOString(),
                    startTime: "10:00",
                    endTime: "11:00",
                    notes: "Discussion about research project"
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Appointment booked successfully");
            expect(response.body.appointment).toBeDefined();
            expect(response.body.appointment.studentId).toBe(studentA2.id);
            expect(response.body.appointment.professorId).toBe(professorP1.id);

            appointment2 = response.body.appointment;
        });

        test("12. Student A1 should see their booked appointment", async () => {
            const response = await request(app)
                .get("/api/appointments/student")
                .set("Authorization", `Bearer ${studentA1Token}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0]._id).toBe(appointment1._id);
            expect(response.body[0].status).toBe("scheduled");
        });

        test("13. Professor P1 should see both appointments", async () => {
            const response = await request(app)
                .get("/api/appointments/professor")
                .set("Authorization", `Bearer ${professorP1Token}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
        });
    });

    describe("Appointment Cancellation", () => {
        test("14. Professor P1 should cancel appointment with Student A1", async () => {
            const response = await request(app)
                .patch(`/api/appointments/${appointment1._id}/cancel`)
                .set("Authorization", `Bearer ${professorP1Token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Appointment cancelled successfully");
            expect(response.body.appointment.status).toBe("cancelled");
        });

        test("15. Student A1 should check their appointments and see none pending", async () => {
            const response = await request(app)
                .get("/api/appointments/student")
                .set("Authorization", `Bearer ${studentA1Token}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0); // No pending appointments
        });

        test("16. Professor P1 should still see the cancelled appointment", async () => {
            const response = await request(app)
                .get("/api/appointments/professor")
                .set("Authorization", `Bearer ${professorP1Token}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1); // Only the active appointment with A2
            expect(response.body[0]._id).toBe(appointment2._id);
            expect(response.body[0].status).toBe("scheduled");
        });
    });

    describe("Data Integrity and Validation", () => {
        test("17. Should not allow double booking of the same time slot", async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(10, 0, 0, 0);

            const response = await request(app)
                .post("/api/appointments")
                .set("Authorization", `Bearer ${studentA1Token}`)
                .send({
                    professorId: professorP1.id,
                    date: tomorrow.toISOString(),
                    startTime: "10:00",
                    endTime: "11:00",
                    notes: "Trying to book already booked slot"
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Time slot is already booked");
        });

        test("18. Should not allow students to book appointments", async () => {
            const response = await request(app)
                .post("/api/availability")
                .set("Authorization", `Bearer ${studentA1Token}`)
                .send({
                    date: new Date().toISOString(),
                    startTime: "14:00",
                    endTime: "15:00"
                });

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("Access denied. Insufficient permissions.");
        });

        test("19. Should not allow professors to book appointments", async () => {
            const response = await request(app)
                .post("/api/appointments")
                .set("Authorization", `Bearer ${professorP1Token}`)
                .send({
                    professorId: professorP1.id,
                    date: new Date().toISOString(),
                    startTime: "14:00",
                    endTime: "15:00"
                });

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("Access denied. Insufficient permissions.");
        });
    });
});
