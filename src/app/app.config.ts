import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Rutas reales (sin hash): el hosting estático del front resuelve
    // cualquier ruta a index.html (rewrite/SPA fallback), ya no estamos
    // atados a la URL fija de un webapp de Apps Script.
    provideRouter(routes),
    provideHttpClient(),
  ]
};
