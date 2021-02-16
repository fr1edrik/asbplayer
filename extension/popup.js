document.addEventListener('DOMContentLoaded', (e) => {
    const checkbox = document.getElementById('displaySubtitlesInput');
    checkbox.addEventListener('change', (e) => {
        chrome.storage.sync.set({displaySubtitles: checkbox.checked}, () => {
            chrome.runtime.sendMessage({
                sender: 'asbplayer-popup',
                message: {
                    command: 'settings-updated'
                }
            });
        });
    });

    chrome.storage.sync.get('displaySubtitles', (data) => {
        checkbox.checked = data.displaySubtitles;
    });

    let tabId;

    chrome.runtime.sendMessage(
        {
            sender: 'asbplayer-popup',
            message: {
                command: 'query-active-tab'
            }
        },
        (response) => {
            console.log("response");
            console.log(response);

            console.log(response.id);
            tabId = response.id;
        }
    );
    const button = document.getElementById('recordAudioButton');

    chrome.commands.onCommand.addListener((command) => {
        console.log(command);
        console.log(chrome);
        console.log("taID=" + tabId);
        chrome.tabCapture.getMediaStreamId({consumerTabId: tabId}, (streamId) => {
            console.log("streamId=" + streamId);
            chrome.runtime.sendMessage({
                sender: 'asbplayer-popup',
                message: {
                    command: 'tab-media-stream',
                    tabId: tabId,
                    streamId: streamId
                }
            })
        });
    });

    button.addEventListener('click', (e) => {
        console.log("tabId=" + tabId);

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {console.log(tabs)});
//        chrome.tabs.getCurrent((tab) => {
//            console.log(tab);
//            chrome.tabCapture.getMediaStreamId({consumerTabId: tab.id}, (streamId) => {
//                chrome.runtime.sendMessage({
//                    sender: 'asbplayer-popup',
//                    message: {
//                        command: 'tab-media-stream',
//                        value: streamId
//                    }
//                })
//            });
//        });
    });
});