import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop()
  text: string;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  group: Types.ObjectId;

  @Prop() 
  fileUrl?: string;

  @Prop() 
  fileName?: string;

  @Prop() 
  fileType?: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
