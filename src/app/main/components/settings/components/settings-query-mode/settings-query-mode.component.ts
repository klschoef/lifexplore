import { Component } from '@angular/core';
import {map} from 'rxjs/operators';
import {SettingsService} from '../../../../services/settings.service';
import {ExpSearchAreaMode} from '../../../exp-search-area/exp-search-area.component';

@Component({
  selector: 'app-settings-query-mode',
  templateUrl: './settings-query-mode.component.html',
  styleUrls: ['./settings-query-mode.component.scss']
})
export class SettingsQueryModeComponent {
  HTMLSearchAreaMode = ExpSearchAreaMode;

  searchAreaMode$ = this.settingsService.settings$.pipe(
    map((settings) => settings.searchAreaMode ?? ExpSearchAreaMode.GRAPHICAL),
  );

  constructor(
    private settingsService: SettingsService
  ) {
  }

  changeResultMode(mode: ExpSearchAreaMode) {
    this.settingsService.setSettings({
      ...this.settingsService.settings$.getValue() ?? {},
      searchAreaMode: mode
    })
  }
}
