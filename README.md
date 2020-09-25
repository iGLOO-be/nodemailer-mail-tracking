
# Nodemailer Mail tracking

## Install

```sh
npm install nodemailer-mail-tracking
```

```sh
yarn add nodemailer-mail-tracking
```

## Usage

```js
import { sendMail, expressApp } from "nodemailer-mail-tracking"
import { createTransport } from 'nodemailer';
import express from 'express';

const transporter = createTransport(/* ... */);
sendMail(mailTrackingOptions, transporter, sendMailOptions)


const app = express();
app.use('/mail-track', expressApp(mailTrackingOptions));
```

### Options

```js
const mailTrackOptions = {
  baseUrl: 'http://localhost:3000/mail-track',
  jwtSecret: 'secret',
  getData: data => {
    /* 
      Default data: { recipient: "rcptto@mail.fake" }
      Add any data if you want
    */
    return { ...data, hello: 'world' };
  },
  onBlankImageView: data => {
    /* 
      When email is opened 
      data is default data + your data
    */
  },
  onLinkClick: data => {
    /* 
      When click on link in mail 
      data is default data + { link } + your data
    */
  },
}
```
