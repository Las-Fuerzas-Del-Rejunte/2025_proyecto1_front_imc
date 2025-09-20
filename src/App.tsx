import ImcForm from './ImcForm';
import Navbar from './components/Navbar';
import React from 'react';
import WelcomeModal from './components/WelcomeModal';
import Footer from './components/Footer';
import { AuthForm } from './components/auth/AuthForm';
import { useAuth } from './hooks/useAuth';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from './components/report/Dashboard';
import { Toaster } from './components/ui/toaster';

function App() {
  const { user, loading } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = React.useState(false);

  // Verificar si el usuario ya ha visto el modal de bienvenida
  React.useEffect(() => {
    const seenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!seenWelcome && user) {
      setOpen(true);
      setHasSeenWelcome(true);
    }
  }, [user]);

  // Función para manejar el cierre del modal
  const handleWelcomeClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && hasSeenWelcome) {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: 'url("/fondo-login.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay oscuro sutil */}
        <div className="absolute inset-0 bg-black/15"></div>
        
        {/* Contenido de carga */}
        <div className="relative z-10 flex flex-col items-center space-y-6">
          {/* Spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-violet-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          
          {/* Texto de carga */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">ElRejunte</h2>
            <p className="text-white/80 text-lg">Cargando sesión...</p>
          </div>
          
          {/* Puntos animados */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {!user ? (
        <AuthForm />
      ) : (
        // ✅ Layout flexible para evitar espacios vacíos
        <div className="flex flex-col min-h-screen">
          <Navbar onOpenInfo={() => setOpen(true)} />
          
          {/* ✅ El main crece dinámicamente y deja espacio bajo el navbar */}
          <main className="flex-grow pt-16 px-4 md:px-6">
            <Routes>
              <Route path="/" element={<ImcForm />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>

          <Footer />
          <WelcomeModal open={open} onOpenChange={handleWelcomeClose} />
        </div>
      )}
      <Toaster />
    </Router>
  );
}

export default App;
