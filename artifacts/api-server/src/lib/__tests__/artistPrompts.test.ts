import { describe, it, expect } from "vitest";
import { getArtistPrompt, ARTIST_IDS, type ArtistId } from "../artistPrompts";

describe("artistPrompts", () => {
  it("exposes exactly three artist ids", () => {
    expect(ARTIST_IDS).toEqual(["van-gogh", "dali", "munch"]);
  });

  it("returns a non-empty system prompt for each id", () => {
    for (const id of ARTIST_IDS as readonly ArtistId[]) {
      const prompt = getArtistPrompt(id);
      expect(prompt.length).toBeGreaterThan(100);
    }
  });

  it("each prompt enforces the 120-word limit", () => {
    for (const id of ARTIST_IDS as readonly ArtistId[]) {
      expect(getArtistPrompt(id).toLowerCase()).toContain("120 words");
    }
  });

  it("each prompt forbids medical advice", () => {
    for (const id of ARTIST_IDS as readonly ArtistId[]) {
      expect(getArtistPrompt(id).toLowerCase()).toContain("medical");
    }
  });
});
