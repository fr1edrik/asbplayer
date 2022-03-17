// Regular expression for the speaker
export const speakerRegex = /[（([].*[）)\]][\s]*/;

export function arrayEquals(a, b, equals = (a, b) => a === b) {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; ++i) {
        if (!equals(a[i], b[i])) {
            return false;
        }
    }

    return true;
}

export function keysAreEqual(a, b) {
    for (let key in a) {
        if (!(key in b)) {
            return false;
        }
    }

    for (let key in b) {
        if (!(key in a)) {
            return false;
        }
    }

    return true;
}

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    };
}

export function computeStyles({
    subtitleColor,
    subtitleSize,
    subtitleOutlineThickness,
    subtitleOutlineColor,
    subtitleBackgroundOpacity,
    subtitleBackgroundColor,
    subtitleFontFamily,
}) {
    const styles = {
        color: subtitleColor,
        fontSize: Number(subtitleSize),
    };

    if (subtitleOutlineThickness > 0) {
        const thickness = subtitleOutlineThickness;
        const color = subtitleOutlineColor;
        styles[
            'textShadow'
        ] = `0 0 ${thickness}px ${color}, 0 0 ${thickness}px ${color}, 0 0 ${thickness}px ${color}, 0 0 ${thickness}px ${color}`;
    }

    if (subtitleBackgroundOpacity > 0) {
        const opacity = subtitleBackgroundOpacity;
        const color = subtitleBackgroundColor;
        const { r, g, b } = hexToRgb(color);
        styles['backgroundColor'] = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    if (subtitleFontFamily && subtitleFontFamily.length > 0) {
        styles['fontFamily'] = subtitleFontFamily;
    }

    return styles;
}

export function timeDurationDisplay(milliseconds, totalMilliseconds, includeMilliseconds = true) {
    if (milliseconds < 0) {
        return timeDurationDisplay(0, totalMilliseconds);
    }

    milliseconds = Math.round(milliseconds);
    const ms = milliseconds % 1000;
    milliseconds = (milliseconds - ms) / 1000;
    const secs = milliseconds % 60;
    milliseconds = (milliseconds - secs) / 60;
    const mins = milliseconds % 60;

    if (totalMilliseconds >= 3600000) {
        const hrs = (milliseconds - mins) / 60;

        if (includeMilliseconds) {
            return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + padEnd(ms);
        }

        return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
    }

    if (includeMilliseconds) {
        return pad(mins) + ':' + pad(secs) + '.' + padEnd(ms);
    }

    return pad(mins) + ':' + pad(secs);
}

function pad(n) {
    return String(n).padStart(2, '0');
}

function padEnd(n) {
    return String(n).padEnd(3, '0');
}

/**
 * Remove the speaker from subtitles
 * example:
 *      before: （ガモちゃん）ふんふん
 *      after: ふんふん
 * @param {string} text
 * @returns sliced text
 */
export function getSubtitleWithoutSpeaker(text) {
    const globalRegex = new RegExp(speakerRegex.source, 'g');
    return text?.replaceAll(globalRegex, '');
}
