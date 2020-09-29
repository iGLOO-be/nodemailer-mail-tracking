import { Transporter, SentMessageInfo } from 'nodemailer';
import {
  SendMailOptions,
  SendMailOptionsWithHtml,
  MailTrackOptions,
  JwtData,
  SendMailOptionsPatched,
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
  const sendOptions = getSendOptions(options, sendMailOptions);
  return Promise.all(sendOptions.map(o => transporter.sendMail(o)));
};

const getSendOptions = (
  options: MailTrackOptions,
  sendMailOptions: SendMailOptionsWithHtml
): SendMailOptionsPatched[] => {
  return splitByRecipients(sendMailOptions).map(o => {
    const data = {
      recipient:
        typeof o.envelope.to === 'object'
          ? o.envelope.to.address
          : extractEmails(o.envelope.to),
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
};

const patchHtmlBody = (
  options: MailTrackOptions,
  html: string,
  data: JwtData
) => {
  return patchLinks(options, addBlankImage(options, html, data), data).trim();
};

export const extractEmails = (text: string) => {
  const result = text.match(
    /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi
  );
  return (result && result[0]) || '';
};
