import { Transporter } from 'nodemailer';

export type SendMailOptions = Parameters<Transporter['sendMail']>['0'];
export type IRecipient =
  | SendMailOptions['to']
  | SendMailOptions['cc']
  | SendMailOptions['bcc'];

export type SendMailOptionsWithHtml = SendMailOptions & {
  html: string;
};

export type SendMailOptionsPatched = SendMailOptionsWithHtml & {
  envelope: NonNullable<SendMailOptions['envelope']>;
};

export interface MailTrackOptions {
  baseUrl: string; // ex: https://some-domain.com/api/mailtrack
  jwtSecret: string;
  getData: (
    data: JwtData | JwtDataForLink
  ) => {
    [key: string]: any;
  };
  onLinkClick: (data: JwtDataForLink) => void;
  onBlankImageView: (data: JwtData) => void;
}

export interface JwtData {
  recipient: string;
  [key: string]: any;
}

export type JwtDataForLink = JwtData & {
  link: string;
};
