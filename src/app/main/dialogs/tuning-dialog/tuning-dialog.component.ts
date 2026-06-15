import {Component, EventEmitter, Output} from '@angular/core';
import {SettingsService} from '../../services/settings.service';
import {map} from 'rxjs/operators';
import {filter} from 'rxjs';
import {ShortcutService} from '../../services/shortcut.service';
import {QueryDefaultModel} from '../../models/query-default-model';
import {ConfigService} from '../../../shared/config/services/config.service';

enum TuningL2Type {
  NONE = 'None',
  LESS = 'Less Duplicates',
  DISTINCTIVE = 'Distinctive Images',
  CUSTOM = 'Custom',
}

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'url';
}

interface ServerEndpointConfig {
  label: string;
  id: 'primary' | 'secondary';
  protocolKey: string;
  hostKey: string;
  portKey: string;
  pathKey: string;
}

@Component({
  selector: 'lx-tuning-dialog',
  templateUrl: './tuning-dialog.component.html',
  styleUrls: ['./tuning-dialog.component.scss']
})
export class TuningDialogComponent {
  @Output() clickOnClose: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  public readonly L2_DIST_LESS = 10;
  public readonly L2_DIST_DISTINCTIVE = 15;

  L2Type = TuningL2Type;
  //currentL2Type = this.L2Type.NONE;
  l2Types = Object.values(this.L2Type);
  //customL2Dist?: number;
  l2Dist$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.l2dist),
    filter((l2dist) => l2dist !== undefined),
  );
  firstPerDay$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.firstPerDay),
    filter((l2dist) => l2dist !== undefined),
  );
  temporalPrefetchMode$= this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.temporalPrefetchMode ?? true),
  );
  temporalDBPrefetchPageSize$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.temporalDBPrefetchPageSize ?? 5000)
  );
  pageSize$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.resultsperpage ?? 50),
    filter((res) => res !== undefined),
  );
  dailyPageSize$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.dailyPageSize ?? 2000),
    filter((res) => res !== undefined),
  );
  dailySummaryL2$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.dailySummaryL2 ?? 20),
    filter((res) => res !== undefined),
  );
  similarityPageSize$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.similarityPageSize ?? 2000),
    filter((res) => res !== undefined),
  );
  clipPageSize$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.clipPageSize ?? 5000),
    filter((res) => res !== undefined),
  );
  solrPageSize$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.solrPageSize ?? 5000),
    filter((res) => res !== undefined),
  );
  textCommandPrefix$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.textCommandPrefix ?? '-'),
    filter((res) => res !== undefined),
  );
  currentL2Type$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.l2dist),
    map((l2dist) => {
      let newL2Type = this.L2Type.NONE;

      if (l2dist === this.L2_DIST_LESS) {
        newL2Type = this.L2Type.LESS;
      } else if (l2dist === this.L2_DIST_DISTINCTIVE) {
        newL2Type = this.L2Type.DISTINCTIVE;
      } else if (l2dist !== undefined) {
        newL2Type = this.L2Type.CUSTOM;
      }

      return newL2Type;
    })
  );
  queryDefaultModelOptions = [
    QueryDefaultModel.clip,
    QueryDefaultModel.gpt,
    QueryDefaultModel.siglip2
  ];
  queryDefaultModel$ = this.settingsService.settings$.pipe(
    map(() => this.settingsService.getQueryDefaultModel()),
  );
  configDraft: any = {};
  configSaved = false;
  private thumbnailAspectRatio = 1;
  serverProtocolOptions = ['ws://', 'wss://'];
  serverPathOptions = [
    {label: 'no /ws', value: ''},
    {label: '/ws', value: '/ws'},
  ];
  serverEndpointConfigs: ServerEndpointConfig[] = [
    {
      label: 'Node server 1 Host',
      id: 'primary',
      protocolKey: 'config_NODE_SERVER_PROTOCOL',
      hostKey: 'config_NODE_SERVER_HOST',
      portKey: 'config_NODE_SERVER_PORT',
      pathKey: 'config_NODE_SERVER_PATH',
    },
    {
      label: 'Node server 2 Host',
      id: 'secondary',
      protocolKey: 'config_NODE_SERVER_SECONDARY_PROTOCOL',
      hostKey: 'config_NODE_SERVER_SECONDARY_HOST',
      portKey: 'config_NODE_SERVER_SECONDARY_PORT',
      pathKey: 'config_NODE_SERVER_SECONDARY_PATH',
    },
    /*
    {
      label: 'CLIP server Host',
      id: 'primary',
      protocolKey: 'config_CLIP_SERVER_PROTOCOL',
      hostKey: 'config_CLIP_SERVER_HOST',
      portKey: 'config_CLIP_SERVER_PORT',
      pathKey: 'config_CLIP_SERVER_PATH',
    },
    */
  ];
  connectionConfigFields: ConfigField[] = [
    {key: 'config_DATA_BASE_URL', label: 'Data Base URL', type: 'url'},
    {key: 'config_DATA_BASE_URL_THUMBS', label: 'Thumbnail Base URL', type: 'url'},
    {key: 'config_UPLOAD_URL', label: 'Upload URL', type: 'url'},
  ];
  displayConfigFields: ConfigField[] = [
    {key: 'config_THUMB_WIDTH', label: 'Thumbnail Width', type: 'number'},
    {key: 'config_THUMB_HEIGHT', label: 'Thumbnail Height', type: 'number'},
    {key: 'config_MAX_RESULTS_TO_RETURN', label: 'Max Results To Return', type: 'number'},
    {key: 'config_RESULTS_PER_PAGE', label: 'Results Per Page', type: 'number'},
    {key: 'config_IMAGES_PER_ROW', label: 'Images Per Row', type: 'number'},
    {key: 'config_MAX_RESULTS_TO_DISPLAY', label: 'Max Results To Display', type: 'number'},
  ];
  credentialConfigFields: ConfigField[] = [
    {key: 'config_USER', label: 'User', type: 'text'},
    {key: 'config_PASS', label: 'Password', type: 'password'},
  ];

  constructor(
    private settingsService: SettingsService,
    private configService: ConfigService,
    public shortcutService: ShortcutService,
  ) {
    this.configDraft = {...this.configService.getConfiguration()};
    this.thumbnailAspectRatio = this.getThumbnailAspectRatio();
  }

  clickOnDistinctiveType(l2Type: TuningL2Type) {
    //this.currentL2Type = l2Type;

    if (l2Type === TuningL2Type.CUSTOM) {
      return;
    }

    let l2dist = undefined;

    switch (l2Type) {
      case TuningL2Type.LESS:
        l2dist = this.L2_DIST_LESS;
        break;
      case TuningL2Type.DISTINCTIVE:
        l2dist = this.L2_DIST_DISTINCTIVE;
        break;
      case TuningL2Type.NONE:
        l2dist = undefined;
        break;
    }

    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      l2dist: l2dist
    })
  }

  onChangeL2(event: any) {
    //console.log("event", event, event.target.valueAsNumber);
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      l2dist: event.target.valueAsNumber
    })
  }

  onChangeFirstPerDay(event: any) {
    console.log("event onChangeFirstPerDay", event, event.target.checked);
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      firstPerDay: event.target.checked
    })
  }

  onChangePageSize(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      resultsperpage: event.target.valueAsNumber
    })
  }

  onChangeDailyPageSize(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      dailyPageSize: event.target.valueAsNumber
    })
  }

  onChangeDailySummaryL2(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      dailySummaryL2: event.target.valueAsNumber
    })
  }

  onChangeSimilarityPageSize(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      similarityPageSize: event.target.valueAsNumber
    })
  }

  onChangeClipPageSize(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      clipPageSize: event.target.valueAsNumber
    })
  }

  onChangeSolrPageSize(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      solrPageSize: event.target.valueAsNumber
    })
  }

  onChangeQueryDefaultModel(event: any) {
    this.settingsService.saveQueryDefaultModel(event.target.value);
  }

  onChangeTemporalPrefetchMode(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      temporalPrefetchMode: event.target.checked
    })
  }

  onChangeTemporalDBPrefetchPageSize(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      temporalDBPrefetchPageSize: event.target.valueAsNumber
    })
  }

  onChangeTextCommandPrefix(event: any) {
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      textCommandPrefix: event.target.value
    })
  }

  onConfigFieldChange(key: string, value: any) {
    if (key === 'config_THUMB_WIDTH' || key === 'config_THUMB_HEIGHT') {
      this.onThumbnailDimensionChange(key, value);
      return;
    }

    this.configDraft[key] = value;
    this.configSaved = false;
  }

  onLinkThumbnailDimensionsChange(checked: boolean) {
    this.configDraft.config_LINK_THUMB_DIMENSIONS = checked;
    this.configSaved = false;

    if (checked) {
      this.thumbnailAspectRatio = this.getThumbnailAspectRatio();
    }
  }

  private onThumbnailDimensionChange(key: string, value: any) {
    const numericValue = Number(value);
    this.configDraft[key] = Number.isFinite(numericValue) ? numericValue : value;

    if (!this.configDraft.config_LINK_THUMB_DIMENSIONS) {
      this.thumbnailAspectRatio = this.getThumbnailAspectRatio();
      this.configSaved = false;
      return;
    }

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      this.configSaved = false;
      return;
    }

    const aspectRatio = this.thumbnailAspectRatio || this.getThumbnailAspectRatio();
    if (key === 'config_THUMB_WIDTH') {
      this.configDraft.config_THUMB_HEIGHT = Math.max(1, Math.round(numericValue / aspectRatio));
    } else {
      this.configDraft.config_THUMB_WIDTH = Math.max(1, Math.round(numericValue * aspectRatio));
    }

    this.configSaved = false;
  }

  private getThumbnailAspectRatio() {
    const width = Number(this.configDraft.config_THUMB_WIDTH);
    const height = Number(this.configDraft.config_THUMB_HEIGHT);

    return width > 0 && height > 0 ? width / height : 1;
  }

  saveLocalConfig() {
    const normalizedConfig = {...this.configDraft};
    this.serverEndpointConfigs.forEach((serverConfig) => {
      normalizedConfig[serverConfig.portKey] = normalizedConfig[serverConfig.portKey] === ''
        ? ''
        : Number(normalizedConfig[serverConfig.portKey]);
    });

    [...this.connectionConfigFields, ...this.displayConfigFields, ...this.credentialConfigFields]
      .filter((field) => field.type === 'number')
      .forEach((field) => {
        normalizedConfig[field.key] = Number(normalizedConfig[field.key]);
      });

    this.configService.updateConfiguration(normalizedConfig);
    this.settingsService.addToSettingsEntry(normalizedConfig, SettingsService.LOCAL_CONFIG_SETTINGS);
    this.settingsService.saveQuerySettings({
      ...this.settingsService.getQuerySettings(),
      resultsperpage: normalizedConfig.config_RESULTS_PER_PAGE
    });
    this.configDraft = {...this.configService.getConfiguration()};
    this.configSaved = true;
  }
}
