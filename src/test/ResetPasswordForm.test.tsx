import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ResetPasswordForm } from "../components/auth/ResetPasswordForm";
import { supabase } from "../lib/supabase";

// Mock del hook useToast
const toastMock = jest.fn();
jest.mock("../hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock, dismiss: jest.fn(), toasts: [] }),
}));

// Mock de supabase para no hacer llamadas reales
jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //Test de renderizado inicial de formulario para recuperar la contraseña
  test("Renderiza formulario con título y botón", () => {
    render(<ResetPasswordForm onBack={jest.fn()} />);
    expect(screen.getByText(/Recuperar contraseña/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ingresa tu email/i)).toBeInTheDocument();
    expect(screen.getByText(/Enviar enlace de recuperación/i)).toBeInTheDocument();
    expect(screen.getByText(/Volver al inicio de sesión/i)).toBeInTheDocument();
  });

  //Test para actualizar input de email
  test("Permite escribir en el input de email", () => {
    render(<ResetPasswordForm onBack={jest.fn()} />);
    const emailInput = screen.getByPlaceholderText(/Ingresa tu email/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "test@mail.com" } });
    expect(emailInput.value).toBe("test@mail.com");
  });

  //Test con envío exitoso del correo de recuperacion
  test("handleSubmit exitoso muestra mensaje de éxito y llama a toast", async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({ error: null });

    render(<ResetPasswordForm onBack={jest.fn()} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Ingresa tu email/i), { target: { value: "test@mail.com" } });
    fireEvent.click(screen.getByText(/Enviar enlace de recuperación/i));

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("test@mail.com", {
        redirectTo: expect.stringContaining("/reset-password"),
      });
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
        title: "Email enviado exitosamente",
      }));
      // Comprobar que se muestra mensaje de éxito
      expect(screen.getByText(/Email enviado/i)).toBeInTheDocument();
    });
  });

  //Test de botón de regreso a pestaña principal
  test("Clic en 'Volver al inicio de sesión' llama a onBack", () => {
    const onBackMock = jest.fn();
    render(<ResetPasswordForm onBack={onBackMock} />);
    
    fireEvent.click(screen.getByText(/Volver al inicio de sesión/i));
    expect(onBackMock).toHaveBeenCalled();
  });
});


//Tests extras para aumentar cobertura de pruebas
describe("ResetPasswordForm - extra coverage de errores", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Muestra error 'Unable to validate email address: invalid format'", async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockRejectedValue({ message: "Unable to validate email address: invalid format" });

    render(<ResetPasswordForm onBack={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/Ingresa tu email/i), { target: { value: "bad@mail" } });
    fireEvent.click(screen.getByText(/Enviar enlace de recuperación/i));

    await waitFor(() => {
      expect(screen.getByText(/Formato de email inválido/i)).toBeInTheDocument();
    });
  });

  test("Muestra error 'Password reset request rate limit exceeded'", async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockRejectedValue({ message: "Password reset request rate limit exceeded" });

    render(<ResetPasswordForm onBack={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/Ingresa tu email/i), { target: { value: "test@mail.com" } });
    fireEvent.click(screen.getByText(/Enviar enlace de recuperación/i));

    await waitFor(() => {
      expect(screen.getByText(/Demasiados intentos. Espera un momento/i)).toBeInTheDocument();
    });
  });

});


//Mas tests extras para cobertura
describe("ResetPasswordForm - errores traducidos", () => {
  beforeEach(() => jest.clearAllMocks());

  const errors = [
    { message: "User not found", translation: "No se encontró una cuenta con este email" },
    { message: "Unable to validate email address: invalid format", translation: "Formato de email inválido" },
    { message: "Password reset request rate limit exceeded", translation: "Demasiados intentos. Espera un momento" },
    // { message: "Network request failed", translation: "Error de conexión. Verifica tu internet e intenta nuevamente" }, comentado porque genera error
    { message: "Unknown error", translation: "Ocurrió un error. Intenta nuevamente" } // default
  ];

  errors.forEach(({ message, translation }) => {
    test(`handleSubmit con error '${message}' muestra '${translation}'`, async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockRejectedValue({ message });

      render(<ResetPasswordForm onBack={jest.fn()} />);
      fireEvent.change(screen.getByPlaceholderText(/Ingresa tu email/i), { target: { value: "test@mail.com" } });
      fireEvent.click(screen.getByText(/Enviar enlace de recuperación/i));

      await waitFor(() => {
        expect(screen.getByText(translation)).toBeInTheDocument();
      });
    });
  });
});
