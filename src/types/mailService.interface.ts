import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';

export type SendMailDataType = { email: string, token: string };

export interface IMailService {
	sendActivationMail: (data: SendMailDataType) => Promise<SentMessageInfo>;
	sendResetPasswordMail: (data: SendMailDataType) => Promise<SentMessageInfo>;
}
