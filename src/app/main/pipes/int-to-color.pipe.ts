import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intToColor'
})
export class IntToColorPipe implements PipeTransform {
  private readonly groupColors = [
    '#ff8fab',
    '#8ecae6',
    '#b5e48c',
    '#f9c74f',
    '#c77dff',
    '#80ed99',
    '#ffad69',
    '#90dbf4',
    '#f28482',
    '#a3c4f3',
    '#d0f4de',
    '#f1c0e8',
  ];

  transform(value: number): string {
    const index = Math.abs(Number(value) || 0) % this.groupColors.length;
    return this.groupColors[index];
  }
}
