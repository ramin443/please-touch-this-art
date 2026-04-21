import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useArtistChat } from "../useArtistChat";

function makeSseResponse(chunks: string[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      for (const c of chunks) controller.enqueue(enc.encode(`data: ${c}\n\n`));
      controller.enqueue(enc.encode("event: done\ndata: ok\n\n"));
      controller.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}

describe("useArtistChat", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("starts idle with no messages", () => {
    const { result } = renderHook(() => useArtistChat("van-gogh"));
    expect(result.current.messages).toEqual([]);
    expect(result.current.status).toBe("idle");
  });

  it("appends user + streamed assistant reply on send", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeSseResponse(["Hello", " Theo"])),
    );
    const { result } = renderHook(() => useArtistChat("van-gogh"));
    await act(async () => {
      await result.current.send("Hi");
    });
    await waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.messages).toEqual([
      { role: "user", content: "Hi" },
      { role: "assistant", content: "Hello Theo" },
    ]);
  });

  it("clears messages when artist changes via switchArtist", () => {
    const { result } = renderHook(() => useArtistChat("van-gogh"));
    act(() => result.current.switchArtist("dali"));
    expect(result.current.messages).toEqual([]);
    expect(result.current.artistId).toBe("dali");
  });

  it("sets error status on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "upstream" }), { status: 502 }),
      ),
    );
    const { result } = renderHook(() => useArtistChat("van-gogh"));
    await act(async () => {
      await result.current.send("Hi");
    });
    expect(result.current.status).toBe("error");
    expect(result.current.error?.code).toBe("upstream");
  });

  it("maps 429 to rate_limit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 429 })),
    );
    const { result } = renderHook(() => useArtistChat("van-gogh"));
    await act(async () => {
      await result.current.send("Hi");
    });
    expect(result.current.error?.code).toBe("rate_limit");
  });
});
