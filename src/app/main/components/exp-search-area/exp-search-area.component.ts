import {Component, EventEmitter, Input, Output} from '@angular/core';
import {QueryPart, QueryPartType, SubqueryType} from './models/query-part';
import {GraphicalContentPart} from '../../models/graphical-content-part';
import ObjectQuery from '../../models/object-query';
import GraphicalToJsonQueryTransformer from '../../utils/transformers/graphical-to-json-query-transformer';
import {map} from 'rxjs/operators';
import {SettingsService} from '../../services/settings.service';

export enum ExpSearchAreaMode {
  TEXT = 'text',
  GRAPHICAL = 'graphical'
}

@Component({
  selector: 'exp-search-area',
  templateUrl: './exp-search-area.component.html',
  styleUrls: ['./exp-search-area.component.scss']
})
export class ExpSearchAreaComponent {
  @Input() searchValue: string = '';
  @Output() searchValueChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onSearch: EventEmitter<string> = new EventEmitter<string>();
  @Output() onSearchObject: EventEmitter<ObjectQuery[]> = new EventEmitter<ObjectQuery[]>();

  searchAreaMode$ = this.settingsService.settings$.pipe(
    map((settings) => settings.searchAreaMode ?? ExpSearchAreaMode.GRAPHICAL),
  );
  graphical_content: GraphicalContentPart[] = [
    {
      queryParts: [
        {
          query_type: QueryPartType.objects,
          query: "car",
          subqueries: [
            {
              query_type: SubqueryType.score,
              query: "0.6 - 0.9"
            },
            {
              query_type: SubqueryType.position,
              query: "Bottom Left"
            }
          ]
        }
      ],
    }
  ]

  constructor(
    private settingsService: SettingsService
  ) {
  }

  onSearchChange(): void {
    switch (this.settingsService.settings$.getValue().searchAreaMode) {
      case ExpSearchAreaMode.TEXT:
        this.onSearch.emit(this.searchValue);
        break;
      case ExpSearchAreaMode.GRAPHICAL:
        this.onSearchObject.emit(GraphicalToJsonQueryTransformer.transformGraphicalArrayToJson(this.graphical_content));
        break;
    }
  }

  clickOnReset(): void {
    this.searchValue = "";
    this.searchValueChange.emit(this.searchValue);
  }

  protected readonly ExpSearchAreaMode = ExpSearchAreaMode;
}
