const IO = require('socket.io');
const fs = require('fs');
const path = require('path');
const CLIENT_VERSION = require('socket.io-client/package').version;
const http = require('http');
const url = require('url');

let sources = {};
function getSource (type) {
  if (!sources[type]) {
    let filepath = path.join(__dirname, type === 'map' ? 'dist/io.js.map' : 'dist/io.js');

    if (!fs.existsSync(filepath)) {
      throw new Error(`File ${filepath} not found`);
    }

    sources[type] = fs.readFileSync(filepath, 'utf-8');
  }
  return sources[type];
}

class Socket extends IO {
  constructor (app, options) {
    super(Object.assign({ path: '/bono' }, options, { serveClient: false }));

    let { debug = false } = options || {};
    this.debug = debug;

    this.on('connection', socket => {
      socket.on('io-req', async (reqCtx, callback) => {
        try {
          let req = new http.IncomingMessage({});
          let parsed = url.parse(reqCtx.url);
          req.method = reqCtx.method;
          req.url = parsed.path;
          req.originalPath = reqCtx.url;
          req.path = parsed.pathname;

          Object.keys(reqCtx.headers).forEach(key => {
            req.headers[key.toLowerCase()] = reqCtx.headers[key];
          });

          let res = new http.ServerResponse(req);
          let ctx = app.createContext(req, res);

          await app.dispatch('', ctx);

          let { status, headers, body } = ctx.response;

          callback({ status, headers, body });
        } catch (err) {
          console.error(err);
          let { status = 500, message, stack } = err;
          callback({ status, message, stack });
        }
      });
    });
  }

  attach (srv, opts) {
    super.attach(srv, opts);

    srv = this.httpServer;

    let ioUrl = this.path() + '/io.js';
    let ioMapUrl = this.path() + '/io.js.map';
    let evs = srv.listeners('request').slice(0);
    srv.removeAllListeners('request');
    srv.on('request', (req, res) => {
      if (req.url.indexOf(ioMapUrl) === 0) {
        this.serveMap(req, res);
      } else if (req.url.indexOf(ioUrl) === 0) {
        this.serve(req, res);
      } else {
        for (var i = 0; i < evs.length; i++) {
          evs[i].call(srv, req, res);
        }
      }
    });

    return this;
  }

  serveMap (req, res) {
    let expectedEtag = `"${CLIENT_VERSION}"`;

    let etag = req.headers['if-none-match'];
    if (etag) {
      if (expectedEtag === etag) {
        res.writeHead(304);
        res.end();
        return;
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('ETag', expectedEtag);
    res.writeHead(200);
    res.end(getSource('map', this.debug));
  }

  serve (req, res) {
    let expectedEtag = `"${CLIENT_VERSION}"`;

    let etag = req.headers['if-none-match'];
    if (etag) {
      if (expectedEtag === etag) {
        res.writeHead(304);
        res.end();
        return;
      }
    }

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('ETag', expectedEtag);
    res.setHeader('X-SourceMap', 'socket.io.js.map');
    res.writeHead(200);
    res.end(getSource('js'));
  }
}

function createSocket (...args) {
  return new Socket(...args);
}

module.exports = createSocket;
