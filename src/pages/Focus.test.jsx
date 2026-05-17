import { describe, expect, it } from "vitest"
import { formatTime, getDirectAudioUrl, getYoutubeEmbedUrl } from "../utils/focusHelpers"

describe("focus helpers", () => {
  it("formats seconds as mm:ss", () => {
    expect(formatTime(0)).toBe("00:00")
    expect(formatTime(65)).toBe("01:05")
    expect(formatTime(1500)).toBe("25:00")
  })

  it("builds YouTube embed URLs from common video links", () => {
    expect(getYoutubeEmbedUrl("https://www.youtube.com/watch?v=abc123")).toContain("/embed/abc123")
    expect(getYoutubeEmbedUrl("https://youtu.be/xyz789")).toContain("/embed/xyz789")
  })

  it("accepts direct audio URLs and rejects invalid or YouTube URLs", () => {
    expect(getDirectAudioUrl("https://example.com/audio.mp3")).toBe("https://example.com/audio.mp3")
    expect(getDirectAudioUrl("not-a-url")).toBe("")
    expect(getDirectAudioUrl("https://www.youtube.com/watch?v=abc123")).toBe("")
  })
})
