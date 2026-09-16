// Mismo contrato que src/common/api-response.ts del backend.
// Se repite acá a propósito (no hay build compartido entre los dos
// proyectos todavía) pero es la ÚNICA definición del lado del front:
// todo el resto del código Angular importa este tipo, nunca redefine
// la forma de la respuesta.
export interface ApiSuccess<T> {
  ok: true;
  data: T;
}
export interface ApiError {
  ok: false;
  error: string;
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
