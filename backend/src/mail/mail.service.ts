import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <h2>Assalam u Alaikum ${name},</h2>
      <p>Welcome to <strong>${process.env.APP_NAME}</strong>!</p>
      <p>You have been registered successfully. We're glad to have you on board.</p>
      <p>JazakAllah Khair,<br/>${process.env.APP_NAME} Team</p>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.APP_NAME}" <${process.env.MAIL_USER}>`,
        to,
        subject: `Welcome to ${process.env.APP_NAME}!`,
        html,
      });
      console.log('✅ Email sent:', info.messageId);
    } catch (err) {
      console.error('❌ Email sending failed:', err.message);
    }
  }

  
  async sendMail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: `"Umar Quran Academy" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}