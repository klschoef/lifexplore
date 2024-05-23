import { Component } from '@angular/core';
import {SettingsService} from '../../../../services/settings.service';
import {map} from 'rxjs/operators';
import {tap} from 'rxjs';

export enum SearchResultMode {
  DEFAULT = 'default',
  MINIMAL = 'minimal'
}

@Component({
  selector: 'app-settings-view-results-mode',
  templateUrl: './settings-view-results-mode.component.html',
  styleUrls: ['./settings-view-results-mode.component.scss']
})
export class SettingsViewResultsModeComponent {
  HTMLSearchResultMode = SearchResultMode;

  searchResultMode$ = this.settingsService.settings$.pipe(
    map((settings) => settings.searchResultMode ?? SearchResultMode.DEFAULT),
  );

  constructor(
    private settingsService: SettingsService
  ) {
  }

  changeResultMode(resultMode: SearchResultMode) {
    this.settingsService.setSettings({
      ...this.settingsService.settings$.getValue() ?? {},
      searchResultMode: resultMode
    })
  }
}
