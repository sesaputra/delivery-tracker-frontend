import {
  BarChart3,
  Car,
  LogOut,
  Truck,
  Users,
  X,
} from "lucide-react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

type SidebarProps = {
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Pengiriman",
    path: "/deliveries",
    icon: Truck,
  },
  {
    name: "Sopir",
    path: "/drivers",
    icon: Users,
  },
  {
    name: "Kendaraan",
    path: "/vehicles",
    icon: Car,
  },
];

function Sidebar({
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();

    onCloseMobile();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <>
      {/* ================================================================ */}
      {/* Mobile Overlay                                                   */}
      {/* ================================================================ */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ================================================================ */}
      {/* Sidebar                                                           */}
      {/* ================================================================ */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-slate-200 bg-white
          transition-transform duration-300 ease-in-out

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0
        `}
      >
        {/* ============================================================ */}
        {/* Header                                                        */}
        {/* ============================================================ */}

        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Delivery Tracker
            </h1>

            <p className="mt-0.5 text-xs text-slate-400">
              EMA
            </p>
          </div>

          {/* Close button mobile */}

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Tutup menu"
          >
            <X size={19} />
          </button>
        </div>

        {/* ============================================================ */}
        {/* Navigation                                                    */}
        {/* ============================================================ */}

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                  />

                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* ============================================================ */}
        {/* User Account                                                   */}
        {/* ============================================================ */}

        <div className="shrink-0 border-t border-slate-100 p-4">
          <div className="mb-3 rounded-xl bg-slate-50 px-3 py-3">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.name ?? "Administrator"}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-400">
              {user?.email ?? ""}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut
              size={18}
              strokeWidth={1.8}
            />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;