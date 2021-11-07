import AudioRecorder from '../../services/AudioRecorder';
import ImageCapturer from '../../services/ImageCapturer';
import { v4 as uuidv4 } from 'uuid';
import { Command, Message, RecordMediaAndForwardSubtitleMessage, VideoToExtensionCommand } from '@project/common';

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
        const videoToExtensionCommand = command as VideoToExtensionCommand<RecordMediaAndForwardSubtitleMessage>;
        const message = videoToExtensionCommand.message;

        const windowActive = await this._isWindowActive(sender.tab.windowId);

        if (!windowActive) {
            console.error('Received record request from wrong window.');
            return;
        }

        const itemId = uuidv4();
        const subtitle = message.subtitle;
        const extensionToPlayerMessage = {
            command: 'copy',
            id: itemId,
            subtitle: subtitle,
            surroundingSubtitles: message.surroundingSubtitles,
            image: undefined,
            audio: undefined,
        };

        let audioPromise: Promise<string> = null;
        let imagePromise: Promise<string> = null;

        if (message.record) {
            const time = (subtitle.end - subtitle.start) / message.playbackRate + message.audioPaddingEnd;
            audioPromise = this.audioRecorder.startWithTimeout(time);
        }

        if (message.screenshot) {
            imagePromise = this.imageCapturer.capture(message.rect, message.maxImageWidth, message.maxImageHeight);
        }

        if (imagePromise) {
            const imageBase64 = await imagePromise;
            extensionToPlayerMessage['image'] = {
                base64: imageBase64,
                extension: 'jpeg',
            };
            chrome.tabs.sendMessage(sender.tab.id, {
                sender: 'asbplayer-extension-to-video',
                message: {
                    command: 'screenshot-taken',
                },
                src: videoToExtensionCommand.src,
            });
        }

        if (audioPromise) {
            const audioBase64 = await audioPromise;
            extensionToPlayerMessage['audio'] = {
                base64: audioBase64,
                extension: 'webm',
                paddingStart: videoToExtensionCommand.message.audioPaddingStart,
                paddingEnd: videoToExtensionCommand.message.audioPaddingEnd,
            };
        }

        chrome.tabs.query({}, (allTabs) => {
            for (let t of allTabs) {
                chrome.tabs.sendMessage(t.id, {
                    sender: 'asbplayer-extension-to-player',
                    message: extensionToPlayerMessage,
                    tabId: sender.tab.id,
                    src: videoToExtensionCommand.src,
                });
            }
        });

        if (videoToExtensionCommand.message.showAnkiUi) {
            chrome.tabs.sendMessage(sender.tab.id, {
                sender: 'asbplayer-extension-to-video',
                message: {
                    command: 'show-anki-ui',
                    id: itemId,
                    subtitle: extensionToPlayerMessage.subtitle,
                    surroundingSubtitles: extensionToPlayerMessage.surroundingSubtitles,
                    image: extensionToPlayerMessage.image,
                    audio: extensionToPlayerMessage.audio,
                },
                src: videoToExtensionCommand.src,
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
