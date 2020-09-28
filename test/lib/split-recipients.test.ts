import { splitByRecipients } from '../../src/lib/split-recipients';

describe('splitByRecipients', () => {
  it('works', () => {
    expect(
      splitByRecipients({
        subject: 'Test',
        from: 'sender@email.com',
        to: 'some@email.com',
        cc: 'cc@email.com',
        bcc: 'cc@email.com',
        replyTo: 'reply@email.com',
        html: 'Hey!',
        text: 'bim',
      })
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "envelope": Object {
            "from": "sender@email.com",
            "to": "some@email.com",
          },
          "from": "sender@email.com",
          "headers": Object {
            "Bcc": "cc@email.com",
            "Cc": "cc@email.com",
            "To": "some@email.com",
          },
          "html": "Hey!",
          "replyTo": "reply@email.com",
          "subject": "Test",
          "text": "bim",
        },
        Object {
          "envelope": Object {
            "from": "sender@email.com",
            "to": "cc@email.com",
          },
          "from": "sender@email.com",
          "headers": Object {
            "Bcc": "cc@email.com",
            "Cc": "cc@email.com",
            "To": "some@email.com",
          },
          "html": "Hey!",
          "replyTo": "reply@email.com",
          "subject": "Test",
          "text": "bim",
        },
        Object {
          "envelope": Object {
            "from": "sender@email.com",
            "to": "cc@email.com",
          },
          "from": "sender@email.com",
          "headers": Object {
            "Bcc": "cc@email.com",
            "Cc": "cc@email.com",
            "To": "some@email.com",
          },
          "html": "Hey!",
          "replyTo": "reply@email.com",
          "subject": "Test",
          "text": "bim",
        },
      ]
    `);
  });

  const attrs = ['to', 'cc', 'bcc'];

  attrs.forEach(attr => {
    it(`works with 1 ${attr}`, () => {
      expect(
        splitByRecipients({
          from: 'sender@email.com',
          [attr]: 'some@email.com',
          html: 'Hey!',
        })
      ).toMatchSnapshot();
    });
    it(`works with 1 multiple ${attr}`, () => {
      expect(
        splitByRecipients({
          from: 'sender@email.com',
          [attr]: ['some@email.com'],
          html: 'Hey!',
        })
      ).toMatchSnapshot();
    });
    it(`works with multiple ${attr}`, () => {
      expect(
        splitByRecipients({
          from: 'sender@email.com',
          [attr]: ['some@email.com', 'other@mail.com'],
          html: 'Hey!',
        })
      ).toMatchSnapshot();
    });
  });
});
