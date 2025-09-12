import { Users, Calendar, University } from "lucide-react";

function Footer() {
  const integrantes = [
    "Enría Elian",
    "Falco Gonzalo", 
    "Goti Franco",
    "Gregorutti Matías",
    "Guridi Ignacio",
    "Host Efraín",
    "Magnano Nicolás",
    "Piermarini Matías"
  ];

  return (
    <footer className="mt-16 border-t bg-gradient-to-r from-background via-background to-background/80 backdrop-blur">
      <div className="container py-12">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Equipo de Desarrollo</h3>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Desarrollado con dedicación por estudiantes de Ingeniería en Sistemas
          </p>
        </div>

        {/* Integrantes Grid */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-10">
          {integrantes.map((nombre, index) => (
            <div 
              key={index} 
              className="group p-4 rounded-lg bg-card/50 border border-border/50 hover:bg-card hover:border-border transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center text-xs font-semibold text-primary group-hover:scale-110 transition-transform">
                  {nombre.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {nombre}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Project Info */}
        <div className="border-t border-border/50 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <University className="h-4 w-4" />
                <span>UTN Villa María</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>2025</span>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="font-medium text-foreground">Calculadora de IMC</p>
              <p className="text-xs">Proyecto Ingeniería en Sistemas</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;


