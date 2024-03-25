import { Component } from '@angular/core';

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
}
