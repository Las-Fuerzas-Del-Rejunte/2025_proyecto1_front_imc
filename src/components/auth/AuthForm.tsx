import { useState } from "react";
import { supabase } from "../../lib/supabase";

export function AuthForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === "signup") {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert("Cuenta creada. Revisa tu correo para confirmar.");
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                alert(`Bienvenido ${data.user?.email}`);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto mt-10 max-w-sm rounded-lg border bg-card p-4 shadow">
            <h1 className="mb-4 text-xl font-bold">
                {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="email"
                    placeholder="Correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-primary px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? "Cargando..." : mode === "login" ? "Entrar" : "Registrarse"}
                </button>
            </form>

            <p className="mt-4 text-center text-sm">
                {mode === "login" ? (
                    <>
                        ¿No tienes cuenta?{" "}
                        <button
                            type="button"
                            onClick={() => setMode("signup")}
                            className="text-primary underline"
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
                            className="text-primary underline"
                        >
                            Inicia sesión
                        </button>
                    </>
                )}
            </p>
        </div>
    );
}
