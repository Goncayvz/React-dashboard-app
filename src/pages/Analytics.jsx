import { useMemo } from "react"
import { useBadge } from "../context/BadgeContext"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts"

function Analytics() {
  const { getEarnedBadgesList } = useBadge()

  const stats = useMemo(() => {
    const savedTasks = localStorage.getItem("tasks")
    const tasks = savedTasks ? JSON.parse(savedTasks) : []
    const badges = getEarnedBadgesList()

    const today = new Date().toDateString()

    const completedCount = tasks.filter((t) => t.status === "Completed").length
    const inProgressCount = tasks.filter((t) => t.status === "In Progress").length

    const completionRate =
      tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

    const createdTodayCount = tasks.filter((t) => {
      const taskDate = new Date(t.id).toDateString()
      return taskDate === today
    }).length

    const completedTodayCount = tasks.filter((t) => t.status === "Completed").length

    return {
      totalTasks: tasks.length,
      completedTasks: completedCount,
      inProgressTasks: inProgressCount,
      completionRate,
      badges: badges.length,
      createdToday: createdTodayCount,
      completedToday: completedTodayCount,
      tasks
    }
  }, [getEarnedBadgesList])

  //REAL CHART DATA 
  const chartData = [
    { name: "Completed", value: stats.completedTasks },
    { name: "In Progress", value: stats.inProgressTasks }
  ]

  const COLORS = ["#22c55e", "#3b82f6"]

  const getCompletionColor = (rate) => {
    if (rate >= 80) return "text-green-500"
    if (rate >= 50) return "text-yellow-500"
    return "text-red-500"
  }
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const taskByDay = {
    Sun: 0,
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0
  }

// task.id üzerinden fake tarih üretim
stats.tasks.forEach((task) => {
  const dayIndex = new Date(task.id).getDay()
  const dayName = days[dayIndex]
  taskByDay[dayName]++
})
const lineData = days.map(day => ({
  name: day,
  tasks: taskByDay[day]
}))
  return (
    <div className="px-4 py-6 text-white sm:p-8">
      <h1 className="mb-8 text-2xl font-bold sm:text-3xl">Analitik Paneli (Analytics Panel)</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-3xl border border-white/10">
          <h2 className="text-zinc-300 text-sm mb-2">Toplam Görev (Total Tasks)</h2>
          <p className="text-3xl font-bold sm:text-4xl">{stats.totalTasks}</p>
        </div>

        <div className="glass-card bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-3xl border border-white/10">
          <h2 className="text-zinc-300 text-sm mb-2">Tamamlanan (Completed)</h2>
          <p className="text-3xl font-bold sm:text-4xl">{stats.completedTasks}</p>
        </div>

        <div className="glass-card bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-3xl border border-white/10">
          <h2 className="text-zinc-300 text-sm mb-2">Devam Ediyor (In Progress)</h2>
          <p className="text-3xl font-bold sm:text-4xl">{stats.inProgressTasks}</p>
        </div>

        <div className={`glass-card p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-yellow-900 to-yellow-800`}>
          <h2 className="text-zinc-300 text-sm mb-2">Başarı Oranı (Success Rate)</h2>
          <p className={`text-3xl font-bold sm:text-4xl ${getCompletionColor(stats.completionRate)}`}>
            {stats.completionRate}%
          </p>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 mb-8">
        <h3 className="text-lg font-semibold mb-4">Genel İlerleme (Overall Progress)</h3>

        <div className="w-full bg-zinc-800 rounded-full h-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>

        <p className="text-zinc-400 text-sm mt-3">
          {stats.completedTasks} / {stats.totalTasks} görev tamamlandı (tasks completed)
        </p>
      </div>

      {/* PIE CHART (EKLENDİ) */}
      <div className="glass-card mb-8 rounded-3xl border border-white/10 p-5 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Görev Dağılımı (Task Distribution)</h3>

        <div className="h-64 min-w-0 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius="70%"
              label
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        </div>
      </div>
      {/* LINE CHART (EKLENDİ) */}
      <div className="glass-card mb-8 rounded-3xl border border-white/10 p-5 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">
          Haftalık Görev Aktivitelesi (Weekly Task Activity)
        </h3>
        <div className="h-64 min-w-0 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineData} margin={{ left: -20, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="name"/>
            <YAxis allowDecimals={false}/>
            <Tooltip/>
            <Line
            type="monotone"
            dataKey="tasks"
            stroke="#3b82f6"
            strokeWidth={3}
            />   
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>
      {/* SUMMARY */}
      <div className="glass-card p-6 rounded-3xl border border-white/10">
        <h3 className="text-lg font-semibold mb-4">📊 Özet (Summary)</h3>

        <div className="space-y-2 text-zinc-300">
          <p>
            • Görevlerin{" "}
            <span className={`font-bold ${getCompletionColor(stats.completionRate)}`}>
              {stats.completionRate}%
            </span>{" "}
            tamamlandı. (Your tasks are {stats.completionRate}% completed.)
          </p>

          <p>
            • Hala{" "}
            <span className="font-bold text-blue-400">
              {stats.totalTasks - stats.completedTasks}
            </span>{" "}
            görev bekliyor. ({stats.totalTasks - stats.completedTasks} tasks are pending.)
          </p>

          <p>
            • <span className="font-bold text-yellow-400">{stats.badges}</span>{" "}
            rozet kazandınız. (You earned {stats.badges} badges.) 🏆
          </p>

          {stats.completionRate === 100 && stats.totalTasks > 0 && (
            <p className="text-green-400 font-bold">
              ✨ Tebrikler! Tüm görevleri tamamladınız! (Congratulations! You completed all tasks!)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics
