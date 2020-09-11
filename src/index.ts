import { Transporter, SentMessageInfo } from 'nodemailer';

type SendMailOptions = Parameters<Transporter['sendMail']>['0'];
interface Address {
  name: string;
  address: string;
}

interface MailTrackOptions {
  baseUrl: string; // https://next.foldio.eu/api/mailtrack
  jwtSecret: string;
  onLinkClick: (recipient) => void;
  onBlankImageView: (recipient) => void
}

function splitByRecipients(options: SendMailOptions): SendMailOptions[] {
  const results = [
    options.to ? patchOptions(options.to, options) : undefined,
  ].filter(<T>(n?: T): n is T => Boolean(n));
  return results.flat();
}

function patchOptions(
  recipient: string | Address | (string | Address)[],
  options: SendMailOptions
): SendMailOptions[] {
  return [];
}

export async function sendMail(
  transporter: Transporter,
  sendMailOptions: SendMailOptions
): SentMessageInfo[] {
  const options = splitByRecipients(sendMailOptions);

  // Patch html body
   // - Add an empty image at end
    // <img src="https://next.foldio.eu/api/mailtrack/blank-image/[JWT]" />
    // JWT = { recipient: {}, type: "view" }
    // Match regex for `</body>`
   // - Patch links
    // http://trucbrol.com ===> https://next.foldio.eu/api/mailtrack/click/[JWT]
    // JWT = { url: "http://trucbrol.com", recipient: {}, type: "click" }
    // /(<a\s+(?:[^>]*?\s+)?href=")([^"]*)(")/ig

  return await Promise.all(options.map(o => transporter.sendMail(o)));
}

export function expressApp () {
  const app = express()


  app.get('/click/:jwt', () => {
    // emit event

    // redirect to jwt.url
  })
  app.get('/blank-image/:jwt', () => {
    // emit event

    // serve blank image locally
  })
}
