const { WebSocketServer } = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const { stat } = require('fs');
const { send } = require('process');

// Spinning the HTTP server and the WebSocket server.
const server = http.createServer();
// so wsServer is the 
const wsServer = new WebSocketServer({ server });
const port = 8000;

// const clients = []
// I'm maintaining all active users in this object
const state = {player1:{}, player2:{}};


wsServer.on ('connection', function (connection) {
    // give an id to the connection
    console.log("Connection established")
    const userId = uuidv4()
    connection.id = userId
    // still need to revise message to client to invite players
    // currently sends state
    // instead check state and send approp message
    invitePlayer(connection)

    // message received
    connection.on('message', function (message, userId) {
        const data = JSON.parse(message)
        console.log("message: ", data)

        // manage adding players    
        if (data.newPlayer) {
            addPlayer (connection, data)
        }

        // manage decision
        if (data.decision) {
            manageDecision (connection, data)
            // check both players have decided
            if (state.player1.decision && state.player2.decision) {
                calculateOutcome()
                sendOutcomes()
            } else {
                console.log("No decision yet")
            }
        }



        // check for reset button
        if (data.message === "restart") {
            console.log("Restart")
            resetPlayers()
        }
        // resetPlayers(data)
        // set players

    })    

})


function resetPlayers () {
    state.player1 = {}
    state.player2 = {}
    console.log(state)
      wsServer.clients.forEach ((client) => {
        client.send(JSON.stringify({restart: true}))
        console.log(client.id)
    })}

function invitePlayer (connection) {
    const space = (!state.player1.name || !state.player2.name) ? true : false
    const spaceForPlayers = {space: space}
    console.log("spaceForPlayers: ", spaceForPlayers.space)
    connection.send(JSON.stringify({spaceForPlayers: spaceForPlayers}))
}


function addPlayer (connection, data) {

        // check if message is a player name
        if (state.player1.id && state.player2.id) {
            connection.send (JSON.stringify({status: "no space", message: "Sorry but there are already two players. Stay on to see their decisions!"}))
        } else if (!state.player1.id) {
            console.log("New player one!")
            state.player1.name = data.newPlayer
            state.player1.id = connection.id
            connection.send (JSON.stringify({status: "joined", message: data.newPlayer + ": You are player 1"}))
        } else if (!state.player2.id) {
            console.log("New player two!")
            state.player2.name = data.newPlayer
            state.player2.id = connection.id
            connection.send (JSON.stringify({status: "joined", message: data.newPlayer + ": You are player 2"}))
        }
}

function manageDecision (connection, data) {
    // check decision 
    if (connection.id == state.player1.id && !state.player1.decision) {
        state.player1.decision = data.decision
        console.log(state)
        sendDecisionSpectators(state.player1)
    }
    else if (connection.id == state.player2.id && !state.player2.decision) {
        state.player2.decision = data.decision
        sendDecisionSpectators(state.player2)
    }
    
    // send the decision to spectators but not to other player + "waiting for the other prisoner's response"

    console.log("decisions: ", state.player1.decision, state.player2.decision)
}

function calculateOutcome () {

    console.log("Checking outcomes")

    // choose outcome from two decisions
    if (state.player1.decision == "schtum" && state.player2.decision == "schtum") {
        state.player1.outcome = "You get a one year stretch. You both kept schtum"
        state.player2.outcome = "You get a one year stretch. You both kept schtum"
    }
    else if (state.player1.decision == "schtum" && state.player2.decision == "snitch") {
        state.player2.outcome = "You get out with no jail time, you rat! Your mate kept schtum."
        state.player1.outcome = "You get a three year stretch for your silence. Your mate ratted you out."
    }
    else if (state.player1.decision == "snitch" && state.player2.decision == "schtum") {
        state.player1.outcome = "You get out with no jail time, you rat! Your mate kept schtum."
        state.player2.outcome = "You get a three year stretch for your silence. Your mate ratted you out."
    }
    else if (state.player1.decision == "snitch" && state.player2.decision == "snitch") {
        state.player1.outcome = "You get a two year stretch. You both ratted each other out!"
        state.player2.outcome = "You both ratted each other out! You both get two years"
    }
    else {
        // waiting for the other prisoner's response
    }
}

// work out how client will know whether to show the decision - 
// though it should only get the message if it's not a plyer so ...
// still not right - how does it know which player's decision it is receiving?
function sendDecisionSpectators (player) {
    wsServer.clients.forEach ((client) => {
        if (client.id !== state.player1.id  && client.id !== state.player2.id ) {
            client.send(JSON.stringify({decision: player.decision, name: player.name}))
        }
    })
} 

function sendOutcomes () {
    wsServer.clients.forEach ((client) => {
        if (client.id == state.player1.id) {
            client.send(JSON.stringify({outcome: state.player1.outcome}))
        } else if (client.id == state.player2.id) {
            client.send(JSON.stringify({outcome: state.player2.outcome}))
        } else {
            client.send(JSON.stringify({outcome: [`${state.player1.name}: ${state.player1.outcome}`, 
                `${state.player2.name}: ${state.player2.outcome}`]
            }))
        }
    })
}

server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});