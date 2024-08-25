const { WebSocketServer } = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

// Spinning the HTTP server and the WebSocket server.
const server = http.createServer();
// so wsServer is the 
const wsServer = new WebSocketServer({ server });
const port = 8000;

// I'm maintaining all active connections in this object
const clients = {};
// I'm maintaining all active users in this object
const users = {};
const outcome = [{id:"", decision:""}, {id:"", decision:""}]

function handleMessage(message, userId) {
 
    const data = message.toString()

    wsServer.clients.forEach(client => {
        console.log(`distributing message: ${data}`)
        client.send(`${data} sent to ${client}`)
    })
    }


wsServer.on ('connection', function (connection) {
    // give an id to the connection
    const userId = uuidv4()
    console.log(`${userId} has joined us!`)

    clients[userId] = connection

    // message received
    connection.on('message', function (message) {
    handleMessage(message, userId)
    })
    
})



server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});