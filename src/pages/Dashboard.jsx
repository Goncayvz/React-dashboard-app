import { useEffect, useState } from "react";
import Header from "../components/Header";
import TaskCard from "../components/TaskCard";
import { useBadge } from "../context/BadgeContext";
import { useNotification } from "../context/NotificationContext";

function Dashboard() {
  const { checkAndAwardBadges } = useBadge();
  const { addNotification } = useNotification();

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");

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
            description: "Build login and register screens",
            status: "Completed",
            deadline: "Done"
          }
        ];
  });

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [filter, setFilter] = useState("all");

  const [isEditing, setIsEditing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));

    const completedCount = tasks.filter((t) => t.status === "Completed").length;
    const newBadges = checkAndAwardBadges(completedCount, tasks.length, { tasks });

    if (newBadges.length > 0) {
      newBadges.forEach((badge) => {
        addNotification(`🎉 Yeni rozet: ${badge.name}!`, "success", 4000);
      });
    }
  }, [tasks, checkAndAwardBadges, addNotification]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "completed") return task.status === "Completed";
    if (filter === "in progress") return task.status === "In Progress";
    return true;
  });

  function handleAddTask() {
    if (!newTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTitle,
      description: newDesc,
      status: "In Progress",
      deadline: "New"
    };

    setTasks((prev) => [...prev, newTask]);

    setNewTitle("");
    setNewDesc("");
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function toggleTaskStatus(id) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "Completed" ? "In Progress" : "Completed"
            }
          : task
      )
    );
  }

  function openEditModal(task) {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setIsEditing(true);
  }

  function updateTask() {
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
    );

    setIsEditing(false);
    setSelectedTask(null);
  }

  return (
    <div className="flex-1 px-4 py-6 sm:p-8 bg-transparent relative overflow-hidden">
      <div className="relative z-10">
        <Header />

        <div className="absolute inset-0 -z-10 bg-transparent" aria-hidden="true" />


        <div className="mb-8 glass-card p-5 sm:p-6 rounded-3xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Add New Task</h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Task Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />

            <input
              type="text"
              placeholder="Task Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />

            <button
              onClick={handleAddTask}
              className="bg-blue-500 px-6 py-2 rounded-lg w-full sm:w-auto"
            >
              Add Task
            </button>
          </div>
        </div>

        <div className="mb-8 glass-card p-5 sm:p-6 rounded-3xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Filter Tasks</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg ${filter === "all" ? "bg-blue-500" : "bg-zinc-700"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-lg ${filter === "completed" ? "bg-blue-500" : "bg-zinc-700"}`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter("in progress")}
              className={`px-4 py-2 rounded-lg ${
                filter === "in progress" ? "bg-blue-500" : "bg-zinc-700"
              }`}
            >
              In Progress
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              description={task.description}
              status={task.status}
              deadline={task.deadline}
              onDelete={() => deleteTask(task.id)}
              onToggle={() => toggleTaskStatus(task.id)}
              onEdit={() => openEditModal(task)}
            />
          ))}
        </div>

        {isEditing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-zinc-900 p-6 rounded-lg w-[92vw] max-w-md">
              <h2 className="text-xl mb-4">Edit Task</h2>

              <input
                className="w-full mb-3 p-2 bg-zinc-800"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <input
                className="w-full mb-3 p-2 bg-zinc-800"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />

              <div className="flex gap-2">
                <button onClick={updateTask} className="bg-green-500 px-4 py-2 rounded">
                  Save
                </button>

                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedTask(null);
                  }}
                  className="bg-red-500 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

