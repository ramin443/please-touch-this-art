import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../../lib/groqClient", () => ({
  streamGroqChat: vi.fn(),
}));

import app from "../../app";
import { streamGroqChat } from "../../lib/groqClient";

async function* fakeStream(chunks: string[]) {
  for (const c of chunks) yield c;
}

describe("POST /api/artist-chat", () => {
  beforeEach(() => {
    vi.mocked(streamGroqChat).mockReset();
    process.env["GROQ_API_KEY"] = "test-key";
  });

  it("rejects unknown artistId with 400", async () => {
    const res = await request(app)
      .post("/api/artist-chat")
      .send({ artistId: "picasso", messages: [{ role: "user", content: "hi" }] });
    expect(res.status).toBe(400);
  });

  it("rejects messages longer than 500 chars with 400", async () => {
    const res = await request(app)
      .post("/api/artist-chat")
      .send({
        artistId: "van-gogh",
        messages: [{ role: "user", content: "x".repeat(501) }],
      });
    expect(res.status).toBe(400);
  });

  it("rejects more than 20 messages with 400", async () => {
    const messages = Array.from({ length: 21 }, () => ({
      role: "user" as const,
      content: "hi",
    }));
    const res = await request(app)
      .post("/api/artist-chat")
      .send({ artistId: "van-gogh", messages });
    expect(res.status).toBe(400);
  });

  it("streams SSE chunks from groq on valid request", async () => {
    vi.mocked(streamGroqChat).mockResolvedValueOnce(
      fakeStream(["Hello", " Theo"]),
    );
    const res = await request(app)
      .post("/api/artist-chat")
      .send({
        artistId: "van-gogh",
        messages: [{ role: "user", content: "Greet Theo" }],
      });
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/event-stream/);
    expect(res.text).toContain("data: Hello");
    expect(res.text).toContain("data:  Theo");
    expect(res.text).toContain("event: done");
  });

  it("returns 502 when groq fails twice (primary + fallback)", async () => {
    const err = new Error("Groq returned 503") as Error & { status: number };
    err.status = 503;
    vi.mocked(streamGroqChat)
      .mockRejectedValueOnce(err)
      .mockRejectedValueOnce(err);
    const res = await request(app)
      .post("/api/artist-chat")
      .send({
        artistId: "van-gogh",
        messages: [{ role: "user", content: "hi" }],
      });
    expect(res.status).toBe(502);
    expect(vi.mocked(streamGroqChat)).toHaveBeenCalledTimes(2);
  });

  it("falls back to smaller model when primary returns 429", async () => {
    const err = new Error("Groq returned 429") as Error & { status: number };
    err.status = 429;
    vi.mocked(streamGroqChat)
      .mockRejectedValueOnce(err)
      .mockResolvedValueOnce(fakeStream(["fallback"]));
    const res = await request(app)
      .post("/api/artist-chat")
      .send({
        artistId: "van-gogh",
        messages: [{ role: "user", content: "hi" }],
      });
    expect(res.status).toBe(200);
    expect(res.text).toContain("data: fallback");
    expect(vi.mocked(streamGroqChat)).toHaveBeenCalledTimes(2);
  });
});
