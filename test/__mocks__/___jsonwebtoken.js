module.exports = {
  sign: (...args) => JSON.stringify(args),
  verify: (...args) => ({ recipient: 'foo', link: 'http://google.be' }),
};
