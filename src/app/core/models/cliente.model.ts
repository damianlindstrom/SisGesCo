export interface Cliente {
  id: number;
  nombre: string;
  dniCuit: string | null;
  categoriaId: number;
  categoriaNombre: string; // "Resp. Inscripto" | "Consumidor Final" | "Cliente con c/corriente"
}
