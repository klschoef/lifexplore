import { Component } from '@angular/core';
import {SettingsService} from '../../services/settings.service';
import {map} from 'rxjs/operators';
import {tap} from 'rxjs';

enum SettingsType {
  General = 'General',
  DRES = 'DRES',
  Server = 'Server',
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  HTMLSettingsType = SettingsType;
  currentSettingsType = this.HTMLSettingsType.General;
  settingTypes = [SettingsType.General];

  mapDefaultSize$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_MAP_SETTINGS]?.defaultZoom ?? 10),
  );

  filterQueryWidth$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_MISC_SETTINGS]?.filterQueryWidth ?? 300),
  );

  showTaskInfo$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_MISC_SETTINGS]?.showTaskInfo ?? true),
  );

  logToDRES$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_MISC_SETTINGS]?.logToDRES?? true),
  );

  constructor(
    private settingsService: SettingsService) {
  }

  changeMapDefaultSize(event: any) {
    this.settingsService.setMapSettings({
      ...this.settingsService.getMapSettings(),
      defaultZoom: event.target.value
    })
  }

  changeFilterQueryWidth(event: any) {
    this.settingsService.addToSettingsEntry({
      filterQueryWidth: event.target.value
    }, SettingsService.LOCAL_MISC_SETTINGS);
  }

  changeShowTaskInfo(event: any) {
    this.settingsService.addToSettingsEntry({
      showTaskInfo: event.target.checked
    }, SettingsService.LOCAL_MISC_SETTINGS);
  }

  changeLogToDRES(event: any) {
    this.settingsService.addToSettingsEntry({
      logToDRES: event.target.checked
    }, SettingsService.LOCAL_MISC_SETTINGS);
  }
}
