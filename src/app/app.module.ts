import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSliderModule } from '@angular/material/slider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ApiModule,Configuration } from 'openapi/dres';
import { GlobalConstants } from './global-constants';
import { HttpClientModule } from '@angular/common/http';
import { VBSServerConnectionService } from './main/services/vbsserver-connection.service';

import { QueryComponent } from './main/components/query/query.component';
import { InfoComponent } from './main/components/info/info.component';
import { QueryHelpDialogComponent } from './main/dialogs/query-help-dialog/query-help-dialog.component';
import {
  ExplDialogsComponentsModule
} from './features/expl-dialogs/expl-dialogs-components/expl-dialogs-components.module';
import {CalendarComponent} from './main/components/calendar/calendar.component';
import { SearchComponent } from './main/components/search/search.component';
import { ExpSearchAreaComponent } from './main/components/exp-search-area/exp-search-area.component';
import {NgOptimizedImage} from '@angular/common';
import { QueryTypeSelectionComponent } from './main/components/exp-search-area/elements/query-type-selection/query-type-selection.component';
import { ExpPopupComponent } from './main/components/utility-components/popups/exp-popup/exp-popup.component';
import { QueryPartElementComponent } from './main/components/exp-search-area/elements/query-part-element/query-part-element.component';
import { GraphicalQueryElementComponent } from './main/components/exp-search-area/elements/graphical-query-element/graphical-query-element.component';
import { GraphicalSearchAreaComponent } from './main/components/exp-search-area/search-areas/graphical-search-area/graphical-search-area.component';
import { QueryPartPresenterElementComponent } from './main/components/exp-search-area/elements/query-part-presenter-element/query-part-presenter-element.component';
import { SubqueryPresenterElementComponent } from './main/components/exp-search-area/elements/subquery-presenter-element/subquery-presenter-element.component';
import { SubqueryElementComponent } from './main/components/exp-search-area/elements/subquery-element/subquery-element.component';


@NgModule({
  declarations: [
    AppComponent,
    QueryComponent,
    CalendarComponent,
    InfoComponent,
    QueryHelpDialogComponent,
    SearchComponent,
    ExpSearchAreaComponent,
    QueryTypeSelectionComponent,
    ExpPopupComponent,
    QueryPartElementComponent,
    GraphicalQueryElementComponent,
    GraphicalSearchAreaComponent,
    QueryPartPresenterElementComponent,
    SubqueryPresenterElementComponent,
    SubqueryElementComponent
  ],
  imports: [
    BrowserModule,
    ApiModule.forRoot(() => {
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
    ExplDialogsComponentsModule,
    NgOptimizedImage,
    ReactiveFormsModule
  ],
  providers: [VBSServerConnectionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
