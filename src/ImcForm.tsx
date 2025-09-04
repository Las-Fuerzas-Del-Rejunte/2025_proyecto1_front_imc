import axios from "axios";
import React, { useState } from "react";
import GaugeComponent from "react-gauge-component";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Gauge as GaugeIcon, AlertTriangle } from "lucide-react";


interface ImcResult {
  imc: number;
  categoria: string;
}
const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const API_URL = (rawApiUrl ?? "").replace(/\/+$/, "");

function ImcForm() {
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [resultado, setResultado] = useState<ImcResult | null>(null);
  const [error, setError] = useState("");
  const [alturaError, setAlturaError] = useState("");
  const [pesoError, setPesoError] = useState("");

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

    // Permitir decimales con coma o punto
    const alturaNum = parseFloat(altura.replace(',', '.'));
    const pesoNum = parseFloat(peso.replace(',', '.'));

    let hasError = false;
    if (isNaN(alturaNum)) {
      setAlturaError("Ingresa una altura válida. Ejemplo: 1,75");
      hasError = true;
    }
    if (isNaN(pesoNum)) {
      setPesoError("Ingresa un peso válido. Ejemplo: 70");
      hasError = true;
    }
    if (!hasError && (alturaNum <= 0 || pesoNum <= 0)) {
      if (alturaNum <= 0) setAlturaError("La altura debe ser mayor que 0");
      if (pesoNum <= 0) setPesoError("El peso debe ser mayor que 0");
      hasError = true;
    }
    if (!hasError && alturaNum > 3) {
      setAlturaError("La altura no puede superar 3,00 m");
      hasError = true;
    }
    if (!hasError && pesoNum > 500) {
      setPesoError("El peso no puede superar 500 kg");
      hasError = true;
    }
    if (hasError) {
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
      setError(
        "Error al calcular el IMC. Verifica si el backend está corriendo."
      );
      setResultado(null);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Calculadora de IMC</CardTitle>
          <CardDescription>Ingresa tu altura y peso para calcular tu índice de masa corporal.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 items-stretch min-h-[240px] md:min-h-[280px] lg:min-h-[300px]">
            {/* izquierda: formulario */}
            <form noValidate onSubmit={handleSubmit} className="flex h-full flex-col space-y-4">
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
              <Button type="submit" className="mt-auto w-full text-base h-11">Calcular</Button>

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

            {/* derecha: gauge */}
            <div className="flex h-[280px] md:h-[320px] lg:h-[340px] flex-col items-center justify-start">
              {resultado ? (
                <>
                  <div className="text-base mb-2 text-center">Categoría: <span className="font-semibold">{resultado.categoria}</span></div>
                  <div className="w-full max-w-xl flex-1 -mt-2 overflow-visible">
                    <div className="h-full w-full" style={{ transform: 'translateY(-4%) scale(0.92)', transformOrigin: '50% 0%' }}>
                      <GaugeComponent
                      value={resultado.imc}
                      minValue={10}
                      maxValue={40}
                      style={{ width: '100%', height: '100%' }}
                      arc={{
                        width: 0.22,
                        cornerRadius: 5,
                        padding: 0.01,
                        subArcs: [
                          { limit: 18.5, color: "#06b6d4" },
                          { limit: 25, color: "#10b981" },
                          { limit: 30, color: "#f59e0b" },
                          { limit: 40, color: "#ef4444" },
                        ],
                      }}
                      pointer={{ color: '#a78bfa', length: 0.55, width: 8 }}
                      labels={{
                        valueLabel: {
                          formatTextValue: (v) => `IMC: ${Number(v).toFixed(2)}`,
                          style: { fill: '#e5e7eb', fontSize: '30px', fontWeight: 800 },
                        },
                      }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full max-w-xl h-full rounded-lg border border-dashed bg-card/30 p-8 text-center flex flex-col items-center justify-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <GaugeIcon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold">Aún sin resultado</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Completa tu altura y peso y presiona "Calcular" para ver tu IMC aquí.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ImcForm;