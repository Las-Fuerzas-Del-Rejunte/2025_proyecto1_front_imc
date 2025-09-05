import { render, screen, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom";
import ImcForm from "../ImcForm";
import axios from "axios";


// Mock del GaugeComponent para que no rompa los tests
jest.mock("react-gauge-component", () => {
  return () => <div data-testid="gauge-mock" />; // componente simulado para pruebas
});

// Mock de la configuración de la API
jest.mock("../../config", () => ({
  API_URL: "http://localhost:3000", // valor fake para pruebas en localhost
}));

// Mock de Axios para simular llamadas HTTP
jest.mock("axios"); 
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ImcForm - integración", () => {

  // Test para verificar que aparezcan errores si la altura o el peso recibe datos inválidos
  it("muestra errores si altura o peso son inválidos", async () => {
    render(<ImcForm />); // se renderiza el componente del formulario de IMC

    fireEvent.change(screen.getByLabelText(/Altura/i), { target: { value: "" } }); // se busca el input de altura por su label y se le ingresan valores vacíos
    fireEvent.change(screen.getByLabelText(/Peso/i), { target: { value: "" } }); // se busca el input de peso por su label y se le ingresan valores vacíos
    fireEvent.click(screen.getByRole("button", { name: /calcular/i })); // se busca el botón calcular por su nombre y se hace click

    // Se espera que aparezcan los mensajes de error correspondientes
    expect(await screen.findByText(/Ingresa una altura válida. Ejemplo: 1,75/i)).toBeInTheDocument();
    expect(await screen.findByText(/Ingresa un peso válido. Ejemplo: 70/i)).toBeInTheDocument();
  });

  // Test para validar error de backend
  it("maneja error de backend", async () => {
    // Se configura el mock de Axios para simular un error de red
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

    render(<ImcForm />); // se renderiza el formulario

    fireEvent.change(screen.getByLabelText(/Altura/i), { target: { value: "1.80" } }); // se ingresa altura
    fireEvent.change(screen.getByLabelText(/Peso/i), { target: { value: "80" } }); // se ingresa peso
    fireEvent.click(screen.getByRole("button", { name: /calcular/i })); // se hace click en calcular

    // Se espera que aparezca el mensaje de error
    expect(await screen.findByText(/Error al calcular el IMC/i)).toBeInTheDocument();
  });
});
