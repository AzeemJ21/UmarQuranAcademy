import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  public onlineUsers = new Set<string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    console.log('✅ Connected user:', userId); // 
    if (userId) {
      this.onlineUsers.add(userId);
      this.broadcastOnlineUsers();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.onlineUsers.delete(userId);
      this.broadcastOnlineUsers();
    }
  }

  private broadcastOnlineUsers() {
    this.server.emit('online-users', Array.from(this.onlineUsers));
  }
}


