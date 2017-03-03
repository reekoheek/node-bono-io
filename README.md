# node-bono-io

The node-bono socket.io connection

## Install

```javascript
npm i reekoheek/bono-io
```

## Configuration

Server configuration:

```javascript
const http = require('http');
const Bundle = require('bono');
const app = new Bundle();

app.get('/', ctx => {
  ctx.body = 'Hello world!';
})

const server = http.Server(app.callback());

require('bono-io/server')(app).attach(server);

server.listen(3000, () => console.log('Listening at http://localhost:3000/'));
```

Client configuration:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Bono IO</title>
</head>
<body>
  <script src="/bono/io.js"></script>
  <script>
    (async () => {
      // set default headers
      io.socket.setHeaders({
        'Authorization': 'Bearer xxx',
      });

      let result = await io.socket.get('/');
      console.log(result);
    })();
  </script>
</body>
</html>
```
