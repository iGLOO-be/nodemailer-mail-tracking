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

const linkRE = /(<a\s+(?:[^>]*?\s+)?href=")([^"]*)(")/gi;
export const patchLinks = (
  options: Pick<MailTrackOptions, 'baseUrl'> & JwtOptions,
  html: string,
  data: JwtData
) => {
  return html.replace(linkRE, (_, first, link, end) => {
    const jwtData: JwtDataForLink = {
      ...data,
      link,
    };
    const jwtLink = sign(options, jwtData);
    return `${first}${options.baseUrl}/link/${jwtLink}${end}`;
  });
};
