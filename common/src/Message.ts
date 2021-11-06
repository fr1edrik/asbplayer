export interface Message {

    command: string
}

export interface AsbplayerHeartbeatMessage extends Message {

    command: 'heartbeat',
    id: string
}

export interface HttpPostMessage extends Message {

    command: 'http-post',
    url: string,
    body: any
}

export interface SettingsUpdatedMessage extends Message {

    command: 'settings-updated'
}