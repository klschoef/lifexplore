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
import { GlobalConstants } from './shared/config/global-constants';
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
import { DefaultResultContainerComponent } from './main/components/search/components/results-containers/default-result-container/default-result-container.component';
import { MinimalResultContainerComponent } from './main/components/search/components/results-containers/minimal-result-container/minimal-result-container.component';
import { SettingsComponent } from './main/components/settings/settings.component';
import { SettingsViewResultsModeComponent } from './main/components/settings/components/settings-view-results-mode/settings-view-results-mode.component';
import { SettingsQueryModeComponent } from './main/components/settings/components/settings-query-mode/settings-query-mode.component';
import { ResultDetailComponent } from './main/components/search/components/result-detail/result-detail.component';
import { MapComponent } from './main/components/search/components/map/map.component';
import { SingleResultContainerComponent } from './main/components/search/components/result-detail/containers/single-result-container/single-result-container.component';
import { ExpImageUrlPipe } from './main/pipes/exp-image-url.pipe';
import { DailySummaryContainerComponent } from './main/components/search/components/result-detail/containers/daily-summary-container/daily-summary-container.component';
import { HistoryDialogComponent } from './main/dialogs/history-dialog/history-dialog.component';
import { HistoryEntryPipe } from './main/dialogs/history-dialog/pipes/history-entry.pipe';
import { TuningDialogComponent } from './main/dialogs/tuning-dialog/tuning-dialog.component';
import {HistoryEntryIsGraphicalPipe} from './main/dialogs/history-dialog/pipes/history-entry-is-graphical.pipe';
import { ExpStatusbarComponent } from './main/components/exp-statusbar/exp-statusbar.component';
import { SubmissionPendingPipe } from './main/pipes/submission-pending.pipe';
import { SubmissionResultMarkerComponent } from './main/components/search/components/results-containers/shared/submission-result-marker/submission-result-marker.component';
import { LazyImgDirective } from './main/directives/lazy-img.directive';


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
    SubqueryElementComponent,
    DefaultResultContainerComponent,
    MinimalResultContainerComponent,
    SettingsComponent,
    SettingsViewResultsModeComponent,
    SettingsQueryModeComponent,
    ResultDetailComponent,
    MapComponent,
    SingleResultContainerComponent,
    ExpImageUrlPipe,
    DailySummaryContainerComponent,
    HistoryDialogComponent,
    HistoryEntryPipe,
    HistoryEntryIsGraphicalPipe,
    TuningDialogComponent,
    ExpStatusbarComponent,
    SubmissionPendingPipe,
    SubmissionResultMarkerComponent,
    LazyImgDirective
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
