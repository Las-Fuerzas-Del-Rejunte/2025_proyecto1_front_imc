import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

export function AuthForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === "signup") {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                toast({
                    title: "Cuenta creada exitosamente",
                    description: "Revisa tu correo para confirmar tu cuenta.",
                    variant: "success",
                });
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast({
                    title: "¡Bienvenido!",
                    description: `Hola ${data.user?.email}, has iniciado sesión correctamente.`,
                    variant: "success",
                });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    }

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                backgroundImage: 'url("/fondo-login.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Overlay oscuro sutil */}
            <div className="absolute inset-0 bg-black/15"></div>

            
            {/* Tarjeta principal */}
            <div className="relative z-10 w-full max-w-md">
                <div 
                    className="login-hover-lift shadow-2xl relative opacity-100 border-transparent rounded-2xl p-6"
                    style={{
                        background: "rgba(255, 255, 255, 0.25)",
                        backdropFilter: "blur(40px) saturate(250%)",
                        border: "1px solid rgba(255, 255, 255, 0.4)",
                        boxShadow: "0 32px 80px rgba(0, 0, 0, 0.3), 0 16px 64px rgba(255, 255, 255, 0.2), inset 0 3px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(255, 255, 255, 0.3)",
                    }}
                >
                    {/* Logo/Título */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">ElRejunte</h1>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">
                            {mode === "login" ? "Bienvenido de vuelta" : "Únete a ElRejunte"}
                        </h2>
                        <p className="text-gray-600 text-sm">
                            {mode === "login" 
                                ? "Inicia sesión en tu cuenta para continuar" 
                                : "Crea tu cuenta para comenzar"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Campo Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 font-sans">
                                Dirección de Email
                            </label>
                            <input
                                type="email"
                                placeholder="Ingresa tu email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border-white/40 bg-white/10 placeholder:text-gray-700/50 text-gray-700 py-3 px-4 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:bg-white/15 transition-all duration-200 focus:outline-none"
                                required
                            />
                        </div>

                        {/* Campo Contraseña */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 font-sans">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border-white/40 bg-white/10 placeholder:text-gray-700/50 text-gray-700 py-3 px-4 pr-12 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:bg-white/15 transition-all duration-200 focus:outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Botón Principal */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full login-ripple-effect login-hover-lift font-sans font-bold py-3 transition-all duration-300 rounded-xl focus:outline-none"
                            style={{ backgroundColor: "#0C115B", color: "white" }}
                        >
                            {loading ? "Cargando..." : mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                        </button>
                    </form>

                    {/* Separador */}
                    <div className="relative my-4">
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="px-2 text-gray-700/60 font-sans">O continúa con</span>
                        </div>
                    </div>

                    {/* Botón de Google */}
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full login-glass-effect border-white/30 login-hover-lift login-ripple-effect text-gray-700 hover:bg-white/20 font-sans transition-all duration-300 py-3 px-4 rounded-xl flex items-center justify-center space-x-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Continuar con Google</span>
                    </button>

                    {/* Enlace de recuperación */}
                    {mode === "login" && (
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                className="text-sm text-gray-700/70 hover:text-gray-700 font-sans transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    )}

                    {/* Cambiar modo */}
                    <div className="text-center mt-3">
                        <p className="text-sm text-gray-700/70">
                            {mode === "login" ? (
                                <>
                                    ¿No tienes cuenta?{" "}
                                    <button
                                        type="button"
                                        onClick={() => setMode("signup")}
                                        className="text-gray-700 hover:text-gray-900 font-medium underline transition-colors duration-200 font-sans"
                                    >
                                        Crear cuenta
                                    </button>
                                </>
                            ) : (
                                <>
                                    ¿Ya tienes cuenta?{" "}
                                    <button
                                        type="button"
                                        onClick={() => setMode("login")}
                                        className="text-gray-700 hover:text-gray-900 font-medium underline transition-colors duration-200 font-sans"
                                    >
                                        Inicia sesión
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
