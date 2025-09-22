import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ImcForm from "../../ImcForm";
import axios from "axios";

jest.mock("react-gauge-component", () => ({
  default: () => <div data-testid="gauge-mock" />
}));

// Mock de supabase
jest.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  },
}));

// Mock de la Api
jest.mock("../../lib/api", () => ({
  api: {
    interceptors: { request: { use: jest.fn() } },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock de la configuración de la API
jest.mock("../../../config", () => ({
  API_URL: "http://localhost:3000",
}));

// Mock de Axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ImcForm - Validación de inputs", () => {
  it("muestra error si altura está vacía", async () => {
    render(<ImcForm />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Peso/i), { target: { value: "70" } });
      fireEvent.click(screen.getByRole("button", { name: /Calcular/i }));
    });
    expect(await screen.findByText(/Ingresa una altura válida. Ejemplo: 1,75/i)).toBeInTheDocument();
  });
});

describe("ImcForm - Manejo de errores", () => {
  it("maneja error de backend al calcular IMC", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));
    render(<ImcForm />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Altura/i), { target: { value: "1.80" } });
      fireEvent.change(screen.getByLabelText(/Peso/i), { target: { value: "80" } });
      fireEvent.click(screen.getByRole("button", { name: /Calcular/i }));
    });
    expect(await screen.findByText(/Error al calcular el IMC/i)).toBeInTheDocument();
  });

  it("muestra mensaje si el historial está vacío", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    render(<ImcForm />);
    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-ver-historial"));
    });
    expect(await screen.findByText(/Sin registros/i)).toBeInTheDocument();
  });
});


