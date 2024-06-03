import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {NodeServerConnectionService} from '../../../../services/nodeserver-connection.service';
import {PythonServerService} from '../../../../services/pythonserver.service';
import {VBSServerConnectionService} from '../../../../services/vbsserver-connection.service';
import {SubmissionLogService} from '../../../../services/submission-log.service';
import {BehaviorSubject, combineLatest, filter, Subject, switchMap, takeUntil, tap} from 'rxjs';
import {map} from 'rxjs/operators';
import {ShortcutService} from '../../../../services/shortcut.service';
import {ResultPresenterService} from '../../../../services/result-presenter.service';

export enum ResultDetailComponentMode {
  Single = 'Single',
  Day = 'Day',
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
  receivedMetadata$ = this.pythonService.receivedMetadata;
  isOpen = true;

  modes: string[] = Object.values(ResultDetailComponentMode);
  selectedMode: string = ResultDetailComponentMode.Single;
  newSelectedResult$ = new BehaviorSubject(null);
  submissionEntry$ = combineLatest([this.submissionLogService.logOrModeChange$, this.newSelectedResult$]).pipe(
    switchMap(_ => this.submissionLogService.submissionLog$),
    filter(log => !!this.vbsServerConnectionService.selectedEvaluation),
    map(log => log[this.vbsServerConnectionService.selectedEvaluation!]),
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
      takeUntil(this.destroy$)
    ).subscribe(isSPressed => {
      if (isSPressed) {
        this.submitImage();
      }
    });

    this.openTrigger?.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.isOpen = true;
    });
  }

  ngOnDestroy() {
    this.destroy$.next(undefined);
    this.destroy$.complete();
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
    this.resultPresenterService.currentResultIndex$.next(undefined);
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
