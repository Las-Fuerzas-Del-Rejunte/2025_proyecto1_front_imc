// src/components/report/Dashboard.tsx
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/Skeleton";
import {
  TrendingUp,
  PieChart as PieChartIcon,
  AlertTriangle,
  BarChart3,
  Activity,
} from "lucide-react";

interface ImcResult {
  id: number;
  peso: number;
  altura: number;
  resultado: number;
  categoria: string;
  createdAt: string;
}

const COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];

const CATEGORY_COLORS = {
  Normal: "#8b5cf6",
  "Bajo peso": "#06b6d4",
  Sobrepeso: "#f59e0b",
  Obeso: "#8b5cf6", // Púrpura para Obeso
  Obesidad: "#8b5cf6", // Púrpura para Obesidad también
};

export function Dashboard() {
  const [data, setData] = useState<ImcResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      try {
        const response = await api.get("/imc/historial");
        const ordenados = response.data.sort(
          (a: ImcResult, b: ImcResult) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setData(ordenados);
        setError(null);
      } catch (err) {
        console.error("Error cargando historial:", err);
        setError("No se pudo cargar el historial. Intenta nuevamente.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorial();
  }, []);

  const categoriaData = Object.values(
    data.reduce((acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = { 
          name: item.categoria, 
          value: 0, 
          imcSum: 0,
          imcCount: 0
        };
      }
      acc[item.categoria].value++;
      acc[item.categoria].imcSum += item.resultado;
      acc[item.categoria].imcCount++;
      return acc;
    }, {} as Record<string, { name: string; value: number; imcSum: number; imcCount: number }>)
  ).map(item => ({
    ...item,
    imcPromedio: item.imcSum / item.imcCount
  }));

  // Encontrar la categoría más frecuente
  const categoriaMasFrecuente = categoriaData.length > 0 
    ? categoriaData.reduce((max, current) => current.value > max.value ? current : max)
    : null;

  return (
    <div className="grid gap-6 md:grid-cols-2 w-full">
      {/* Evolución IMC y Peso */}
      <Card className="w-full h-full p-4">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Evolución de IMC y Peso
          </CardTitle>
          {data.length > 0 && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>
                Total registros:{" "}
                <span className="text-violet-400 font-medium">
                  {data.length}
                </span>
              </span>
              <span>
                Último IMC:{" "}
                <span className="text-violet-400 font-medium">
                  {data[data.length - 1]?.resultado.toFixed(2)}
                </span>
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col gap-6 w-full">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="relative">
                <Skeleton className="h-[280px] w-full rounded-lg" />
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                </div>
                <div className="absolute inset-4 grid grid-cols-6 gap-4 opacity-20">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="border-r border-gray-300/30"></div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground animate-pulse">
                  Cargando estadísticas...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  Error al cargar datos
                </h3>
                <p className="text-red-500/80 text-sm max-w-sm">
                  No se pudo cargar el historial. Verifica tu conexión e
                  intenta nuevamente.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="createdAt"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("es-AR", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis domain={["auto", "auto"]} stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f9fafb",
                    padding: "12px",
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    return `${day}/${month}/${year} - ${hours}:${minutes}`;
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(2)}${name === "IMC" ? " IMC" : " kg"}`,
                    name,
                  ]}
                />
                <Legend />
                <Line type="monotone" dataKey="resultado" stroke="#8b5cf6" strokeWidth={3} name="IMC" />
                <Line type="monotone" dataKey="peso" stroke="#06b6d4" strokeWidth={3} name="Peso (kg)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
              <BarChart3 className="w-8 h-8 text-blue-400" />
              <p className="text-blue-500/80">Registra tu primer cálculo para ver la evolución.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribución por Categoría */}
      <Card className="w-full h-full p-4">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Distribución por Categoría
          </CardTitle>
          {categoriaData.length > 0 && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>
                Categorías:{" "}
                <span className="text-violet-400 font-medium">
                  {categoriaData.length}
                </span>
              </span>
              <span>
                Más frecuente:{" "}
                <span className="text-violet-400 font-medium">
                  {categoriaMasFrecuente?.name}
                </span>
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          {loading ? (
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
          ) : categoriaData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriaData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={2}
                >
                  {categoriaData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] ||
                        COLORS[index % COLORS.length]
                      }
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f9fafb",
                    padding: "12px",
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    const categoryColor = CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || "#8b5cf6";
                    return [
                      <div key="tooltip-content" className="space-y-2">
                        <div className="font-semibold text-lg" style={{ color: categoryColor }}>
                          {name}
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="text-gray-300">
                            Registros: <span className="text-white">{value}</span>
                          </div>
                          <div className="text-gray-300">
                            Porcentaje: <span style={{ color: categoryColor }}>
                              {((value / data.length) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-gray-300">
                            IMC Promedio: <span style={{ color: "#06b6d4" }}>
                              {props.payload.imcPromedio.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ];
                  }}
                />
                <Legend 
                  formatter={(value, entry) => (
                    <span className="text-sm">
                      {value} ({entry.payload?.value || 0})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Activity className="text-orange-400 w-10 h-10" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
