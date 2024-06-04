import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-single-result-container',
  templateUrl: './single-result-container.component.html',
  styleUrls: ['./single-result-container.component.scss']
})
export class SingleResultContainerComponent implements OnChanges {
  @Input() result: any;
  imageDate?: Date;
  //this.selectedResult.originalFilepath

  ngOnChanges(changes:SimpleChanges) {
    console.log(this.result);
    if (changes["result"]) {
      this.imageDate = new Date(this.result.datetime);
      console.log(this.imageDate);
    }
  }
}
