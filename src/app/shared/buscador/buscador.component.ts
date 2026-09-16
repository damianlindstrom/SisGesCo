import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Buscador con autocompletado genérico. Reemplaza el patrón repetido
 * en el proyecto original (inputComprador+listComprador, inputProducto+
 * listProducto, inputClienteCC+listClienteCC, buscador de proveedor):
 * ahora es un solo componente parametrizado por @Input, usado 4 veces.
 */
@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.css'
})
export class BuscadorComponent<T = any> implements OnChanges {
  /** Lista completa sobre la que se filtra (ya cargada en memoria). */
  @Input() items: T[] = [];
  /** Placeholder del input. */
  @Input() placeholder = 'Buscar...';
  /** Devuelve el texto principal a mostrar de cada opción. */
  @Input() titulo: (item: T) => string = (item) => String(item);
  /** Devuelve el texto secundario (gris, chico) de cada opción. Opcional. */
  @Input() subtitulo?: (item: T) => string;
  /** Cómo se filtra: por defecto, coincidencia parcial contra `titulo`. */
  @Input() filtro?: (item: T, texto: string) => boolean;
  /**
   * Texto a mostrar cuando la selección se hizo por fuera del propio
   * buscador (ej: se creó un cliente nuevo desde el modal de alta y el
   * padre lo setea como seleccionado). Si no se usa, el buscador se
   * comporta igual que antes.
   */
  @Input() valorMostrado?: string;

  @Output() seleccionado = new EventEmitter<T | null>();

  texto = '';
  visible = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['valorMostrado'] && this.valorMostrado !== undefined) {
      this.texto = this.valorMostrado;
    }
  }

  get filtrados(): T[] {
    const q = this.texto.trim().toLowerCase();
    if (!q) return [];
    const filtroFn = this.filtro ?? ((item: T, t: string) => this.titulo(item).toLowerCase().includes(t));
    return this.items.filter((item) => filtroFn(item, q)).slice(0, 20);
  }

onInput(): void {
  this.visible = true;
  if (this.valorMostrado && this.texto !== this.valorMostrado) {
    this.seleccionado.emit(null);
  }
}

  elegir(item: T): void {
    this.texto = this.titulo(item);
    this.visible = false;
    this.seleccionado.emit(item);
  }

  onBlur(): void {
    // Delay para permitir que el click en un ítem del dropdown se registre
    // antes de ocultarlo.
    setTimeout(() => (this.visible = false), 150);
  }

  limpiar(): void {
    this.texto = '';
    this.visible = false;
  }
}
