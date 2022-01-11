import {
  SendMailOptions,
  SendMailOptionsWithHtml,
  SendMailOptionsPatched,
  IRecipient,
} from '../types';

const recipientKeys = ['to', 'cc', 'bcc'];

export const splitByRecipients = (
  options: SendMailOptionsWithHtml
): SendMailOptionsPatched[] => {
  return recipientKeys
    .map(
      recipientKey =>
        options[recipientKey as keyof typeof options] as IRecipient
    )
    .map(recipient => patchSendMailOptions(recipient, options))
    .flat()
    .filter(<T>(n?: T): n is T => Boolean(n));
};

const joinRecipients = (recipients: string | string[]) =>
  Array.isArray(recipients) ? recipients.join(', ') : recipients;

const patchSendMailOptions = (
  recipient: IRecipient,
  { to, cc, bcc, ...options }: SendMailOptionsWithHtml
): SendMailOptionsPatched[] | undefined => {
  const headers: SendMailOptions['headers'] = {};
  const toAddress = getRecipientAddress(to);
  if (toAddress) {
    headers.To = joinRecipients(toAddress);
  }
  const ccAddress = getRecipientAddress(cc);
  if (ccAddress) {
    headers.Cc = joinRecipients(ccAddress);
  }
  const bccAddress = getRecipientAddress(bcc);
  if (bccAddress) {
    headers.Bcc = joinRecipients(bccAddress);
  }

  const from = getRecipientAddress(options.from);
  const rcptTo = toArrayString(getRecipientAddress(recipient)) || [];

  return rcptTo.map(recipient => ({
    ...options,
    headers: {
      ...options.headers,
      ...headers,
    },
    envelope: {
      from: Array.isArray(from) ? from[0] : from,
      to: recipient,
    },
  }));
};

function getRecipientAddress(
  recipient: IRecipient
): string | string[] | undefined {
  return typeof recipient === 'string'
    ? recipient
    : Array.isArray(recipient)
    ? recipient
        .map(r => {
          return typeof r === 'string'
            ? r
            : ((r as any).address as string) || undefined;
        })
        .filter(<T>(n?: T): n is T => Boolean(n))
    : recipient?.address
    ? recipient.address
    : undefined;
}

function toArrayString(value?: string | string[]): string[] | undefined {
  return typeof value === 'undefined' || Array.isArray(value) ? value : [value];
}
