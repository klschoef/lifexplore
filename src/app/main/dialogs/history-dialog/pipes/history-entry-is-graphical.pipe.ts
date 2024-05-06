import { Pipe, PipeTransform } from '@angular/core';
import {HistoryEntryToText} from '../../../utils/transformers/history-entry-to-text';

@Pipe({
  name: 'historyEntryIsGraphical'
})
export class HistoryEntryIsGraphicalPipe implements PipeTransform {

  transform(value: any): boolean {
    return HistoryEntryToText.isGraphical(value);
  }

}
