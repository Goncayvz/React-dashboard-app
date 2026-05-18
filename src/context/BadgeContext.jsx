/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react"

const BadgeContext = createContext()

export const BADGES = [
  {
    id: 1,
    name: "İlk Adım (First Step)",
    description: "1 görevi tamamla (Complete 1 task)",
    icon: "🎯",
    threshold: 1,
    category: "completions"
  },
  {
    id: 2,
    name: "Bronz Başarı (Bronze Achievement)",
    description: "5 görevi tamamla (Complete 5 tasks)",
    icon: "🥉",
    threshold: 5,
    category: "completions"
  },
  {
    id: 3,
    name: "Gümüş Başarı (Silver Achievement)",
    description: "10 görevi tamamla (Complete 10 tasks)",
    icon: "🥈",
    threshold: 10,
    category: "completions"
  },
  {
    id: 4,
    name: "Altın Başarı (Gold Achievement)",
    description: "20 görevi tamamla (Complete 20 tasks)",
    icon: "🥇",
    threshold: 20,
    category: "completions"
  },
  {
    id: 5,
    name: "Elmas Başarı (Diamond Achievement)",
    description: "50 görevi tamamla (Complete 50 tasks)",
    icon: "💎",
    threshold: 50,
    category: "completions"
  },
  {
    id: 6,
    name: "Hız Ustası (Speed Master)",
    description: "2 görevi tamamla (Complete 2 tasks)",
    icon: "⚡",
    threshold: 2,
    category: "speed"
  },
  {
    id: 7,
    name: "Hız Şampiyonu (Speed Champion)",
    description: "5 görevi tamamla (Complete 5 tasks)",
    icon: "🚀",
    threshold: 5,
    category: "speed"
  },
  {
    id: 8,
    name: "Temizlik Ustası (Cleanup Master)",
    description: "Tüm görevleri tamamla (Complete all tasks)",
    icon: "✨",
    threshold: 100,
    category: "cleanup"
  },
  {
    id: 9,
    name: "Tasarımcı (Designer)",
    description: "UI Design System görevini tamamla (Complete the UI Design System task)",
    icon: "🎨",
    threshold: 1,
    category: "specific"
  },
  {
    id: 10,
    name: "Güvenlik Uzmanı (Security Expert)",
    description: "Authentication görevini tamamla (Complete the Authentication task)",
    icon: "🔐",
    threshold: 1,
    category: "specific"
  },
  {
    id: 11,
    name: "Verimli Gün (Productive Day)",
    description: "3 görevi aynı günde tamamla (Complete 3 tasks in one day)",
    icon: "☀️",
    threshold: 3,
    category: "daily"
  },
  {
    id: 12,
    name: "İş Diyarı (Task Realm)",
    description: "10 görev ekle (Add 10 tasks)",
    icon: "📋",
    threshold: 10,
    category: "created"
  },
  {
    id: 13,
    name: "Ekibin Kahramanı (Team Hero)",
    description: "5 gün üst üste aktif ol (Be active for 5 days in a row)",
    icon: "🦸",
    threshold: 5,
    category: "streak"
  },
  {
    id: 14,
    name: "Mükemmeliyetçi (Perfectionist)",
    description: "100% görev başarı oranı (100% task success rate)",
    icon: "💯",
    threshold: 100,
    category: "perfect"
  },
  {
    id: 15,
    name: "Süper Verimliliği (Super Productivity)",
    description: "30 görev tamamla (Complete 30 tasks)",
    icon: "🌟",
    threshold: 30,
    category: "completions"
  },
  {
    id: 16,
    name: "Lider (Leader)",
    description: "100 görev tamamla (Complete 100 tasks)",
    icon: "👑",
    threshold: 100,
    category: "completions"
  },
  {
    id: 17,
    name: "Zaman Yöneticisi (Time Manager)",
    description: "Hiç gecikmiş görev yapma (Do not create overdue tasks)",
    icon: "⏰",
    threshold: 1,
    category: "ontime"
  },
  {
    id: 18,
    name: "Dikkat Meraklısı (Detail Seeker)",
    description: "Çok detaylı görev açıklaması ekle (Add a very detailed task description)",
    icon: "🔍",
    threshold: 1,
    category: "detail"
  },
  {
    id: 19,
    name: "Sosyal Kelebek (Social Butterfly)",
    description: "Yeni profil bilgileri ekle (Add new profile information)",
    icon: "🦋",
    threshold: 1,
    category: "social"
  },
  {
    id: 20,
    name: "Başlangıç Ustası (Setup Master)",
    description: "Profil ve ayarlarını tamamla (Complete your profile and settings)",
    icon: "🚀",
    threshold: 1,
    category: "setup"
  }
]

export function getBadgeAwards(completedCount, totalCount = 0, earnedBadges = []) {
  const earnedSet = new Set(earnedBadges)
  const awards = [
    ...BADGES.filter(
      (badge) => badge.category === "completions" && completedCount >= badge.threshold && !earnedSet.has(badge.id)
    ),
    ...BADGES.filter((badge) => badge.category === "speed" && completedCount >= badge.threshold && !earnedSet.has(badge.id))
  ]

  const perfectBadge = BADGES.find((badge) => badge.id === 14)
  if (totalCount > 0 && completedCount === totalCount && totalCount >= 5 && perfectBadge && !earnedSet.has(14)) {
    awards.push(perfectBadge)
  }

  const creatorBadge = BADGES.find((badge) => badge.id === 12)
  if (totalCount >= 10 && creatorBadge && !earnedSet.has(12)) {
    awards.push(creatorBadge)
  }

  return awards
}

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

  function checkAndAwardBadges(completedCount, totalCount = 0) {
    const newBadges = []
    
    // Tamamlama sayısına göre
    BADGES
      .filter((badge) => badge.category === "completions" && completedCount >= badge.threshold && !earnedBadges.includes(badge.id))
      .forEach((badge) => {
        addBadge(badge.id)
        newBadges.push(badge)
      })

    // Hız rozetleri (tamamlama sayısına göre)
    BADGES
      .filter((badge) => badge.category === "speed" && completedCount >= badge.threshold && !earnedBadges.includes(badge.id))
      .forEach((badge) => {
        addBadge(badge.id)
        newBadges.push(badge)
      })

    // Mükemmellik (100% tamamlama oranı)
    if (totalCount > 0 && completedCount === totalCount && totalCount >= 5) {
      const perfectBadge = BADGES.find(b => b.id === 14)
      if (perfectBadge && !earnedBadges.includes(14)) {
        addBadge(14)
        newBadges.push(perfectBadge)
      }
    }

    // İş Diyarı (10+ görev oluşturulmuş)
    if (totalCount >= 10) {
      const creatorBadge = BADGES.find(b => b.id === 12)
      if (creatorBadge && !earnedBadges.includes(12)) {
        addBadge(12)
        newBadges.push(creatorBadge)
      }
    }

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
