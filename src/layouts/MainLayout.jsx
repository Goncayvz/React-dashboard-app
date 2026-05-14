import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import NotificationContainer from "../components/NotificationContainer"

function MainLayout() {
    return(
        <div className="min-h-screen bg-zinc-950 text-white flex">
            <Sidebar />
            <main className="flex-1 min-h-screen">
                <Outlet />
            </main>
            <NotificationContainer />
        </div>
    )
}
export default MainLayout