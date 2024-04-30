import {Component, EventEmitter, Input, Output} from '@angular/core';
import {QueryPart, QueryPartType, SubqueryType} from './models/query-part';
import {GraphicalContentPart} from '../../models/graphical-content-part';
import ObjectQuery from '../../models/object-query';
import GraphicalToJsonQueryTransformer from '../../utils/transformers/graphical-to-json-query-transformer';
import {map} from 'rxjs/operators';
import {SettingsService} from '../../services/settings.service';
import JsonToGraphicalQueryTransformer from '../../utils/transformers/json-to-graphical-query-transformer';

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

  showHelpActive: boolean = false;
  showHistoryActive: boolean = false;
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
          ]
        }
      ],
    },
    {
      queryParts: [
        {
          query_type: QueryPartType.objects,
          query: "person",
          subqueries: [
          ]
        }
      ]
    },
    {
      queryParts: [
        {
          query_type: QueryPartType.heart_rate,
          query: "200+",
          subqueries: [
          ]
        }
      ]
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
        console.log("this.graphical_content", this.graphical_content);
        this.onSearchObject.emit(GraphicalToJsonQueryTransformer.transformGraphicalArrayToJson(this.graphical_content));
        break;
    }
  }

  clickOnReset(): void {
    this.searchValue = "";
    this.searchValueChange.emit(this.searchValue);
  }

  openHistory(): void {
    console.log('open history');
    this.showHistoryActive = !this.showHistoryActive;
  }

  showHelp() {
    this.showHelpActive = !this.showHelpActive;
  }

  clickOnHistoryItem(item: any): void {
    console.log('clickOnHistoryItem', item);
    console.log("searchvalue", this.searchValue);
    if (item.query_dicts && item.query_dicts.length > 0) {
      this.settingsService.setSettings({
        ...this.settingsService.settings$.getValue() ?? {},
        searchAreaMode: ExpSearchAreaMode.GRAPHICAL
      })
      this.graphical_content = JsonToGraphicalQueryTransformer.transformJsonArrayToGraphical(item.query_dicts);
    } else {
      console.log("no query dicts", item)
      this.settingsService.setSettings({
        ...this.settingsService.settings$.getValue() ?? {},
        searchAreaMode: ExpSearchAreaMode.TEXT
      })
      this.searchValue = item.query;
      this.searchValueChange.emit(this.searchValue);
    }
    this.showHistoryActive = false;
    //this.onSearchChange();
  }

  protected readonly ExpSearchAreaMode = ExpSearchAreaMode;
}
