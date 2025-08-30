const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/user");

beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/collegeAppointments_test");
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

beforeEach(async () => {
    // Clear data before each test
    await User.deleteMany({});
});

describe("Auth API", () => {
    it("should register a user", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test Student",
                email: "student@test.com",
                password: "123456",
                role: "student"
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toBe("✅ User registered successfully");
    });

    it("should login a user", async () => {
        // First register a user
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test Student",
                email: "student@test.com",
                password: "123456",
                role: "student"
            });

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "student@test.com",
                password: "123456"
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
    });
});
