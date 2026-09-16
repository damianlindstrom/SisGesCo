import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImpuestosService } from '../../core/impuestos.service';
import { ReportesService } from '../../core/reportes.service';
import { Impuesto } from '../../core/models/impuesto.model';
import { ReporteImpositivo, ResultadoPeriodo } from '../../core/models/reportes.model';

type Pestana = 'impuestos' | 'operativos' | 'personalizados';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  pestana: Pestana = 'impuestos';
  cargando = true;
  mensaje: { tipo: 'ok' | 'error'; texto: string } | null = null;

  // ---------- Impuestos ----------
  impuestos: Impuesto[] = [];
  impuestoSeleccionadoId: number | null = null;
  desdeImpuestos = this.hoyISO();
  hastaImpuestos = this.hoyISO();
  consultandoImpuesto = false;
  reporteImpositivo: ReporteImpositivo | null = null;

  // ---------- Reportes Operativos (resultado del período) ----------
  desdeOperativo = this.primerDiaDelMesISO();
  hastaOperativo = this.hoyISO();
  consultandoOperativo = false;
  resultado: ResultadoPeriodo | null = null;

  constructor(
    private impuestosService: ImpuestosService,
    private reportesService: ReportesService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.impuestos = await this.impuestosService.listar();
      this.impuestoSeleccionadoId = this.impuestos[0]?.id ?? null;
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo cargar el catálogo de impuestos: ' + (e as Error).message);
    } finally {
      this.cargando = false;
    }
  }

  cambiarPestana(p: Pestana): void {
    this.pestana = p;
  }

  private hoyISO(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private primerDiaDelMesISO(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }

  private mostrarMensaje(tipo: 'ok' | 'error', texto: string): void {
    this.mensaje = { tipo, texto };
    setTimeout(() => (this.mensaje = null), 4000);
  }

  // ---------- Impuestos ----------

  async consultarReporte(): Promise<void> {
    if (!this.impuestoSeleccionadoId) return;
    this.consultandoImpuesto = true;
    this.reporteImpositivo = null;
    try {
      this.reporteImpositivo = await this.reportesService.reporteImpositivo(this.impuestoSeleccionadoId, this.desdeImpuestos, this.hastaImpuestos);
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo generar el reporte: ' + (e as Error).message);
    } finally {
      this.consultandoImpuesto = false;
    }
  }

  get totalNetoCalculado(): number {
    if (!this.reporteImpositivo) return 0;
    return this.reporteImpositivo.movimientos.reduce((acc, m) => {
      const esCompra = m.origen === 'COMPRA';
      return acc + (esCompra ? -m.neto : m.neto);
    }, 0);
  }

  get totalImpuestoCalculado(): number {
    if (!this.reporteImpositivo) return 0;
    return this.reporteImpositivo.movimientos.reduce((acc, m) => {
      const esCompra = m.origen === 'COMPRA';
      return acc + (esCompra ? -m.montoImpuesto : m.montoImpuesto);
    }, 0);
  }

  exportarCSVImpositivo(): void {
    if (!this.reporteImpositivo) return;
    const encabezado = ['Fecha', 'Origen', 'Concepto', 'Contraparte', 'Neto', 'Impuesto'];
    const filas = this.reporteImpositivo.movimientos.map((m) => {
      const esCompra = m.origen === 'COMPRA';
      const signo = esCompra ? -1 : 1;
      const fechaFormateada = new Date(m.fecha).toLocaleDateString('es-AR');
      return [
        fechaFormateada,
        m.origen === 'VENTA' ? 'Venta' : 'Compra',
        m.concepto,
        m.contraparte,
        (m.neto * signo).toFixed(2),
        (m.montoImpuesto * signo).toFixed(2),
      ];
    });
    this.descargarCSV(`reporte-${this.reporteImpositivo.impuesto}-${this.desdeImpuestos}-a-${this.hastaImpuestos}.csv`, encabezado, filas);
  }

  // ---------- Reportes Operativos ----------

  async consultarResultado(): Promise<void> {
    this.consultandoOperativo = true;
    this.resultado = null;
    try {
      this.resultado = await this.reportesService.resultadoPeriodo(this.desdeOperativo, this.hastaOperativo);
    } catch (e) {
      this.mostrarMensaje('error', 'No se pudo generar el resultado del período: ' + (e as Error).message);
    } finally {
      this.consultandoOperativo = false;
    }
  }

  exportarCSVResultado(): void {
    if (!this.resultado) return;
    const encabezado = ['Concepto', 'Detalle', 'Monto'];
    const filas: string[][] = [
      ['Ingresos por ventas', '', this.resultado.ventas.total.toFixed(2)],
      ...this.resultado.compras.detalle.map((c) => ['Compra', `${c.tipo} — ${c.proveedor} (${c.nroComprobante ?? ''})`, c.monto.toFixed(2)]),
      ...this.resultado.gastos.detalle.map((g) => ['Gasto vario', `${g.nombreCorto} — ${g.tipo}`, (-g.importe).toFixed(2)]),
      ['Resultado bruto', '', this.resultado.resultadoBruto.toFixed(2)],
      ['CMV', '', (-this.resultado.cmv).toFixed(2)],
      ['Resultado neto', '', this.resultado.resultadoNeto.toFixed(2)],
    ];
    this.descargarCSV(`resultado-periodo-${this.desdeOperativo}-a-${this.hastaOperativo}.csv`, encabezado, filas);
  }

  private descargarCSV(nombreArchivo: string, encabezado: string[], filas: string[][]): void {
    const separador = ';';
    const csv = '\uFEFF' + [encabezado, ...filas].map((f) => f.map((v) => `"${v}"`).join(separador)).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    URL.revokeObjectURL(url);
  }
}