import {Component, Input} from '@angular/core';
import {GraphicalContentPart} from '../../../../models/graphical-content-part';
import {QueryPartType} from '../../models/query-part';
import {SettingsService} from '../../../../services/settings.service';

@Component({
  selector: 'exp-graphical-search-area',
  templateUrl: './graphical-search-area.component.html',
  styleUrls: ['./graphical-search-area.component.scss']
})
export class GraphicalSearchAreaComponent {
  @Input() graphicalContent: GraphicalContentPart[] = [];

  constructor(
    private settingsService: SettingsService) {
  }

  addGraphicalContentPart() {
    this.graphicalContent.push({
      queryParts: [
        {
          query_type: this.settingsService.settings$.value[SettingsService.LOCAL_QUERY_SETTINGS]?.useGPTasDefault ? QueryPartType.gpt : QueryPartType.clip,
          query: "",
          subqueries: [
          ]
        }
      ]
    });
  }

  deleteGraphicalContentPart(graphicalContentPart: GraphicalContentPart) {
    const index = this.graphicalContent.indexOf(graphicalContentPart);
    if (index > -1) {
      this.graphicalContent.splice(index, 1);
    }
  }

  moveGraphicalContentPartForward(graphicalContentPart: GraphicalContentPart) {
    const index = this.graphicalContent.indexOf(graphicalContentPart);
    if (index > -1 && index < this.graphicalContent.length - 1) {
      const temp = this.graphicalContent[index];
      this.graphicalContent[index] = this.graphicalContent[index + 1];
      this.graphicalContent[index + 1] = temp;
    }
  }

  moveGraphicalContentPartBackward(graphicalContentPart: GraphicalContentPart) {
    const index = this.graphicalContent.indexOf(graphicalContentPart);
    if (index > 0) {
      const temp = this.graphicalContent[index];
      this.graphicalContent[index] = this.graphicalContent[index - 1];
      this.graphicalContent[index - 1] = temp;
    }
  }
}
