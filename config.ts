export const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");


//tuve que hacer esto porque los test no se pueden hacer con vite y de esta manera si


// Ventaja de este enfoque:
// Código testable → Jest no se rompe con import.meta.env.

// Backend real sigue funcionando → no hay que tocar .env ni la app.

// Diferentes escenarios de test → puedes mockear o usar real según el caso.