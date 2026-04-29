import { Server, Socket } from 'socket.io';
export declare class NotificationsGateway {
    server: Server;
    handleJoin(userId: string, client: Socket): void;
    sendNotification(userId: string, data: {
        type: string;
        message: string;
        payload?: any;
    }): void;
}
