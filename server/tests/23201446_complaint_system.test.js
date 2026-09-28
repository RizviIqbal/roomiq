/**
 * Complaint & Moderation System — API Endpoint Tests
 * Student: Sumit Ghosh (23201446)
 * Feature: File Complaint, Mediation Voting, Resolve, Repeat Offenders
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

let app, mongoServer;
let adminToken, adminId;
let memberToken, memberId;
let accusedToken, accusedId;
let houseId, complaintId;

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

  // ── Register 3 users: admin, member (filer), accused ──
  const regAdmin = await request(app)
    .post("/api/auth/register")
    .send({ name: "Sumit Admin", email: "sumit@test.com", password: "password123" });
  adminToken = regAdmin.body.token;
  adminId = regAdmin.body._id;

  const regMember = await request(app)
    .post("/api/auth/register")
    .send({ name: "Filer User", email: "filer@test.com", password: "password123" });
  memberToken = regMember.body.token;
  memberId = regMember.body._id;

  const regAccused = await request(app)
    .post("/api/auth/register")
    .send({ name: "Accused User", email: "accused@test.com", password: "password123" });
  accusedToken = regAccused.body.token;
  accusedId = regAccused.body._id;

  // ── Create house and add members ──
  const houseRes = await request(app)
    .post("/api/houses")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "Complaint Test House",
      address: "789 Conflict Rd",
      totalRooms: 3,
      monthlyRent: 12000,
      maxMembers: 5
    });
  houseId = houseRes.body._id;
  const inviteCode = houseRes.body.inviteCode;

  // Other users join
  await request(app)
    .post("/api/houses/join")
    .set("Authorization", `Bearer ${memberToken}`)
    .send({ inviteCode });

  await request(app)
    .post("/api/houses/join")
    .set("Authorization", `Bearer ${accusedToken}`)
    .send({ inviteCode });
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}, 15000);

// ═══════════════════════════════════════════════════════
describe("Feature: Complaint System (ID: 23201446)", () => {

  // ═══════════════════════════════════════════════════════
  // A. POSITIVE FLOW (Happy Path)
  // ═══════════════════════════════════════════════════════

  // ── TEST 1: File a Complaint ──
  it("should file a complaint against a housemate", async () => {
    const res = await request(app)
      .post("/api/complaints")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        houseId,
        against: accusedId,
        title: "Excessive Noise at Night",
        description: "Playing loud music after 11 PM repeatedly.",
        category: "noise",
        isAnonymous: false
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe("Excessive Noise at Night");
    expect(res.body.category).toBe("noise");
    expect(res.body.status).toBe("open");

    complaintId = res.body._id;
  });

  // ── TEST 2: Get House Complaints ──
  it("should retrieve all complaints for the house", async () => {
    const res = await request(app)
      .get(`/api/complaints/house/${houseId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  // ── TEST 3: Mediation Vote ──
  it("should allow a third-party member to cast a mediation vote", async () => {
    const res = await request(app)
      .post(`/api/complaints/${complaintId}/vote`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ verdict: "valid", comment: "I heard it too." });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toMatch(/vote recorded/i);
  });

  // ── TEST 4: Resolve Complaint ──
  it("should resolve a complaint", async () => {
    const res = await request(app)
      .put(`/api/complaints/${complaintId}/resolve`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ resolution: "Warning issued. Must stop by 10 PM.", status: "resolved" });

    expect(res.statusCode).toEqual(200);
    expect(res.body.complaint.status).toBe("resolved");
    expect(res.body.complaint.resolution).toMatch(/warning/i);
  });

  // ═══════════════════════════════════════════════════════
  // B. NEGATIVE FLOW (Error Handling)
  // ═══════════════════════════════════════════════════════

  // ── TEST 5: Validation — Missing Required Fields ──
  it("should return 500 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/complaints")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        houseId,
        against: accusedId
        // title and description missing
      });

    expect(res.statusCode).toEqual(500);
  });

  // ── TEST 6: Not Found — Resolve Nonexistent Complaint ──
  it("should return 404 when resolving a nonexistent complaint", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/complaints/${fakeId}/resolve`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ resolution: "N/A", status: "dismissed" });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  // ═══════════════════════════════════════════════════════
  // C. SECURITY & BOUNDARY
  // ═══════════════════════════════════════════════════════

  // ── TEST 7: Unauthorized — No Token ──
  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app)
      .post("/api/complaints")
      .send({
        houseId,
        against: accusedId,
        title: "Unauthorized Complaint",
        description: "Should be rejected."
      });

    expect(res.statusCode).toEqual(401);
  });
});
