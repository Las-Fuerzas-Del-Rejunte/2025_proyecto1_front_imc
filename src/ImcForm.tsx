import axios from "axios";
import React, { useEffect, useState } from "react";
import GaugeComponent from "react-gauge-component";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Gauge as GaugeIcon, AlertTriangle } from "lucide-react";
import { validateAltura, validatePeso } from "./util/validators";


interface ImcResult {
  id: number;
  peso: number;
  altura: number;
  resultado: number;
  categoria: string;
  createdAt: string;
}

//esto se encuentra comentado para poder realizar los test, de igual manera al menos en localhost funciona con normalidad

// const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;
// const API_URL = (rawApiUrl ?? "").replace(/\/+$/, "");
import { API_URL } from "..//config";

function ImcForm() {
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [resultado, setResultado] = useState<ImcResult | null>(null);
  const [error, setError] = useState("");
  const [alturaError, setAlturaError] = useState("");
  const [pesoError, setPesoError] = useState("");

  // Historial de cálculos
  const [historial, setHistorial] = useState<ImcResult[]>([]);
  // Filtros controlados por el usuario
  const [fechaDesdeInput, setFechaDesdeInput] = useState("");
  const [fechaHastaInput, setFechaHastaInput] = useState("");
  // Filtros aplicados
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const registrosPorPagina = 10;

  // Función para limitar a 2 decimales
  const limitToTwoDecimals = (value: string): string => {
    // Permitir coma o punto como separador decimal
    const normalizedValue = value.replace(',', '.');

    // Validar con regex: número opcional con hasta 2 decimales
    const regex = /^\d*\.?\d{0,2}$/;

    if (regex.test(normalizedValue)) {
      return value; // Mantener el formato original (coma o punto)
    }

    // Si no cumple, recortar a 2 decimales
    const match = normalizedValue.match(/^(\d*\.?\d{0,2})/);
    return match ? match[1].replace('.', value.includes(',') ? ',' : '.') : value;
  };

  const handleAlturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limitedValue = limitToTwoDecimals(e.target.value);
    setAltura(limitedValue);
    if (alturaError) setAlturaError("");
  };

  const handlePesoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limitedValue = limitToTwoDecimals(e.target.value);
    setPeso(limitedValue);
    if (pesoError) setPesoError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpiar errores previos
    setAlturaError("");
    setPesoError("");

    const alturaNum = parseFloat(altura.replace(',', '.'));
    const pesoNum = parseFloat(peso.replace(',', '.'));

    // Validaciones con funciones de "Validators"
    const alturaValidation = validateAltura(alturaNum);
    const pesoValidation = validatePeso(pesoNum);

    if (alturaValidation || pesoValidation) {
      if (alturaValidation) setAlturaError(alturaValidation);
      if (pesoValidation) setPesoError(pesoValidation);
      setResultado(null);
      setError("");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/imc/calcular`, {
        altura: alturaNum,
        peso: pesoNum,
      });
      setResultado(response.data);
      setError("");
    } catch (err) {
      setError("Error al calcular el IMC. Verifica si el backend está corriendo.");
      setResultado(null);
    }
  };

  // Obtener historial solo cuando cambian los filtros aplicados
  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        let url = `${API_URL}/imc/historial`;
        if (fechaDesde || fechaHasta) {
          const params = [];
          if (fechaDesde) params.push(`desde=${fechaDesde}`);
          if (fechaHasta) params.push(`hasta=${fechaHasta}`);
          url += "?" + params.join("&");
        }
        const response = await axios.get(url);
        const ordenados = response.data.sort(
          (a: ImcResult, b: ImcResult) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setHistorial(ordenados);
      } catch {
        setHistorial([]);
      }
    };
    fetchHistorial();
  }, [fechaDesde, fechaHasta]);

  // Filtrado y paginación de registros
  const registrosFiltrados = (() => {
    let registros = historial;
    if (fechaDesde || fechaHasta) {
      registros = registros.filter(item => {
        const fechaItem = new Date(item.createdAt).toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
        const desdeOk = fechaDesde ? fechaItem >= fechaDesde : true;
        const hastaOk = fechaHasta ? fechaItem <= fechaHasta : true;
        return desdeOk && hastaOk;
      });
    }
    return registros;
  })();

  const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
  const registrosPagina = registrosFiltrados.slice(
    (currentPage - 1) * registrosPorPagina,
    currentPage * registrosPorPagina
  );

  return (
    <div className="container mx-auto max-w-5xl p-4 h-full">
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Calculadora de IMC</CardTitle>
          <CardDescription>Ingresa tu altura y peso para calcular tu índice de masa corporal.</CardDescription>
        </CardHeader>
        <CardContent className="h-full">
          <div className="grid gap-6 md:grid-cols-[1fr_1fr_2.5fr] items-stretch min-h-[350px] h-full">
            {/* Columna 1: Formulario */}
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full min-w-[120px]">
              <div className="space-y-2">
                <Label htmlFor="altura">Altura (m)</Label>
                <Input
                  id="altura"
                  type="number"
                  inputMode="decimal"
                  value={altura}
                  onChange={handleAlturaChange}
                  step="0.01"
                  min="0.1"
                  max="3"
                  placeholder="Ej: 1,75"
                  aria-invalid={!!alturaError}
                  aria-describedby={alturaError ? "altura-error" : undefined}
                  className={alturaError ? "border-destructive focus-visible:ring-destructive" : undefined}
                />
                <p className="text-xs text-muted-foreground">Rango permitido: 0.10 m a 3.00 m</p>
                {alturaError && (
                  <div id="altura-error" className="mt-1 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive shadow-sm ring-1 ring-destructive/20">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{alturaError}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  inputMode="decimal"
                  value={peso}
                  onChange={handlePesoChange}
                  step="0.01"
                  min="1"
                  max="500"
                  placeholder="Ej: 70.50"
                  aria-invalid={!!pesoError}
                  aria-describedby={pesoError ? "peso-error" : undefined}
                  className={pesoError ? "border-destructive focus-visible:ring-destructive" : undefined}
                />
                <p className="text-xs text-muted-foreground">Rango permitido: 1 kg a 500 kg</p>
                {pesoError && (
                  <div id="peso-error" className="mt-1 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive shadow-sm ring-1 ring-destructive/20">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{pesoError}</span>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full text-base h-11">Calcular</Button>

              {error && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}
            </form>

            {/* Columna 2: Gauge */}
            <div className="flex flex-col items-center justify-center w-full h-full">
              {resultado ? (
                <>
                  <div className="text-base mb-2 text-center w-full">
                    Categoría: <span className="font-semibold">{resultado.categoria}</span>
                  </div>
                  <div className="text-sm mb-2 text-center w-full">
                    Peso: <span className="font-medium">{resultado.peso} kg</span> | Altura: <span className="font-medium">{resultado.altura} m</span>
                  </div>
                  <div className="w-[340px] h-[180px] flex items-center justify-center">
                    <GaugeComponent
                      value={resultado.resultado}
                      minValue={10}
                      maxValue={40}
                      arc={{
                        width: 0.22,
                        padding: 0.005,
                        subArcs: [
                          { limit: 18.5, color: "#60a5fa", showTick: true },
                          { limit: 24.9, color: "#22c55e", showTick: true },
                          { limit: 29.9, color: "#facc15", showTick: true },
                          { limit: 40, color: "#ef4444", showTick: true },
                        ],
                      }}
                      pointer={{ color: "#4b5563", length: 0.65, width: 18, type: "needle" }}
                      labels={{
                        valueLabel: {
                          formatTextValue: (value) => `${value} IMC`,
                          style: { fontSize: "1rem", fill: "#374151" },
                        },
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                  <GaugeIcon className="w-10 h-10 mb-2" />
                  <p>Ingresa tus datos y presiona "Calcular".</p>
                </div>
              )}
            </div>

            {/* Columna 3: Historial */}
            <div className="flex flex-col w-full h-full mt-0">
              <h3 className="text-lg font-semibold mb-2 text-center">Historial de cálculos</h3>
              <form
                className="flex gap-2 mb-2 justify-center items-center"
                onSubmit={e => {
                  e.preventDefault();
                  setFechaDesde(fechaDesdeInput);
                  setFechaHasta(fechaHastaInput);
                  setCurrentPage(1); // <-- reinicia la paginación
                }}
              >
                <input
                  type="date"
                  value={fechaDesdeInput}
                  onChange={e => setFechaDesdeInput(e.target.value)}
                  className="border rounded px-2 py-1 text-sm bg-white text-black"
                  placeholder="Desde"
                />
                <input
                  type="date"
                  value={fechaHastaInput}
                  onChange={e => setFechaHastaInput(e.target.value)}
                  className="border rounded px-2 py-1 text-sm bg-white text-black"
                  placeholder="Hasta"
                />
                <Button type="submit" className="text-xs h-8 px-3">Filtrar</Button>
              </form>
              <div className="overflow-auto flex-1 mt-4">
                <table className="min-w-full text-xs border rounded">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-2 py-1">Fecha</th>
                      <th className="px-2 py-1">Peso (kg)</th>
                      <th className="px-2 py-1">Altura (m)</th>
                      <th className="px-2 py-1">IMC</th>
                      <th className="px-2 py-1">Categoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosPagina.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-2 text-muted-foreground">
                          Sin registros
                        </td>
                      </tr>
                    ) : (
                      registrosPagina.map(item => (
                        <tr key={item.id} className="border-b">
                          <td className="px-2 py-1 text-center truncate min-w-[120px]">{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td className="px-2 py-1 text-center truncate min-w-[80px]">{item.peso}</td>
                          <td className="px-2 py-1 text-center truncate min-w-[80px]">{item.altura}</td>
                          <td className="px-2 py-1 text-center truncate min-w-[80px]">{item.resultado.toFixed(2)}</td>
                          <td className="px-2 py-1 text-center truncate min-w-[100px]">{item.categoria}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {/* Paginación */}
                  <tfoot>
                    <tr>
                      <td colSpan={5} className="py-2 text-center">
                        <Button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="mx-1 px-2 py-1 text-xs"
                        >
                          Anterior
                        </Button>
                        <span className="mx-2 text-sm">{currentPage} / {totalPaginas || 1}</span>
                        <Button
                          disabled={currentPage === totalPaginas || totalPaginas === 0}
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="mx-1 px-2 py-1 text-xs"
                        >
                          Siguiente
                        </Button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ImcForm;