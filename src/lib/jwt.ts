import jwt from 'jsonwebtoken';
import { JwtData, MailTrackOptions } from '../types';

export type JwtOptions = Pick<MailTrackOptions, 'jwtSecret'>;

export const sign = (options: JwtOptions, data: JwtData) => {
  return jwt.sign(
    {
      ...data,
    },
    options.jwtSecret,
    { expiresIn: '1y' }
  );
};

export const decode = (options: JwtOptions, token: string) => {
  try {
    return jwt.verify(token, options.jwtSecret);
  } catch (originalError) {
    const err = new Error('JwtDecodeError');
    err.name = 'JwtDecodeError';
    throw err;
  }
};

export function isDecodeError(error: any) {
  return error && 'name' in error && error.name === 'JwtDecodeError';
}
