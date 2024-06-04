import {Component, EventEmitter, Output} from '@angular/core';
import {SettingsService} from '../../services/settings.service';
import {map} from 'rxjs/operators';
import {filter} from 'rxjs';

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

  constructor(
    private settingsService: SettingsService
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
}
