// Espejo del ProductoConPrecios que devuelve el backend.
export interface Producto {
  id: number;
  nombre: string;
  rubro: string | null;
  tipo: string | null;
  stock: number;
  costo: number;
  precioRespInsc: number;
  precioConsFinal: number;
  precioCtaCte: number;
}
