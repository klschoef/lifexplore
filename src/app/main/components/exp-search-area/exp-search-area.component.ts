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
import {QueryDefaultModel} from '../../models/query-default-model';
import {QueryType} from '../../../shared/config/global-constants';
import {HistoryEntryToText} from '../../utils/transformers/history-entry-to-text';

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

  HTMLSearchAreaMode = ExpSearchAreaMode;

  queryDefaultModel$ = this.settingsService.settings$.pipe(
    map(() => this.settingsService.getQueryDefaultModel())
  );

  destroy$ = new Subject();
  searchAreaMode$ = this.settingsService.settings$.pipe(
    map((settings) => settings.searchAreaMode ?? ExpSearchAreaMode.GRAPHICAL),
  );
  graphical_content: GraphicalContentPart[] = [
    {
      queryParts: [
        {
          query_type: this.getDefaultQueryPartType(),
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

  private historyIndex = -1;
  private historySeedValue = '';

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
      //this.searchButton.nativeElement.focus();
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

    this.resultPresenterService.translatedQuery$.pipe(
      filter((value): value is string => !!value),
      takeUntil(this.destroy$)
    ).subscribe((value) => {
      this.searchValue = value;
      this.searchValueChange.emit(value);
    });

    this.shortcutService.isRAndShiftIsPressed.pipe(
      skip(1),
      takeUntil(this.destroy$)
    ).subscribe(isRPressed => {
      if (isRPressed) {
        this.clickOnReset();
      }
    });

    this.shortcutService.isEscapePressed.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isEscapePressed => {
      if (isEscapePressed) {
        this.resultPresenterService.showHelp$.next(false);
        this.resultPresenterService.showHistory$.next(false);
        this.resultPresenterService.showTuning$.next(false);
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
    this.historyIndex = -1;
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

  cycleQueryDefaultModel() {
    this.settingsService.cycleQueryDefaultModel();
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
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      queryDefaultModel: item.queryDefaultModel ?? (item.useGPTasDefault ? QueryDefaultModel.gpt : QueryDefaultModel.clip),
      useGPTasDefault: item.useGPTasDefault ?? false,
      firstPerDay: item.firstPerDay ?? false,
      l2dist: item.l2dist,
    });
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

  onHistoryKeydown(event: KeyboardEvent, textCommandPrefix: string) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      this.historyIndex = -1;
      this.historySeedValue = this.searchValue ?? '';
      return;
    }

    const history = this.getHistorySnapshot();
    if (!history.length) {
      return;
    }

    event.preventDefault();

    if (this.historyIndex === -1) {
      this.historySeedValue = this.searchValue ?? '';
    }

    if (event.key === 'ArrowUp') {
      this.historyIndex = Math.min(this.historyIndex + 1, history.length - 1);
    } else {
      this.historyIndex = this.historyIndex <= 0 ? -1 : this.historyIndex - 1;
    }

    if (this.historyIndex === -1) {
      this.searchValue = this.historySeedValue;
    } else {
      this.searchValue = HistoryEntryToText.transform(history[this.historyIndex], textCommandPrefix);
    }
    this.searchValueChange.emit(this.searchValue);
  }

  private getHistorySnapshot(): QueryType[] {
    const raw = this.historyService.fetch_raw_history_object();
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
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

  changeResultMode(mode: ExpSearchAreaMode) {
    this.settingsService.setSearchAreaMode(mode);
  }

  getQueryDefaultModelLabel(model?: QueryDefaultModel | null): string {
    if (model === QueryDefaultModel.gpt) {
      return 'GPT';
    }
    if (model === QueryDefaultModel.siglip2) {
      return 'SigLIP2';
    }
    return 'CLIP';
  }

  getTextSearchExample(model?: QueryDefaultModel | null): string {
    if (model === QueryDefaultModel.gpt) {
      return 'drinking coffee:3 !sky';
    }
    return 'drinking coffee';
  }

  private getDefaultQueryPartType(): QueryPartType {
    const queryDefaultModel = this.settingsService.getQueryDefaultModel();
    if (queryDefaultModel === QueryDefaultModel.gpt) {
      return QueryPartType.gpt;
    }
    if (queryDefaultModel === QueryDefaultModel.siglip2) {
      return QueryPartType.siglip2;
    }
    return QueryPartType.clip;
  }
}
