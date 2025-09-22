import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ImcForm from "../../ImcForm";
import axios from "axios";
import { api } from "../../lib/api";

// Mock del Gauge (gráfico del IMC) para que no rompa los tests
// jest.mock("react-gauge-component", () => () => <div data-testid="gauge-mock" />);


jest.mock("react-gauge-component", () => ({
  default: () => <div data-testid="gauge-mock" />
}));


// Mock de la configuración de la API
jest.mock("../../../config", () => ({
  API_URL: "http://localhost:3000",
}));


//Mock de supabase
jest.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  },
}));

//Mock de la Api
jest.mock("../../lib/api", () => ({
  api: {
    interceptors: { request: { use: jest.fn() } },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));



// Mock de Axios para simular llamadas HTTP sin tocar la API real
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Tipo para los registros del historial
interface HistorialItem {
  id: number;
  peso: number;
  altura: number;
  resultado: number;
  categoria: string;
  createdAt: string;
}

// Helper para abrir el modal del historial y mockear datos
const abrirModal = async (historialMock: HistorialItem[]) => {
  mockedAxios.get.mockResolvedValueOnce({ data: historialMock });
  render(<ImcForm />);
  await act(async () => {
    fireEvent.click(screen.getByTestId("btn-ver-historial"));
  });
};

describe("ImcForm - integración", () => {
  // Limpiamos todos los mocks antes de cada test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Manejo de error de backend
  it("maneja error de backend", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));
    render(<ImcForm />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Altura/i), { target: { value: "1.80" } });
      fireEvent.change(screen.getByLabelText(/Peso/i), { target: { value: "80" } });
      fireEvent.click(screen.getByRole("button", { name: /Calcular/i }));
    });

    expect(await screen.findByText(/Error al calcular el IMC/i)).toBeInTheDocument();
  });

  // cálculo exitoso que debería mostrarse en el gauge 
  it("muestra el Gauge con resultado si el cálculo es exitoso", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { resultado: 24.5, categoria: "Normal", peso: 70, altura: 1.75 },
    });
  
    render(<ImcForm />);
  
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Altura/i), { target: { value: "1.75" } });
      fireEvent.change(screen.getByLabelText(/Peso/i), { target: { value: "70" } });
      fireEvent.click(screen.getByRole("button", { name: /Calcular/i }));
    });
  
    expect(await screen.findByTestId("gauge-mock")).toBeInTheDocument();
    expect(await screen.findByText(/Normal/i)).toBeInTheDocument();
  });


  // Historial de cálculos
  describe("Historial de cálculos", () => {

    //prueba sobre la carga de historial    
    it("carga historial correctamente", async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({
        data: [
          {
            id: 1,
            peso: 70,
            altura: 1.75,
            resultado: 24.5,
            categoria: "Normal",
            createdAt: "2025-09-15T12:00:00Z",
          },
        ],
      });
    
      render(<ImcForm />);
      await act(async () => {
        fireEvent.click(screen.getByTestId("btn-ver-historial"));
      });
    
      expect(await screen.findByText(/Normal/i)).toBeInTheDocument();
      expect(await screen.findByText(/70/i)).toBeInTheDocument();
    });


    //prueba para verificar el ordenamiento de historial por peso  
    it("ordena historial por peso", async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({
        data: [
          { id: 1, peso: 80, altura: 1.80, resultado: 24.7, categoria: "Normal", createdAt: "2025-09-15T12:00:00Z" },
          { id: 2, peso: 60, altura: 1.70, resultado: 20.8, categoria: "Normal", createdAt: "2025-09-14T12:00:00Z" },
        ],
      });
    
      render(<ImcForm />);
      await act(async () => {
        fireEvent.click(screen.getByTestId("btn-ver-historial"));
      });
    
      expect(await screen.findByText("80")).toBeInTheDocument();
    
      await act(async () => {
        fireEvent.click(screen.getByTestId("btn-ordenar-peso"));
      });
    
      expect(screen.getAllByText(/Normal/i).length).toBe(2);
    });

  //Prueba de Limpieza del rango de fechas
  it("limpia el rango de fechas al hacer click en Limpiar", async () => {
  await abrirModal([]);
 
  const limpiarBtn = await screen.getByTestId("btn-limpiar");
    await act(async () => {
    fireEvent.click(limpiarBtn);
  });
 
  expect(await screen.findByText(/Sin registros/i)).toBeInTheDocument();
  });
  });


});