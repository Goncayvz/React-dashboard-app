/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react"

const BadgeContext = createContext()

const BADGES = [
  {
    id: 1,
    name: "İlk Adım",
    description: "1 görevi tamamla",
    icon: "🎯",
    threshold: 1,
    category: "completions"
  },
  {
    id: 2,
    name: "Bronz Başarı",
    description: "5 görevi tamamla",
    icon: "🥉",
    threshold: 5,
    category: "completions"
  },
  {
    id: 3,
    name: "Gümüş Başarı",
    description: "10 görevi tamamla",
    icon: "🥈",
    threshold: 10,
    category: "completions"
  },
  {
    id: 4,
    name: "Altın Başarı",
    description: "20 görevi tamamla",
    icon: "🥇",
    threshold: 20,
    category: "completions"
  },
  {
    id: 5,
    name: "Elmas Başarı",
    description: "50 görevi tamamla",
    icon: "💎",
    threshold: 50,
    category: "completions"
  },
  {
    id: 6,
    name: "Hız Ustası",
    description: "2 görevi tamamla",
    icon: "⚡",
    threshold: 2,
    category: "speed"
  },
  {
    id: 7,
    name: "Hız Şampiyonu",
    description: "5 görevi tamamla",
    icon: "🚀",
    threshold: 5,
    category: "speed"
  },
  {
    id: 8,
    name: "Temizlik Ustası",
    description: "Tüm görevleri tamamla",
    icon: "✨",
    threshold: 100,
    category: "cleanup"
  },
  {
    id: 9,
    name: "Tasarımcı",
    description: "UI Design System görevini tamamla",
    icon: "🎨",
    threshold: 1,
    category: "specific"
  },
  {
    id: 10,
    name: "Güvenlik Uzmanı",
    description: "Authentication görevini tamamla",
    icon: "🔐",
    threshold: 1,
    category: "specific"
  },
  {
    id: 11,
    name: "Verimli Gün",
    description: "3 görevi aynı günde tamamla",
    icon: "☀️",
    threshold: 3,
    category: "daily"
  },
  {
    id: 12,
    name: "İş Diyarı",
    description: "10 görev ekle",
    icon: "📋",
    threshold: 10,
    category: "created"
  },
  {
    id: 13,
    name: "Ekibin Kahramanı",
    description: "5 gün üst üste aktif ol",
    icon: "🦸",
    threshold: 5,
    category: "streak"
  },
  {
    id: 14,
    name: "Mükemmeliyetçi",
    description: "100% görev başarı oranı",
    icon: "💯",
    threshold: 100,
    category: "perfect"
  },
  {
    id: 15,
    name: "Süper Verimliliği",
    description: "30 görev tamamla",
    icon: "🌟",
    threshold: 30,
    category: "completions"
  },
  {
    id: 16,
    name: "Lider",
    description: "100 görev tamamla",
    icon: "👑",
    threshold: 100,
    category: "completions"
  },
  {
    id: 17,
    name: "Zaman Yöneticisi",
    description: "Hiç gecikmiş görev yapma",
    icon: "⏰",
    threshold: 1,
    category: "ontime"
  },
  {
    id: 18,
    name: "Dikkat Meraklısı",
    description: "Çok detaylı görev açıklaması ekle",
    icon: "🔍",
    threshold: 1,
    category: "detail"
  },
  {
    id: 19,
    name: "Sosyal Kelebek",
    description: "Yeni profil bilgileri ekle",
    icon: "🦋",
    threshold: 1,
    category: "social"
  },
  {
    id: 20,
    name: "Başlangıç Ustası",
    description: "Profil ve ayarlarını tamamla",
    icon: "🚀",
    threshold: 1,
    category: "setup"
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
