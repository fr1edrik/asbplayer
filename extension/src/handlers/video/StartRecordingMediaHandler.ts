import AudioRecorder from '../../services/AudioRecorder';
import ImageCapturer from '../../services/ImageCapturer';
import { v4 as uuidv4 } from 'uuid';
import {
    Command,
    Message,
    ImageModel,
    ScreenshotTakenMessage,
    StartRecordingMediaMessage,
    SubtitleModel,
    VideoToExtensionCommand,
    CopyMessage,
    ExtensionToVideoCommand,
    ExtensionToAsbPlayerCommand,
    ShowAnkUiMessage,
} from '@project/common';

export default class StartRecordingMediaHandler {
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
        return 'start-recording-media';
    }

    async handle(command: Command<Message>, sender: chrome.runtime.MessageSender) {
        const windowActive = await this._isWindowActive(sender.tab.windowId);

        if (!windowActive) {
            console.error('Received record request from wrong window.');
            return;
        }

        const videoToExtensionCommand = command as VideoToExtensionCommand<StartRecordingMediaMessage>;
        const message = videoToExtensionCommand.message;

        if (message.record) {
            this.audioRecorder.start();
        }

        let imageBase64 = null;

        if (message.screenshot) {
            imageBase64 = await this.imageCapturer.capture(message.rect, message.maxImageWidth, message.maxImageHeight);
            const screenshotTakenCommand: ExtensionToVideoCommand<ScreenshotTakenMessage> = {
                sender: 'asbplayer-extension-to-video',
                message: {
                    command: 'screenshot-taken',
                },
                src: videoToExtensionCommand.src,
            };

            chrome.tabs.sendMessage(sender.tab.id, screenshotTakenCommand);
        }

        if (!message.record) {
            const subtitle: SubtitleModel = { text: '', start: message.timestamp, end: message.timestamp, track: 0 };
            const id = uuidv4();

            let image: ImageModel | undefined = undefined;

            if (imageBase64) {
                image = {
                    base64: imageBase64,
                    extension: 'jpeg',
                };
            }

            chrome.tabs.query({}, (allTabs) => {
                for (let t of allTabs) {
                    const copyCommand: ExtensionToAsbPlayerCommand<CopyMessage> = {
                        sender: 'asbplayer-extension-to-player',
                        message: {
                            command: 'copy',
                            id: id,
                            subtitle: subtitle,
                            surroundingSubtitles: [],
                            image: image,
                        },
                        tabId: sender.tab.id,
                        src: videoToExtensionCommand.src,
                    };

                    chrome.tabs.sendMessage(t.id, copyCommand);
                }
            });

            if (message.showAnkiUi) {
                const showAnkiUiCommand: ExtensionToVideoCommand<ShowAnkUiMessage> = {
                    sender: 'asbplayer-extension-to-video',
                    message: {
                        command: 'show-anki-ui',
                        id: id,
                        subtitle: subtitle,
                        surroundingSubtitles: [],
                        image: image,
                    },
                    src: videoToExtensionCommand.src,
                };
                chrome.tabs.sendMessage(sender.tab.id, showAnkiUiCommand);
            }
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
