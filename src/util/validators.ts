//Utilizamos esta funcion para validar que el ingreso de la altura sea correcto
export function validateAltura(altura: number): string | null {
  if (isNaN(altura)) return "Ingresa una altura válida. Ejemplo: 1,75";
  if (altura <= 0) return "La altura debe ser mayor que 0";
  if (altura > 3) return "La altura no puede superar 3,00 m";
  return null; 
}

//Utilizamos esta funcion para validar en este caso que el peso sea correcto 
export function validatePeso(peso: number): string | null {
  if (isNaN(peso)) return "Ingresa un peso válido. Ejemplo: 70";
  if (peso <= 0) return "El peso debe ser mayor que 0";
  if (peso > 500) return "El peso no puede superar 500 kg";
  return null; 
}



