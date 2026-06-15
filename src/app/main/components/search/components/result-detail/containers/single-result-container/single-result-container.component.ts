import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-single-result-container',
  templateUrl: './single-result-container.component.html',
  styleUrls: ['./single-result-container.component.scss']
})
export class SingleResultContainerComponent implements OnChanges {
  @Input() result: any;
  imageDate?: Date;

  ngOnChanges(changes:SimpleChanges) {
    if (changes["result"]) {
      this.imageDate = this.getImageDate(this.result);
    }
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
}
