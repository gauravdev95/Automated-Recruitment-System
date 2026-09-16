const request = require("supertest");
const app = require("../src/app");
const connectDB = require("../src/config/database.config");
const mongoose = require("mongoose");

// Note: these are integration tests — MongoDB must be running.
describe("Auth API", () => {
  const email = `hrtest_${Date.now()}@test.com`;
  const password = "Passw0rd!";

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("should signup HR successfully", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test HR",
        email,
        password,
        contact: "1234567890",
        companyName: "Test Company",
        position: "HR Manager",
        role: "hr",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "HR registered successfully");
  });

  it("should login the signed-up HR", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});