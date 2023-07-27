import { Transporter } from 'nodemailer';

interface Address {
  name: string;
  address: string;
}

interface Envelope {
  /** the first address gets used as MAIL FROM address in SMTP */
  from?: string;
  /** addresses from this value get added to RCPT TO list */
  to?: string;
  /** addresses from this value get added to RCPT TO list */
  cc?: string;
  /** addresses from this value get added to RCPT TO list */
  bcc?: string;
}

export type SendMailOptions = Parameters<Transporter['sendMail']>['0'];
export type IRecipient =
  | SendMailOptions['to']
  | SendMailOptions['cc']
  | SendMailOptions['bcc'];

export type SendMailOptionsWithHtml = SendMailOptions & {
  html: string;
};

export type SendMailOptionsPatched = Omit<
  SendMailOptionsWithHtml,
  'envelope'
> & {
  envelope: Omit<Envelope, 'to'> & {
    to: string | Address;
  };
};

interface MailTrackOptionsBase {
  baseUrl: string; // ex: https://some-domain.com/api/mailtrack
  jwtSecret: string;
  imageAlt?: string;
}

export interface MailTrackOptionsSendMail extends MailTrackOptionsBase {
  sendConcurrency?: number;
  getData: (
    data: JwtData | JwtDataForLink
  ) => {
    [key: string]: any;
  };
  getSendOptionsBeforeSend?: (
    options: SendMailOptionsPatched
  ) => SendMailOptionsPatched;
}

export interface MailTrackOptionsMiddleware extends MailTrackOptionsBase {
  onLinkClick: (data: JwtDataForLink) => Promise<void>;
  onBlankImageView: (data: JwtData) => Promise<void>;
}

export type MailTrackOptions = MailTrackOptionsSendMail &
  MailTrackOptionsMiddleware;

export interface JwtData {
  recipient: string;
  [key: string]: any;
}

export type JwtDataForLink = JwtData & {
  link: string;
};
