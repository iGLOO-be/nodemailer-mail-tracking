import { Transporter, SentMessageInfo } from 'nodemailer';
import pMap from 'p-map';
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
      if (options.getSendOptionsBeforeSend) {
        sendMailOptions = await options.getSendOptionsBeforeSend(
          sendMailOptions as SendMailOptionsPatched
        );
      }
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
  return pMap(
    sendOptions,
    async sendOptions => {
      try {
        if (options.getSendOptionsBeforeSend) {
          sendOptions = await options.getSendOptionsBeforeSend(sendOptions);
        }
        const result = await transporter.sendMail(sendOptions);
        return {
          result,
          sendOptions: sendOptions,
        };
      } catch (error) {
        return {
          error,
          sendOptions: sendOptions,
        };
      }
    },
    {
      concurrency: options.sendConcurrency || Infinity,
    }
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
    /([a-zA-Z0-9._-]+[d+1]?[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi
  );
  return (result && result[0]) || '';
};
