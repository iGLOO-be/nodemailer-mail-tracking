import { Transporter, SentMessageInfo } from 'nodemailer';
import {
  SendMailOptions,
  SendMailOptionsWithHtml,
  MailTrackOptionsSendMail,
  JwtData,
  SendMailOptionsPatched,
} from './types';
import { splitByRecipients } from './lib/split-recipients';
import { addBlankImage, patchLinks } from './lib/patch-html';

function isMailOptionsWithHtml(v: any): v is SendMailOptionsWithHtml {
  return v.html && typeof v.html === 'string';
}

type SendMailResult = {
  result?: SentMessageInfo;
  error?: any;
  sendOptions: SendMailOptions | SendMailOptionsPatched;
};

export const sendMail = async (
  options: MailTrackOptionsSendMail,
  transporter: Transporter,
  sendMailOptions: SendMailOptions
): Promise<SendMailResult[]> => {
  if (!isMailOptionsWithHtml(sendMailOptions)) {
    try {
      const result: SentMessageInfo = await transporter.sendMail(
        sendMailOptions
      );
      return [
        {
          result: result,
          sendOptions: sendMailOptions,
        },
      ];
    } catch (error) {
      return [
        {
          error,
          sendOptions: sendMailOptions,
        },
      ];
    }
  }
  const sendOptions = getSendOptions(options, sendMailOptions);
  return Promise.all(
    sendOptions.map(async o => {
      try {
        const result = await transporter.sendMail(o);
        return {
          result,
          sendOptions: o,
        };
      } catch (error) {
        return {
          error,
          sendOptions: o,
        };
      }
    })
  );
};

const getSendOptions = (
  options: MailTrackOptionsSendMail,
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
  options: MailTrackOptionsSendMail,
  html: string,
  data: JwtData
) => {
  return patchLinks(options, addBlankImage(options, html, data), data).trim();
};

export const extractEmails = (text: string) => {
  // d\+1 = "+"
  const result = text.match(
    /([a-zA-Z0-9._-]+[d\+1]?[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi
  );
  return (result && result[0]) || '';
};
