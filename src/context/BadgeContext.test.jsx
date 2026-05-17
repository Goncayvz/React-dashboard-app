import { describe, expect, it } from "vitest"
import { getBadgeAwards } from "./BadgeContext.jsx"

const getAwardIds = (...args) => getBadgeAwards(...args).map((badge) => badge.id)

describe("getBadgeAwards", () => {
  it("awards completion and speed badges for completed tasks", () => {
    expect(getAwardIds(5, 7, [])).toEqual(expect.arrayContaining([1, 2, 6, 7]))
  })

  it("does not award badges that are already earned", () => {
    expect(getAwardIds(5, 7, [1, 2, 6, 7])).not.toEqual(expect.arrayContaining([1, 2, 6, 7]))
  })

  it("awards perfect and creator badges when thresholds match", () => {
    expect(getAwardIds(10, 10, [])).toEqual(expect.arrayContaining([12, 14]))
  })
})
