import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampoFormulario } from '../models/campo-formulario.model';

/**
 * Modal de alta rápida 100% genérico: no conoce "cliente" ni "proveedor",
 * solo dibuja los `campos` que le pasen y emite los valores cargados.
 * Quien lo usa (VentasComponent para Cliente, ComprasComponent para
 * Proveedor) es responsable de mapear esos valores al service correcto.
 */
@Component({
  selector: 'app-alta-rapida-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alta-rapida-modal.component.html',
  styleUrl: './alta-rapida-modal.component.css'
})
export class AltaRapidaModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() titulo = 'Nuevo registro';
  @Input() campos: CampoFormulario[] = [];
  @Input() guardando = false;
  /** Si se pasa, el modal arranca precargado (modo edición) en vez de en blanco. */
  @Input() valoresIniciales: Record<string, string | number> | null = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<Record<string, string>>();

  valores: Record<string, string> = {};

  ngOnChanges(changes: SimpleChanges): void {
  const acabaDeAbrirse = changes['visible']?.currentValue === true && !changes['visible']?.previousValue;
  const cambiaronIniciales = !!changes['valoresIniciales'] && 
    changes['valoresIniciales'].currentValue !== changes['valoresIniciales'].previousValue;

  if (acabaDeAbrirse || cambiaronIniciales) {
    if (this.valoresIniciales) {
      this.valores = Object.fromEntries(
        this.campos.map((c) => [c.key, String(this.valoresIniciales?.[c.key] ?? '')])
      );
    } else {
      this.valores = Object.fromEntries(this.campos.map((c) => [c.key, '']));
    }
  }
}

get esValido(): boolean {
  return this.campos
    .filter(c => c.requerido)
    .every(c => {
      const valor = this.valores[c.key];
      return valor !== null && valor !== undefined && String(valor).trim() !== '';
    });
}

  onGuardar(): void {
    if (!this.esValido || this.guardando) return;
    this.guardar.emit(this.valores);
  }

  onCerrar(): void {
    this.cerrar.emit();
  }
}
