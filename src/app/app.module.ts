import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WebcamModule } from 'ngx-webcam';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../environments/environment';
import { AuthenticationType } from 'azure-maps-control';
import { AzureMapsModule } from 'ng-azure-maps';
import * as atlas from 'azure-maps-control';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    WebcamModule,
    FormsModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatCardModule,
    AzureMapsModule.forRoot({
      
      authOptions: {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey: 'KXPqsdAHCRZM14LM1Y-Fp863ozf9tS6R4xwMAIRHtIk'
      }
    })
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
