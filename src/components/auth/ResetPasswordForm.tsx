import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { ArrowLeft, Mail } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

interface ResetPasswordFormProps {
    onBack: () => void;
}

export function ResetPasswordForm({ onBack }: ResetPasswordFormProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { toast } = useToast();

    // Función para traducir errores de Supabase al español
    function translateError(errorMessage: string): string {
        const errorTranslations: { [key: string]: string } = {
            // Errores de recuperación de contraseña
            "Invalid email": "Dirección de email inválida",
            "User not found": "No se encontró una cuenta con este email",
            "Unable to validate email address: invalid format": "Formato de email inválido",
            "Password reset request rate limit exceeded": "Demasiados intentos. Espera un momento",
            
            // Errores de red/conexión
            "Failed to fetch": "Error de conexión. Verifica tu internet",
            "Network request failed": "Error de red. Intenta nuevamente",
            "Request timeout": "Tiempo de espera agotado. Intenta nuevamente",
            
            // Errores generales
            "An unexpected error occurred": "Ocurrió un error inesperado",
            "Service unavailable": "Servicio no disponible. Intenta más tarde"
        };

        // Buscar traducción exacta
        if (errorTranslations[errorMessage]) {
            return errorTranslations[errorMessage];
        }

        // Buscar traducciones parciales para errores dinámicos
        if (errorMessage.includes("Invalid email")) {
            return "Formato de email inválido";
        }
        if (errorMessage.includes("User not found")) {
            return "No se encontró una cuenta con este email";
        }
        if (errorMessage.includes("Failed to fetch") || errorMessage.includes("Network")) {
            return "Error de conexión. Verifica tu internet e intenta nuevamente";
        }
        if (errorMessage.includes("rate limit")) {
            return "Demasiados intentos. Espera un momento";
        }

        // Si no se encuentra traducción, devolver mensaje genérico
        return "Ocurrió un error. Intenta nuevamente";
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            
            if (error) throw error;
            
            setSuccess(true);
            toast({
                title: "Email enviado exitosamente",
                description: "Revisa tu correo para restablecer tu contraseña.",
                variant: "success",
                duration: 6000,
            });
        } catch (err: any) {
            const translatedError = translateError(err.message);
            setError(translatedError);
        } finally {
            setLoading(false);
        }
    }

    if (success) {
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
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Mail className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">ElRejunte</h1>
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">
                                Email enviado
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Te hemos enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>
                            </p>
                        </div>

                        {/* Mensaje de éxito */}
                        <div 
                            className="login-glass-effect border-green-300/50 login-hover-lift rounded-xl p-4 shadow-lg mb-6"
                            style={{
                                background: "rgba(34, 197, 94, 0.15)",
                                backdropFilter: "blur(20px) saturate(150%)",
                                border: "1px solid rgba(34, 197, 94, 0.3)",
                                boxShadow: "0 8px 32px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800 font-medium leading-relaxed">
                                        Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                                    </p>
                                    <p className="text-xs text-gray-600 mt-2">
                                        Si no ves el email, revisa también tu carpeta de spam.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Botón de regreso */}
                        <button
                            onClick={onBack}
                            className="w-full login-ripple-effect login-hover-lift font-sans font-bold py-3 transition-all duration-300 rounded-xl focus:outline-none flex items-center justify-center gap-2"
                            style={{ backgroundColor: "#0C115B", color: "white" }}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver al inicio de sesión
                        </button>
                    </div>
                </div>
            </div>
        );
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
                            Recuperar contraseña
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
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

                        {error && (
                            <div 
                                className="login-glass-effect border-red-300/50 login-hover-lift rounded-xl p-4 shadow-lg"
                                style={{
                                    background: "rgba(239, 68, 68, 0.15)",
                                    backdropFilter: "blur(20px) saturate(150%)",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    boxShadow: "0 8px 32px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-800 font-medium leading-relaxed drop-shadow-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Botón Principal */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full login-ripple-effect login-hover-lift font-sans font-bold py-3 transition-all duration-300 rounded-xl focus:outline-none"
                            style={{ backgroundColor: "#0C115B", color: "white" }}
                        >
                            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                        </button>
                    </form>

                    {/* Botón de regreso */}
                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-sm text-gray-700/70 hover:text-gray-700 font-sans transition-colors flex items-center gap-2 mx-auto"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver al inicio de sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
