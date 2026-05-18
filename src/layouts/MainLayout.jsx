import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import NotificationContainer from "../components/NotificationContainer"

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-transparent text-white sm:flex">
      <header className="sm:hidden sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-zinc-950/70 backdrop-blur px-4 py-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          Menü
        </button>
        <span className="font-bold text-blue-400">TaskFlow</span>
        <div className="w-[64px]" aria-hidden="true" />
      </header>

      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen min-w-0 flex-1 overflow-x-hidden">
        <Outlet />
      </main>

      <NotificationContainer />
    </div>
  )
}
export default MainLayout
