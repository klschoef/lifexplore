import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NodeServerConnectionService} from '../../../../services/nodeserver-connection.service';
import {PythonServerService} from '../../../../services/pythonserver.service';
import {VBSServerConnectionService} from '../../../../services/vbsserver-connection.service';
import {SubmissionLogService} from '../../../../services/submission-log.service';
import {BehaviorSubject, combineLatest, filter, switchMap, tap} from 'rxjs';
import {map} from 'rxjs/operators';

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
export class ResultDetailComponent implements OnChanges {
  @Input() selectedResult?: any;
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

  constructor(
    private pythonService: PythonServerService,
    private vbsServerConnectionService: VBSServerConnectionService,
    private submissionLogService: SubmissionLogService
  ) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("SELECTED RESULTS ON CHANGES", this.selectedResult);
    if (this.selectedResult) {
      this.fetchDetails();
      this.isOpen = true;
      this.newSelectedResult$.next(this.selectedResult);
    }
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
