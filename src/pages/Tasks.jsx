import { useState, useEffect } from "react"
import TaskCard from "../components/TaskCard"
import { useBadge } from "../context/BadgeContext"
import { useNotification } from "../context/NotificationContext"

function Tasks() {
  const { checkAndAwardBadges } = useBadge()
  const { addNotification } = useNotification()

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks")
    return savedTasks
      ? JSON.parse(savedTasks)
      : [
          {
            id: 1,
            title: "UI Design System",
            description: "Create reusable UI components",
            status: "In Progress",
            deadline: "2 days left"
          },
          {
            id: 2,
            title: "Authentication Page",
            description: "Build login system",
            status: "Completed",
            deadline: "Done"
          }
        ]
  })

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))

    // Rozetleri kontrol et
    const completedCount = tasks.filter(t => t.status === "Completed").length
    const newBadges = checkAndAwardBadges(completedCount, tasks.length, { tasks })

    // Yeni rozetler kazanıldıysa bildirim göster
    if (newBadges.length > 0) {
      newBadges.forEach((badge) => {
        addNotification(`🎉 Yeni rozet: ${badge.name}!`, "success", 4000)
      })
    }
  }, [tasks, checkAndAwardBadges, addNotification])

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function toggleStatus(id) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "Completed" ? "In Progress" : "Completed" }
          : t
      )
    )
  }

  return (
    <div className="p-8 grid grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          title={task.title}
          description={task.description}
          status={task.status}
          deadline={task.deadline}
          onDelete={() => deleteTask(task.id)}
          onToggle={() => toggleStatus(task.id)}
        />
      ))}
    </div>
  )
}

export default Tasks