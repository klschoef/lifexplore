import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {Subject} from 'rxjs';
import {SettingsService} from '../../../../services/settings.service';
import {map, skip} from 'rxjs/operators';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() coordinates: number[] = [0, 0];
  private map: any;
  private destroy$ = new Subject();

  constructor(
    private settingsService: SettingsService
  ) {
  }

  private initMap(): void {
    console.log("create map", this.coordinates);
    this.map = L.map('map', {
      center: [ this.coordinates[1], this.coordinates[0] ],
      zoom: this.settingsService.settings$.value[SettingsService.LOCAL_MAP_SETTINGS]?.defaultZoom ?? 10,
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 1,
      attribution: 'd'
    });

    tiles.addTo(this.map);

    L.marker([this.coordinates[1], this.coordinates[0]], {
      icon: L.icon({
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png',
        iconAnchor: [12, 41]
      })
    }).addTo(this.map);
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnInit() {
    this.settingsService.settings$.pipe(
      skip(1),
      map((settings) => settings[SettingsService.LOCAL_MAP_SETTINGS]?.defaultZoom ?? 10),
    ).subscribe((zoom) => {
      this.map.setZoom(zoom);
    });
  }

  ngOnDestroy() {
    this.destroy$.complete();
  }
}
