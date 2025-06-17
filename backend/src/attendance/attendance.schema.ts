
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Attendance extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  student?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  teacher?: Types.ObjectId;

  @Prop({ type: String, enum: ['Present', 'Absent', 'Late', 'Excused'], required: true })
  status: string;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({ type: String, default: null })
  arrivalTime: string;

  @Prop({ type: Boolean, default: false })
  late: boolean;

  @Prop({ type: Number, default: 0 })
  lateByMinutes: number;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Add custom pre-validation logic
AttendanceSchema.pre('validate', function (next) {
  if (!this.student && !this.teacher) {
    next(new Error('Either student or teacher must be assigned to attendance.'));
  } else {
    next();
  }
});
