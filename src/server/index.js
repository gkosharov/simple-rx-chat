/**
 * Server Entry File
 */

import express from 'express'
import path from 'path'
import Rx from 'rxjs'
import engine from 'engine.io'
import bodyParser from 'body-parser'
import Immutable from 'immutable'

console.log("STATICS: ", path.join(__dirname, 'static'))
var io = engine.listen(4000)
var app = express()
    .use(express.static(path.join(__dirname, 'static')))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({extended: false}))
    .use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    })
    .listen(8888, () => console.log('App is listening on http://localhost:8888/'))

var usersList = new Immutable.List();

var connections = Rx.Observable.create(function (observer) {

    io.on('connection', function (socket) {
        console.log('Client connection notified to server first. Client socketId is ', socket.id);

        socket.send(JSON.stringify({'socketId': socket.id, 'connectTime': Date.now()}));

        observer.next(socket);
    });

    return function () {
        io.close();
    }
});

var messages = Rx.Observable.create(function (observer) {
    io.on('connection', function (socket) {
        console.log("Ready to intercept messages!");
        socket.on('message', function (message) {
            console.log('Message upstream: ', message);
            observer.next(Object.assign(JSON.parse(message), {socketId: socket.id}));
        });
    });
});

var disconnections = Rx.Observable.create(function (observer) {

    io.on('connection', function (socket) {
        socket.on('close', function () {
            console.log("Data on client disconnect: ", socket.id);
            observer.next(socket);
        });
    });

    return function () {
        io.close();
    }
});

connections.subscribe(function (socket) {
    console.log('New client connected ', socket.id);
    usersList = usersList.push(Immutable.fromJS({
        id: socket.id,
        name: "",
        messages: [],
        socket: socket
    }));
    let toSerialize = usersList.map((user)=> {
        return user.delete("socket");
    });

    console.log("Users after connected: ", toSerialize.toString());
    broadcastToOthers({sender: socket.id, type: "connect", data: JSON.stringify(toSerialize.toJS())});
});

disconnections.subscribe(function (socket) {
    var socketId = socket.socketId;
    console.log(socketId);
    var user = usersList.get(socketId);
    console.log('Client disconnected ', user.socketId, user.nickname);
    var usersList = usersList.delete(socketId);
    let usersString = usersList.entries().map((entry)=> {
        entry.delete("socket")
    }).toString()
    console.log("Users after disconnect: ", usersString);
    broadcastToOthers({
        sender: socketId,
        type: "disconnect",
        data: usersString
    });
});

messages.subscribe(function (message) {
    console.log('Client sent message ', message);
    let socket = message.socketId;

    let index = usersList.findIndex((u)=> {
        u.id === socket
    });
    if (~index) {
        usersList = usersList.setIn([index, "messages"], usersList.getIn([index, "messages"]).push(message));
    }
    broadcastToOthers({
        sender: socket,
        type: "message",
        data: JSON.stringify(message)
    });
});

function broadcastToOthers(message) {
    console.log("Broadcasting...");
    console.log("Sender: ", message.sender);
    console.log("Data: ", message.data);
    console.log("Type: ", message.type);
    console.log("Users: ", usersList);
    let socket = message.sender;

    usersList.forEach((u)=> {
        if (u.get("id") !== socket) {
            console.log(`Emitting ${message.data} for: ${u.get("id")}`);
            u.get("socket").send(message.data);
        }
    })
}