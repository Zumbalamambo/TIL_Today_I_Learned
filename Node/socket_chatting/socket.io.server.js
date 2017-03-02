
const fs = require('fs');

//서버를 생성
const http = require('http')
const socketio = require('socket.io')


const server = http.createServer((request, response) => {
  //HTMLPage.html
  fs.readFile('SocketIoHTMLpage.html', (error, data) => {
    response.writeHead(200, { 'Content-Type' : 'text/html'});
    response.end(data);
  });
});
//서버 실행
server.listen(53147, () => {
  console.log('Server running at http://127.0.0.1:53147');
});

//소켓 서버를 만듬
const io = socketio.listen(server);
io.sockets.on('connection', (socket) => {

//message이벤트
socket.on('message', (data) => {
  io.sockets.emit('message', data);
    });
  });