/**
 * Shared Shopping List & Inventory System — API Endpoint Tests
 * Student: Rizvi Iqbal (23201104)
 * Feature: Add Shopping Item, Get List, Claim Item, Delete Item
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

let app, mongoServer, authToken, userId, houseId, itemId;

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
      name: "Rizvi Test",
      email: "rizvi@test.com",
      password: "password123",
      phone: "01700000001",
      occupation: "Student"
    });
  authToken = registerRes.body.token;
  userId = registerRes.body._id;

  // ── Create a house ──
  const houseRes = await request(app)
    .post("/api/houses")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      name: "Shopping Test House",
      address: "202 Market Street",
      totalRooms: 3,
      monthlyRent: 16000,
      maxMembers: 4
    });
  houseId = houseRes.body._id;
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}, 15000);

// ═══════════════════════════════════════════════════════
describe("Feature: Shopping System (ID: 23201104)", () => {

  // ═══════════════════════════════════════════════════════
  // A. POSITIVE FLOW (Happy Path)
  // ═══════════════════════════════════════════════════════

  // ── TEST 1: Add a Shopping Item ──
  it("should add a new item to the shopping list", async () => {
    const res = await request(app)
      .post("/api/shopping/list")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        houseId,
        name: "Dishwashing Liquid",
        quantity: 2,
        unit: "bottles",
        category: "cleaning"
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.name).toBe("Dishwashing Liquid");
    expect(res.body.quantity).toBe(2);
    expect(res.body.category).toBe("cleaning");
    expect(res.body.isBought).toBe(false);

    itemId = res.body._id;
  });

  // ── TEST 2: Retrieve House Shopping List ──
  it("should retrieve all shopping list items for the house", async () => {
    const res = await request(app)
      .get(`/api/shopping/list/${houseId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].name).toBe("Dishwashing Liquid");
  });

  // ── TEST 3: Claim a Shopping Item ──
  it("should allow a roommate to claim a shopping item", async () => {
    const res = await request(app)
      .put(`/api/shopping/list/${itemId}/claim`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toMatch(/claim updated/i);
    expect(res.body.item.claimedBy).not.toBeNull();
  });

  // ── TEST 4: Delete Shopping Item ──
  it("should delete a shopping item when removed by a member", async () => {
    // Create a disposable item to delete
    const createRes = await request(app)
      .post("/api/shopping/list")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        houseId,
        name: "Disposable Paper Towels",
        quantity: 1,
        unit: "pack",
        category: "cleaning"
      });
    const disposableId = createRes.body._id;

    const res = await request(app)
      .delete(`/api/shopping/list/${disposableId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toMatch(/removed/i);
  });

  // ═══════════════════════════════════════════════════════
  // B. NEGATIVE FLOW (Error Handling)
  // ═══════════════════════════════════════════════════════

  // ── TEST 5: Validation — Missing Item Name ──
  it("should return 500 if the item name is missing", async () => {
    const res = await request(app)
      .post("/api/shopping/list")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        houseId,
        quantity: 3,
        category: "groceries"
        // name is missing
      });

    expect(res.statusCode).toEqual(500);
  });

  // ── TEST 6: Not Found — Claim Nonexistent Item ──
  it("should return 404 when claiming a nonexistent item", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/shopping/list/${fakeId}/claim`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  // ═══════════════════════════════════════════════════════
  // C. SECURITY & BOUNDARY
  // ═══════════════════════════════════════════════════════

  // ── TEST 7: Unauthorized — No Token ──
  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app)
      .post("/api/shopping/list")
      .send({
        houseId,
        name: "Unauthorized Shopping Item",
        quantity: 1,
        category: "groceries"
      });

    expect(res.statusCode).toEqual(401);
  });
});
