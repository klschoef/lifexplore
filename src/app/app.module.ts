import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSliderModule } from '@angular/material/slider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ApiModule,Configuration } from 'openapi/dres';
import { GlobalConstants } from './global-constants';
import { HttpClientModule } from '@angular/common/http';
import { VBSServerConnectionService } from './vbsserver-connection.service';

import { QueryComponent } from './query/query.component';
import { CalendarComponent } from './calendar/calendar.component';
import { InfoComponent } from './info/info.component';
import { QueryHelpDialogComponent } from './features/query-help-dialog/query-help-dialog.component';
import {
  ExplDialogsComponentsModule
} from './features/expl-dialogs/expl-dialogs-components/expl-dialogs-components.module';


@NgModule({
  declarations: [
    AppComponent,
    QueryComponent,
    CalendarComponent,
    InfoComponent,
    QueryHelpDialogComponent
  ],
  imports: [
    BrowserModule,
    ApiModule.forRoot( () => {
      return new Configuration({
        basePath: GlobalConstants.configVBSSERVER
        , withCredentials: true
      });
    }),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatSliderModule,
    MatButtonToggleModule,
    ExplDialogsComponentsModule
  ],
  providers: [VBSServerConnectionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
