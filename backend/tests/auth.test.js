import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import supertest from "supertest";

process.env.NODE_ENV = "test";

import { createApp } from "../src/app.js";
import User from "../src/models/User.js";
import config from "../src/config/index.js";

const app = createApp();
const request = supertest(app);

const TEST_DB = config.mongoUri + "-test";

before(async () => {
  await mongoose.connect(TEST_DB);
  await User.deleteMany({});
});

after(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe("Auth API", () => {
  let savedToken = "";

  it("should register a new user", async () => {
    const res = await request.post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "editor",
    });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, "test@example.com");
    assert.strictEqual(res.body.user.role, "editor");
    assert.strictEqual(res.body.user.password, undefined);
    savedToken = res.body.token;
  });

  it("should reject duplicate email", async () => {
    const res = await request.post("/api/auth/register").send({
      name: "Duplicate",
      email: "test@example.com",
      password: "password123",
    });

    assert.strictEqual(res.status, 409);
  });

  it("should reject missing fields", async () => {
    const res = await request.post("/api/auth/register").send({
      email: "missing@example.com",
    });

    assert.strictEqual(res.status, 400);
  });

  it("should login with valid credentials", async () => {
    const res = await request.post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, "test@example.com");
    savedToken = res.body.token;
  });

  it("should reject wrong password", async () => {
    const res = await request.post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    assert.strictEqual(res.status, 401);
  });

  it("should reject non-existent email", async () => {
    const res = await request.post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });

    assert.strictEqual(res.status, 401);
  });

  it("should return current user with valid token", async () => {
    const res = await request
      .get("/api/auth/me")
      .set("Authorization", "Bearer " + savedToken);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.email, "test@example.com");
  });

  it("should reject request without token", async () => {
    const res = await request.get("/api/auth/me");
    assert.strictEqual(res.status, 401);
  });

  it("should reject invalid token", async () => {
    const res = await request
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalidtoken123");

    assert.strictEqual(res.status, 401);
  });
});
