import {Component, EventEmitter, Output} from '@angular/core';
import {SettingsService} from '../../services/settings.service';
import {map} from 'rxjs/operators';
import {filter} from 'rxjs';
import {ShortcutService} from '../../services/shortcut.service';

enum TuningL2Type {
  NONE = 'None',
  LESS = 'Less Duplicates',
  DISTINCTIVE = 'Distinctive Images',
  CUSTOM = 'Custom',
}

@Component({
  selector: 'lx-tuning-dialog',
  templateUrl: './tuning-dialog.component.html',
  styleUrls: ['./tuning-dialog.component.scss']
})
export class TuningDialogComponent {
  @Output() clickOnClose: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  public readonly L2_DIST_LESS = 10;
  public readonly L2_DIST_DISTINCTIVE = 15;

  L2Type = TuningL2Type;
  //currentL2Type = this.L2Type.NONE;
  l2Types = Object.values(this.L2Type);
  //customL2Dist?: number;
  l2Dist$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.l2dist),
    filter((l2dist) => l2dist !== undefined),
  );
  firstPerDay$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.firstPerDay),
    filter((l2dist) => l2dist !== undefined),
  );
  temporalPrefetchMode$= this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.temporalPrefetchMode ?? true),
  );
  temporalDBPrefetchPageSize$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.temporalDBPrefetchPageSize ?? 5000)
  );
  pageSize$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.resultsperpage ?? 50),
    filter((res) => res !== undefined),
  );
  dailyPageSize$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.dailyPageSize ?? 2000),
    filter((res) => res !== undefined),
  );
  dailySummaryL2$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.dailySummaryL2 ?? 20),
    filter((res) => res !== undefined),
  );
  similarityPageSize$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.similarityPageSize ?? 2000),
    filter((res) => res !== undefined),
  );
  clipPageSize$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.clipPageSize ?? 5000),
    filter((res) => res !== undefined),
  );
  solrPageSize$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.solrPageSize ?? 5000),
    filter((res) => res !== undefined),
  );
  textCommandPrefix$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.textCommandPrefix ?? '-'),
    filter((res) => res !== undefined),
  );
  currentL2Type$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.l2dist),
    map((l2dist) => {
      let newL2Type = this.L2Type.NONE;

      if (l2dist === this.L2_DIST_LESS) {
        newL2Type = this.L2Type.LESS;
      } else if (l2dist === this.L2_DIST_DISTINCTIVE) {
        newL2Type = this.L2Type.DISTINCTIVE;
      } else if (l2dist !== undefined) {
        newL2Type = this.L2Type.CUSTOM;
      }

      return newL2Type;
    })
  );
  useGPTasDefault$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.useGPTasDefault ?? false),
  );

  constructor(
    private settingsService: SettingsService,
    public shortcutService: ShortcutService,
  ) {
  }

  clickOnDistinctiveType(l2Type: TuningL2Type) {
    //this.currentL2Type = l2Type;

    if (l2Type === TuningL2Type.CUSTOM) {
      return;
    }

    let l2dist = undefined;

    switch (l2Type) {
      case TuningL2Type.LESS:
        l2dist = this.L2_DIST_LESS;
        break;
      case TuningL2Type.DISTINCTIVE:
        l2dist = this.L2_DIST_DISTINCTIVE;
        break;
      case TuningL2Type.NONE:
        l2dist = undefined;
        break;
    }

    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      l2dist: l2dist
    })
  }

  onChangeL2(event: any) {
    //console.log("event", event, event.target.valueAsNumber);
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      l2dist: event.target.valueAsNumber
    })
  }

  onChangeFirstPerDay(event: any) {
    console.log("event onChangeFirstPerDay", event, event.target.checked);
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      firstPerDay: event.target.checked
    })
  }

  onChangePageSize(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      resultsperpage: event.target.valueAsNumber
    })
  }

  onChangeDailyPageSize(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      dailyPageSize: event.target.valueAsNumber
    })
  }

  onChangeDailySummaryL2(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      dailySummaryL2: event.target.valueAsNumber
    })
  }

  onChangeSimilarityPageSize(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      similarityPageSize: event.target.valueAsNumber
    })
  }

  onChangeClipPageSize(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      clipPageSize: event.target.valueAsNumber
    })
  }

  onChangeSolrPageSize(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      solrPageSize: event.target.valueAsNumber
    })
  }

  onChangeUseGPTasDefault(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      useGPTasDefault: event.target.checked
    })
  }

  onChangeTemporalPrefetchMode(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      temporalPrefetchMode: event.target.checked
    })
  }

  onChangeTemporalDBPrefetchPageSize(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      temporalDBPrefetchPageSize: event.target.valueAsNumber
    })
  }

  onChangeTextCommandPrefix(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      textCommandPrefix: event.target.value
    })
  }
}
