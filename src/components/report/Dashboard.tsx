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
import { TrendingUp, PieChart as PieChartIcon, AlertTriangle, BarChart3, Activity } from 'lucide-react';

interface ImcResult {
  id: number;
  peso: number;
  altura: number;
  resultado: number;
  categoria: string;
  createdAt: string;
}

// Colores mejorados con gradientes y mejor contraste
const COLORS = [
  "#8b5cf6", // Violeta para Normal
  "#06b6d4", // Cyan para Bajo peso  
  "#f59e0b", // Amber para Sobrepeso
  "#ef4444"  // Rojo para Obesidad
];

const CATEGORY_COLORS = {
  "Normal": "#8b5cf6",
  "Bajo peso": "#06b6d4", 
  "Sobrepeso": "#f59e0b",
  "Obesidad": "#ef4444"
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
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Evolución de IMC y Peso
          </CardTitle>
          {data.length > 0 && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Total registros: <span className="text-violet-400 font-medium">{data.length}</span></span>
              <span>Último IMC: <span className="text-violet-400 font-medium">{data[data.length - 1]?.resultado.toFixed(2)}</span></span>
            </div>
          )}
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col gap-6 w-full">
              {/* Skeleton del título */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-48" />
              </div>
              
              {/* Skeleton del gráfico */}
              <div className="relative">
                <Skeleton className="h-[280px] w-full rounded-lg" />
                
                {/* Efectos de brillo animados */}
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                </div>
                
                {/* Líneas de grid simuladas */}
                <div className="absolute inset-4 grid grid-cols-6 gap-4 opacity-20">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="border-r border-gray-300/30"></div>
                  ))}
                </div>
              </div>
              
              {/* Texto de carga */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground animate-pulse">Cargando estadísticas...</p>
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
                  No se pudo cargar el historial. Verifica tu conexión e intenta nuevamente.
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
                  tickLine={{ stroke: "#6b7280" }}
                />
                <YAxis 
                  domain={["auto", "auto"]} 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={{ stroke: "#6b7280" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f9fafb"
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(2)}${name === 'IMC' ? ' IMC' : ' kg'}`, 
                    name
                  ]}
                  labelFormatter={(label) =>
                    `${new Date(label).toLocaleDateString("es-AR", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}`
                  }
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    color: '#f9fafb',
                    fontSize: '14px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="resultado"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ 
                    r: 6, 
                    fill: "#8b5cf6",
                    stroke: "#ffffff",
                    strokeWidth: 2
                  }}
                  activeDot={{ 
                    r: 8, 
                    fill: "#8b5cf6",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                    filter: "drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))"
                  }}
                  name="IMC"
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ 
                    r: 6, 
                    fill: "#06b6d4",
                    stroke: "#ffffff",
                    strokeWidth: 2
                  }}
                  activeDot={{ 
                    r: 8, 
                    fill: "#06b6d4",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                    filter: "drop-shadow(0 0 6px rgba(6, 182, 212, 0.6))"
                  }}
                  name="Peso (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Sin datos de evolución
                </h3>
                <p className="text-blue-500/80 text-sm max-w-sm">
                  Registra tu primer cálculo de IMC para ver la evolución de tu peso y salud.
                </p>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card: Distribución de Categorías */}
      <Card className="w-full h-full p-4">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Distribución por Categoría
          </CardTitle>
          {categoriaData.length > 0 && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Categorías: <span className="text-purple-400 font-medium">{categoriaData.length}</span></span>
              <span>Más frecuente: <span className="text-purple-400 font-medium">{categoriaData.reduce((max, item) => item.value > max.value ? item : max, categoriaData[0])?.name}</span></span>
            </div>
          )}
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col gap-6 w-full items-center">
              {/* Skeleton del título */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-48" />
              </div>
              
              {/* Skeleton del gráfico circular mejorado */}
              <div className="relative flex items-center justify-center">
                {/* Círculo base */}
                <div className="w-[200px] h-[200px] rounded-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                  {/* Efecto de carga circular */}
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                  
                  {/* Contenido central */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <PieChartIcon className="w-8 h-8 text-gray-500 dark:text-gray-400 animate-pulse" />
                    </div>
                  </div>
                </div>
                
                {/* Leyenda simulada */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                  </div>
                </div>
              </div>
              
              {/* Texto de carga */}
              <div className="text-center mt-8">
                <p className="text-sm text-muted-foreground animate-pulse">Cargando distribución...</p>
              </div>
            </div>
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
                  label={({ name, value, percent }) => 
                    percent > 0.05 ? `${name}: ${value}` : ''
                  }
                  labelLine={false}
                  labelStyle={{
                    fontSize: '12px',
                    fontWeight: '600',
                    fill: '#f9fafb',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                  }}
                >
                  {categoriaData.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || COLORS[index % COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "2px solid #8b5cf6",
                    borderRadius: "12px",
                    color: "#f9fafb",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.2)",
                    fontSize: "14px",
                    fontWeight: "500",
                    padding: "16px 20px",
                    minWidth: "280px"
                  }}
                  cursor={{
                    fill: "rgba(139, 92, 246, 0.1)",
                    stroke: "#8b5cf6",
                    strokeWidth: 2
                  }}
                  formatter={(value: number, name: string) => {
                    const total = categoriaData.reduce((sum, item) => sum + item.value, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    const categoryData = data.filter(item => item.categoria === name);
                    const avgImc = categoryData.length > 0 
                      ? (categoryData.reduce((sum, item) => sum + item.resultado, 0) / categoryData.length).toFixed(2)
                      : '0';
                    
                    return [
                      <div key="tooltip-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || '#8b5cf6',
                          marginBottom: '4px'
                        }}>
                          {name}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: '#d1d5db' }}>Registros:</span>
                          <span style={{ color: '#f9fafb', fontWeight: '600' }}>{value}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: '#d1d5db' }}>Porcentaje:</span>
                          <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{percentage}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: '#d1d5db' }}>IMC Promedio:</span>
                          <span style={{ color: '#06b6d4', fontWeight: '600' }}>{avgImc}</span>
                        </div>
                      </div>
                    ];
                  }}
                  labelStyle={{
                    color: "#d1d5db",
                    fontSize: "12px",
                    marginBottom: "8px"
                  }}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    color: '#f9fafb',
                    fontSize: '14px'
                  }}
                  formatter={(value: string) => (
                    <span style={{ color: '#f9fafb' }}>
                      {value} ({categoriaData.find(d => d.name === value)?.value || 0})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Activity className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-2">
                  Sin categorías registradas
                </h3>
                <p className="text-orange-500/80 text-sm max-w-sm">
                  Realiza algunos cálculos de IMC para ver la distribución de tus categorías de peso.
                </p>
              </div>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
