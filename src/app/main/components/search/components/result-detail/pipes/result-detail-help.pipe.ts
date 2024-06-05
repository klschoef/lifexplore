import { Pipe, PipeTransform } from '@angular/core';
import {ResultDetailComponentMode} from '../result-detail.component';

@Pipe({
  name: 'resultDetailHelp'
})
export class ResultDetailHelpPipe implements PipeTransform {

  transform(mode: string): string {
    switch (mode) {
      case ResultDetailComponentMode.Single:
        return "s";
      case ResultDetailComponentMode.Similar:
        return "s";
      case ResultDetailComponentMode.Day:
        return "d";
      case ResultDetailComponentMode.DailySummary:
        return "Shift+d";
    }
    return "";
  }

}
