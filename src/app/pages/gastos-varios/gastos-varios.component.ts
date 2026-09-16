import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GastosService } from '../../core/gastos.service';

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
export class GastosVariosComponent {
  clasificaciones = CLASIFICACIONES;
  formasPago = FORMAS_PAGO;

  nombre = '';
  tipo = CLASIFICACIONES[0].valor;
  importe: number | null = null;
  descripcion = '';
  formaPago = FORMAS_PAGO[0];

  guardando = false;
  mensaje: { tipo: 'ok' | 'error'; texto: string } | null = null;

  constructor(private gastosService: GastosService) {}

  private mostrarMensaje(tipo: 'ok' | 'error', texto: string): void {
    this.mensaje = { tipo, texto };
    setTimeout(() => (this.mensaje = null), 4000);
  }

  async guardarGasto(): Promise<void> {
    const nombre = this.nombre.trim();
    if (!nombre || !this.importe || this.importe <= 0) {
      this.mostrarMensaje('error', 'Completá el nombre y un importe válido.');
      return;
    }
    this.guardando = true;
    try {
      const res = await this.gastosService.registrar({
        nombreCorto: nombre,
        tipo: this.tipo,
        importe: this.importe,
        descripcion: this.descripcion.trim() || undefined,
        formaPago: this.formaPago,
      });
      this.mostrarMensaje('ok', 'Gasto registrado con éxito. ID: ' + res.id);
      this.limpiarForm();
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo registrar el gasto: ' + (e as Error).message);
    } finally {
      this.guardando = false;
    }
  }

  private limpiarForm(): void {
    this.nombre = '';
    this.importe = null;
    this.descripcion = '';
    this.tipo = CLASIFICACIONES[0].valor;
    this.formaPago = FORMAS_PAGO[0];
  }
}
