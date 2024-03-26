import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-minimal-result-container',
  templateUrl: './minimal-result-container.component.html',
  styleUrls: ['./minimal-result-container.component.scss']
})
export class MinimalResultContainerComponent {
  @Input() results: any[] = [];
  selectedResult?: any;


  clickResult(result: any) {
    console.log("result", result);
    this.selectedResult = result;
  }
}
