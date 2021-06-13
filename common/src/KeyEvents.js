export default class KeyEvents {

    static detectCopy(event) {
        // Ctrl + Shift + A
        return !KeyEvents.detectCopyAndUpdateLastCard(event) && event.ctrlKey && event.shiftKey && event.keyCode === 65;
    }

    static detectCopyAndUpdateLastCard(event) {
        // Ctrl + Shift + S
        return event.ctrlKey && event.shiftKey && event.keyCode === 83;
    }

    static detectDecreaseOffset(event) {
        // Ctrl + Shift + Right
        return event.ctrlKey && event.shiftKey && event.keyCode === 39;
    }

    static detectIncreaseOffset(event) {
        // Ctrl + Shift + Left
        return event.ctrlKey && event.shiftKey && event.keyCode === 37;
    }

    static detectDecreaseOffsetToNextSubtitle(event) {
        // Ctrl + Right
        return !KeyEvents.detectDecreaseOffset(event) && event.ctrlKey && event.keyCode === 39;
    }

    static detectIncreaseOffsetToPreviousSubtitle(event) {
        // Ctrl + Left
        return !KeyEvents.detectIncreaseOffset(event) && event.ctrlKey && event.keyCode === 37;
    }

    static detectPreviousSubtitle(event) {
        // Left
        return !KeyEvents.detectIncreaseOffset(event) && !KeyEvents.detectIncreaseOffsetToPreviousSubtitle(event) && event.keyCode === 37;
    }

    static detectNextSubtitle(event) {
        // Right
        return !KeyEvents.detectDecreaseOffset(event) && !KeyEvents.detectDecreaseOffsetToNextSubtitle(event) && event.keyCode === 39;
    }

    static detectToggleSubtitles(event) {
        // S
        return !KeyEvents.detectCopyAndUpdateLastCard(event) && event.keyCode === 83;
    }
}