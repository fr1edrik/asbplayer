export interface RectModel {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
}

export interface SubtitleModel {
    readonly text: string;
    readonly start: number;
    readonly end: number;
    readonly track: number;
}

export interface ImageModel {
    readonly base64: string;
    readonly extension: 'jpeg';
}

export interface AudioModel {
    readonly base64: string;
    readonly extension: 'webm' | 'mp3';
    readonly paddingStart: number;
    readonly paddingEnd: number;
    readonly start: number;
    readonly end: number;
}
