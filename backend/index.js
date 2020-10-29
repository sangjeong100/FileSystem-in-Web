const http = require('http');
const routerFunc = require('./router').routeFunc;

const app = http.createServer(routerFunc);

app.listen(3000, '127.0.0.1', function () {
    console.log('Server Listening on 127.0.0.1:3000');
});             