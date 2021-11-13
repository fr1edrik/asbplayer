import {
    Command,
    ExtensionSyncMessage,
    ExtensionToAsbPlayerCommand,
    Message,
    PlayerSyncMessage,
    VideoToExtensionCommand,
} from '@project/common';
import TabRegistry from '../../services/TabRegistry';

export default class SyncHandler {
    private readonly tabRegistry: TabRegistry;

    constructor(tabRegistry: TabRegistry) {
        this.tabRegistry = tabRegistry;
    }

    get sender() {
        return 'asbplayer-video';
    }

    get command() {
        return 'sync';
    }

    async handle(command: Command<Message>, sender: chrome.runtime.MessageSender) {
        let chosenTabId = await this.tabRegistry.findAsbplayerTab(sender.tab);
        await this.tabRegistry.publish();

        if (chosenTabId) {
            const videoToExtensionCommand = command as VideoToExtensionCommand<ExtensionSyncMessage>;
            const syncCommand: ExtensionToAsbPlayerCommand<PlayerSyncMessage> = {
                sender: 'asbplayer-extension-to-player',
                message: {
                    command: 'syncv2',
                    subtitles: videoToExtensionCommand.message.subtitles,
                },
                src: videoToExtensionCommand.src,
                tabId: sender.tab.id,
            };

            chrome.tabs.sendMessage(Number(chosenTabId), syncCommand);
        }
    }
}
