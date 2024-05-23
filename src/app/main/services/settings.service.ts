import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ExpSearchAreaMode} from '../components/exp-search-area/exp-search-area.component';
import {
  SearchResultMode
} from '../components/settings/components/settings-view-results-mode/settings-view-results-mode.component';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  static LOCAL_STORAGE_SETTINGS = 'settings';
  static LOCAL_QUERY_SETTINGS = 'querySettings';
  static LOCAL_MAP_SETTINGS = 'mapSettings';
  settings$ = new BehaviorSubject<any>({});

  constructor() {
    this.loadSettings();
  }

  setSettings(settings: any) {
    this.settings$.next(settings);
    this.saveSettings();
  }

  saveSettings() {
    localStorage.setItem(SettingsService.LOCAL_STORAGE_SETTINGS, JSON.stringify(this.settings$.value));
  }

  deleteSettings() {
    localStorage.removeItem(SettingsService.LOCAL_STORAGE_SETTINGS);
    this.settings$.next({});
  }

  loadSettings() {
    this.settings$.next(JSON.parse(localStorage.getItem(SettingsService.LOCAL_STORAGE_SETTINGS) ?? "{}"))
  }

  getQuerySettings() {
    return this.settings$.getValue()[SettingsService.LOCAL_QUERY_SETTINGS];
  }

  saveQuerySettings(querySettings: any) {
    this.setSettings({
      ...this.settings$.getValue(),
      querySettings: querySettings
    });
  }

  setSearchAreaMode(mode: ExpSearchAreaMode) {
    this.setSettings({
      ...this.settings$.getValue() ?? {},
      searchAreaMode: mode
    })
  }

  getSearchAreaMode() {
    return this.settings$.getValue().searchAreaMode;
  }

  setResultMode(mode: SearchResultMode) {
    this.setSettings({
      ...this.settings$.getValue() ?? {},
      searchResultMode: mode
    })
  }

  getResultMode() {
    return this.settings$.getValue().searchResultMode;
  }

  getMapSettings() {
    return this.settings$.getValue().mapSettings;
  }

  setMapSettings(mapSettings: any) {
    this.setSettings({
      ...this.settings$.getValue() ?? {},
      mapSettings: mapSettings
    })
  }
}
