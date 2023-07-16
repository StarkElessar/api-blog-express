import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { TYPES } from '../types';
import { IConfigService } from '../types/configService.interface';
import { IMailService } from '../types/mailService.interface';

@injectable()
export class MailService implements IMailService {
	private transporter: Transporter<SMTPTransport.SentMessageInfo>;

	constructor(@inject(TYPES.ConfigService) private configService: IConfigService) {
		this.transporter = nodemailer.createTransport({
			service: this.configService.get('SMTP_SERVICE'), // указываем сервис, который будет отправлять письмо
			auth: {
				user: this.configService.get('SMTP_USER'), // адрес почты, с которой будет отправляться письмо
				pass: this.configService.get('SMTP_PASSWORD'), // сгенерированный пароль, после подключения 2-х этапной аутен-ции
			},
		});
	}

	/**
	 * Метод для отправки письма с активацией:
	 * */
	public async sendActivationMail(email: string, link: string): Promise<void> {
		const apiUrl = this.configService.get('API_URL');
		await this.transporter.sendMail({
			from: this.configService.get('SMTP_USER'), // кто отправляет письмо
			to: email, // кому отправить это письмо
			subject: `Активация аккаунта на ${apiUrl}`, // тема письма
			text: '',
			// html разметка для тела письма:
			html: `
        <div>
          <h3>Для активации перейдите по ссылке:</h3>
          <a href="${apiUrl}/api/activate/${link}">
          	${apiUrl}/api/activate/${link}
          </a>
        </div>
			`,
		});
	}
}
