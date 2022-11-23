const request = require("supertest");
const config = require("../common/tokenConfig");
const jwt = require("jsonwebtoken");
let server;

describe("POST /api/v1/staffs", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  describe("login", () => {
    it("should return a staff if login successful", async () => {
      const response = await request(server).post("/api/v1/staffs/login").send({
        phone: "0905444555",
        password: "123456",
      });
      expect(response.statusCode).toBe(200);
    });
    it("should return 400 if login failed", async () => {
      const response = await request(server).post("/api/v1/staffs/login").send({
        phone: "0905444555",
        password: "1234567",
      });
      expect(response.statusCode).toBe(401);
    });
  });
});

describe("GET /api/v1/staffs/:id", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  it("should return a staff if valid id is passed", async () => {
    const token = await generateAdminToken();
    const res = await request(server)
      .get("/api/v1/staffs/1")
      .set("x-access-token", token);
    expect(res.status).toBe(200);
  });

  it("should return 204 if invalid id is passed", async () => {
    const token = await generateAdminToken();
    const res = await request(server)
      .get("/api/v1/staffs/15")
      .set("x-access-token", token);
    expect(res.status).toBe(204);
  });
  it("should return 403 if staff is not permission", async () => {
    const token = await generateAdminToken(null, null, 2);
    const res = await request(server)
      .get("/api/v1/staffs/1")
      .set("x-access-token", token);
    expect(res.status).toBe(403);
  });
});

async function generateAdminToken(id, phone, roleId) {
  const staff = new Object({
    id: id ? id : 1,
    phone: phone ? phone : "0905444555",
    roleId: roleId ? roleId : 3,
  });
  const token = jwt.sign(staff, config.secret, { expiresIn: config.tokenLife });
  return `Bearer ${token}`;
}
