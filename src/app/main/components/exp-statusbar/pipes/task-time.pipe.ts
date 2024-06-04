import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'taskTime'
})
export class TaskTimePipe implements PipeTransform {
  transform(value: number, ...args: unknown[]): string {
    const hours = Math.floor(value / 3600); // Convert seconds to hours
    const minutes = Math.floor((value % 3600) / 60); // Convert remaining seconds to minutes
    const seconds = value % 60; // Remaining seconds

    // Format numbers to have at least two digits
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
}
