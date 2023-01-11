import { addBlankImage, patchLinks } from '../../src/lib/patch-html';
import { sign } from 'jsonwebtoken';

const options = {
  baseUrl: 'http://some-path',
  jwtSecret: 'qsdsd',
};
const data = { recipient: 'bar' };

jest.mock('jsonwebtoken');
const mockedSign = sign as jest.Mock<string>;

describe('path-html', () => {
  mockedSign.mockImplementation((...args: any[]) => JSON.stringify(args));

  describe('addBlankImage', () => {
    it('without body', () => {
      expect(addBlankImage(options, `foo`, data)).toMatchInlineSnapshot(
        `"foo<img src=\\"http://some-path/blank-image/[{\\"recipient\\":\\"bar\\"},\\"qsdsd\\",{\\"expiresIn\\":\\"1y\\"}]\\" />"`
      );
    });
    it('with body', () => {
      expect(
        addBlankImage(
          options,
          `<html><head></head><body><h1>Hello</h1><p>paraph</p></body>`,
          data
        )
      ).toMatchInlineSnapshot(
        `"<html><head></head><body><h1>Hello</h1><p>paraph</p><img src=\\"http://some-path/blank-image/[{\\"recipient\\":\\"bar\\"},\\"qsdsd\\",{\\"expiresIn\\":\\"1y\\"}]\\" /></body>"`
      );
    });
  });

  describe('patchLinks', () => {
    it('no change when no links', () => {
      expect(
        patchLinks(
          options,
          `
      <html>
        <body>
          <h1>Hello world</h1>
        </body>
      </html>
      `,
          data
        )
      ).toMatchInlineSnapshot(`
        "<html><head></head><body>
                  <h1>Hello world</h1>
                
              
              </body></html>"
      `);
    });
    it('with simple links', () => {
      expect(
        patchLinks(
          options,
          `
        <html>
          <body>
            <h1>Hello world</h1>
            <a href="http://google.com">Click me</a>
          </body>
        </html>
      `,
          data
        )
      ).toMatchInlineSnapshot(`
        "<html><head></head><body>
                    <h1>Hello world</h1>
                    <a href=\\"http://some-path/link/[{&quot;recipient&quot;:&quot;bar&quot;,&quot;link&quot;:&quot;http://google.com&quot;},&quot;qsdsd&quot;,{&quot;expiresIn&quot;:&quot;1y&quot;}]\\">Click me</a>
                  
                
              </body></html>"
      `);
    });
    it('with anchor', () => {
      expect(
        patchLinks(
          options,
          `
        <html>
          <body>
            <h1>Hello world</h1>
            <a href="#">Click me</a>
            <a href="#some-path">Click me 2</a>
          </body>
        </html>
      `,
          data
        )
      ).toMatchInlineSnapshot(`
        "<html><head></head><body>
                    <h1>Hello world</h1>
                    <a href=\\"#\\">Click me</a>
                    <a href=\\"#some-path\\">Click me 2</a>
                  
                
              </body></html>"
      `);
    });
    it('with links with attrs', () => {
      expect(
        patchLinks(
          options,
          `
        <html>
          <body>
            <h1>Hello world</h1>
            <a target="_blank" href="http://google.com" class="some-class">Click me</a>
          </body>
        </html>
      `,
          data
        )
      ).toMatchInlineSnapshot(`
        "<html><head></head><body>
                    <h1>Hello world</h1>
                    <a target=\\"_blank\\" href=\\"http://some-path/link/[{&quot;recipient&quot;:&quot;bar&quot;,&quot;link&quot;:&quot;http://google.com&quot;},&quot;qsdsd&quot;,{&quot;expiresIn&quot;:&quot;1y&quot;}]\\" class=\\"some-class\\">Click me</a>
                  
                
              </body></html>"
      `);
    });
    it('with links without quotes', () => {
      expect(
        patchLinks(
          options,
          `
        <html>
          <body>
            <h1>Hello world</h1>
            <a target=_blank href=http://google.com class=some-class>Click me</a>
          </body>
        </html>
      `,
          data
        )
      ).toMatchInlineSnapshot(`
        "<html><head></head><body>
                    <h1>Hello world</h1>
                    <a target=\\"_blank\\" href=\\"http://some-path/link/[{&quot;recipient&quot;:&quot;bar&quot;,&quot;link&quot;:&quot;http://google.com&quot;},&quot;qsdsd&quot;,{&quot;expiresIn&quot;:&quot;1y&quot;}]\\" class=\\"some-class\\">Click me</a>
                  
                
              </body></html>"
      `);
    });
    it('with links with mailto', () => {
      expect(
        patchLinks(
          options,
          `
        <html>
          <body>
            <h1>Hello world</h1>
            <a target=_blank href=mailto:foo@bar.com class=some-class>Click me</a>
          </body>
        </html>
      `,
          data
        )
      ).toMatchInlineSnapshot(`
        "<html><head></head><body>
                    <h1>Hello world</h1>
                    <a target=\\"_blank\\" href=\\"mailto:foo@bar.com\\" class=\\"some-class\\">Click me</a>
                  
                
              </body></html>"
      `);
    });
    it('with links with no http', () => {
      expect(
        patchLinks(
          options,
          `
        <html>
          <body>
            <h1>Hello world</h1>
            <a target=_blank href=ftp://foo class=some-class>Click me</a>
          </body>
        </html>
      `,
          data
        )
      ).toMatchInlineSnapshot(`
        "<html><head></head><body>
                    <h1>Hello world</h1>
                    <a target=\\"_blank\\" href=\\"ftp://foo\\" class=\\"some-class\\">Click me</a>
                  
                
              </body></html>"
      `);
    });
    it('with &apos; in href', () => {
      expect(
        patchLinks(
          options,
          `
        <html>
          <body>
            <h1>Hello world</h1>
            <a target=_blank href=http://google.com class=some-class>Click ' me</a>
          </body>
        </html>
      `,
          data
        )
      ).toMatchInlineSnapshot(`
        "<html><head></head><body>
                    <h1>Hello world</h1>
                    <a target=\\"_blank\\" href=\\"http://some-path/link/[{&quot;recipient&quot;:&quot;bar&quot;,&quot;link&quot;:&quot;http://google.com&quot;},&quot;qsdsd&quot;,{&quot;expiresIn&quot;:&quot;1y&quot;}]\\" class=\\"some-class\\">Click ' me</a>
                  
                
              </body></html>"
      `);
    });
  });
});
