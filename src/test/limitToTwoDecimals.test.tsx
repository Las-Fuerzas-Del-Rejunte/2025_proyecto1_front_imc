// import { describe, expect, test } from "@jest/globals";
import { describe, expect} from "@jest/globals";


// Llamamos a la funcion que delimita a dos decimales
const limitToTwoDecimals = (value: string): string => {
  const normalizedValue = value.replace(',', '.'); //cambiamos la coma por el punto para validar
  const regex = /^\d*\.?\d{0,2}$/; //verifica si coincide
  if (regex.test(normalizedValue)) {
    return value; //si regex coincide con el valor normalizado entonces lo devuelve
  }

  //usamos este bloque para recortar el numero a dos decimales y luego lo devolvemos con el mismo separador (punto o coma)
  const match = normalizedValue.match(/^(\d*\.?\d{0,2})/);
  return match ? match[1].replace('.', value.includes(',') ? ',' : '.') : value;
};

describe("limitToTwoDecimals", () => {
  it("permite números con hasta 2 decimales", () => {
    expect(limitToTwoDecimals("12.34")).toBe("12.34"); //comparamos que el valor esperado sea igual al ingresado
    expect(limitToTwoDecimals("12,34")).toBe("12,34"); //comparamos que el valor esperado sea igual al ingresado
  });

  it("recorta a 2 decimales si hay más", () => {
    expect(limitToTwoDecimals("12.3456")).toBe("12.34"); //recortamos los decimales que sobran cuando hay punto
    expect(limitToTwoDecimals("12,3456")).toBe("12,34"); //recortamos los decimales que sobran cuando hay coma
  });

  it("acepta enteros", () => {
    expect(limitToTwoDecimals("100")).toBe("100"); //verificamos si se aceptan enteros
  });
});


