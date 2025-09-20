import { Info, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface NavbarProps {
  onOpenInfo?: () => void;
}

function Navbar({ onOpenInfo }: NavbarProps) {
  const { user } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <img src="/utn-logo.png" alt="UTN Villa María" className="h-8 w-auto" />
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="text-lg font-bold tracking-tight">ElRejunte</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Info */}
          <button
            aria-label="Información"
            onClick={onOpenInfo}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card hover:bg-accent/40"
          >
            <Info className="h-4 w-4" />
          </button>

          {/* Si hay usuario logueado, muestra logout */}
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
      </div>
    </header>
  );
}

export default Navbar;
