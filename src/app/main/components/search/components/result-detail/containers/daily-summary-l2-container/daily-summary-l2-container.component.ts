import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import ObjectQuery from '../../../../../../models/object-query';
import {WSServerStatus} from '../../../../../../../shared/config/global-constants';
import URLUtil from '../../../../../../utils/url-util';
import {PythonServerService} from '../../../../../../services/pythonserver.service';
import {BehaviorSubject, filter, Subject, takeUntil, tap} from 'rxjs';
import {map, skip} from 'rxjs/operators';
import {ShortcutService} from '../../../../../../services/shortcut.service';
import {ResultDetailComponentMode} from '../../result-detail.component';
import {SettingsService} from '../../../../../../services/settings.service';

@Component({
  selector: 'app-daily-summary-l2-container',
  templateUrl: './daily-summary-l2-container.component.html',
  styleUrls: ['./daily-summary-l2-container.component.scss']
})
export class DailySummaryL2ContainerComponent implements OnInit, OnDestroy {
  @Input() result: any;
  @Input() lockEscapeInParent$?: BehaviorSubject<boolean>;
  detailModes = [ResultDetailComponentMode.Single, ResultDetailComponentMode.Similar, ResultDetailComponentMode.Day];
  currentPage = 1;
  totalResults = 0;
  totalPages = 0;
  navigated_date?: Date = undefined;
  ascending = true;
  pages: number[] = [];
  requestId?: string;
  results$ = this.pythonServerService.receivedMessages.pipe(
    filter((msg) => msg && msg.results && msg.results.length > 0 && !msg.type && msg.requestId === this.requestId),
    tap((msg) => {
      this.totalResults = msg.totalresults ?? 0;
      this.totalPages = Math.ceil(this.totalResults / (this.settingsService.settings$.value[SettingsService.LOCAL_QUERY_SETTINGS]?.dailyPageSize ?? 2000));

      // Calculate start and end page numbers
      const startPage = Math.max(this.currentPage - 3, 1);
      const endPage = Math.min(this.currentPage + 3, this.totalPages);

      // Generate the array of page numbers
      this.pages = Array.from({length: (endPage - startPage) + 1}, (_, i) => startPage + i);
    }),
    // add the base URL to the filepath, and return just the results
    map((msg) => msg.results.map((result: any) => ({
      ...result,
      originalFilepath: result.filepath,
      filepath: URLUtil.getKeyframeBaseUrl()+result.filepath,
      thumbsFilepath: URLUtil.getKeyframeThumbsBaseUrl()+result.filepath
    }))),
  );


  previousPageTrigger$ = new BehaviorSubject(undefined);
  nextPageTrigger$ = new BehaviorSubject(undefined);
  openPageTrigger$ = new BehaviorSubject<number | undefined>(undefined);

  destroy$ = new Subject<void>();

  constructor(
    private pythonServerService: PythonServerService,
    private shortcutService: ShortcutService,
    private settingsService: SettingsService
  ) {
  }

  ngOnInit() {
    this.navigated_date = new Date(this.result.year, this.result.month - 1, this.result.day);
    this.performDailyQuery();

    this.shortcutService.isEscapePressed.pipe(
      filter(isEscapePressed => isEscapePressed && (this.lockEscapeInParent$?.value ?? false)),
      takeUntil(this.destroy$)
    ).subscribe(isEscapePressed => {
      // close detail view
    });

    this.previousPageTrigger$.pipe(
      skip(1),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = Math.max(this.currentPage - 1, 1);
      this.loadPage(this.currentPage);
    });

    this.nextPageTrigger$.pipe(
      skip(1),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = Math.min(this.currentPage + 1, this.totalPages);
      this.loadPage(this.currentPage);
    });

    this.openPageTrigger$.pipe(
      filter(page => page !== undefined),
      takeUntil(this.destroy$)
    ).subscribe((page) => {
      if (page) {
        this.currentPage = page;
        this.loadPage(this.currentPage);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }

  changeSorting() {
    this.ascending = !this.ascending;
    this.performDailyQuery();
  }

  performDailyQuery() {
    if (this.pythonServerService.connectionState === WSServerStatus.CONNECTED) {

      // generate new request id
      this.requestId = Math.random().toString(36).substring(7);

      let msg = {
        type: "textquery",
        version: 2,
        clientId: "direct",
        l2dist: this.settingsService.settings$.value[SettingsService.LOCAL_QUERY_SETTINGS]?.dailySummaryL2 ?? 20,
        query_dicts: [
          {
            day: {
              min: this.navigated_date?.getDate() ?? this.result.day,
              max: this.navigated_date?.getDate() ?? this.result.day
            },
            month: {
              min: (this.navigated_date?.getMonth() ?? this.result.month-1)+1,
              max: (this.navigated_date?.getMonth() ?? this.result.month-1)+1
            },
            year: {
              min: this.navigated_date?.getFullYear() ?? this.result.year,
              max: this.navigated_date?.getFullYear() ?? this.result.year
            }
          }
        ],
        sorting: {
          field: "datetime",
          order: this.ascending ? "asc" : "desc",
        },
        maxresults: 2000,
        resultsperpage: this.settingsService.settings$.value[SettingsService.LOCAL_QUERY_SETTINGS]?.dailyPageSize ?? 2000,
        selectedpage: this.currentPage,
        // random request id
        requestId: this.requestId
      };

      this.pythonServerService.sendMessage(msg);
    }
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.performDailyQuery();
  }

  increaseDateByOneDay() {
    if (!this.navigated_date) {
      return;
    }
    this.navigated_date = new Date(this.navigated_date?.setDate(this.navigated_date.getDate() + 1));
    this.performDailyQuery();
  }

  decreaseDateByOneDay() {
    if (!this.navigated_date) {
      return;
    }
    this.navigated_date = new Date(this.navigated_date?.setDate(this.navigated_date.getDate() - 1));
    this.performDailyQuery();
  }
}
