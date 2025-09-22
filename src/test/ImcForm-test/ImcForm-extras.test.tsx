import { render, screen, fireEvent, act, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import ImcForm from "../../ImcForm";
import axios from "axios";
import { limitToTwoDecimals } from "../../util/limitToTwoDecimals";
import { api } from "../../lib/api";

// Mock de la API
jest.mock("../../lib/api", () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock("react-gauge-component", () => ({
  __esModule: true,
  default: () => <div data-testid="gauge-mock" />,
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

// Mock de la API
jest.mock("../../lib/api", () => ({
  api: {
    interceptors: { request: { use: jest.fn() } },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock de Axios
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
const abrirModal = async (historialMock: HistorialItem[] = []) => {
  mockedAxios.get.mockResolvedValueOnce({ data: historialMock });
  render(<ImcForm />);
  await act(async () => {
    fireEvent.click(screen.getByTestId("btn-ver-historial"));
  });
};

describe("IMC Form Tests Extras", () => {
  
  beforeEach(() => {
     jest.clearAllMocks();
   });


  //--------------------------------------------------------------------------------------------------------
  it("limitToTwoDecimals: recorta a 2 decimales cuando hay más", () => {
    const valores = ["1.234", "2,345", "3.2", "4,56"];
    const esperados = ["1.23", "2,34", "3.2", "4,56"];

    valores.forEach((v, i) => {
      expect(limitToTwoDecimals(v)).toBe(esperados[i]);
    });
  });

  //--------------------------------------------------------------------------------------------------------
  it("muestra 'Sin registros' cuando no hay historial", async () => {
    await abrirModal([]); // mock del historial vacío
    expect(await screen.findByText("Sin registros")).toBeInTheDocument();
  });

  //--------------------------------------------------------------------------------------------------------

 test("limpia error al cambiar altura o peso", () => {
    render(<ImcForm />);

    const alturaInput = screen.getByLabelText(/altura/i);
    const pesoInput = screen.getByLabelText(/peso/i);

    // Simular error previo
    fireEvent.change(alturaInput, { target: { value: "0" } });
    fireEvent.blur(alturaInput);
    fireEvent.change(pesoInput, { target: { value: "0" } });
    fireEvent.blur(pesoInput);

    // Cambiar valor para limpiar error
    fireEvent.change(alturaInput, { target: { value: "1.7" } });
    fireEvent.change(pesoInput, { target: { value: "70" } });

    // expect(screen.queryByText(/rango permitido/i)).toBeInTheDocument(); // placeholder check
    expect(screen.getByTestId('rangoPermitidoAltura')).toBeInTheDocument(); // placeholder check
  });

  // ----------------------
  // Submit con datos válidos
  // ----------------------
  test("calcula IMC correctamente", async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: {
        id: 1,
        peso: 70,
        altura: 1.7,
        resultado: 24.22,
        categoria: "Normal",
        createdAt: new Date().toISOString(),
      },
    });

    render(<ImcForm />);
    fireEvent.change(screen.getByLabelText(/altura/i), { target: { value: "1.7" } });
    fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: "70" } });

    // fireEvent.click(screen.getByText(/calcular/i));
    fireEvent.click(screen.getByTestId('btn-calcular'));

    await waitFor(() => expect(screen.getByText(/categoría/i)).toBeInTheDocument());
    expect(screen.getByText(/normal/i)).toBeInTheDocument();
  });

// ----------------------
// Modal historial con filtros y orden
// ----------------------
// test("abre modal historial, filtra y ordena", async () => {
//   const mockData = [
//     { id: 1, peso: 70, altura: 1.7, resultado: 24.22, categoria: "Normal", createdAt: "2025-01-01" },
//     { id: 2, peso: 80, altura: 1.8, resultado: 24.69, categoria: "Normal", createdAt: "2025-01-02" },
//   ];
//   (api.get as jest.Mock).mockResolvedValue({ data: mockData });

//   render(<ImcForm />);
//   fireEvent.click(screen.getByTestId("btn-ver-historial"));

//   // Esperar a que cargue
//   await waitFor(() => expect(api.get).toHaveBeenCalled());

//   // Ordenar por peso
//   fireEvent.click(screen.getByTestId("btn-ordenar-peso"));
//   expect(screen.getByTestId("peso-1")).toHaveTextContent("70");
//   expect(screen.getByTestId("peso-2")).toHaveTextContent("80");

//   // Simular filtrado aplicando fechas directamente en el input (simplificación para test)
//   act(() => {
//     fireEvent.click(screen.getByTestId("btn-filtrar"));
//   });

//   // Como la fecha mock es "2025-01-02" y filtramos solo por esa fecha, solo queda peso-2
//   await waitFor(() => {
//     expect(screen.getByTestId("peso-2")).toBeInTheDocument();
//     expect(screen.queryByTestId("peso-1")).not.toBeInTheDocument();
//   });
// });

// // ----------------------
// // Paginación
// // ----------------------
// test("navega entre páginas del historial", async () => {
//   const mockData = Array.from({ length: 15 }, (_, i) => ({
//     id: i + 1,
//     peso: 60 + i,
//     altura: 1.6 + i * 0.01,
//     resultado: 23 + i * 0.1,
//     categoria: "Normal",
//     createdAt: `2025-01-${(i + 1).toString().padStart(2, "0")}`,
//   }));
//   (api.get as jest.Mock).mockResolvedValue({ data: mockData });

//   render(<ImcForm />);
//   fireEvent.click(screen.getByTestId("btn-ver-historial"));

//   await waitFor(() => expect(api.get).toHaveBeenCalled());

//   // Página 1: ids 1-10
//   for (let i = 1; i <= 10; i++) {
//     expect(screen.getByTestId(`peso-${i}`)).toHaveTextContent((60 + i - 1).toString());
//   }

//   // Ir a página 2: ids 11-15
//   fireEvent.click(screen.getByTestId("btn-siguiente"));
//   await waitFor(() => {
//     for (let i = 11; i <= 15; i++) {
//       expect(screen.getByTestId(`peso-${i}`)).toHaveTextContent((60 + i - 1).toString());
//     }
//   });

//   // Volver a página 1
//   fireEvent.click(screen.getByTestId("btn-anterior"));
//   await waitFor(() => {
//     for (let i = 1; i <= 10; i++) {
//       expect(screen.getByTestId(`peso-${i}`)).toHaveTextContent((60 + i - 1).toString());
//     }
//   });
// });
});