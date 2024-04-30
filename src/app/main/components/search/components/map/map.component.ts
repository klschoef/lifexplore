import {AfterViewInit, Component, Input} from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  @Input() coordinates: number[] = [0, 0];
  private map: any;

  private initMap(): void {
    console.log("create map", this.coordinates);
    this.map = L.map('map', {
      center: [ this.coordinates[1], this.coordinates[0] ],
      zoom: 12
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: 'd'
    });

    tiles.addTo(this.map);

    L.marker([this.coordinates[1], this.coordinates[0]], {
      icon: L.icon({
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png'
      })
    }).addTo(this.map);
  }

  ngAfterViewInit(): void {
    this.initMap();
  }
}
