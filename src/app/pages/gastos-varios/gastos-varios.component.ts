import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GastosService } from '../../core/gastos.service';
import { ParametrosService } from '../../core/parametros.service';
import { Impuesto } from '../../core/models/parametros.model';

const CLASIFICACIONES = [
  { valor: 'Gastos de Oficina', label: '📂 Gastos de oficina' },
  { valor: 'Sueldos', label: '👥 Sueldos' },
  { valor: 'Otros', label: '⚙️ Otros' },
];

const FORMAS_PAGO = [
  'Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta de débito',
  'Tarjeta de crédito', 'Cheque físico', 'Cheque diferido',
];

@Component({
  selector: 'app-gastos-varios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gastos-varios.component.html',
  styleUrl: './gastos-varios.component.css'
})
export class GastosVariosComponent implements OnInit {
  clasificaciones = CLASIFICACIONES;
  formasPago = FORMAS_PAGO;

  cargando = true;
  nombre = '';
  tipo = CLASIFICACIONES[0].valor;
  nroComprobante = '';
  descripcion = '';
  formaPago = FORMAS_PAGO[0];

  // --- Desglose de importes e impuestos ---
  neto = 0;
  noGravado = 0;
  impuestosDisponibles: Array<Impuesto & { id: number }> = [];
  impuestosValores: Record<number, number> = {};

  guardando = false;
  mensaje: { tipo: 'ok' | 'error'; texto: string } | null = null;

  constructor(
    private gastosService: GastosService,
    private parametrosService: ParametrosService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const listaImpuestos = await this.parametrosService.getImpuestos();
      
      // Filtramos y normalizamos la alícuota/porcentaje igual que en compras
      this.impuestosDisponibles = listaImpuestos
        .filter((i): i is Impuesto & { id: number } => i.activo === true && i.enGastos === true && typeof i.id === 'number')
        .map(i => {
          const alic = i.alicuota ?? 0;
          return {
            ...i,
            id: i.id as number,
            porcentaje: i.porcentaje ?? (alic > 1 ? alic : alic * 100)
          };
        });

      this.impuestosDisponibles.forEach(imp => {
        this.impuestosValores[imp.id] = 0;
      });
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudieron cargar los impuestos: ' + (e as Error).message);
    } finally {
      this.cargando = false;
    }
  }

  private mostrarMensaje(tipo: 'ok' | 'error', texto: string): void {
    this.mensaje = { tipo, texto };
    setTimeout(() => (this.mensaje = null), 4000);
  }

  get totalImpuestosDinamicos(): number {
    return Object.values(this.impuestosValores).reduce((acc, val) => acc + (Number(val) || 0), 0);
  }

  get totalGasto(): number {
    const total = Number(this.neto) + Number(this.noGravado) + this.totalImpuestosDinamicos;
    return Math.round(total * 100) / 100;
  }

  async guardarGasto(): Promise<void> {
    const nombre = this.nombre.trim();
    if (!nombre) {
      this.mostrarMensaje('error', 'Ingresá el título o nombre del gasto.');
      return;
    }

    if (this.totalGasto <= 0) {
      this.mostrarMensaje('error', 'El importe total del gasto debe ser mayor a 0.');
      return;
    }
    

    this.guardando = true;
    try {
      const impuestosAplicados = Object.entries(this.impuestosValores)
        .filter(([_, monto]) => Number(monto) > 0)
        .map(([impuestoId, monto]) => ({ impuestoId: Number(impuestoId), monto: Number(monto) }));

      const payload: any = {
        nombreCorto: nombre,
        tipo: this.tipo,
        importe: this.totalGasto,
        neto: Number(this.neto) || 0,
        noGravado: Number(this.noGravado) || 0,
        iva: 0,
        iibb: 0,
        impuestos: impuestosAplicados,
        nroComprobante: this.nroComprobante.trim() || undefined,
        descripcion: this.descripcion.trim() || undefined,
        formaPago: this.formaPago,
      };

      const res = await this.gastosService.registrar(payload);
      this.mostrarMensaje('ok', 'Gasto registrado con éxito. ID: ' + res.id);
      this.limpiarForm();
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo registrar el gasto: ' + (e as Error).message);
    } finally {
      this.guardando = false;
    }
  }
onNetoChange(): void {
    const netoVal = Number(this.neto) || 0;
    const nuevosValores: Record<number, number> = {};
    
    this.impuestosDisponibles.forEach(imp => {
      const porcentaje = imp.porcentaje ?? 0;
      nuevosValores[imp.id] = Math.round(netoVal * (porcentaje / 100) * 100) / 100;
    });

    this.impuestosValores = nuevosValores;
  }
  private limpiarForm(): void {
    this.nombre = '';
    this.nroComprobante = '';
    this.neto = 0;
    this.noGravado = 0;
    this.descripcion = '';
    this.tipo = CLASIFICACIONES[0].valor;
    this.formaPago = FORMAS_PAGO[0];
    Object.keys(this.impuestosValores).forEach(id => (this.impuestosValores[Number(id)] = 0));
  }
}