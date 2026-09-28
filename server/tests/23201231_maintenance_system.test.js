/**
 * Maintenance Tracking System — API Endpoint Tests
 * Student: Tawsif Kabir Pritom (23201231)
 * Feature: Report Issue, Get Issues, Update Status, Delete Issue
 *
 * Uses MongoMemoryServer for an isolated in-memory DB.
 * Auth token is generated programmatically — no hardcoded credentials.
 */

// Pin to cached binary version
process.env.MONGOMS_VERSION = "7.0.20";
process.env.MONGOMS_MD5_CHECK = "0";

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let app, mongoServer, authToken, userId, houseId, issueId;

// Mock socket & activity logger to avoid side-effects
jest.mock("../socket", () => {
  const emitToHouse = jest.fn();
  const initSocket = jest.fn();
  initSocket.emitToHouse = emitToHouse;
  return initSocket;
});
jest.mock("../utils/activityLogger", () => jest.fn());

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  app = require("../app");

  // ── Register a test user programmatically ──
  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Tawsif Test",
      email: "tawsif@test.com",
      password: "password123",
      phone: "01700000004",
      occupation: "Engineer"
    });
  authToken = registerRes.body.token;
  userId = registerRes.body._id;

  // ── Create a house ──
  const houseRes = await request(app)
    .post("/api/houses")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      name: "Maintenance Test House",
      address: "101 Repair Lane",
      totalRooms: 4,
      monthlyRent: 18000,
      maxMembers: 6
    });
  houseId = houseRes.body._id;
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}, 15000);

// ═══════════════════════════════════════════════════════
describe("Feature: Maintenance System (ID: 23201231)", () => {

  // ═══════════════════════════════════════════════════════
  // A. POSITIVE FLOW (Happy Path)
  // ═══════════════════════════════════════════════════════

  // ── TEST 1: Report a Maintenance Issue ──
  it("should report a new maintenance issue", async () => {
    const res = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        houseId,
        title: "Broken Kitchen Faucet",
        description: "The kitchen faucet is leaking badly and needs immediate repair.",
        category: "plumbing",
        priority: "high"
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe("Broken Kitchen Faucet");
    expect(res.body.category).toBe("plumbing");
    expect(res.body.priority).toBe("high");
    expect(res.body.status).toBe("reported");

    issueId = res.body._id;
  });

  // ── TEST 2: Get House Maintenance Issues ──
  it("should retrieve all maintenance issues for the house", async () => {
    const res = await request(app)
      .get(`/api/maintenance/house/${houseId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].title).toBe("Broken Kitchen Faucet");
  });

  // ── TEST 3: Update Issue Status ──
  it("should update the status of a maintenance issue", async () => {
    const res = await request(app)
      .put(`/api/maintenance/${issueId}/status`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        status: "in_progress",
        note: "Plumber contacted, scheduled for tomorrow."
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.issue.status).toBe("in_progress");
    expect(res.body.issue.statusHistory.length).toBeGreaterThanOrEqual(2);
  });

  // ── TEST 4: Delete Maintenance Issue ──
  it("should delete a maintenance issue when requested by the reporter", async () => {
    // Create a disposable issue to delete
    const createRes = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        houseId,
        title: "Minor Scratch on Wall",
        description: "Small cosmetic issue.",
        category: "structural",
        priority: "low"
      });
    const disposableId = createRes.body._id;

    const res = await request(app)
      .delete(`/api/maintenance/${disposableId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  // ═══════════════════════════════════════════════════════
  // B. NEGATIVE FLOW (Error Handling)
  // ═══════════════════════════════════════════════════════

  // ── TEST 5: Validation — Missing Title ──
  it("should return 500 if the issue title is missing", async () => {
    const res = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        houseId,
        description: "No title provided.",
        category: "electrical",
        priority: "medium"
        // title is missing
      });

    expect(res.statusCode).toEqual(500);
  });

  // ── TEST 6: Not Found — Update Nonexistent Issue ──
  it("should return 404 when updating a nonexistent issue", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/maintenance/${fakeId}/status`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ status: "resolved", note: "Fixed" });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  // ═══════════════════════════════════════════════════════
  // C. SECURITY & BOUNDARY
  // ═══════════════════════════════════════════════════════

  // ── TEST 7: Unauthorized — No Token ──
  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app)
      .post("/api/maintenance")
      .send({
        houseId,
        title: "Unauthorized Issue",
        description: "Should be rejected.",
        category: "other",
        priority: "low"
      });

    expect(res.statusCode).toEqual(401);
  });
});
