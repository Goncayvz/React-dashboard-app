import { NavLink } from "react-router-dom"
import { useUser } from "../context/UserContext"
import { useBadge } from "../context/BadgeContext"

function Sidebar() {
    const { user } = useUser()
    const { getEarnedBadgesList } = useBadge()
    const badgeCount = getEarnedBadgesList().length

    return(
        <div className="w-64 h-screen bg-zinc-900 border-r border-zinc-800 p-5 flex flex-col">
            <div>
                <h1 className="text-2xl font-bold mb-6 text-blue-500">
                    TaskFlow
                </h1>
                
                <NavLink
                    to="/profile"
                    className="mb-8 block p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"
                >
                    <div className="flex items-center gap-3">
                        <div className="text-2xl bg-blue-500/20 w-10 h-10 rounded-full flex items-center justify-center">
                            {user.avatar}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-semibold text-white truncate">{user.name}</p>
                            <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                        </div>
                    </div>
                </NavLink>
            </div>

            <nav className="flex-1 flex flex-col gap-3">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `text-left transition px-3 py-2 rounded-lg ${isActive ? "bg-blue-500 text-white" : "text-zinc-300 hover:text-blue-400 hover:bg-zinc-800"}`
                    }
                >
                    Dashboard
                </NavLink>
                <NavLink
                    to="/tasks"
                    className={({ isActive }) =>
                        `text-left transition px-3 py-2 rounded-lg ${isActive ? "bg-blue-500 text-white" : "text-zinc-300 hover:text-blue-400 hover:bg-zinc-800"}`
                    }
                >
                    Tasks
                </NavLink>
                <NavLink
                    to="/analytics"
                    className={({ isActive }) =>
                        `text-left transition px-3 py-2 rounded-lg ${isActive ? "bg-blue-500 text-white" : "text-zinc-300 hover:text-blue-400 hover:bg-zinc-800"}`
                    }
                >
                    Analytics
                </NavLink>
                <NavLink
                    to="/badges"
                    className={({ isActive }) =>
                        `text-left transition px-3 py-2 rounded-lg flex items-center gap-2 ${isActive ? "bg-blue-500 text-white" : "text-zinc-300 hover:text-blue-400 hover:bg-zinc-800"}`
                    }
                >
                    <span>Rozetler</span>
                    {badgeCount > 0 && (
                        <span className="ml-auto bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                            {badgeCount}
                        </span>
                    )}
                </NavLink>
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `text-left transition px-3 py-2 rounded-lg ${isActive ? "bg-blue-500 text-white" : "text-zinc-300 hover:text-blue-400 hover:bg-zinc-800"}`
                    }
                >
                    Settings
                </NavLink>
            </nav>
        </div>
    )
}
export default Sidebar