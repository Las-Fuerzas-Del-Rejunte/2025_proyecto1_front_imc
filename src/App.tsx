import ImcForm from './ImcForm';
import Navbar from './components/Navbar';
import React from 'react';
import WelcomeModal from './components/WelcomeModal';
import Footer from './components/Footer';
import { AuthForm } from './components/auth/AuthForm';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();
  const [open, setOpen] = React.useState(true);

  if (loading) {
    return <p className="text-center mt-10">Cargando sesión...</p>;
  }

  return (
    <>
      {!user ? (
        // Si no está autenticado, muestra el login/signup
        <div className="min-h-screen flex items-center justify-center">
          <AuthForm />
        </div>
      ) : (
        // Si está autenticado, muestra tu app normal
        <>
          <Navbar onOpenInfo={() => setOpen(true)} />
          <ImcForm />
          <Footer />
          <WelcomeModal open={open} onOpenChange={setOpen} />
        </>
      )}
    </>
  );
}

export default App;
