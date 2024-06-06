import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intToColor'
})
export class IntToColorPipe implements PipeTransform {
  transform(value: number): string {
    // Prime numbers to modulate color changes more effectively
    const r = (value * 137) % 256;  // Using 137, a prime number for red
    const g = (value * 157) % 256;  // Using 157, a prime number for green
    const b = (value * 173) % 256;  // Using 173, a prime number for blue

    // Convert RGB to HEX
    return '#' + this.toHex(r) + this.toHex(g) + this.toHex(b);
  }

  private toHex(value: number): string {
    const hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;  // Pad with zero if necessary
  }
}
