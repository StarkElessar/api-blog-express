export interface IMailService {
	sendActivationMail: (email: string, link: string) => Promise<void>;
}
