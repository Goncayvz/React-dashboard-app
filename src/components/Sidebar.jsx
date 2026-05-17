import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "../context/UserContext";

import { useBadge } from "../context/BadgeContext";
import { useNotification } from "../context/NotificationContext";

function Sidebar({ mobileOpen = false, onClose }) {
  const { user } = useUser();
  const { getEarnedBadgesList } = useBadge();
  const { addNotification } = useNotification();
  const badgeCount = getEarnedBadgesList().length;

  const prevBadgeCountRef = useRef(badgeCount);

  useEffect(() => {
    // sadece sayım artışında bildirim bas
    if (badgeCount > prevBadgeCountRef.current) {
      addNotification(`Rozetler: ${badgeCount}`, "info", 3500);
    }
    prevBadgeCountRef.current = badgeCount;
  }, [badgeCount, addNotification]);

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
    <div className={`flex min-w-0 items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
      {user.avatar?.startsWith("data:image") ? (
        <img
          src={user.avatar}
          alt="Profil avatar"
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-2xl">
          {user.avatar}
        </div>
      )}

      {!collapsed && (
        <div className="min-w-0 max-w-[180px] overflow-hidden">
          <p className="truncate font-semibold text-white">{user.name}</p>
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
          collapsed ? "sm:w-20" : "sm:w-72"
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
          className={`mb-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800 transition-all duration-300 ${
            collapsed ? "max-h-[58px] p-2" : profileOpen ? "max-h-[240px] p-3" : "max-h-[58px] p-2"
          }`}
        >
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className={`flex w-full min-w-0 items-center text-left ${collapsed ? "justify-center" : ""}`}
          >
            {profileContent}
          </button>

          {!collapsed && profileOpen && (
            <div className="mt-4 text-sm text-zinc-300">
              <div className="flex min-w-0 flex-col gap-3">
                <p className="break-words leading-5 text-zinc-300">
                  {user.jobTitle || "Görev tutkunuz"}
                </p>
                <NavLink
                  to="/profile"
                  onClick={() => onClose?.()}
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 py-2 font-medium text-blue-200 transition hover:border-blue-300 hover:bg-blue-500/20"
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
                <span
                  className="ml-auto bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full select-none"
                  aria-label={`Rozet sayısı: ${badgeCount}`}
                  title={`Rozet sayısı: ${badgeCount}`}
                >
                  {badgeCount}
                </span>
              )}

              {item.to === "/badges" && badgeCount > 0 && collapsed && (
                <span
                  className="ml-auto bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-full select-none"
                  aria-label={`Rozet sayısı: ${badgeCount}`}
                  title={`Rozet sayısı: ${badgeCount}`}
                >
                  {badgeCount}
                </span>
              )}
            </NavLink>
          ))}

          {/* Boşta kalan alt alanı doldur (responsive) */}
          <div className="mt-auto pb-2 flex items-end justify-center overflow-hidden w-full">
            <div
              className="w-full"
              style={{ height: collapsed ? 92 : 168, maxHeight: "100%" }}
            >
              {/* Sidebar animation removed (DotLottieReact) */}
              <div className="w-full h-full" aria-hidden="true" />

            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
