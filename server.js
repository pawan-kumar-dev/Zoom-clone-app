const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server); //specify the server

//connecting a express and peer to work together
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidv4 } = require("uuid"); //creating a unique ids

// provides webRTC for realtime connection
app.use("/peerjs", peerServer);
app.use(express.static("public")); //setting a static files
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  //user on this route will be redirected to the route with room id
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", socket => {
  //user will join a room
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId); // to broadcast a msg to all member

    //receiving the message
    socket.on("message", message => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});
server.listen(process.env.PORT || 3000);
