import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {QueryPart, QueryPartType, SubqueryType} from './models/query-part';
import {GraphicalContentPart} from '../../models/graphical-content-part';
import ObjectQuery from '../../models/object-query';
import GraphicalToJsonQueryTransformer from '../../utils/transformers/graphical-to-json-query-transformer';
import {map, skip} from 'rxjs/operators';
import {SettingsService} from '../../services/settings.service';
import JsonToGraphicalQueryTransformer from '../../utils/transformers/json-to-graphical-query-transformer';
import {filter, Subject, takeUntil} from 'rxjs';
import {ResultPresenterService} from '../../services/result-presenter.service';

export enum ExpSearchAreaMode {
  TEXT = 'text',
  GRAPHICAL = 'graphical'
}

@Component({
  selector: 'exp-search-area',
  templateUrl: './exp-search-area.component.html',
  styleUrls: ['./exp-search-area.component.scss']
})
export class ExpSearchAreaComponent implements OnInit, OnDestroy {
  @Input() searchValue: string = '';
  @Output() searchValueChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onSearch: EventEmitter<string> = new EventEmitter<string>();
  @Output() onSearchObject: EventEmitter<ObjectQuery[]> = new EventEmitter<ObjectQuery[]>();

  @ViewChild('textInput') textInput: any;
  @ViewChild('searchButton') searchButton: any;

  destroy$ = new Subject();
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
    private settingsService: SettingsService,
    public resultPresenterService: ResultPresenterService
  ) {
  }

  ngOnInit() {
    this.resultPresenterService.resetQuery$.pipe(
      filter(val => val),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.searchValue = '';
    });

    this.resultPresenterService.focusQuery$.pipe(
      skip(1),
      takeUntil(this.destroy$)
    ).subscribe((val) => {
      if (val) {
        this.textInput.nativeElement.focus();
        return;
      }
      this.searchButton.nativeElement.focus();
    });

    this.resultPresenterService.selectQuery$.pipe(
      filter(val => val),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.textInput.nativeElement.select();
    });
  }

  ngOnDestroy() {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }

  onSearchChange(): void {
    switch (this.settingsService.settings$.getValue().searchAreaMode) {
      case ExpSearchAreaMode.TEXT:
        this.onSearch.emit(this.searchValue);
        this.resultPresenterService.focusQuery$.next(false);
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
    this.resultPresenterService.showHistory$.next(!this.resultPresenterService.showHistory$.value);
  }

  openTuning(): void {
    this.resultPresenterService.showTuning$.next(!this.resultPresenterService.showTuning$.value);
  }

  showHelp() {
    this.resultPresenterService.showHelp$.next(!this.resultPresenterService.showHelp$.value);
  }

  clickOnHistoryItem(item: any): void {
    console.log('clickOnHistoryItem', item);
    console.log("searchvalue", this.searchValue);
    if (item.query_dicts && item.query_dicts.length > 0) {
      this.settingsService.setSettings({
        ...this.settingsService.settings$.getValue() ?? {},
        searchAreaMode: ExpSearchAreaMode.GRAPHICAL
      })
      this.settingsService.saveQuerySettings({
        l2dist: item.l2dist,
        firstPerDay: item.firstPerDay,
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
    this.resultPresenterService.showHistory$.next(!this.resultPresenterService.showHistory$.value);
    this.onSearchChange();
  }

  protected readonly ExpSearchAreaMode = ExpSearchAreaMode;

  focusOutTextInput(event: any) {
    console.log("focusOutTextInput", event);
    this.resultPresenterService.focusQuery$.next(false);
  }

  focusInTextInput(event: any) {
    console.log("focusInTextInput", event);
    if (!this.resultPresenterService.focusQuery$.value) {
      this.resultPresenterService.focusQuery$.next(true);
    }
  }
}
