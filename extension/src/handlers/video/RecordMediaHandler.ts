import AudioRecorder from '../../services/AudioRecorder';
import ImageCapturer from '../../services/ImageCapturer';
import { v4 as uuidv4 } from 'uuid';
import { Command, Message } from '@project/common';

export default class RecordMediaHandler {

    private readonly audioRecorder: AudioRecorder;
    private readonly imageCapturer: ImageCapturer;

    constructor(audioRecorder: AudioRecorder, imageCapturer: ImageCapturer) {
        this.audioRecorder = audioRecorder;
        this.imageCapturer = imageCapturer;
    }

    get sender() {
        return 'asbplayer-video';
    }

    get command() {
        return 'record-media-and-forward-subtitle';
    }

    async handle(command: Command<Message>, sender: chrome.runtime.MessageSender) {
        const windowActive = await this._isWindowActive(sender.tab.windowId);

        if (!windowActive) {
            console.error("Received record request from wrong window.");
            return;
        }

        const itemId = uuidv4();
        const subtitle = command.message.subtitle;
        const message = {
            command: 'copy',
            id: itemId,
            subtitle: subtitle,
            surroundingSubtitles: command.message.surroundingSubtitles
        };

        let audioPromise: Promise<string> = null;
        let imagePromise: Promise<string> = null;

        if (command.message.record) {
            const time = (subtitle.end - subtitle.start) / command.message.playbackRate + command.message.audioPaddingEnd;
            audioPromise = this.audioRecorder.startWithTimeout(time);
        }

        if (command.message.screenshot) {
            imagePromise = this.imageCapturer.capture(command.message.rect, command.message.maxImageWidth, command.message.maxImageHeight);
        }

        if (imagePromise) {
            const imageBase64 = await imagePromise;
            message['image'] = {
                base64: imageBase64,
                extension: 'jpeg'
            };
            chrome.tabs.sendMessage(sender.tab.id, {
                sender: 'asbplayer-extension-to-video',
                message: {
                    command: 'screenshot-taken'
                },
                src: command.src
            });
        }

        if (audioPromise) {
            const audioBase64 = await audioPromise;
            message['audio'] = {
                base64: audioBase64,
                extension: 'webm',
                paddingStart: command.message.audioPaddingStart,
                paddingEnd: command.message.audioPaddingEnd
            };
        }

        chrome.tabs.query({}, (allTabs) => {
            for (let t of allTabs) {
                chrome.tabs.sendMessage(t.id, {
                    sender: 'asbplayer-extension-to-player',
                    message: message,
                    tabId: sender.tab.id,
                    src: command.src
                });
            }
        });

        if (command.message.showAnkiUi) {
            chrome.tabs.sendMessage(sender.tab.id, {
                sender: 'asbplayer-extension-to-video',
                message: {
                    command: 'show-anki-ui',
                    id: itemId,
                    subtitle: message.subtitle,
                    surroundingSubtitles: message.surroundingSubtitles,
                    image: message.image,
                    audio: message.audio,
                },
                src: command.src
            });
        }
    }

    async _isWindowActive(windowId) {
        return new Promise((resolve, reject) => {
            chrome.windows.getLastFocused(null, (window) => {
                resolve(window.id === windowId);
            });
        });
    }
}