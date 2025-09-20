import ImcForm from './ImcForm';
import Navbar from './components/Navbar';
import React from 'react';
import WelcomeModal from './components/WelcomeModal';
import Footer from './components/Footer';
import { AuthForm } from './components/auth/AuthForm';
import { useAuth } from './hooks/useAuth';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from './components/report/Dashboard';

function App() {
  const { user, loading } = useAuth();
  const [open, setOpen] = React.useState(true);

  if (loading) {
    return <p className="text-center mt-10">Cargando sesión...</p>;
  }

  return (
    <Router>
      {!user ? (
        <div className="min-h-screen flex items-center justify-center">
          <AuthForm />
        </div>
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
          <WelcomeModal open={open} onOpenChange={setOpen} />
        </div>
      )}
    </Router>
  );
}

export default App;
