import { useEffect, useState } from "react"
import { useBadge } from "../context/BadgeContext"

function Analytics() {
  const { getEarnedBadgesList } = useBadge()
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    completionRate: 0,
    badges: 0,
    createdToday: 0,
    completedToday: 0
  })

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    const tasks = savedTasks ? JSON.parse(savedTasks) : []
    const badges = getEarnedBadgesList()
    
    const today = new Date().toDateString()
    const completedCount = tasks.filter(t => t.status === "Completed").length
    const inProgressCount = tasks.filter(t => t.status === "In Progress").length
    const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0
    
    // Bugün oluşturulan görevleri sayar (simüle edilmiş olarak ID'nin son 4 hanesi)
    const createdTodayCount = tasks.filter(t => {
      const taskDate = new Date(t.id).toDateString()
      return taskDate === today
    }).length
    
    // Bugün tamamlanan görevleri sayar
    const completedTodayCount = tasks.filter(t => {
      t.status === "Completed"
    }).length

    setStats({
      totalTasks: tasks.length,
      completedTasks: completedCount,
      inProgressTasks: inProgressCount,
      completionRate: completionRate,
      badges: badges.length,
      createdToday: createdTodayCount,
      completedToday: completedTodayCount
    })
  }, [getEarnedBadgesList])

  const getCompletionColor = (rate) => {
    if (rate >= 80) return "text-green-500"
    if (rate >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Analitik Paneli</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-xl border border-blue-700">
          <h2 className="text-zinc-300 text-sm mb-2">Toplam Görev</h2>
          <p className="text-4xl font-bold">{stats.totalTasks}</p>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-xl border border-green-700">
          <h2 className="text-zinc-300 text-sm mb-2">Tamamlanan</h2>
          <p className="text-4xl font-bold text-green-400">{stats.completedTasks}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-xl border border-purple-700">
          <h2 className="text-zinc-300 text-sm mb-2">Devam Ediyor</h2>
          <p className="text-4xl font-bold text-purple-400">{stats.inProgressTasks}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 p-6 rounded-xl border border-yellow-700">
          <h2 className="text-zinc-300 text-sm mb-2">Başarı Oranı</h2>
          <p className={`text-4xl font-bold ${getCompletionColor(stats.completionRate)}`}>
            {stats.completionRate}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-zinc-300 text-sm mb-2">Bugün Oluşturulan</h2>
          <p className="text-3xl font-bold">{stats.createdToday}</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-zinc-300 text-sm mb-2">Bugün Tamamlanan</h2>
          <p className="text-3xl font-bold text-green-400">{stats.completedToday}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-900 to-yellow-700 p-6 rounded-xl border border-yellow-700">
          <h2 className="text-zinc-300 text-sm mb-2">🏆 Rozetler</h2>
          <p className="text-3xl font-bold">{stats.badges}</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-zinc-300 text-sm mb-2">Geri Kalan</h2>
          <p className="text-3xl font-bold text-blue-400">{stats.totalTasks - stats.completedTasks}</p>
        </div>
      </div>

      {/* İlerleme Çubuğu */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 mb-8">
        <h3 className="text-lg font-semibold mb-4">Genel İlerleme</h3>
        <div className="w-full bg-zinc-800 rounded-full h-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>
        <p className="text-zinc-400 text-sm mt-3">
          {stats.completedTasks} / {stats.totalTasks} görev tamamlandı
        </p>
      </div>

      {/* Özet */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        <h3 className="text-lg font-semibold mb-4">📊 Özet</h3>
        <div className="space-y-2 text-zinc-300">
          <p>• Görevlerin <span className={`font-bold ${getCompletionColor(stats.completionRate)}`}>{stats.completionRate}%</span>'i tamamlandı</p>
          <p>• Hala <span className="font-bold text-blue-400">{stats.totalTasks - stats.completedTasks}</span> görev bekliyor</p>
          <p>• <span className="font-bold text-yellow-400">{stats.badges}</span> rozet kazandınız 🏆</p>
          {stats.completionRate === 100 && stats.totalTasks > 0 && (
            <p className="text-green-400 font-bold">✨ Tebrikler! Tüm görevleri tamamladınız!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics