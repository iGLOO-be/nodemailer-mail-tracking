import { Transporter, SentMessageInfo } from 'nodemailer';
import {
  SendMailOptions,
  SendMailOptionsWithHtml,
  MailTrackOptions,
  JwtData,
} from './types';
import { splitByRecipients } from './lib/split-recipients';
import { addBlankImage, patchLinks } from './lib/patch-html';

function isMailOptionsWithHtml(v: any): v is SendMailOptionsWithHtml {
  return v.html && typeof v.html === 'string';
}

export const sendMail = async (
  options: MailTrackOptions,
  transporter: Transporter,
  sendMailOptions: SendMailOptions
): Promise<SentMessageInfo[]> => {
  if (!isMailOptionsWithHtml(sendMailOptions)) {
    return [await transporter.sendMail(sendMailOptions)];
  }

  const sendOptions = splitByRecipients(sendMailOptions).map(o => {
    const data = {
      recipient:
        (o.envelope.to &&
          (Array.isArray(o.envelope.to) ? o.envelope.to[0] : o.envelope.to)) ||
        '',
    };
    const tokenData = {
      ...options.getData(data),
      ...data,
    };
    return {
      ...o,
      html: patchHtmlBody(options, o.html, tokenData),
    };
  });

  return Promise.all(sendOptions.map(o => transporter.sendMail(o)));
};

const patchHtmlBody = (
  options: MailTrackOptions,
  html: string,
  data: JwtData
) => {
  return patchLinks(options, addBlankImage(options, html, data), data).trim();
};
