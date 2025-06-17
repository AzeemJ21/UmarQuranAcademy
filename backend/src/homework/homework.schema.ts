import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Homework extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacher: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, default: '' })
  sabaq: string;

  @Prop({ type: String, default: '' })
  sabqi: string;

  @Prop({ type: String, default: '' })
  manzil: string;

  @Prop({ type: String, default: '' })
  comment: string;
}

export const HomeworkSchema = SchemaFactory.createForClass(Homework);
