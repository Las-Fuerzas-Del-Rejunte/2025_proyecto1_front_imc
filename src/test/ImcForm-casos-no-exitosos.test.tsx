import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ImcForm from "../ImcForm";
import axios from "axios";

jest.mock("react-gauge-component", () => ({
  default: () => <div data-testid="gauge-mock" />
}));


// Mock de la configuración de la API
jest.mock("../../config", () => ({
  API_URL: "http://localhost:3000",
}));

// Mock de Axios para simular llamadas HTTP sin tocar la API real
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ImcForm - Validación de inputs", () => {
    it("muestra error si altura está vacía", async () => {
        render(<ImcForm />);
        await act(async () => {
              fireEvent.change(screen.getByLabelText(/Peso/i), { target: { value: "70" } });
              fireEvent.click(screen.getByRole("button", { name: /Calcular/i }));
            });
            // expect(await screen.findByText(/Altura requerida/i)).toBeInTheDocument();
            expect(await screen.findByText(/Ingresa una altura válida. Ejemplo: 1,75/i)).toBeInTheDocument();
        });  
    
 
  // it("muestra error si peso está fuera de rango", async () => {
  //       render(<ImcForm />);
  //     await act(async () => {
  //       fireEvent.change(screen.getByLabelText(/Altura/i), { target: { value: "1.75" } });
  //       fireEvent.change(screen.getByLabelText(/Peso/i), { target: { value: "600" } });
  //       fireEvent.click(screen.getByRole("button", { name: /Calcular/i }));
  //     });
  //     // expect(await screen.findByText(/Peso debe estar entre 1 y 500/i)).toBeInTheDocument();
  //     expect(await screen.findByText(/Ingresa un peso válido. Ejemplo: 70/i)).toBeInTheDocument();
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
    })
    
});

describe("ImcForm - Render condicional", () => {
    it("muestra el Gauge si el cálculo es exitoso", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { resultado: 24.5, categoria: "Normal" } });
    render(<ImcForm />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Altura/i), { target: { value: "1.75" } });
      fireEvent.change(screen.getByLabelText(/Peso/i), { target: { value: "70" } });
      fireEvent.click(screen.getByRole("button", { name: /Calcular/i }));
    });
    expect(await screen.findByTestId("gauge-mock")).toBeInTheDocument();
    expect(await screen.findByText(/Normal/i)).toBeInTheDocument();
    });
    
    it("muestra botones de paginación si hay muchos registros", async () => {
    const registros = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      peso: 60 + i,
      altura: 1.70,
      resultado: 20 + i,
      categoria: "Normal",
      fecha: "2025-09-15T12:00:00Z",
    }));
    mockedAxios.get.mockResolvedValueOnce({ data: registros });
    render(<ImcForm />);
    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-ver-historial"));
    });
    expect(await screen.findByText("60")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Siguiente/i })).toBeInTheDocument();
    });

});
    

