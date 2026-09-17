import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from './api-response';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
    return this.desenvolver(
      this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}`, { params })
    );
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.desenvolver(
      this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body)
    );
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    return this.desenvolver(
      this.http.patch<ApiResponse<T>>(`${this.baseUrl}${path}`, body)
    );
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return this.desenvolver(
      this.http.put<ApiResponse<T>>(`${this.baseUrl}${path}`, body)
    );
  }

  async delete<T>(path: string): Promise<T> {
    return this.desenvolver(
      this.http.delete<ApiResponse<T>>(`${this.baseUrl}${path}`)
    );
  }

  private async desenvolver<T>(obs: import('rxjs').Observable<ApiResponse<T>>): Promise<T> {
    const respuesta = await firstValueFrom(obs);
    if (!respuesta.ok) {
      throw new Error(respuesta.error);
    }
    return respuesta.data;
  }
}