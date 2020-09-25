import {
  SendMailOptions,
  SendMailOptionsWithHtml,
  SendMailOptionsPatched,
  IRecipient,
} from '../types';

export const splitByRecipients = (
  options: SendMailOptionsWithHtml
): SendMailOptionsPatched[] => {
  const recipientKeys = ['to', 'cc', 'bcc'];
  const results: SendMailOptionsPatched[] = [];

  for (let recipientKey of recipientKeys) {
    if (options[recipientKey as keyof typeof options]) {
      results.push(
        patchSendMailOptions(
          options[recipientKey as keyof typeof options] as IRecipient,
          options
        )
      );
    }
  }
  return results;
};

const patchSendMailOptions = (
  recipient: IRecipient,
  { to, cc, bcc, ...options }: SendMailOptionsWithHtml
): SendMailOptionsPatched => {
  const headers: SendMailOptions['headers'] = {};
  const toAddress = getRecipientAddress(to);
  if (toAddress) {
    headers.To = toAddress;
  }
  const ccAddress = getRecipientAddress(cc);
  if (ccAddress) {
    headers.Cc = ccAddress;
  }
  const bccAddress = getRecipientAddress(bcc);
  if (bccAddress) {
    headers.Bcc = bccAddress;
  }

  const from = getRecipientAddress(options.from);
  const rcptTo = getRecipientAddress(recipient);

  return {
    ...options,
    headers: {
      ...options.headers,
      ...headers,
    },
    envelope: {
      from: (Array.isArray(from) ? from[0] : from) || false,
      to: Array.isArray(rcptTo) ? rcptTo : [rcptTo as string],
    },
  };
};

function getRecipientAddress(
  recipient: IRecipient
): string | string[] | undefined {
  return typeof recipient === 'string'
    ? recipient
    : Array.isArray(recipient)
    ? recipient
        .map(r => {
          return r === 'string'
            ? r
            : ((r as any).address as string) || undefined;
        })
        .filter(<T>(n?: T): n is T => Boolean(n))
    : recipient?.address
    ? recipient.address
    : undefined;
}
