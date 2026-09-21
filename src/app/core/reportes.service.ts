import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReporteImpositivo, ResultadoPeriodo } from './models/reportes.model';

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
    return await firstValueFrom(this.http.get<ReporteImpositivo>(`${this.apiUrl}/impositivo`, { params }));
  }

  async resultadoPeriodo(desde: string, hasta: string): Promise<ResultadoPeriodo> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    return await firstValueFrom(this.http.get<ResultadoPeriodo>(`${this.apiUrl}/resultado-periodo`, { params }));
  }

  async resumenFormaPago(formaPagoId: number | string, desde: string, hasta: string): Promise<any> {
    const params = new HttpParams()
      .set('formaPagoId', formaPagoId.toString())
      .set('desde', desde)
      .set('hasta', hasta);
    return await firstValueFrom(this.http.get<any>(`${this.apiUrl}/resumen-forma-pago`, { params }));
  }
}