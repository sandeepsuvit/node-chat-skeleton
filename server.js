//var http = require("http");
//var fs = require("fs");
var mongo = require("mongodb").MongoClient;
var client = require("socket.io").listen(8092).sockets;


// Connect to MongoDb
mongo.connect('mongodb://localhost/chat', function(err, db) {
    if (err) throw err;
    // Check connection
    client.on("connection", function(socket) {
        console.log("Someone has connected");
        var col = db.collection("messages"),
            // For creating a status message
            sendStatus = function(s) {
                socket.emit("status", s);
            };
        // Emmit all messages to display on page
        col.find().limit(100).sort({
            "_id": 1
        }).toArray(function(err, res) {
            if (err) throw err;
            socket.emit('output', res);
        });
        // Wait for input
        socket.on('input', function(data) {
            var name = data.name,
                message = data.message,
                regex_msg = /^\s*$/;
            // Validation for name and message fields
            if (regex_msg.test(name) || regex_msg.test(message)) {
                //console.log("Invalid data")
                sendStatus("Name and Message is requried");
            } else {
                // Inset your message to database
                col.insert({
                    name: name,
                    message: message
                }, function() {
                	// Emit latest message to all clients
                	client.emit('output',[data]);

                    // Send your satus message
                    sendStatus({
                        message: "Message sent",
                        clear: true
                    });
                })
            }
        });
    });
});