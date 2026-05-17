/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useMemo, useState, useContext } from "react"

const NotificationContext = createContext()

export function createNotification(message, type = "info", id = Date.now()) {
  return { id, message, type }
}

export function removeNotificationById(notifications, id) {
  return notifications.filter((notification) => notification.id !== id)
}

export function clearNotificationsList(notifications) {
  return notifications.length === 0 ? notifications : []
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => removeNotificationById(prev, id))
  }, [])

  const addNotification = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now()
    const notification = createNotification(message, type, id)

    setNotifications((prev) => [...prev, notification])

    if (duration) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }, [removeNotification])

  const clearNotifications = useCallback(() => {
    setNotifications(clearNotificationsList)
  }, [])

  const value = useMemo(
    () => ({ notifications, addNotification, removeNotification, clearNotifications }),
    [notifications, addNotification, removeNotification, clearNotifications]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>

  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider")
  }
  return context
}
