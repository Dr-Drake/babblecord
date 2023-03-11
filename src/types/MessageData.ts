export interface MessageData{
    username: string;
    message: string;
    time: Date | string;
    type?: 'notification' | 'chat'
}