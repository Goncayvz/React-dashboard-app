import { useState } from "react"
import TaskCard from "../components/TaskCard"

function Tasks() {
  const [tasks, setTasks] = useState([
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
  ])

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