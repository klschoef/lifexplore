import {Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {NodeServerConnectionService} from '../../../../services/nodeserver-connection.service';
import {PythonServerService} from '../../../../services/pythonserver.service';
import {VBSServerConnectionService} from '../../../../services/vbsserver-connection.service';
import {SubmissionLogService} from '../../../../services/submission-log.service';
import {BehaviorSubject, combineLatest, filter, Subject, switchMap, takeUntil, tap} from 'rxjs';
import {map, skip} from 'rxjs/operators';
import {ShortcutService} from '../../../../services/shortcut.service';
import {ResultPresenterService} from '../../../../services/result-presenter.service';
import {SettingsService} from '../../../../services/settings.service';
import URLUtil from '../../../../utils/url-util';

export enum ResultDetailComponentMode {
  Single = 'Single',
  Day = 'Day',
  DailySummary = 'Daily Summary',
  Similar = 'Similar'
}

@Component({
  selector: 'app-result-detail',
  templateUrl: './result-detail.component.html',
  styleUrls: ['./result-detail.component.scss']
})
export class ResultDetailComponent implements OnChanges, OnInit, OnDestroy {
  @Input() selectedResult?: any;
  @Input() openTrigger?: BehaviorSubject<any> = new BehaviorSubject(undefined);
  @Input() disableControlsInParent?: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Input() dialogState?: BehaviorSubject<boolean>;
  receivedMetadata$ = this.pythonService.receivedMetadata;
  isOpen = true;

  @Input() modes: string[] = Object.values(ResultDetailComponentMode);
  selectedMode: string = ResultDetailComponentMode.Single;
  lockEscape$ = new BehaviorSubject(false);
  newSelectedResult$ = new BehaviorSubject(null);
  private titleDateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  submissionEntry$ = combineLatest([this.submissionLogService.logOrModeChange$, this.newSelectedResult$]).pipe(
    switchMap(_ => this.submissionLogService.submissionLog$),
    filter(log => !!this.vbsServerConnectionService.selectedEvaluation),
    map(log => (log[this.vbsServerConnectionService.selectedEvaluation!] ?? {})[this.vbsServerConnectionService.currentTaskState$.value?.taskId!]),
    filter(log => log),
    tap(log => console.log("SUBMISSION ENTRY", log, this.selectedResult.filename)),
    map(log => log.find((entry: any) => entry.image === this.getSubmissionImageID()))
  );
  destroy$ = new Subject<void>();

  removeSuccess$ = this.pythonService.receivedMessages.pipe(
    tap(msg => {
      console.log("server message: ", msg);
    }),
    filter((msg) => msg && msg.type == 'remove_image'),
    map(msg => msg.success),
    tap(success => {
      if (success) {
        this.closeDialog();
      }
    }));

  constructor(
    private pythonService: PythonServerService,
    private vbsServerConnectionService: VBSServerConnectionService,
    private submissionLogService: SubmissionLogService,
    private shortcutService: ShortcutService,
    private resultPresenterService: ResultPresenterService
  ) {
  }

  ngOnInit() {
    this.shortcutService.isSPressed.pipe(
      skip(1),
      filter(isEscapePressed => !this.lockEscape$.value),
      takeUntil(this.destroy$)
    ).subscribe(isSPressed => {
      if (isSPressed) {
        if (this.selectedMode === ResultDetailComponentMode.Single) {
          this.changeMode(ResultDetailComponentMode.Similar);
        } else {
          this.changeMode(ResultDetailComponentMode.Single);
        }
      }
    });

    this.shortcutService.isSAndShiftIsPressed.pipe(
      skip(1),
      filter(isEscapePressed => !this.lockEscape$.value),
      takeUntil(this.destroy$)
    ).subscribe(isSPressed => {
      if (isSPressed) {
        this.submitImage();
      }
    });

    this.shortcutService.isDPressed.pipe(
      skip(1),
      filter(isEscapePressed => !this.lockEscape$.value),
      takeUntil(this.destroy$)
    ).subscribe(isDPressed => {
      if (isDPressed && this.modes.includes(ResultDetailComponentMode.Day)) {
        this.changeMode(ResultDetailComponentMode.Day);
      }
    });

    this.shortcutService.isDAndShiftPressed.pipe(
      skip(1),
      filter(isEscapePressed => !this.lockEscape$.value),
      takeUntil(this.destroy$)
    ).subscribe(isDPressed => {
      if (isDPressed && this.modes.includes(ResultDetailComponentMode.DailySummary)) {
        this.changeMode(ResultDetailComponentMode.DailySummary);
      }
    });

    this.openTrigger?.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.isOpen = true;
    });

    this.shortcutService.isEscapePressed.pipe(
      skip(1),
      filter(isEscapePressed => isEscapePressed && !this.lockEscape$.value),
      takeUntil(this.destroy$)
    ).subscribe(isEscapePressed => {
      this.disableControlsInParent?.next(false);
      this.closeDialog();
    });
  }

  ngOnDestroy() {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }

  changeMode(mode: string) {
    this.selectedMode = mode;
    console.log("CHANGE MODE", mode);
    if (mode === ResultDetailComponentMode.Single) {
      this.disableControlsInParent?.next(false);
    } else if (
      mode === ResultDetailComponentMode.Day || mode === ResultDetailComponentMode.DailySummary
      || mode === ResultDetailComponentMode.Similar) {
      this.disableControlsInParent?.next(true);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("SELECTED RESULTS ON CHANGES", this.selectedResult);
    if (this.selectedResult) {
      this.fetchDetails();
      this.isOpen = true;
      this.newSelectedResult$.next(this.selectedResult);
    }
  }

  closeDialog() {
    this.isOpen = false;
    this.dialogState?.next(false);
  }

  fetchDetails() {
    let msg = {
      type: "metadataquery",
      version: 2,
      clientId: "direct",
      imagepath: this.selectedResult.originalFilepath,
    };


    this.pythonService.sendMessage(msg);
  }

  submitImage() {
    console.log("SUBMIT IMAGE", this.selectedResult);
    this.vbsServerConnectionService.submitImageID(this.getSubmissionImageID());
  }

  private getSubmissionImageID() {
    const imagePath = this.selectedResult.originalFilepath ?? this.selectedResult.filename ?? '';

    return this.vbsServerConnectionService.normalizeMediaItemName(imagePath);
  }

  deleteImage(filepath: string) {
    console.log("DELETE IMAGE", filepath);
    let msg = {
      type: "remove_image",
      version: 2,
      filepath: filepath,
      clientId: "direct"
    };

    this.pythonService.sendMessage(msg);
  }

  getModeLabel(mode: string) {
    return mode === ResultDetailComponentMode.Single ? 'Image' : mode;
  }

  getResultTitleDate(result: any) {
    const date = this.getImageDate(result);
    return date ? this.titleDateFormatter.format(date) : this.getModeLabel(this.selectedMode);
  }

  getResultTitleLocation(result: any) {
    return this.firstTextValue(
      result?.location_metadata?.address,
      result?.place_label,
      result?.placeLabel,
      result?.address,
      result?.places?.[0]?.place
    );
  }

  private getImageDate(result: any): Date | undefined {
    return this.parseDateValue(result?.datetime)
      ?? this.parseDateValue(result?.timestamp)
      ?? this.parseDateValue(result?.date)
      ?? this.parseDateFromPath(result?.originalFilepath ?? result?.filepath ?? result?.filename);
  }

  private parseDateValue(value: unknown): Date | undefined {
    if (value === undefined || value === null || value === '' || value === 0 || value === '0') {
      return undefined;
    }

    if (typeof value === 'number') {
      const timestamp = value < 10000000000 ? value * 1000 : value;
      return this.validDate(new Date(timestamp));
    }

    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmedValue = value.trim();
    const filenameDate = this.parseDateFromPath(trimmedValue);
    if (filenameDate) {
      return filenameDate;
    }

    return this.validDate(new Date(trimmedValue));
  }

  private parseDateFromPath(path?: string): Date | undefined {
    const match = path?.match(/(\d{8})[_-](\d{6})/);
    if (!match) {
      return undefined;
    }

    const datePart = match[1];
    const timePart = match[2];
    const year = Number(datePart.substring(0, 4));
    const month = Number(datePart.substring(4, 6)) - 1;
    const day = Number(datePart.substring(6, 8));
    const hours = Number(timePart.substring(0, 2));
    const minutes = Number(timePart.substring(2, 4));
    const seconds = Number(timePart.substring(4, 6));

    return this.validDate(new Date(year, month, day, hours, minutes, seconds));
  }

  private validDate(date: Date): Date | undefined {
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  private firstTextValue(...values: unknown[]) {
    const value = values.find((candidate) => typeof candidate === 'string' && candidate.trim());
    return typeof value === 'string' ? value.trim() : '';
  }

  protected readonly ResultDetailComponentMode = ResultDetailComponentMode;
}
