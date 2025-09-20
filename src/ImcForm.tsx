import React, { useEffect, useState } from "react";
import GaugeComponent from "react-gauge-component";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "./components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover";
import { Calendar } from "./components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, X, ArrowUpDown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Gauge as GaugeIcon, AlertTriangle } from "lucide-react";
import { validateAltura, validatePeso } from "./util/validators";
import { Loader2 } from "lucide-react";



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
import { api } from "./lib/api";
import { Skeleton } from "./components/ui/Skeleton";

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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [sortKey, setSortKey] = useState<"peso" | "altura" | "resultado" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

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
    setAlturaError("");
    setPesoError("");
    setLoading(true);

    const alturaNum = parseFloat(altura.replace(",", "."));
    const pesoNum = parseFloat(peso.replace(",", "."));

    const alturaValidation = validateAltura(alturaNum);
    const pesoValidation = validatePeso(pesoNum);

    if (alturaValidation || pesoValidation) {
      if (alturaValidation) setAlturaError(alturaValidation);
      if (pesoValidation) setPesoError(pesoValidation);
      setResultado(null);
      setError("");
      setLoading(false); // 🔑 RESETEA loading aunque no llames API
      return;
    }

    try {
      const response = await api.post("/imc/calcular", {
        altura: alturaNum,
        peso: pesoNum,
      });
      setResultado(response.data);
      setError("");
    } catch (err: any) {
      setError("Error al calcular el IMC. Verifica si el backend está corriendo.");
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  // Obtener historial solo cuando cambian los filtros aplicados
  useEffect(() => {
    const fetchHistorial = async () => {
      setLoadingHistorial(true);
      try {
        let url = "/imc/historial";
        const params = [];
        if (fechaDesde) params.push(`desde=${fechaDesde}`);
        if (fechaHasta) params.push(`hasta=${fechaHasta}`);
        if (params.length) url += "?" + params.join("&");

        const response = await api.get(url);
        const ordenados = response.data.sort(
          (a: ImcResult, b: ImcResult) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setHistorial(ordenados);
      } catch {
        setHistorial([]);
      } finally {
        setLoadingHistorial(false);
      }
    };
    fetchHistorial();
  }, [fechaDesde, fechaHasta]);

  useEffect(() => {
    if (historyOpen) {
      const from = fechaDesdeInput ? new Date(fechaDesdeInput) : undefined;
      const to = fechaHastaInput ? new Date(fechaHastaInput) : undefined;
      setRange({ from, to });
    }
  }, [historyOpen]);

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
    if (sortKey) {
      const dir = sortDir === "asc" ? 1 : -1;
      registros = [...registros].sort((a, b) => {
        const av = a[sortKey] as number;
        const bv = b[sortKey] as number;
        if (av === bv) return 0;
        return av > bv ? dir : -dir;
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Calculadora de IMC</CardTitle>
              <CardDescription>Ingresa tu altura y peso para calcular tu índice de masa corporal.</CardDescription>
            </div>
            <Button data-testid="btn-ver-historial" onClick={() => setHistoryOpen(true)} className="h-10 text-sm text-white">Ver historial</Button>
          </div>
        </CardHeader>
        <CardContent className="h-full">
          <div className="grid gap-6 md:grid-cols-[1fr_1fr] items-stretch min-h-[350px] h-full">
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
              <Button type="submit" className="w-full text-base h-11 text-white" disabled={loading}>
                {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                {loading ? "Calculando..." : "Calcular"}
              </Button>
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

            {/* Botón adicional para abrir historial en pantallas pequeñas */}
            <div className="flex items-center justify-center md:justify-end">
              <Button onClick={() => setHistoryOpen(true)} className="md:hidden w-full">Ver historial</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de historial */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Historial de cálculos</DialogTitle>
              <DialogClose asChild>
                <button aria-label="Cerrar" className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted/50">
                  <X size={16} />
                </button>
              </DialogClose>
            </div>
          </DialogHeader>

          <form
            className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 mb-4 items-end"
            onSubmit={e => {
              e.preventDefault();
              setFechaDesde(fechaDesdeInput);
              setFechaHasta(fechaHastaInput);
              setCurrentPage(1);
            }}
          >
            <div className="space-y-1">
              <Label className="text-xs">Rango de fechas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between hover:bg-violet-500/20">
                    {fechaDesdeInput || fechaHastaInput
                      ? `${fechaDesdeInput ? new Date(fechaDesdeInput).toLocaleDateString() : ""}${fechaHastaInput ? ' - ' + new Date(fechaHastaInput).toLocaleDateString() : ''}`
                      : "dd/mm/aaaa - dd/mm/aaaa"}
                    <CalendarIcon className="h-4 w-4 opacity-80" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar
                    mode="range"
                    numberOfMonths={2}
                    selected={range}
                    onSelect={(r) => {
                      setRange(r);
                      setFechaDesdeInput(r?.from ? r.from.toLocaleDateString('en-CA') : "");
                      setFechaHastaInput(r?.to ? r.to.toLocaleDateString('en-CA') : "");
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button data-testid="btn-filtrar" type="submit" className="h-10 sm:h-9 px-4 text-white">Filtrar</Button>
            <Button
              data-testid="btn-limpiar"
              type="button"
              variant="secondary"
              className="h-10 sm:h-9 px-4"
              onClick={() => {
                setFechaDesdeInput("");
                setFechaHastaInput("");
                setFechaDesde("");
                setFechaHasta("");
                setRange(undefined);
                setCurrentPage(1);
              }}
            >
              Limpiar
            </Button>
          </form>

          <div className="mt-2 overflow-auto max-h-[60vh]">
            <div className="overflow-hidden rounded-md border">
              {loadingHistorial ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : (<table className="min-w-full text-sm">
                <thead className="bg-muted sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Fecha</th>
                    <th className="px-3 py-2 text-left font-medium">
                      <button
                        data-testid="btn-ordenar-peso"
                        type="button"
                        className="inline-flex items-center gap-1 hover:opacity-80"
                        onClick={() => {
                          setSortKey("peso");
                          setSortDir(prev => (sortKey === "peso" && prev === "desc") ? "asc" : "desc");
                        }}
                        aria-label="Ordenar por peso"
                      >
                        Peso (kg)
                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortKey === "peso" ? "opacity-100" : "opacity-60"}`} />
                      </button>
                    </th>
                    <th className="px-3 py-2 text-left font-medium">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:opacity-80"
                        onClick={() => {
                          setSortKey("altura");
                          setSortDir(prev => (sortKey === "altura" && prev === "desc") ? "asc" : "desc");
                        }}
                        aria-label="Ordenar por altura"
                      >
                        Altura (m)
                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortKey === "altura" ? "opacity-100" : "opacity-60"}`} />
                      </button>
                    </th>
                    <th className="px-3 py-2 text-left font-medium">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:opacity-80"
                        onClick={() => {
                          setSortKey("resultado");
                          setSortDir(prev => (sortKey === "resultado" && prev === "desc") ? "asc" : "desc");
                        }}
                        aria-label="Ordenar por IMC"
                      >
                        IMC
                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortKey === "resultado" ? "opacity-100" : "opacity-60"}`} />
                      </button>
                    </th>
                    <th className="px-3 py-2 text-left font-medium">Categoría</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosPagina.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center px-3 py-6 text-muted-foreground">
                        Sin registros
                      </td>
                    </tr>
                  ) : (
                    registrosPagina.map(item => (
                      <tr key={item.id} className="border-t historial-table-row">
                        <td className="px-3 py-2 whitespace-nowrap min-w-[120px]">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="px-3 py-2 whitespace-nowrap min-w-[80px]">{item.peso}</td>
                        <td className="px-3 py-2 whitespace-nowrap min-w-[80px]">{item.altura}</td>
                        <td className="px-3 py-2 whitespace-nowrap min-w-[80px]">{item.resultado.toFixed(2)}</td>
                        <td className="px-3 py-2 whitespace-nowrap min-w-[100px]">{item.categoria}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot></tfoot>
              </table>)}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-4 text-white"
            >
              Anterior
            </Button>
            <span className="text-sm">Página {currentPage} de {totalPaginas || 1}</span>
            <Button
              disabled={currentPage === totalPaginas || totalPaginas === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 text-white"
            >
              Siguiente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ImcForm;