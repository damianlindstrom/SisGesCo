import { Component, OnInit } from '@angular/core';
import { ParametrosService } from '../../core/parametros.service';
import { Impuesto, FormaPago } from '../../core/models/parametros.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parametros',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './parametros.component.html',
  styleUrls: ['./parametros.component.css'],
  
})
export class ParametrosComponent implements OnInit {
  pestanaActiva: 'impuestos' | 'formasPago' = 'impuestos';

  // Impuestos
  impuestos: Impuesto[] = [];
  nuevoImpuesto: Impuesto = {
    nombre: '',
    porcentaje: 0,
    enCompras: true,
    enVentas: false,
    enGastosVarios: true,
    activo: true
  };
  cargandoImpuestos = false;

  // Formas de Pago
  formasPago: FormaPago[] = [];
  nuevaFormaPago: FormaPago = {
    nombre: '',
    descripcion: '',
    activa: true
  };
  cargandoFormasPago = false;

  constructor(private parametrosService: ParametrosService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    await Promise.all([this.cargarImpuestos(), this.cargarFormasPago()]);
  }

  // --- MÉTODOS IMPUESTOS ---
  async cargarImpuestos(): Promise<void> {
    this.cargandoImpuestos = true;
    try {
      this.impuestos = await this.parametrosService.getImpuestos();
    } catch (e) {
      console.error('Error al cargar impuestos', e);
    } finally {
      this.cargandoImpuestos = false;
    }
  }

  async agregarImpuesto(): Promise<void> {
    if (!this.nuevoImpuesto.nombre.trim()) return;
    try {
      const creado = await this.parametrosService.crearImpuesto(this.nuevoImpuesto);
      this.impuestos.push(creado);
      this.resetNuevoImpuesto();
    } catch (e) {
      console.error('Error al agregar impuesto', e);
    }
  }

  async toggleImpuestoCampo(impuesto: Impuesto, campo: 'enCompras' | 'enVentas' | 'enGastosVarios' | 'activo'): Promise<void> {
    impuesto[campo] = !impuesto[campo];
    if (impuesto.id) {
      await this.parametrosService.actualizarImpuesto(impuesto.id, { [campo]: impuesto[campo] });
    }
  }

  async eliminarImpuesto(id?: number | string): Promise<void> {
    if (!id || !confirm('¿Seguro que querés eliminar este impuesto?')) return;
    await this.parametrosService.eliminarImpuesto(id);
    this.impuestos = this.impuestos.filter(i => i.id !== id);
  }

private resetNuevoImpuesto(): void {
  this.nuevoImpuesto = {
    nombre: '',
    porcentaje: 0,
    enCompras: true,
    enVentas: false,
    enGastosVarios: true,
    activo: true,
    fechaDesde: '',
    fechaHasta: ''
  };
}

  // --- MÉTODOS FORMAS DE PAGO ---
  async cargarFormasPago(): Promise<void> {
    this.cargandoFormasPago = true;
    try {
      this.formasPago = await this.parametrosService.getFormasPago();
    } catch (e) {
      console.error('Error al cargar formas de pago', e);
    } finally {
      this.cargandoFormasPago = false;
    }
  }

  async agregarFormaPago(): Promise<void> {
    if (!this.nuevaFormaPago.nombre.trim()) return;
    try {
      const creada = await this.parametrosService.crearFormaPago(this.nuevaFormaPago);
      this.formasPago.push(creada);
      this.nuevaFormaPago = { nombre: '', descripcion: '', activa: true };
    } catch (e) {
      console.error('Error al agregar forma de pago', e);
    }
  }

  async toggleFormaPagoActiva(fp: FormaPago): Promise<void> {
    fp.activa = !fp.activa;
    if (fp.id) {
      await this.parametrosService.actualizarFormaPago(fp.id, { activa: fp.activa });
    }
  }

  async eliminarFormaPago(id?: number | string): Promise<void> {
    if (!id || !confirm('¿Seguro que querés eliminar esta forma de pago?')) return;
    await this.parametrosService.eliminarFormaPago(id);
    this.formasPago = this.formasPago.filter(f => f.id !== id);
  }
}