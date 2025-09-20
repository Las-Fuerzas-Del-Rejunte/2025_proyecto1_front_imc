import { Info, LogOut, BarChart3, Calculator, Menu } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

interface NavbarProps {
  onOpenInfo?: () => void;
}

function Navbar({ onOpenInfo }: NavbarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between relative">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/utn-logo.png" alt="UTN Villa María" className="h-8 w-auto" />
        </div>

        {/* Título centrado */}
        <div className="flex-1 flex justify-center">
          <span className="text-lg font-bold tracking-tight truncate max-w-[140px] sm:max-w-[200px] text-center">
            ElRejunte
          </span>
        </div>

        {/* Acciones de la derecha */}
        <div className="flex items-center gap-3">
          {/* Botón menú hamburguesa en mobile */}
          <button
            aria-label="Menú"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card hover:bg-accent/40"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex gap-3">
            <Link
              to="/"
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent/20 ${location.pathname === "/" ? "bg-accent/30 font-semibold" : ""
                }`}
            >
              <Calculator className="h-4 w-4" /> Calculadora
            </Link>
            <Link
              to="/dashboard"
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent/20 ${location.pathname === "/dashboard" ? "bg-accent/30 font-semibold" : ""
                }`}
            >
              <BarChart3 className="h-4 w-4" /> Estadísticas
            </Link>
          </nav>

          {/* Botón Info */}
          <button
            aria-label="Información"
            onClick={onOpenInfo}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card hover:bg-accent/40"
          >
            <Info className="h-4 w-4" />
          </button>

          {/* Logout */}
          {user && (
            <button
              aria-label="Cerrar sesión"
              onClick={handleLogout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card hover:bg-red-200"
            >
              <LogOut className="h-4 w-4 text-red-600" />
            </button>
          )}
        </div>

        {/* Menú desplegable en mobile */}
        {menuOpen && (
          <div className="absolute top-full right-2 mt-2 w-40 rounded-md border bg-popover shadow-md p-2 flex flex-col gap-2 md:hidden">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2 rounded-md text-sm hover:bg-accent/20 ${location.pathname === "/" ? "bg-accent/30 font-semibold" : ""
                }`}
            >
              <Calculator className="inline h-4 w-4 mr-2" /> Calculadora
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2 rounded-md text-sm hover:bg-accent/20 ${location.pathname === "/dashboard" ? "bg-accent/30 font-semibold" : ""
                }`}
            >
              <BarChart3 className="inline h-4 w-4 mr-2" /> Estadísticas
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
