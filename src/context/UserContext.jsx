import { createContext, useState, useContext, useEffect } from "react"

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user")
    return savedUser
      ? JSON.parse(savedUser)
      : {
          name: "Kullanıcı",
          email: "user@example.com",
          phone: "+90 XXX XXXX",
          bio: "Ben bir görev yöneticisiyim",
          avatar: "👤",
          birthDate: "2000-01-01"
        }
  })

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user))
  }, [user])

  function updateUser(updatedData) {
    setUser((prev) => ({ ...prev, ...updatedData }))
  }

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within UserProvider")
  }
  return context
}
