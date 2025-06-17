import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from '../message/message.service';
import { GroupService } from '../group/group.service';
import { Types } from 'mongoose';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly messageService: MessageService,
    private readonly groupService: GroupService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    console.log('🔐 Received token:', token?.slice(0, 20));

    try {
      const decoded = this.jwtService.verify(token);
      console.log('✅ Decoded user from token:', decoded);
      client.data.user = decoded;
    } catch (err) {
      console.error('❌ Invalid token:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected', client.id);
  }

  @SubscribeMessage('joinGroup')
  async handleJoinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    const { groupId } = data;
    const user = client.data.user;
    const userId = user._id || user.sub;

    const group = await this.groupService.getGroupById(groupId);
    if (!group) return client.emit('error', 'Group not found');

    const isMember = group.members?.some(
      (member) => member._id?.toString() === userId,
    );

    if (isMember) {
      client.join(groupId);
      console.log('✅ User joined group:', groupId);
    } else {
      client.emit('error', 'Unauthorized');
    }
  }

  @SubscribeMessage('leaveGroup')
  handleLeaveGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() groupId: string,
  ) {
    client.leave(groupId);
  }

  @SubscribeMessage('sendGroupMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string; text: string },
  ) {
    const user = client.data.user;
    const { groupId, text } = data;

    const userId = user._id || user.userId || user.userid || user.sub;

    console.log('🟢 Incoming message:', { groupId, text });
    console.log('👤 User sending message:', userId);

    const group = await this.groupService.getGroupById(groupId);
    if (!group) return client.emit('error', 'Group not found');

    const isMember = group.members?.some(
      (member) => member._id?.toString() === userId,
    );

    if (!isMember) {
      console.warn('🚫 Unauthorized message sender:', userId);
      return client.emit('error', 'Not allowed to send message');
    }

    const message = await this.messageService.createMessage({
      sender: new Types.ObjectId(userId),
      group: new Types.ObjectId(groupId),
      text,
    });

    const populatedMessage = await message.populate('sender', 'name role');
    this.server.to(groupId).emit('groupMessage', populatedMessage);
  }
}
