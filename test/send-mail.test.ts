import { extractEmails, sendMail } from '../src/send-mail';
import { MailTrackOptionsSendMail } from '../src/types';

jest.mock('nodemailer');
const nodemailer = require('nodemailer'); // doesn't work with import
const sendMailMock = jest.fn();
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

const mailTrackingOptions: MailTrackOptionsSendMail = {
  baseUrl: 'http://localhost:3000/mail-track',
  jwtSecret: 'secret',
  getData: () => ({}),
};

beforeEach(() => {
  sendMailMock.mockClear();
  nodemailer.createTransport.mockClear();
});

describe('send-mail', () => {
  it('Should split mail by recipient', async () => {
    const transporter = nodemailer.createTransport();
    const result = await sendMail(mailTrackingOptions, transporter, {
      from: 'me@mail.fake',
      to: 'to@mail.fake',
      cc: 'cc@mail.fake',
      bcc: 'bcc@mail.fake',
      subject: 'test',
      html: `
        <html>
          <body>
            <h1>Hello!</h1>
          </body>
        </html>
      `,
    });
    expect(sendMailMock).toHaveBeenCalled();
    expect(result).toHaveLength(3);
  });
  it('Should not split mail by recipient because no html', async () => {
    const transporter = nodemailer.createTransport();
    const result = await sendMail(mailTrackingOptions, transporter, {
      from: 'me@mail.fake',
      to: 'to@mail.fake',
      cc: 'cc@mail.fake',
      bcc: 'bcc@mail.fake',
      subject: 'test',
      text: 'Hello !',
    });
    expect(sendMailMock).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });
});

describe('extractEmails', () => {
  it('Extract email from string', () => {
    expect(extractEmails('to@mail.fake')).toBe('to@mail.fake');
  });
  it('Extract email from string (with name)', () => {
    expect(extractEmails('My Name <to@mail.fake>')).toBe('to@mail.fake');
  });
  it('Fail to extract email from string', () => {
    expect(extractEmails('bla bla bla')).toBe('');
  });
  it('Extract email from string (name & +)', () => {
    expect(extractEmails('Test <me+test@mail.fake>')).toBe('me+test@mail.fake');
  });
});
