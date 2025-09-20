import { Info, LogOut, BarChart3, Calculator, Menu, ChevronDown, User } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

interface NavbarProps {
  onOpenInfo?: () => void;
}

function Navbar({ onOpenInfo }: NavbarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState(location.pathname === "/dashboard" ? "estadisticas" : "calculadora");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Actualizar vista actual cuando cambia la ruta
  useEffect(() => {
    setCurrentView(location.pathname === "/dashboard" ? "estadisticas" : "calculadora");
  }, [location.pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    // Limpiar el localStorage para mostrar el modal de bienvenida en el próximo login
    localStorage.removeItem('hasSeenWelcome');
    navigate("/");
  }

  function handleViewToggle() {
    if (currentView === "calculadora") {
      setCurrentView("estadisticas");
      navigate("/dashboard");
    } else {
      setCurrentView("calculadora");
      navigate("/");
    }
  }

  function getUserDisplayName() {
    if (!user?.email) return "Usuario";
    const email = user.email;
    const atIndex = email.indexOf("@");
    return atIndex > 0 ? email.substring(0, atIndex) : email;
  }

  return (
    <>
      {/* Navbar principal */}
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

          {/* Acciones de la derecha - Solo en desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Switch entre Calculadora y Estadísticas */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleViewToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === "calculadora"
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calculator className="h-4 w-4" />
                Calculadora
              </button>
              <button
                onClick={handleViewToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === "estadisticas"
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Estadísticas
              </button>
            </div>

            {/* Dropdown del usuario */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-violet-500/20 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {getUserDisplayName()}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {/* Dropdown menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover shadow-md p-1">
                    <div className="px-3 py-2 text-sm text-muted-foreground border-b">
                      {user.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-violet-500/20 rounded-md transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Menú hamburguesa en mobile */}
          <div className="md:hidden relative" ref={mobileMenuRef}>
            <button
              aria-label="Menú"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card hover:bg-violet-500/20"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Menú desplegable móvil */}
            {mobileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover shadow-md p-2">
                {/* Información del usuario */}
                {user && (
                  <div className="px-3 py-2 border-b">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{getUserDisplayName()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {user.email}
                    </div>
                  </div>
                )}

                {/* Opciones de navegación */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate("/");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-violet-500/20 rounded-md transition-colors ${
                      location.pathname === "/" ? "bg-violet-500/30 font-semibold" : ""
                    }`}
                  >
                    <Calculator className="h-4 w-4" />
                    Calculadora
                  </button>
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-violet-500/20 rounded-md transition-colors ${
                      location.pathname === "/dashboard" ? "bg-violet-500/30 font-semibold" : ""
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Estadísticas
                  </button>
                </div>

                {/* Botón de información */}
                <div className="border-t pt-2">
                  <button
                    onClick={() => {
                      onOpenInfo?.();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-violet-500/20 rounded-md transition-colors"
                  >
                    <Info className="h-4 w-4" />
                    Información
                  </button>
                </div>

                {/* Cerrar sesión */}
                {user && (
                  <div className="border-t pt-2">
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-violet-500/20 rounded-md transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Botón de información fijo en desktop */}
      <button
        onClick={onOpenInfo}
        className="hidden md:flex fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-colors items-center justify-center"
        aria-label="Información"
      >
        <Info className="h-6 w-6 text-white" />
      </button>
    </>
  );
}

export default Navbar;
