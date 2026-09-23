import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { MovimientoGeneral, ReporteImpositivo, ResultadoPeriodo } from './models/reportes.model';

interface ApiResponse<T> {
  status: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  async reporteImpositivo(impuestoId: number, desde: string, hasta: string): Promise<ReporteImpositivo> {
    const params = new HttpParams()
      .set('impuestoId', impuestoId.toString())
      .set('desde', desde)
      .set('hasta', hasta);
    const res = await firstValueFrom(this.http.get<ApiResponse<ReporteImpositivo>>(`${this.apiUrl}/impositivo`, { params }));
    return res.data;
  }

  async resultadoPeriodo(desde: string, hasta: string): Promise<ResultadoPeriodo> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    const res = await firstValueFrom(this.http.get<ApiResponse<ResultadoPeriodo>>(`${this.apiUrl}/resultado-periodo`, { params }));
    return res.data;
  }

  async resumenFormaPago(formaPagoId: number | string, desde: string, hasta: string): Promise<any> {
    const params = new HttpParams()
      .set('formaPagoId', formaPagoId.toString())
      .set('desde', desde)
      .set('hasta', hasta);
    const res = await firstValueFrom(this.http.get<ApiResponse<any>>(`${this.apiUrl}/resumen-forma-pago`, { params }));
    return res.data;
  }

  async movimientos(desde: string, hasta: string, modulo?: string): Promise<MovimientoGeneral[]> {
    let params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    if (modulo && modulo !== 'TODOS') {
      params = params.set('modulo', modulo);
    }

    const res = await firstValueFrom(this.http.get<ApiResponse<MovimientoGeneral[]>>(`${this.apiUrl}/movimientos`, { params }));
    return res.data;
  }
}