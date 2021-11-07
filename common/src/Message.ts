import { RectModel, SubtitleModel, ImageModel, AudioModel } from './Model';

export interface Message {
    readonly command: string;
}

export interface AsbplayerHeartbeatMessage extends Message {
    readonly command: 'heartbeat';
    readonly id: string;
}

export interface VideoHeartbeatMessage extends Message {
    readonly command: 'heartbeat';
}

export interface HttpPostMessage extends Message {
    readonly command: 'http-post';
    readonly url: string;
    readonly body: any;
}

export interface SettingsUpdatedMessage extends Message {
    readonly command: 'settings-updated';
}

export interface RecordMediaAndForwardSubtitleMessage extends Message {
    readonly command: 'record-media-and-forward-subtitle';
    readonly subtitle: SubtitleModel;
    readonly surroundingSubtitles: SubtitleModel[];
    readonly record: boolean;
    readonly screenshot: boolean;
    readonly showAnkiUi: boolean;
    readonly audioPaddingStart: number;
    readonly audioPaddingEnd: number;
    readonly playbackRate: number;
    readonly rect?: RectModel;
    readonly maxImageWidth: number;
    readonly maxImageHeight: number;
}

export interface StartRecordingMediaMessage extends Message {
    readonly command: 'start-recording-media';
    readonly record: boolean;
    readonly timestamp: number;
    readonly screenshot: boolean;
    readonly showAnkiUi: boolean;
    readonly rect?: RectModel;
    readonly maxImageWidth: number;
    readonly maxImageHeight: number;
}

export interface StopRecordingMediaMessage extends Message {
    readonly command: 'stop-recording-media';
    readonly showAnkiUi: boolean;
    readonly startTimestamp: number;
    readonly endTimestamp: number;
    readonly screenshot: boolean;
    readonly videoDuration: number;
}

export interface CopyMessage extends Message {
    readonly command: 'copy';
    readonly id: string;
    readonly subtitle: SubtitleModel;
    readonly surroundingSubtitles: SubtitleModel[];
    readonly image?: ImageModel;
    readonly audio?: AudioModel;
}

export interface ScreenshotTakenMessage extends Message {
    readonly command: 'screenshot-taken';
}

export interface ShowAnkUiMessage extends Message {
    readonly command: 'show-anki-ui';
    readonly id: string;
    readonly subtitle: SubtitleModel;
    readonly surroundingSubtitles: SubtitleModel[];
    readonly image?: ImageModel;
    readonly audio?: AudioModel;
}
