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

  const [isEditing, setIsEditing] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")

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

  function openEditModal(task) {
    setSelectedTask(task)
    setEditTitle(task.title)
    setEditDesc(task.description)
    setIsEditing(true)
  }

  function updateTask() {
    if (!selectedTask) return

    setTasks((prev) =>
      prev.map((task) =>
        task.id === selectedTask.id
          ? {
              ...task,
              title: editTitle,
              description: editDesc
            }
          : task
      )
    )

    setIsEditing(false)
    setSelectedTask(null)
  }

  return (
    <div className="px-4 py-6 sm:p-8 relative overflow-hidden">
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            title={task.title}
            description={task.description}
            status={task.status}
            deadline={task.deadline}
            onDelete={() => deleteTask(task.id)}
            onToggle={() => toggleStatus(task.id)}
            onEdit={() => openEditModal(task)}
          />
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-zinc-900 p-6 rounded-lg w-[92vw] max-w-md border border-white/10">
            <h2 className="text-xl mb-4 font-semibold">Görevi Düzenle (Edit Task)</h2>

            <input
              className="w-full mb-3 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Başlık (Title)"
            />

            <input
              className="w-full mb-4 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Açıklama (Description)"
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={updateTask} className="bg-green-500 px-4 py-2 rounded w-full sm:w-auto">
                Kaydet (Save)
              </button>

              <button
                onClick={() => {
                  setIsEditing(false)
                  setSelectedTask(null)
                }}
                className="bg-red-500 px-4 py-2 rounded w-full sm:w-auto"
              >
                İptal (Cancel)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks
