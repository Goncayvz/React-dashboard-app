import { useEffect } from "react"
import { useBadge } from "../context/BadgeContext"
import { useNotification } from "../context/NotificationContext"

function Badges() {
  const { getEarnedBadgesList, BADGES } = useBadge()
  const earnedBadges = getEarnedBadgesList()
  const { clearNotifications } = useNotification()

  useEffect(() => {
    // sayfa açılınca bildirimleri sil
    clearNotifications()
  }, [clearNotifications])




  const categories = {
    completions: { name: "🎯 Tamamlama Seviyeleri", color: "from-blue-900 to-blue-800" },
    speed: { name: "⚡ Hız ve Verimlilik", color: "from-yellow-900 to-yellow-800" },
    daily: { name: "☀️ Günlük Zorluklar", color: "from-orange-900 to-orange-800" },
    created: { name: "📋 Yaratıcılık", color: "from-purple-900 to-purple-800" },
    streak: { name: "🔥 Tutarlılık", color: "from-red-900 to-red-800" },
    cleanup: { name: "✨ Temizlik", color: "from-green-900 to-green-800" },
    specific: { name: "🎨 Özel Görevler", color: "from-pink-900 to-pink-800" },
    perfect: { name: "💯 Mükemmellik", color: "from-indigo-900 to-indigo-800" },
    ontime: { name: "⏰ Zaman Yönetimi", color: "from-cyan-900 to-cyan-800" },
    detail: { name: "🔍 Dikkat", color: "from-slate-900 to-slate-800" },
    social: { name: "🦋 Sosyal", color: "from-fuchsia-900 to-fuchsia-800" },
    setup: { name: "🚀 Başlangıç", color: "from-lime-900 to-lime-800" }
  }

  const getBadgesByCategory = (categoryKey) => {
    return BADGES.filter((b) => b.category === categoryKey)
  }

  const isBadgeEarned = (badgeId) => {
    return earnedBadges.some((b) => b.id === badgeId)
  }

  return (
    <div className="px-4 py-6 sm:p-8">
      <div className="mb-8" onClick={clearNotifications}>
        <h1 className="text-4xl font-bold mb-2">🏆 Rozetler</h1>
        <p className="text-zinc-400">
          Kazanılan:{" "}
          <span className="text-yellow-400 font-bold">{earnedBadges.length}</span> / {BADGES.length}
        </p>
      </div>

      {/* Kazanılan Rozetler Hızlı Gösterim */}
      {earnedBadges.length > 0 && (
        <div
          className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-700 rounded-lg p-6 mb-8"
          onClick={clearNotifications}
        >
          <h2 className="text-xl font-bold text-yellow-400 mb-4">⭐ Kazanılan Rozetler</h2>
          <div className="flex flex-wrap gap-3">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-yellow-500/10 border border-yellow-400 rounded-full px-4 py-2 flex items-center gap-2"
              >
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <p className="font-semibold text-yellow-300">{badge.name}</p>
                  <p className="text-xs text-yellow-200">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kategoriye Göre Rozetler */}
      <div className="space-y-8">
        {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
          const badgesInCategory = getBadgesByCategory(categoryKey)
          const earnedInCategory = badgesInCategory.filter((b) => isBadgeEarned(b.id))

          return (
            <div key={categoryKey} className="rounded-lg overflow-hidden border border-zinc-800">
              <div className={`bg-gradient-to-r ${categoryInfo.color} p-4 border-b border-zinc-700`}>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {categoryInfo.name}
                  <span className="ml-auto text-sm bg-black/30 px-3 py-1 rounded-full">
                    {earnedInCategory.length} / {badgesInCategory.length}
                  </span>
                </h3>
              </div>

              <div className="p-6 bg-zinc-900">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badgesInCategory.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isBadgeEarned(badge.id)
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-zinc-700 bg-zinc-800/50 opacity-40"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`text-4xl ${isBadgeEarned(badge.id) ? "" : "grayscale"}`}>
                          {badge.icon}
                        </div>
                        {isBadgeEarned(badge.id) && <div className="text-yellow-400 text-xl">✓</div>}
                      </div>
                      <h4 className="font-bold text-white">{badge.name}</h4>
                      <p className="text-sm text-zinc-400">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* İstatistikler */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
          <h3 className="text-zinc-400 mb-2">Toplam Rozetler</h3>
          <p className="text-4xl font-bold text-yellow-400">{BADGES.length}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
          <h3 className="text-zinc-400 mb-2">Kalan Rozetler</h3>
          <p className="text-4xl font-bold text-blue-400">{BADGES.length - earnedBadges.length}</p>
        </div>
      </div>
    </div>
  )
}

export default Badges

