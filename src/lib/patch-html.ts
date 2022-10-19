import { load } from 'cheerio';
import { sign, JwtOptions } from './jwt';
import { JwtData, JwtDataForLink, MailTrackOptions } from '../types';

export const addBlankImage = (
  options: Pick<MailTrackOptions, 'baseUrl'> & JwtOptions,
  html: string,
  data: JwtData
) => {
  const jwtImg = sign(options, data);
  const imgTag = `<img src="${options.baseUrl}/blank-image/${jwtImg}" />`;
  if (new RegExp(/<\/body>/).test(html)) {
    html = html.replace(/<\/body>/, `${imgTag}</body>`);
  } else {
    html = `${html}${imgTag}`;
  }

  return html;
};

export const patchLinks = (
  options: Pick<MailTrackOptions, 'baseUrl'> & JwtOptions,
  html: string,
  data: JwtData
) => {
  const $ = load(html);
  $('a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && !href.startsWith('mailto:') && !href.startsWith('#')) {
      const jwtData: JwtDataForLink = {
        ...data,
        link: href,
      };
      const jwtLink = sign(options, jwtData);
      $(el).attr('href', `${options.baseUrl}/link/${jwtLink}`);
    }
  });
  return $.html();
};
