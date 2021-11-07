export interface Rect {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
}

export interface Subtitle {
    readonly text: string;
    readonly start: number;
    readonly end: number;
    readonly track: number;
}
