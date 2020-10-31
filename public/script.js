//getting a user media

const socket = io("/"); //importing socket in a this file for further use
const myVideo = document.createElement("video");

const videoGrid = document.getElementById("video-grid"); //appending a video

var peer = new Peer(
  undefined, // id is not required as it is creatd automatically by peers
  {
    path: "/peerjs", //specify the path for peers
    host: "/",
    port: "3000"
  }
);

myVideo.muted = true; //to mute my video

let myVideoStream;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  .then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    //afer connecting a user they will call us and then they will create a video stream for us
    peer.on("call", call => {
      //after they will call us and we will add the video stream for them
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    // to connect to new user
    socket.on("user-connected", userId => {
      connectToNewUser(userId, stream);
    });

    let text = document.getElementById("chat__message");
    console.log(text.value);
    window.addEventListener("keydown", e => {
      //if the user press enter having code 13 and if the text input is not empty then send msg
      if (e.which == 13 && text.value.length !== 0) {
        console.log(text);
        socket.emit("message", text.value);
        text.value = "";
      }
    });

    socket.on("createMessage", message => {
      document
        .getElementById("ul")
        .append(`<li class="message"><b>user</b><br/>${message}</li>`);
      scrollToBottom();
    });
  })
  .catch(error => alert(error.message));

peer.on("open", id => {
  // join room of particular ROOM_ID having a peers id
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  //call the other connected user by providing a stream
  const call = peer.call(userId, stream);
  //create a video element for that user
  const video = document.createElement("video");
  //addinga video stream on the screen
  call.on("stream", userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  //video playing function
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  var d = document.getElementById("main__chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};

//mute our video
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = false;
  }
};
