import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Proveedor } from './models/reportes.model';

interface ApiResponse<T> {
  status: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private apiUrl = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) {}

  async listar(soloActivos: boolean = false): Promise<Proveedor[]> {
    const params = new HttpParams().set('soloActivos', soloActivos.toString());
    const res = await firstValueFrom(this.http.get<ApiResponse<Proveedor[]> | Proveedor[]>(this.apiUrl, { params }));
    return Array.isArray(res) ? res : res.data;
  }

  async crear(datos: { nombre: string; cuit?: string; categoria?: string; activo?: boolean }): Promise<Proveedor> {
    const res = await firstValueFrom(this.http.post<ApiResponse<Proveedor> | Proveedor>(this.apiUrl, datos));
    return 'data' in res ? res.data : res;
  }

  async actualizar(id: number, datos: Partial<Proveedor>): Promise<Proveedor> {
    const res = await firstValueFrom(this.http.put<ApiResponse<Proveedor> | Proveedor>(`${this.apiUrl}/${id}`, datos));
    return 'data' in res ? res.data : res;
  }
}