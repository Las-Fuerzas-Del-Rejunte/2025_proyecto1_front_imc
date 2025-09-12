import { validateAltura, validatePeso } from "../util/validators";

describe("Validador de Altura", () => {
  test("Devuelve error si la altura no es un número", () => {
    expect(validateAltura(NaN)).toBe("Ingresa una altura válida. Ejemplo: 1,75");
  });

  it("Devuelve error si la altura es menor o igual a 0", () => {
    expect(validateAltura(0)).toBe("La altura debe ser mayor que 0");
    expect(validateAltura(-1)).toBe("La altura debe ser mayor que 0");
  });

  it("Devuelve error si la altura es mayor a 3", () => {
    expect(validateAltura(3.1)).toBe("La altura no puede superar 3,00 m");
  });

  it("Devuelve null si la altura es válida", () => {
    expect(validateAltura(1.75)).toBeNull();
  });
});

describe("Validador de Peso", () => {
  it("Devuelve error si el peso no es un número", () => {
    expect(validatePeso(NaN)).toBe("Ingresa un peso válido. Ejemplo: 70");
  });

  it("Devuelve error si el peso es menor o igual a 0", () => {
    expect(validatePeso(0)).toBe("El peso debe ser mayor que 0");
    expect(validatePeso(-5)).toBe("El peso debe ser mayor que 0");
  });

  it("Devuelve error si el peso es mayor a 500", () => {
    expect(validatePeso(600)).toBe("El peso no puede superar 500 kg");
  });

  it("Devuelve null si el peso es válido", () => {
    expect(validatePeso(70)).toBeNull();
  });
});


