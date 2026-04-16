import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import supertest from "supertest";
import fs from "fs";
import path from "path";

process.env.NODE_ENV = "test";

import { createApp } from "../src/app.js";
import User from "../src/models/User.js";
import Video from "../src/models/Video.js";
import config from "../src/config/index.js";

const mockIo = { to: () => ({ emit: () => {} }) };
const app = createApp(mockIo);
const request = supertest(app);

const TEST_DB = config.mongoUri + "-test";
let editorToken = "";
let viewerToken = "";
let adminToken = "";
let uploadedVideoId = "";

before(async () => {
  await mongoose.connect(TEST_DB);
  await User.deleteMany({});
  await Video.deleteMany({});

  const editorRes = await request.post("/api/auth/register").send({
    name: "Editor",
    email: "editor@test.com",
    password: "password123",
    role: "editor",
  });
  editorToken = editorRes.body.token;

  const viewerRes = await request.post("/api/auth/register").send({
    name: "Viewer",
    email: "viewer@test.com",
    password: "password123",
    role: "viewer",
  });
  viewerToken = viewerRes.body.token;

  const adminRes = await request.post("/api/auth/register").send({
    name: "Admin",
    email: "admin@test.com",
    password: "password123",
    role: "admin",
  });
  adminToken = adminRes.body.token;

  const testVideoPath = path.join(config.uploadDir, "test-sample.mp4");
  if (!fs.existsSync(testVideoPath)) {
    fs.writeFileSync(testVideoPath, Buffer.alloc(1024, 0));
  }
});

after(async () => {
  await User.deleteMany({});
  await Video.deleteMany({});
  const testVideoPath = path.join(config.uploadDir, "test-sample.mp4");
  if (fs.existsSync(testVideoPath)) fs.unlinkSync(testVideoPath);
  await mongoose.connection.close();
});

describe("Video and Admin API", () => {
  it("should reject upload from viewer role", async () => {
    const res = await request
      .post("/api/videos/upload")
      .set("Authorization", `Bearer ${viewerToken}`)
      .field("title", "Test Video")
      .attach("video", Buffer.alloc(1024), {
        filename: "test.mp4",
        contentType: "video/mp4",
      });

    assert.strictEqual(res.status, 403);
  });

  it("should reject upload without auth", async () => {
    const res = await request
      .post("/api/videos/upload")
      .field("title", "Test Video")
      .attach("video", Buffer.alloc(1024), {
        filename: "test.mp4",
        contentType: "video/mp4",
      });

    assert.strictEqual(res.status, 401);
  });

  it("should reject non-video files", async () => {
    const res = await request
      .post("/api/videos/upload")
      .set("Authorization", `Bearer ${editorToken}`)
      .field("title", "Test")
      .attach("video", Buffer.from("not a video"), {
        filename: "test.txt",
        contentType: "text/plain",
      });

    assert.ok(res.status >= 400);
  });

  it("should allow editor to upload video", async () => {
    const res = await request
      .post("/api/videos/upload")
      .set("Authorization", `Bearer ${editorToken}`)
      .field("title", "Editor Upload Test")
      .attach("video", Buffer.alloc(2048), {
        filename: "sample.mp4",
        contentType: "video/mp4",
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.video.title, "Editor Upload Test");
    assert.strictEqual(res.body.video.status, "pending");
    uploadedVideoId = res.body.video._id;
  });

  it("should reject upload without title", async () => {
    const res = await request
      .post("/api/videos/upload")
      .set("Authorization", `Bearer ${editorToken}`)
      .attach("video", Buffer.alloc(1024), {
        filename: "test.mp4",
        contentType: "video/mp4",
      });

    assert.strictEqual(res.status, 400);
  });

  it("should list videos for authenticated user", async () => {
    const res = await request
      .get("/api/videos")
      .set("Authorization", `Bearer ${editorToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.videos));
    assert.ok(res.body.videos.length > 0);
  });

  it("should return empty for viewer with no safe videos", async () => {
    const res = await request
      .get("/api/videos")
      .set("Authorization", `Bearer ${viewerToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.videos.length, 0);
  });

  it("should filter by status", async () => {
    const res = await request
      .get("/api/videos?status=safe")
      .set("Authorization", `Bearer ${editorToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.videos));
  });

  it("should reject unauthenticated request", async () => {
    const res = await request.get("/api/videos");
    assert.strictEqual(res.status, 401);
  });

  it("should reject delete from viewer", async () => {
    const res = await request
      .delete(`/api/videos/${uploadedVideoId}`)
      .set("Authorization", `Bearer ${viewerToken}`);

    assert.strictEqual(res.status, 403);
  });

  it("should allow editor to delete own video", async () => {
    if (!uploadedVideoId) return;

    const res = await request
      .delete(`/api/videos/${uploadedVideoId}`)
      .set("Authorization", `Bearer ${editorToken}`);

    assert.strictEqual(res.status, 200);
  });

  it("should allow admin to list users", async () => {
    const res = await request
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.users));
  });

  it("should reject non-admin from admin endpoints", async () => {
    const res = await request
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${editorToken}`);

    assert.strictEqual(res.status, 403);
  });

  it("should allow admin to get stats", async () => {
    const res = await request
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.stats.totalUsers !== undefined);
    assert.ok(res.body.stats.totalVideos !== undefined);
  });
});
