import { createContext, useState, useContext, useEffect } from "react"

const BadgeContext = createContext()

const BADGES = [
  {
    id: 1,
    name: "İlk Adım",
    description: "1 görevi tamamla",
    icon: "🎯",
    threshold: 1,
    color: "bronze"
  },
  {
    id: 2,
    name: "Bronz Başarı",
    description: "5 görevi tamamla",
    icon: "🥉",
    threshold: 5,
    color: "bronze"
  },
  {
    id: 3,
    name: "Gümüş Başarı",
    description: "10 görevi tamamla",
    icon: "🥈",
    threshold: 10,
    color: "silver"
  },
  {
    id: 4,
    name: "Altın Başarı",
    description: "20 görevi tamamla",
    icon: "🥇",
    threshold: 20,
    color: "gold"
  },
  {
    id: 5,
    name: "Elmas Başarı",
    description: "50 görevi tamamla",
    icon: "💎",
    threshold: 50,
    color: "diamond"
  },
  {
    id: 6,
    name: "Süper Verimli",
    description: "1 gün içinde 3 görevi tamamla",
    icon: "⚡",
    threshold: 3,
    color: "lightning"
  },
  {
    id: 7,
    name: "Hız Ustası",
    description: "10 dakika içinde 2 görevi tamamla",
    icon: "🚀",
    threshold: 2,
    color: "rocket"
  }
]

export function BadgeProvider({ children }) {
  const [earnedBadges, setEarnedBadges] = useState(() => {
    const saved = localStorage.getItem("earnedBadges")
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem("earnedBadges", JSON.stringify(earnedBadges))
  }, [earnedBadges])

  function addBadge(badgeId) {
    if (!earnedBadges.includes(badgeId)) {
      setEarnedBadges((prev) => [...prev, badgeId])
      return true
    }
    return false
  }

  function checkAndAwardBadges(completedCount) {
    const newBadges = BADGES
      .filter((badge) => completedCount >= badge.threshold && !earnedBadges.includes(badge.id))
      .map((badge) => {
        addBadge(badge.id)
        return badge
      })
    return newBadges
  }

  function getBadgeInfo(badgeId) {
    return BADGES.find((b) => b.id === badgeId)
  }

  function getEarnedBadgesList() {
    return earnedBadges.map((id) => getBadgeInfo(id)).filter(Boolean)
  }

  return (
    <BadgeContext.Provider
      value={{
        earnedBadges,
        addBadge,
        checkAndAwardBadges,
        getBadgeInfo,
        getEarnedBadgesList,
        BADGES
      }}
    >
      {children}
    </BadgeContext.Provider>
  )
}

export function useBadge() {
  const context = useContext(BadgeContext)
  if (!context) {
    throw new Error("useBadge must be used within BadgeProvider")
  }
  return context
}
