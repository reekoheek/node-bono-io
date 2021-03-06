require('regenerator-runtime/runtime');

const io = require('socket.io-client');
io.Socket = require('./socket');
io.connect = (() => {
  const lookup = io.connect;

  return (uri, opts = {}) => {
    opts.path = opts.path || '/bono';
    return lookup(uri, opts);
  };
})();
io.socket = new io.Socket();

this.io = io;
module.exports = io;
