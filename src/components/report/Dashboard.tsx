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
import { Skeleton } from '../ui/Skeleton';

interface ImcResult {
  id: number;
  peso: number;
  altura: number;
  resultado: number;
  categoria: string;
  createdAt: string;
}

const COLORS = ["#22c55e", "#60a5fa", "#facc15", "#ef4444"]; // Normal, Bajo, Sobrepeso, Obesidad

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

  // Construcción de dataset para el PieChart
  const categoriaData = Object.values(
    data.reduce((acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = { name: item.categoria, value: 0 };
      }
      acc[item.categoria].value++;
      return acc;
    }, {} as Record<string, { name: string; value: number }>)
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 w-full">
      {/* Card: Evolución IMC/Peso */}
      <Card className="w-full h-full p-4">
        <CardHeader>
          <CardTitle className="text-xl">📈 Evolución de IMC y Peso</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col gap-4 w-full">
              <Skeleton className="h-6 w-1/3 mx-auto" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : error ? (
            <p className="text-red-400 text-center">{error}</p>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="createdAt"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("es-AR", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip
                  formatter={(value: number) => value.toFixed(2)}
                  labelFormatter={(label) =>
                    `Fecha: ${new Date(label).toLocaleDateString("es-AR")}`
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="resultado"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="IMC"
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Peso (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground">
              No hay datos suficientes para mostrar estadísticas.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card: Distribución de Categorías */}
      <Card className="w-full h-full p-4">
        <CardHeader>
          <CardTitle className="text-xl">🍩 Distribución por Categoría</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          {loading ? (
            <Skeleton className="h-[300px] w-[300px] mx-auto rounded-full" />
          ) : categoriaData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriaData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {categoriaData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground">
              No hay categorías registradas.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
