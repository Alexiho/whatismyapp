const request = require("supertest");

const BASE_URL = "http://localhost:8080";

describe("HTTP API Vert.x", () => {

  test("GET /api/messages - should return JSON array", async () => {
    const res = await request(BASE_URL).get("/api/messages");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("application/json");

    const data = JSON.parse(res.text);
    expect(Array.isArray(data)).toBe(true);
  });

  test("POST /api/messages - should redirect", async () => {
    const res = await request(BASE_URL)
      .post("/api/messages")
      .type("form") // IMPORTANT (form data)
      .send({
        author: "Test",
        content: "Hello"
      });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/");
  });

  test("GET /api/message/:id - returns HTML", async () => {
    const res = await request(BASE_URL)
      .get("/api/message/1");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");

    expect(res.text).toContain("<"); // HTML basique
  });

  test("DELETE /api/message/:id - should delete", async () => {
    const res = await request(BASE_URL)
      .delete("/api/message/1");

    expect(res.statusCode).toBe(204);
  });

});
