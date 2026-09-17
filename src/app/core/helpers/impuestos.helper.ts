import { Impuesto } from "../models/parametros.model";
export function obtenerImpuestosVigentes(
  impuestos: Impuesto[],
  origen: 'enCompras' | 'enVentas' | 'enGastosVarios',
  fechaOperacion: string // YYYY-MM-DD
): Impuesto[] {
  return impuestos.filter(imp => {
    if (!imp.activo || !imp[origen]) return false;
    
    const cumpleDesde = !imp.fechaDesde || imp.fechaDesde <= fechaOperacion;
    const cumpleHasta = !imp.fechaHasta || imp.fechaHasta >= fechaOperacion;
    
    return cumpleDesde && cumpleHasta;
  });
}