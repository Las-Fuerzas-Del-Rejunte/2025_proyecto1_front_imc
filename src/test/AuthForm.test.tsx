import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthForm } from "../components/auth/AuthForm";
import { supabase } from "../lib/supabase";

// Mock de useToast para capturar llamadas a toast sin mostrar nada real
jest.mock("../hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock de Supabase para no hacer llamadas reales
jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  },
}));

// ---------------------------
describe("AuthForm", () => {
  // Limpiar todos los mocks antes de cada test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //Test de renderizado inicial del login
  test("Renderiza formulario de login por defecto", () => {
    render(<AuthForm />);
    expect(screen.getByText(/Bienvenido de vuelta/i)).toBeInTheDocument(); // título login
    expect(screen.getByPlaceholderText(/Ingresa tu email/i)).toBeInTheDocument(); // input email
    expect(screen.getByPlaceholderText(/Ingresa tu contraseña/i)).toBeInTheDocument(); // input contraseña
  });

  //Test de cambio entre login y signup
  test("Cambia entre login y signup", () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByText(/Crear cuenta/i)); // clic en botón de cambio de modo
    expect(screen.getByText(/Únete a ElRejunte/i)).toBeInTheDocument(); // título signup
  });

  //Test de click en Mostrar/ocultar contraseña
  test("Muestra contraseña al hacer clic en el icono", () => {
    render(<AuthForm />);
    const passwordInput = screen.getByPlaceholderText(/Ingresa tu contraseña/i) as HTMLInputElement;
    const toggleButton = screen.getByTestId("mostrarContrasena");
    expect(passwordInput.type).toBe("password"); // al inicio es password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("text"); // al hacer clic pasa a text
  });

  //Test de Login exitoso
  test("handleSubmit login exitoso llama a toast", async () => {
    // Mock de login exitoso
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: { email: "test@mail.com" } },
      error: null,
    });
    
    const { getByText, getByPlaceholderText } = render(<AuthForm />);
    
    // Rellenar formulario
    fireEvent.change(getByPlaceholderText(/Ingresa tu email/i), { target: { value: "test@mail.com" } });
    fireEvent.change(getByPlaceholderText(/Ingresa tu contraseña/i), { target: { value: "123456" } });
    
    fireEvent.click(getByText(/Iniciar Sesión/i)); // enviar formulario

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@mail.com",
        password: "123456",
      });
    });
  });

  //Test de Login con error
  test("handleSubmit login con error muestra mensaje traducido", async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue({ message: "Invalid login credentials" });
    
    render(<AuthForm />);
    
    fireEvent.change(screen.getByPlaceholderText(/Ingresa tu email/i), { target: { value: "wrong@mail.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Ingresa tu contraseña/i), { target: { value: "wrongpass" } });
    
    fireEvent.click(screen.getByText(/Iniciar Sesión/i));

    // Esperar a que se muestre el mensaje traducido
    await waitFor(() => {
      expect(screen.getByText(/Credenciales de inicio de sesión inválidas/i)).toBeInTheDocument();
    });
  });

  // Test sobre logueo con Google
  test("handleGoogleSignIn llama a signInWithOAuth", async () => {
    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({ error: null });
    
    render(<AuthForm />);
    fireEvent.click(screen.getByText(/Continuar con Google/i));

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: expect.any(String) },
      });
    });
  });

  //Test para mostrar el formulario ResetPasswordForm
  test("Mostrar ResetPasswordForm al hacer clic en '¿Olvidaste tu contraseña?'", () => {
    render(<AuthForm />);
    const toggleButton = screen.getByTestId("recuperarContrasena");
    fireEvent.click(toggleButton);
    expect(screen.getByText(/Recuperar contraseña/i)).toBeInTheDocument();
  });
});

//Tests extras para aumentar la covertura de las pruebas
//Tests extras para aumentar la covertura de las pruebas
//Tests extras para aumentar la covertura de las pruebas
describe("AuthForm - extra coverage de errores", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Signup con 'User already registered' muestra error traducido", async () => {
    (supabase.auth.signUp as jest.Mock).mockRejectedValue({ message: "User already registered" });

    render(<AuthForm />);
    fireEvent.click(screen.getByText(/Crear cuenta/i));
    fireEvent.change(screen.getByPlaceholderText(/Ingresa tu email/i), { target: { value: "existe@mail.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Ingresa tu contraseña/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByText(/Crear Cuenta/i));

    await waitFor(() => {
      expect(screen.getByText(/Este email ya está registrado/i)).toBeInTheDocument();
    });
  });

  test("Login con 'Email not confirmed' muestra error traducido", async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue({ message: "Email not confirmed" });

    render(<AuthForm />);
    fireEvent.change(screen.getByPlaceholderText(/Ingresa tu email/i), { target: { value: "noConfirmado@mail.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Ingresa tu contraseña/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByText(/Iniciar Sesión/i));

    await waitFor(() => {
      expect(screen.getByText(/Email no confirmado/i)).toBeInTheDocument();
    });
  });
});

//Mas tests extras para mejorar cobertura
describe("AuthForm - errores traducidos", () => {
  beforeEach(() => jest.clearAllMocks());

  const signupErrors = [
    { message: "User already registered", translation: "Este email ya está registrado" },
    { message: "Password should be at least 6 characters", translation: "La contraseña debe tener al menos 6 caracteres" }
  ];

  const loginErrors = [
    { message: "Invalid login credentials", translation: "Credenciales de inicio de sesión inválidas" },
    { message: "Email not confirmed", translation: "Email no confirmado. Revisa tu correo electrónico" }
  ];

  // Tests parametrizados para signup
  signupErrors.forEach(({ message, translation }) => {
    test(`Signup con error '${message}' muestra '${translation}'`, async () => {
      (supabase.auth.signUp as jest.Mock).mockRejectedValue({ message });

      render(<AuthForm />);
      fireEvent.click(screen.getByText(/Crear cuenta/i));
      fireEvent.change(screen.getByPlaceholderText(/Ingresa tu email/i), { target: { value: "test@mail.com" } });
      fireEvent.change(screen.getByPlaceholderText(/Ingresa tu contraseña/i), { target: { value: "123456" } });
      fireEvent.click(screen.getByText(/Crear Cuenta/i));

      await waitFor(() => {
        expect(screen.getByText(translation)).toBeInTheDocument();
      });
    });
  });

  // Tests parametrizados para login
  loginErrors.forEach(({ message, translation }) => {
    test(`Login con error '${message}' muestra '${translation}'`, async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue({ message });

      render(<AuthForm />);
      fireEvent.change(screen.getByPlaceholderText(/Ingresa tu email/i), { target: { value: "test@mail.com" } });
      fireEvent.change(screen.getByPlaceholderText(/Ingresa tu contraseña/i), { target: { value: "123456" } });
      fireEvent.click(screen.getByText(/Iniciar Sesión/i));

      await waitFor(() => {
        expect(screen.getByText(translation)).toBeInTheDocument();
      });
    });
  });
});


// ---------------------------
describe("AuthForm - nuevos tests para cubrir ramas no testeadas", () => {
  beforeEach(() => jest.clearAllMocks());

  // Login con error inesperado
  test("Login con error inesperado muestra mensaje genérico", async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue({ message: "Unexpected error" });

    render(<AuthForm />);
    fireEvent.change(screen.getByPlaceholderText(/Ingresa tu email/i), { target: { value: "test@mail.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Ingresa tu contraseña/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByText(/Iniciar Sesión/i));

    await waitFor(() => {
      expect(screen.getByText(/Ocurrió un error. Intenta nuevamente/i)).toBeInTheDocument();
    });
  });

  // Signup con contraseña corta
  test("Signup con contraseña corta muestra mensaje traducido", async () => {
    (supabase.auth.signUp as jest.Mock).mockRejectedValue({ message: "Password should be at least 6 characters" });

    render(<AuthForm />);
    fireEvent.click(screen.getByText(/Crear cuenta/i));
    fireEvent.change(screen.getByPlaceholderText(/Ingresa tu email/i), { target: { value: "test@mail.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Ingresa tu contraseña/i), { target: { value: "123" } });
    fireEvent.click(screen.getByText(/Crear Cuenta/i));

    await waitFor(() => {
      expect(screen.getByText(/La contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
    });
  });
});
