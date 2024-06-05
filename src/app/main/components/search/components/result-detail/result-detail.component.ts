import {Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {NodeServerConnectionService} from '../../../../services/nodeserver-connection.service';
import {PythonServerService} from '../../../../services/pythonserver.service';
import {VBSServerConnectionService} from '../../../../services/vbsserver-connection.service';
import {SubmissionLogService} from '../../../../services/submission-log.service';
import {BehaviorSubject, combineLatest, filter, Subject, switchMap, takeUntil, tap} from 'rxjs';
import {map, skip} from 'rxjs/operators';
import {ShortcutService} from '../../../../services/shortcut.service';
import {ResultPresenterService} from '../../../../services/result-presenter.service';

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
  submissionEntry$ = combineLatest([this.submissionLogService.logOrModeChange$, this.newSelectedResult$]).pipe(
    switchMap(_ => this.submissionLogService.submissionLog$),
    filter(log => !!this.vbsServerConnectionService.selectedEvaluation && !!this.vbsServerConnectionService.currentTaskState$.value),
    map(log => (log[this.vbsServerConnectionService.selectedEvaluation!] ?? {})[this.vbsServerConnectionService.currentTaskState$.value!.taskId!]),
    filter(log => log),
    tap(log => console.log("SUBMISSION ENTRY", log, this.selectedResult.filename)),
    map(log => log.find((entry: any) => entry.image === this.selectedResult.filename))
  );
  destroy$ = new Subject<void>();

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
    this.vbsServerConnectionService.submitImageID(this.selectedResult.filename);
  }

  protected readonly ResultDetailComponentMode = ResultDetailComponentMode;
}
