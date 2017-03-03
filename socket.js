const io = require('socket.io-client');

class Socket {
  get io () {
    if (!this._io) {
      this._io = io.connect();
    }

    return this._io;
  }

  get (url) {
    return this.request({ method: 'get', url });
  }

  post (url, data) {
    return this.request({ method: 'post', url, data });
  }

  put (url, data) {
    return this.request({ method: 'put', url, data });
  }

  patch (url, data) {
    return this.request({ method: 'patch', url, data });
  }

  delete (url, data) {
    return this.request({ method: 'delete', url, data });
  }

  setHeaders (headers) {
    this.headers = headers;
  }

  async request ({ method = 'get', url, headers = {}, data } = {}) {
    return await new Promise((resolve, reject) => {
      switch (method) {
        case 'get':
        case 'post':
        case 'put':
        case 'patch':
        case 'delete':
          method = method.toUpperCase();
          headers = Object.assign({}, this.headers, headers);
          this.io.emit('io-req', { method, url, headers, data }, ctx => {
            console.log('callback io-req', ctx);
            resolve();
          });
          return;
      }

      reject(new Error(`Invalid method '${method}'`));
    });
  }
}

module.exports = Socket;
