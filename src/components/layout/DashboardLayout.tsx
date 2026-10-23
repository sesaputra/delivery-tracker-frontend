import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Lock body scroll while mobile sidebar is open
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================================================================ */}
      {/* Sidebar                                                          */}
      {/* ================================================================ */}

      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() =>
          setMobileOpen(false)
        }
      />

      {/* ================================================================ */}
      {/* Main Content                                                      */}
      {/* ================================================================ */}

      <main className="min-h-screen lg:ml-64">
        {/* ============================================================ */}
        {/* Mobile Header                                                 */}
        {/* ============================================================ */}

        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() =>
              setMobileOpen(true)
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Buka menu"
          >
            <Menu size={21} />
          </button>

          <div className="ml-3">
            <p className="text-sm font-semibold text-slate-900">
              Delivery Tracker
            </p>

            <p className="text-[11px] text-slate-400">
              MKP
            </p>
          </div>
        </header>

        {/* ============================================================ */}
        {/* Page Content                                                  */}
        {/* ============================================================ */}

        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;

