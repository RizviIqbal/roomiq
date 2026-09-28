/**
 * Roommate Matching & Compatibility — API Endpoint Tests
 * Student: Fahmida Afrin (23201306)
 * Feature: Compatibility Quiz, Matching Algorithm, Public House Discovery
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
let userAToken, userAId;
let userBToken, userBId;
let houseId;

// Mock socket & activity logger to avoid side-effects
jest.mock("../socket", () => {
  const emitToHouse = jest.fn();
  const initSocket = jest.fn();
  initSocket.emitToHouse = emitToHouse;
  return initSocket;
});
jest.mock("../utils/activityLogger", () => jest.fn());

const compatibilityProfile = {
  sleepSchedule: "night_owl",
  cleanlinessLevel: 4,
  guestPolicy: "sometimes",
  noiseTolerance: "moderate",
  smokingPolicy: "no_smoking",
  petPolicy: "small_pets",
  studyHabits: "mixed",
  foodSharing: true
};

const compatibilityProfileB = {
  sleepSchedule: "early_bird",
  cleanlinessLevel: 5,
  guestPolicy: "rarely",
  noiseTolerance: "low",
  smokingPolicy: "no_smoking",
  petPolicy: "no_pets",
  studyHabits: "at_home",
  foodSharing: false
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  app = require("../app");

  // ── Register User A ──
  const regA = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Fahmida Test",
      email: "fahmida@test.com",
      password: "password123"
    });
  userAToken = regA.body.token;
  userAId = regA.body._id;

  // ── Register User B (for comparison) ──
  const regB = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Aisha Housemate",
      email: "aisha@test.com",
      password: "password123"
    });
  userBToken = regB.body.token;
  userBId = regB.body._id;

  // ── Create house and add both users ──
  const houseRes = await request(app)
    .post("/api/houses")
    .set("Authorization", `Bearer ${userAToken}`)
    .send({
      name: "Matching Test House",
      address: "456 Quiz Ave",
      totalRooms: 4,
      monthlyRent: 20000,
      maxMembers: 5,
      isPublic: true
    });
  houseId = houseRes.body._id;
  const inviteCode = houseRes.body.inviteCode;

  // User B joins the house
  await request(app)
    .post("/api/houses/join")
    .set("Authorization", `Bearer ${userBToken}`)
    .send({ inviteCode });

  // ── Save compatibility profiles for both users ──
  await request(app)
    .put("/api/auth/compatibility")
    .set("Authorization", `Bearer ${userBToken}`)
    .send(compatibilityProfileB);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}, 15000);

// ═══════════════════════════════════════════════════════
describe("Feature: Roommate Matching (ID: 23201306)", () => {

  // ═══════════════════════════════════════════════════════
  // A. POSITIVE FLOW (Happy Path)
  // ═══════════════════════════════════════════════════════

  // ── TEST 1: Save Compatibility Profile ──
  it("should save compatibility profile for the logged-in user", async () => {
    const res = await request(app)
      .put("/api/auth/compatibility")
      .set("Authorization", `Bearer ${userAToken}`)
      .send(compatibilityProfile);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("compatibilityProfile");
    expect(res.body.compatibilityProfile.sleepSchedule).toBe("night_owl");
  });

  // ── TEST 2: Get House Compatibility Scores ──
  it("should return compatibility scores for house members", async () => {
    const res = await request(app)
      .get(`/api/matching/house/${houseId}`)
      .set("Authorization", `Bearer ${userAToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty("score");
    expect(res.body[0]).toHaveProperty("label");
  });

  // ── TEST 3: Get House Summary ──
  it("should return overall house compatibility summary", async () => {
    const res = await request(app)
      .get(`/api/matching/house/${houseId}/summary`)
      .set("Authorization", `Bearer ${userAToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("overallScore");
    expect(res.body).toHaveProperty("pairScores");
  });

  // ── TEST 4: Compare With Specific User ──
  it("should return compatibility score with a specific user", async () => {
    const res = await request(app)
      .get(`/api/matching/compare/${userBId}`)
      .set("Authorization", `Bearer ${userAToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("score");
    expect(res.body).toHaveProperty("label");
    expect(res.body.with._id).toBe(userBId);
  });

  // ── TEST 5: Get Public Houses ──
  it("should return public house listings", async () => {
    const res = await request(app)
      .get("/api/houses/public")
      .set("Authorization", `Bearer ${userAToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("houses");
    expect(Array.isArray(res.body.houses)).toBe(true);
  });

  // ═══════════════════════════════════════════════════════
  // B. NEGATIVE FLOW (Error Handling)
  // ═══════════════════════════════════════════════════════

  // ── TEST 6: Compare With Nonexistent User ──
  it("should return 404 when comparing with a nonexistent user", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/matching/compare/${fakeId}`)
      .set("Authorization", `Bearer ${userAToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  // ═══════════════════════════════════════════════════════
  // C. SECURITY & BOUNDARY
  // ═══════════════════════════════════════════════════════

  // ── TEST 7: Unauthorized — No Token ──
  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app)
      .get(`/api/matching/house/${houseId}`);

    expect(res.statusCode).toEqual(401);
  });
});
