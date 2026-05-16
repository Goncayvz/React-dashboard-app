import { BrowserRouter, Routes, Route } from "react-router-dom"
import { UserProvider } from "./context/UserContext"
import { BadgeProvider } from "./context/BadgeContext"
import { NotificationProvider } from "./context/NotificationContext"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard"
import Tasks from "./pages/Tasks"
import Focus from "./pages/Focus"
import Analytics from "./pages/Analytics"
import Profile from "./pages/Profile"
import Badges from "./pages/Badges"

function App() {
  return (
    <UserProvider>
      <BadgeProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="focus" element={<Focus />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="profile" element={<Profile />} />
                <Route path="badges" element={<Badges />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </BadgeProvider>
    </UserProvider>
  )
}

export default App