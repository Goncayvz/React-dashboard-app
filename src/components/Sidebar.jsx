import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useBadge } from "../context/BadgeContext";

function Sidebar({ mobileOpen = false, onClose }) {
  const { user } = useUser();
  const { getEarnedBadgesList } = useBadge();
  const badgeCount = getEarnedBadgesList().length;

  const [profileOpen, setProfileOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, onClose]);

  const navItems = [
    { to: "/", label: "Dashboard", icon: "🏠" },
    { to: "/tasks", label: "Tasks", icon: "✅" },
    { to: "/focus", label: "Odaklanma", icon: "🎯" },
    { to: "/analytics", label: "Analytics", icon: "📊" },
    { to: "/badges", label: "Rozetler", icon: "🏅" }
  ];

  const profileContent = (
    <div className="flex items-center gap-3">
      {user.avatar?.startsWith("data:image") ? (
        <img
          src={user.avatar}
          alt="Profil avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="text-2xl bg-blue-500/20 w-10 h-10 rounded-full flex items-center justify-center">
          {user.avatar}
        </div>
      )}

      {!collapsed && (
        <div className="overflow-hidden">
          <p className="font-semibold text-white truncate">{user.name}</p>
          <p className="text-xs text-zinc-400 truncate">{user.email}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="sm:hidden fixed inset-0 z-40 bg-black/50"
          aria-label="Menüyü kapat"
          onClick={() => onClose?.()}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-zinc-900 border-r border-zinc-800 p-3 flex flex-col transition-transform duration-300 w-72 max-w-[85vw] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 sm:static sm:z-auto sm:h-screen sm:w-auto ${
          collapsed ? "sm:w-20" : "sm:w-64"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {collapsed && <div className="text-xl font-bold text-blue-500">TF</div>}
            {!collapsed && (
              <h1 className="text-2xl font-bold text-blue-500">TaskFlow</h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="sm:hidden text-sm text-zinc-300 px-2 py-1 rounded-full border border-zinc-700 hover:bg-zinc-800"
              title="Menüyü kapat"
            >
              ✕
            </button>

            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="hidden sm:inline-flex text-sm text-zinc-400 px-2 py-1 rounded-full border border-zinc-700 hover:bg-zinc-800"
              title={collapsed ? "Menüyü aç" : "Menüyü kapat"}
            >
              {collapsed ? "➡" : "⬅"}
            </button>
          </div>
        </div>

        <div
          className={`mb-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 transition-all duration-300 ${
            profileOpen ? "max-h-[220px] p-3" : "max-h-[56px] p-2"
          }`}
        >
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="w-full text-left inline-flex items-center"
          >
            {profileContent}
          </button>

          {/* Avatar/tıklama menüyü açar/kapatır; gerçek avatar değiştirme UI'i Profile sayfasındadır. */}
          {!collapsed && profileOpen && (
            <div className="mt-4 text-zinc-300 text-sm space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p>{user.jobTitle || "Görev tutkunuz"}</p>
                <NavLink
                  to="/profile"
                  onClick={() => onClose?.()}
                  className="text-blue-300 hover:underline whitespace-nowrap"
                >
                  Profili aç
                </NavLink>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-zinc-300 hover:text-blue-400 hover:bg-zinc-800"
                }`
              }
              title={item.label}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}

              {item.to === "/badges" && badgeCount > 0 && !collapsed && (
                <span className="ml-auto bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                  {badgeCount}
                </span>
              )}

              {item.to === "/badges" && badgeCount > 0 && collapsed && (
                <span className="ml-auto bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-full">
                  {badgeCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;

