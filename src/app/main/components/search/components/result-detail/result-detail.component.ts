import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NodeServerConnectionService} from '../../../../services/nodeserver-connection.service';
import {PythonServerService} from '../../../../services/pythonserver.service';
import {VBSServerConnectionService} from '../../../../services/vbsserver-connection.service';

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

  constructor(
    private pythonService: PythonServerService,
    private vbsServerConnectionService: VBSServerConnectionService
  ) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("SELECTED RESULTS ON CHANGES", this.selectedResult);
    if (this.selectedResult) {
      this.fetchDetails();
      this.isOpen = true;
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
