import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('-password');
  }

  async create(userData: Partial<User>) {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async findAll(role?: string): Promise<User[]> {
    const filter = role ? { role } : {};
    return this.userModel.find(filter).select('-password').exec();
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) throw new NotFoundException('User not found');
    return updatedUser;
  }

  async delete(id: string): Promise<{ message: string }> {
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    if (!deletedUser) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }

  async assignStudentsToTeacher(teacherId: string, studentIds: string[]) {
    const teacher = await this.userModel.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      throw new NotFoundException('Teacher not found or invalid role');
    }

    const students = await this.userModel.find({
      _id: { $in: studentIds },
      role: 'student',
    });

    if (students.length !== studentIds.length) {
      throw new NotFoundException('Some student IDs are invalid');
    }

    const objectIds = studentIds.map((id) => new Types.ObjectId(id));
    teacher.assignedStudents = objectIds;
    return teacher.save();
  }

  async getStudentsOfTeacher(teacherId: string) {
    const teacher = await this.userModel
      .findById(teacherId)
      .populate('assignedStudents')
      .exec();

    if (!teacher) throw new NotFoundException('Teacher not found');

    return teacher.assignedStudents || [];
  }
  async getStudentsByTeacher(teacherId: string) {
    const teacher = await this.userModel.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      throw new NotFoundException('Teacher not found or invalid role');
    }

    const studentIds = teacher.assignedStudents || [];

    // Map ids to ObjectId to avoid CastError
    const objectIds = studentIds.map((id) => new Types.ObjectId(id));

    const students = await this.userModel.find({
      _id: { $in: objectIds },
      role: 'student',
    }).select('-password');

    return students;
  }

  async getStudentsAssignedToTeacher(teacherId: string): Promise<User[]> {
  const teacher = await this.userModel
    .findById(teacherId)
    .populate('assignedStudents') // ✅ Correct path
    .exec();

  if (!teacher || !teacher.assignedStudents) {
    throw new NotFoundException('Teacher or students not found');
  }

  return teacher.assignedStudents as unknown as User[];

}




  async findOrCreateGoogleUser(googleUser: { name: string; email: string; googleId: string }) {
  let user = await this.userModel.findOne({ email: googleUser.email });

  if (!user) {
    user = await this.userModel.create({
      name: googleUser.name,
      email: googleUser.email,
      googleId: googleUser.googleId,
      role: 'student', // default role
    });
  }

  return user;
}




}
