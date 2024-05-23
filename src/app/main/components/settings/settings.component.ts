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
  settingTypes = Object.values(SettingsType);

  mapDefaultSize$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_MAP_SETTINGS]?.defaultZoom ?? 10),
  );

  constructor(
    private settingsService: SettingsService) {
  }

  changeMapDefaultSize(event: any) {
    console.log("changeMapDefaultSize", event, event.target.value);
    this.settingsService.setMapSettings({
      ...this.settingsService.getMapSettings(),
      defaultZoom: event.target.value
    })
  }
}
