import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";
import { HeartPulse, Ruler, Weight, TrendingUp, X } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <div className="relative">
          <div className="h-20 w-full bg-gradient-to-r from-violet-600/80 to-purple-500/80" />
          <DialogClose asChild>
            <button aria-label="Cerrar" className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-black/30 text-white hover:bg-black/40">
              <X size={16} />
            </button>
          </DialogClose>
          <div className="absolute inset-x-0 -bottom-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background shadow ring-4 ring-background">
              <HeartPulse className="text-violet-400" />
            </div>
          </div>
        </div>

        <div className="px-6 pt-12 pb-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Bienvenido a ElRejunte · Calculadora de IMC</DialogTitle>
            <DialogDescription className="text-center">
              Calcula tu Índice de Masa Corporal con una visual simple y clara. Conoce tu categoría y sigue tu progreso.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-md border bg-card/40 p-3">
              <Ruler className="h-4 w-4 text-violet-400" />
              <span className="text-sm">Altura en metros</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border bg-card/40 p-3">
              <Weight className="h-4 w-4 text-purple-400" />
              <span className="text-sm">Peso en kg</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border bg-card/40 p-3">
              <TrendingUp className="h-4 w-4 text-violet-300" />
              <span className="text-sm">Resultado inmediato</span>
            </div>
          </div>

          <div className="mt-4 rounded-md bg-accent/10 p-4 text-sm text-accent-foreground/90">
            Ingresa altura (ej. 1.75) y peso (ej. 70). Luego presiona "Calcular".
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:opacity-90">Empezar</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WelcomeModal;


