import express from 'express';
import { MailTrackOptionsMiddleware, JwtData, JwtDataForLink } from './types';
import { decode, isDecodeError } from './lib/jwt';

const image = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>`;

export function expressApp(options: MailTrackOptionsMiddleware) {
  const app = express();

  app.get('/link/:jwt', async (req, res, next) => {
    try {
      const data = decode(options, req.params.jwt) as JwtDataForLink;
      await options.onLinkClick(data);
      res.redirect(data.link);
    } catch (err) {
      if (isDecodeError(err)) {
        next();
      } else {
        next(err);
      }
    }
  });

  app.get('/blank-image/:jwt', async (req, res, next) => {
    try {
      const data = decode(options, req.params.jwt) as JwtData;
      await options.onBlankImageView(data);
      res.set('Content-Type', 'image/svg+xml');
      res.send(image);
    } catch (err) {
      if (isDecodeError(err)) {
        next();
      } else {
        next(err);
      }
    }
  });

  return app;
}
