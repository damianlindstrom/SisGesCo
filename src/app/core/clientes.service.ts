import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cliente } from './models/reportes.model';

interface ApiResponse<T> {
  status: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  async listar(soloActivos: boolean = false): Promise<Cliente[]> {
    const params = new HttpParams().set('soloActivos', soloActivos.toString());
    const res = await firstValueFrom(this.http.get<ApiResponse<Cliente[]> | Cliente[]>(this.apiUrl, { params }));
    return Array.isArray(res) ? res : res.data;
  }

  async crear(datos: { nombre: string; dniCuit?: string; categoriaId: number; cuentaCorriente?: boolean; activo?: boolean }): Promise<Cliente> {
    const res = await firstValueFrom(this.http.post<ApiResponse<Cliente> | Cliente>(this.apiUrl, datos));
    return 'data' in res ? res.data : res;
  }

  async actualizar(id: number, datos: Partial<Cliente>): Promise<Cliente> {
    const res = await firstValueFrom(this.http.put<ApiResponse<Cliente> | Cliente>(`${this.apiUrl}/${id}`, datos));
    return 'data' in res ? res.data : res;
  }

  async listarCategorias(): Promise<Array<{ id: number; nombre: string }>> {
    const res = await firstValueFrom(this.http.get<ApiResponse<Array<{ id: number; nombre: string }>> | Array<{ id: number; nombre: string }>>(`${environment.apiUrl}/categorias-cliente`));
    return Array.isArray(res) ? res : res.data;
  }
}