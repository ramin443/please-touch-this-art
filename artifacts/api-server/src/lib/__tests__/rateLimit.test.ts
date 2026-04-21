import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRateLimiter } from "../rateLimit";

describe("createRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-21T00:00:00Z"));
  });

  it("allows requests up to the limit", () => {
    const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60_000 });
    expect(limiter.check("ip-a")).toEqual({ allowed: true, remaining: 2 });
    expect(limiter.check("ip-a")).toEqual({ allowed: true, remaining: 1 });
    expect(limiter.check("ip-a")).toEqual({ allowed: true, remaining: 0 });
  });

  it("rejects requests over the limit", () => {
    const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60_000 });
    limiter.check("ip-a");
    limiter.check("ip-a");
    expect(limiter.check("ip-a")).toEqual({ allowed: false, remaining: 0 });
  });

  it("tracks separate buckets per key", () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000 });
    expect(limiter.check("ip-a").allowed).toBe(true);
    expect(limiter.check("ip-b").allowed).toBe(true);
    expect(limiter.check("ip-a").allowed).toBe(false);
  });

  it("resets the bucket after the window elapses", () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000 });
    expect(limiter.check("ip-a").allowed).toBe(true);
    expect(limiter.check("ip-a").allowed).toBe(false);
    vi.advanceTimersByTime(60_001);
    expect(limiter.check("ip-a").allowed).toBe(true);
  });
});
