import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideToastr({
      closeButton: true,
      positionClass: 'toast-top-center',
      progressBar: true,
      timeOut: 5000
    }),
    importProvidersFrom(MatDialogModule)
  ]
};
