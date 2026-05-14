import { useNotification } from "../context/NotificationContext"

function NotificationContainer() {
  const { notifications } = useNotification()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg animate-slideIn pointer-events-auto ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "error"
              ? "bg-red-500 text-white"
              : notification.type === "warning"
              ? "bg-yellow-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  )
}

export default NotificationContainer
