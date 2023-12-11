import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import nodemailer, { Transporter } from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';

import { DiTypes } from '../diTypes';
import { IConfigService } from '../types/configService.interface';
import { IMailService, SendMailDataType } from '../types/mailService.interface';

@injectable()
export class MailService implements IMailService {
	private _transporter: Transporter<SentMessageInfo>;
	private readonly _clientUrl: string;
	private readonly _smtpUser: string;

	constructor(@inject(DiTypes.ConfigService) private _configService: IConfigService) {
		this._clientUrl = this._configService.get('CLIENT_URL');
		this._smtpUser = this._configService.get('SMTP_USER');

		this._transporter = nodemailer.createTransport({
			/** указываем сервис, который будет отправлять письмо */
			service: this._configService.get('SMTP_SERVICE'),
			auth: {
				/** адрес почты, с которой будет отправляться письмо */
				user: this._smtpUser,
				/** сгенерированный пароль, после подключения 2-х этапной аутен-ции */
				pass: this._configService.get('SMTP_PASSWORD'),
			},
		});
	}

	/**
	 * Метод для отправки письма с активацией:
	 * */
	public async sendActivationMail({ email, token }: SendMailDataType): Promise<SentMessageInfo> {
		return this._transporter.sendMail({
			/** Кто отправляет письмо */
			from: this._smtpUser,
			/** Кому отправить письмо */
			to: email,
			/** Тема для письма */
			subject: `Активация аккаунта на ${this._clientUrl}`,
			text: '',
			/** html разметка для тела письма: */
			html: `
        <div>
          <h3>Для активации перейдите по ссылке:</h3>
          <a href="${this._clientUrl}/auth/activate?token=${token}">активировать аккаунт</a>
        </div>
			`,
		});
	}

	// TODO: обработать колбек
	public async sendResetPasswordMail({ email, token }: SendMailDataType): Promise<SentMessageInfo> {
		return this._transporter.sendMail({
			from: this._smtpUser,
			to: email,
			subject: `Восстановление пароля для аккаунта на сайте ${this._clientUrl}`,
			text: '',
			html: `
				<div>
          <h3>Для восстановления пароля перейдите по ссылке:</h3>
          <a href="${this._clientUrl}/auth/reset?token=${token}">восстановить пароль</a>
        </div>
			`,
		});
	}
}
