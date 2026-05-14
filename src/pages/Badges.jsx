import { useBadge } from "../context/BadgeContext"

function Badges() {
  const { getEarnedBadgesList, BADGES } = useBadge()
  const earnedBadges = getEarnedBadgesList()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Rozetlerim</h1>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-green-400">Kazanılan Rozetler ({earnedBadges.length})</h2>
        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-zinc-900 rounded-lg p-6 border-2 border-yellow-500 text-center hover:border-yellow-400 transition"
              >
                <div className="text-5xl mb-3">{badge.icon}</div>
                <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                <p className="text-xs text-zinc-400">{badge.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-400">Henüz rozet kazanmadınız. Görevleri tamamlayarak rozetler kazanın!</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6 text-zinc-400">Kullanılabilir Rozetler ({BADGES.length - earnedBadges.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {BADGES.filter((b) => !earnedBadges.find((eb) => eb.id === b.id)).map((badge) => (
            <div
              key={badge.id}
              className="bg-zinc-900 rounded-lg p-6 border border-zinc-700 text-center opacity-50 hover:opacity-70 transition"
            >
              <div className="text-5xl mb-3 grayscale">{badge.icon}</div>
              <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
              <p className="text-xs text-zinc-500">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Badges
