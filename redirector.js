var http = require('http')

var server = http.createServer(function(req, res) {
    res.writeHead(302, {'Location': 'https://new-network.ru/pages/nullBalance'});
    res.end();
});

server.listen(8686);