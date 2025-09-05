import { render, screen, fireEvent } from "@testing-library/react";
import {Dialog, DialogContent, DialogFooter, DialogClose, DialogTitle, DialogDescription} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

describe("closeModal", () => {
  //test para verificar que el modal que aparece al cargar la pagina se cierre cuando se utilice el boton 'Empezar'
  test("cierra el modal al apretar 'Empezar'", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          {/* Título para accesibilidad */}
          <DialogTitle>
            <VisuallyHidden>Bienvenida</VisuallyHidden>
          </DialogTitle>

          {/* Descripción para accesibilidad */}
          <DialogDescription>
            Bienvenido a ElRejunte · Calculadora de IMC
          </DialogDescription>

          <DialogFooter>
            <DialogClose asChild>
              <Button>Empezar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    // Verifico que el modal esté abierto
    expect(screen.getByText("Bienvenido a ElRejunte · Calculadora de IMC")).toBeInTheDocument();

    // Simulo el click en el boton empezar
    fireEvent.click(screen.getByText("Empezar"));

    // Verifico que ya no se encuentre el modal abierto
    expect(screen.queryByText("Bienvenido a ElRejunte · Calculadora de IMC")).not.toBeInTheDocument();
  });
});
