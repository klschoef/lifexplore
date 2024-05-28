import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalConstantsService {
  constructor(private configService: ConfigService) {
    console.log('GlobalConstantsService created');
  }

  get configUSER(): string {
    return this.configService.getConfiguration().config_USER;
  }

  get configPASS(): string {
    return this.configService.getConfiguration().config_PASS;
  }
}

