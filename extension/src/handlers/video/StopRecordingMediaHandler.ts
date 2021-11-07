import AudioRecorder from '../../services/AudioRecorder';
import ImageCapturer from '../../services/ImageCapturer';
import { v4 as uuidv4 } from 'uuid';
import {
    AudioModel,
    Command,
    CopyMessage,
    ExtensionToAsbPlayerCommand,
    ExtensionToVideoCommand,
    ImageModel,
    Message,
    mockSurroundingSubtitles,
    ShowAnkUiMessage,
    StopRecordingMediaMessage,
    SubtitleModel,
    VideoToExtensionCommand,
} from '@project/common';

export default class StopRecordingMediaHandler {
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
        return 'stop-recording-media';
    }

    async handle(command: Command<Message>, sender: chrome.runtime.MessageSender) {
        const windowActive = await this._isWindowActive(sender.tab.windowId);

        if (!windowActive) {
            console.error('Received record request from wrong window.');
            return;
        }

        const videoToExtensionCommand = command as VideoToExtensionCommand<StopRecordingMediaMessage>;
        const message = videoToExtensionCommand.message;

        const itemId = uuidv4();
        const subtitle: SubtitleModel = {
            text: '',
            start: message.startTimestamp,
            end: message.endTimestamp,
            track: 0,
        };
        const surroundingSubtitles = mockSurroundingSubtitles(subtitle, message.videoDuration, 5000);

        let image: ImageModel | undefined = undefined;

        if (message.screenshot && this.imageCapturer.lastImageBase64) {
            image = {
                base64: this.imageCapturer.lastImageBase64,
                extension: 'jpeg',
            };
        }

        const audioBase64 = await this.audioRecorder.stop();
        const audio: AudioModel = {
            base64: audioBase64,
            extension: 'webm',
            paddingStart: 0,
            paddingEnd: 0,
            start: message.startTimestamp,
            end: message.endTimestamp,
        };

        chrome.tabs.query({}, (allTabs) => {
            const copyCommand: ExtensionToAsbPlayerCommand<CopyMessage> = {
                sender: 'asbplayer-extension-to-player',
                message: {
                    command: 'copy',
                    id: itemId,
                    subtitle: subtitle,
                    surroundingSubtitles: surroundingSubtitles,
                    image: image,
                    audio: audio,
                },
                tabId: sender.tab.id,
                src: videoToExtensionCommand.src,
            };

            for (let t of allTabs) {
                chrome.tabs.sendMessage(t.id, copyCommand);
            }
        });

        if (message.showAnkiUi) {
            const showAnkiUiCommand: ExtensionToVideoCommand<ShowAnkUiMessage> = {
                sender: 'asbplayer-extension-to-video',
                message: {
                    command: 'show-anki-ui',
                    id: itemId,
                    subtitle: subtitle,
                    surroundingSubtitles: surroundingSubtitles,
                    image: image,
                    audio: audio,
                },
                src: videoToExtensionCommand.src,
            };

            chrome.tabs.sendMessage(sender.tab.id, showAnkiUiCommand);
        }
    }

    async _isWindowActive(windowId): Promise<boolean> {
        return new Promise((resolve, reject) => {
            chrome.windows.getLastFocused(null, (window) => {
                resolve(window.id === windowId);
            });
        });
    }
}
