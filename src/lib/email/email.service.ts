import nodemailer from 'nodemailer';
import { config } from '@/config';
import {
  createVerificationEmailTemplate,
  createWelcomeEmailTemplate,
  createPasswordResetEmailTemplate,
  createPasswordResetSuccessTemplate,
  createAccountDeactivationTemplate,
  createAccountDeletionTemplate,
} from './email.templates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  private async sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: {
          name: 'Our Platform',
          address: config.email.from!,
        },
        to,
        subject,
        html,
      });
      console.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error('Email failed:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, verificationUrl: string): Promise<boolean> {
    const html = createVerificationEmailTemplate(verificationUrl);

    return this.sendEmail({
      to: email,
      subject: 'Please Verify Your Email',
      html,
    });
  }

  async sendWelcomeEmail(email: string, userName: string, dashboardUrl: string): Promise<boolean> {
    const html = createWelcomeEmailTemplate(userName, dashboardUrl);

    return this.sendEmail({
      to: email,
      subject: `Welcome ${userName}!`,
      html,
    });
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
    const html = createPasswordResetEmailTemplate(resetUrl);

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html,
    });
  }

  async sendPasswordResetSuccessEmail(email: string, loginUrl: string): Promise<boolean> {
    const html = createPasswordResetSuccessTemplate(loginUrl);

    return this.sendEmail({
      to: email,
      subject: 'Password Reset Successful',
      html,
    });
  }

  async sendAccountDeactivationEmail(
    email: string,
    userName: string,
    loginUrl: string,
  ): Promise<boolean> {
    const html = createAccountDeactivationTemplate(userName, loginUrl);

    return this.sendEmail({
      to: email,
      subject: 'Account Deactivated',
      html,
    });
  }

  async sendAccountDeletionEmail(
    email: string,
    userName: string,
    deletionDate: Date,
    profileUrl: string,
  ): Promise<boolean> {
    const html = createAccountDeletionTemplate(userName, deletionDate, profileUrl);

    return this.sendEmail({
      to: email,
      subject: 'Account Deletion Scheduled',
      html,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connected successfully');
      return true;
    } catch (error) {
      console.error('Email connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
