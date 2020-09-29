import request from 'supertest';
import { ErrorRequestHandler } from 'express';
import { verify } from 'jsonwebtoken';
import { expressApp } from '../src/express-middleware';
import { JwtDataForLink, JwtData } from '../src/types';

jest.mock('jsonwebtoken');
const mockedVerify = verify as jest.Mock<{}>;

const options = {
  baseUrl: 'http://some-path',
  jwtSecret: 'qsdsd',
  onLinkClick: async (data: JwtDataForLink) => {
    console.log(data);
  },
  onBlankImageView: async (data: JwtData) => {
    console.log(data);
  },
};

const getApp = (options: Parameters<typeof expressApp>[0]) => {
  const app = expressApp(options);

  const errorHandler: ErrorRequestHandler = (err, _, _2, next) => {
    // console.error(err)
    // console.error(err.message)
    next(err);
  };

  app.use(errorHandler);

  return app;
};

describe('express', () => {
  describe('link', () => {
    it('Get links with valid token', async () => {
      mockedVerify.mockImplementation((token: String) => ({
        recipient: 'foo',
        link: `http://${token}`,
      }));

      const onLinkClick = jest.fn();
      const app = getApp({
        ...options,
        onLinkClick,
      });
      await request(app)
        .get('/link/some-jwt-token')
        .expect(302)
        .expect('Location', 'http://some-jwt-token');

      expect(onLinkClick).toBeCalledWith({
        recipient: 'foo',
        link: 'http://some-jwt-token',
      });
    });
    it('Get links with invalid token', async () => {
      mockedVerify.mockImplementation(() => {
        throw new Error('boom');
      });
      const onLinkClick = jest.fn();
      const app = getApp({
        ...options,
        onLinkClick,
      });
      await request(app)
        .get('/link/some-jwt-token')
        .expect(404);

      expect(onLinkClick).toBeCalledTimes(0);
    });
    it('Should catch error', async () => {
      mockedVerify.mockImplementation(() => ({ recipient: 'foo' }));

      const app = getApp({
        ...options,
        onLinkClick: async () => {
          throw new Error('Boom');
        },
      });
      await request(app)
        .get('/link/some-jwt-token')
        .expect(500);
    });
  });
  describe('blank-image', () => {
    it('Get blank image with valid token', async () => {
      mockedVerify.mockImplementation(() => ({ recipient: 'foo' }));

      const onBlankImageView = jest.fn();
      const app = getApp({
        ...options,
        onBlankImageView,
      });
      await request(app)
        .get('/blank-image/some-jwt-token')
        .expect(200);

      expect(onBlankImageView).toBeCalledWith({ recipient: 'foo' });
    });
    it('Get blank image with invalid token', async () => {
      mockedVerify.mockImplementation(() => {
        throw new Error('boom');
      });
      const onBlankImageView = jest.fn();
      const app = getApp({
        ...options,
        onBlankImageView,
      });
      await request(app)
        .get('/blank-image/some-jwt-token')
        .expect(404);

      expect(onBlankImageView).toBeCalledTimes(0);
    });
    it('Should catch error', async () => {
      mockedVerify.mockImplementation(() => ({ recipient: 'foo' }));

      const app = getApp({
        ...options,
        onBlankImageView: async () => {
          throw new Error('Boom');
        },
      });
      await request(app)
        .get('/blank-image/some-jwt-token')
        .expect(500);
    });
  });
});
