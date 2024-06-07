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
import {Router} from '@angular/router';
import {HistoryService} from '../../services/history.service';
import {SubmissionLogService} from '../../services/submission-log.service';
import {ShortcutService} from '../../services/shortcut.service';

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

  useGPTasDefault$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.useGPTasDefault ?? false)
  );

  destroy$ = new Subject();
  searchAreaMode$ = this.settingsService.settings$.pipe(
    map((settings) => settings.searchAreaMode ?? ExpSearchAreaMode.GRAPHICAL),
  );
  graphical_content: GraphicalContentPart[] = [
    {
      queryParts: [
        {
          query_type: this.settingsService.settings$.value[SettingsService.LOCAL_QUERY_SETTINGS]?.useGPTasDefault ? QueryPartType.gpt : QueryPartType.clip,
          query: "",
          subqueries: [
          ]
        }
      ],
    }
  ]

  firstPerDay$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.firstPerDay),
    filter((l2dist) => l2dist !== undefined),
  );

  textCommandPrefix$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.textCommandPrefix ?? '-'),
    filter((res) => res !== undefined),
  );

  constructor(
    private settingsService: SettingsService,
    public resultPresenterService: ResultPresenterService,
    private router: Router,
    private historyService: HistoryService,
    private shortcutService: ShortcutService,
    private submissionLogService: SubmissionLogService,
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

    this.resultPresenterService.triggerSearch$.pipe(
        filter(val => val),
        takeUntil(this.destroy$)
        ).subscribe(() => {
          this.onSearchChange();
        });

    this.shortcutService.isRAndShiftIsPressed.pipe(
      skip(1),
      takeUntil(this.destroy$)
    ).subscribe(isRPressed => {
      if (isRPressed) {
        this.clickOnReset();
      }
    });

    this.shortcutService.isXPressed.pipe(
      skip(1),
      takeUntil(this.destroy$)
    ).subscribe(isXPressed => {
      if (isXPressed) {
        this.settingsService.saveQuerySettings({
          ...this.settingsService.getQuerySettings(),
          firstPerDay: !(this.settingsService.getQuerySettings().firstPerDay ?? false)
        })
      }
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
        this.onSearchObject.emit(GraphicalToJsonQueryTransformer.transformGraphicalArrayToJson(this.graphical_content));
        break;
    }
  }

  changeGPTAsDefault() {
    this.settingsService.saveQuerySettings({
      useGPTasDefault: !(this.settingsService.settings$.value[SettingsService.LOCAL_QUERY_SETTINGS]?.useGPTasDefault ?? false)
    });
  }

  clickOnReset(): void {
    //this.historyService.replaceHistory([]);
    this.submissionLogService.clearSubmissionLog();
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      l2dist: undefined
    })
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      firstPerDay: false
    })
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      temporalPrefetchMode: true
    })
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      temporalDBPrefetchPageSize: 5000
    })
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      textCommandPrefix: "-"
    })
    window.location.reload();
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
    this.resultPresenterService.focusQuery$.next(false);
  }

  focusInTextInput(event: any) {
    if (!this.resultPresenterService.focusQuery$.value) {
      this.resultPresenterService.focusQuery$.next(true);
    }
  }

  navigateToSearch(): void {
    if (this.router.url === '/search') {
      window.location.reload();
    } else {
      this.router.navigate(['/search']);
    }
  }

  onChangeFirstPerDay(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      firstPerDay: event.target.checked
    })
  }
}
