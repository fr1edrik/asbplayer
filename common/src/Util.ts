import { SubtitleModel } from './Model';

export function humanReadableTime(timestamp): string {
    const totalSeconds = Math.floor(timestamp / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    if (hours > 0) {
        return hours + 'h' + String(minutes).padStart(2, '0') + 'm' + String(seconds).padStart(2, '0') + 's';
    }

    return minutes + 'm' + String(seconds).padStart(2, '0') + 's';
}

export function surroundingSubtitles(
    subtitles: SubtitleModel[],
    index: number,
    countRadius: number,
    timeRadius: number
): SubtitleModel[] {
    let startIndex;
    let endIndex;

    for (let i = index; i >= 0; --i) {
        startIndex = i;

        if (atBoundary(subtitles, startIndex, index, countRadius, timeRadius, false)) {
            break;
        }
    }

    for (let i = index; i <= subtitles.length - 1; ++i) {
        endIndex = i;

        if (atBoundary(subtitles, endIndex, index, countRadius, timeRadius, true)) {
            break;
        }
    }

    return subtitles.slice(startIndex, endIndex + 1);
}

export function mockSurroundingSubtitles(
    middleSubtitle: SubtitleModel,
    maxTimestamp: number,
    timeRadius: number
): SubtitleModel[] {
    const subtitles = [middleSubtitle];

    if (middleSubtitle.end < maxTimestamp) {
        const afterTimestamp = Math.min(maxTimestamp, middleSubtitle.end + timeRadius);
        subtitles.push({
            text: '',
            start: middleSubtitle.end,
            end: afterTimestamp,
            track: 0,
        });
    }

    if (middleSubtitle.start > 0) {
        const beforeTimestamp = Math.max(0, middleSubtitle.start - timeRadius);
        subtitles.unshift({
            text: '',
            start: beforeTimestamp,
            end: middleSubtitle.start,
            track: 0,
        });
    }

    return subtitles;
}

function atBoundary(
    subtitles: SubtitleModel[],
    index: number,
    initialIndex: number,
    countRadius: number,
    timeRadius: number,
    sign: boolean
): boolean {
    let next;

    if (sign) {
        next = index + 1 < subtitles.length ? subtitles[index + 1] : null;
    } else {
        next = index - 1 >= 0 ? subtitles[index - 1] : null;
    }

    if (
        Math.abs(initialIndex - index) >= countRadius &&
        (next === null || Math.abs(next.start - subtitles[initialIndex].start) >= timeRadius)
    ) {
        return true;
    }

    return false;
}
