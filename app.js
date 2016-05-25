 (function() {
     var getNode = function(s) {
             return document.querySelector(s);
         },
         // Get the required nodes
         status = getNode(".chat-status span"),
         textarea = getNode(".chat-textarea"),
         messages = getNode(".chat-messages"),
         chatName = getNode(".chat-name"),
         statusDefault = status.textContent,
         setStatus = function(s) {
             status.textContent = s;
             if (s !== statusDefault) {
                 // If there is a 3s delay of status then set it default
                 var delay = setTimeout(function() {
                     setStatus(statusDefault);
                 }, 3000);
             }
         };
     try {
         var socket = io.connect("http://localhost:8092");
         // Check if socket is available
         if (socket != undefined) {
             // Listen for output
             socket.on('output', function(data) {
                 //console.log(data)
                 if (data.length) {
                     // Loop result
                     for (var i = 0; i < data.length; i++) {
                         var message = document.createElement('div');
                         message.setAttribute('class', 'chat-message');
                         message.innerHTML = "<span class='user-name'>" + data[i].name + ": </span>" + "<span class='user-message'>" + data[i].message + "</span>";
                         // Append to dom
                         messages.appendChild(message);
                         // Inset the message in reverse order
                         messages.insertBefore(message, messages.firstChild);
                     }
                 }
             });
             // Listen for status
             socket.on('status', function(data) {
                 // Check if data is object
                 setStatus((typeof data === 'object') ? data.message : data);
                 if (data.clear === true) {
                     textarea.value = '';
                 }
             });
             // Check if the keydown event is triggered
             textarea.addEventListener('keydown', function(event) {
                 var self = this,
                     name = chatName.value;
                 // For allowing user to enter multiple line in textarea
                 if (event.which === 13 && event.shiftKey === false) {
                     //console.log("Send!")
                     socket.emit("input", {
                         name: name,
                         message: self.value
                     });
                     // Prevent the default behaviour of the keydown
                     event.preventDefault();
                 }
             })
         }
     } catch (e) {
         // Set status to warn user
     }
 })();