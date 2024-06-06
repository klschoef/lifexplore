import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BehaviorSubject, tap} from 'rxjs';
import {QueryPart, QueryPartType, SubqueryType} from '../../models/query-part';
import {GraphicalContentPart} from '../../../../models/graphical-content-part';
import {SettingsService} from '../../../../services/settings.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'graphical-query-element',
  templateUrl: './graphical-query-element.component.html',
  styleUrls: ['./graphical-query-element.component.scss']
})
export class GraphicalQueryElementComponent {
  @Input() graphicalContentPart!: GraphicalContentPart;
  @Input() canMoveForward: boolean = true;
  @Input() canMoveBackward: boolean = true;

  @Output() onMoveForward: EventEmitter<GraphicalContentPart> = new EventEmitter();
  @Output() onMoveBackward: EventEmitter<GraphicalContentPart> = new EventEmitter();
  @Output() onDelete: EventEmitter<GraphicalContentPart> = new EventEmitter();

  filterQueryWidth$ = this.settingsService.settings$.pipe(
    tap((settings) => console.log("settings before", settings)),
    map((settings) => settings[SettingsService.LOCAL_MISC_SETTINGS]?.filterQueryWidth ?? 300),
    tap((settings) => console.log("width after", settings))
  );

  constructor(
    public settingsService: SettingsService
  ) {
  }

  clickDelete() {
    this.onDelete.emit(this.graphicalContentPart);
  }

  clickMoveForward() {
    if (this.canMoveForward) {
      this.onMoveForward.emit(this.graphicalContentPart);
    }
  }

  clickMoveBackward() {
    if (this.canMoveBackward) {
      this.onMoveBackward.emit(this.graphicalContentPart);
    }
  }

  addQueryPart() {
    this.graphicalContentPart?.queryParts.push({
      query_type: QueryPartType.address,
      open_selection: true
    });
  }

  deleteQueryPart(queryPart: QueryPart) {
    this.graphicalContentPart.queryParts = this.graphicalContentPart?.queryParts.filter(qp => qp !== queryPart);
  }
}
