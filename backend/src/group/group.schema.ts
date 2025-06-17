// src/group/schemas/group.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Group extends Document {
  @Prop({ required: true })
  name: string;

   @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  members: Types.ObjectId[];

  
}

export const GroupSchema = SchemaFactory.createForClass(Group);
