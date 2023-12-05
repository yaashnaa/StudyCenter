const socket = io("/");
const main__chat__window = document.getElementById("main__chat_window");
const videoGrids = document.getElementById("video-grids");
const myVideo = document.createElement("video");
const chat = document.getElementById("chat");
OtherUsername = "";
chat.hidden = true;
myVideo.muted = true;

window.onload = () => {
    $(document).ready(function() {
        $("#getCodeModal").modal("show");
    });
};

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3030",
});

let myVideoStream;
const peers = {};
var getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

sendmessage = (text) => {
    if (event.key === "Enter" && text.value != "") {
        socket.emit("messagesend", myname + ' : ' + text.value);
        text.value = "";
        main__chat_window.scrollTop = main__chat_window.scrollHeight;
    }
};

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream, myname);

        socket.on("user-connected", (id, username) => {
            console.log("userid:" + id);
            connectToNewUser(id, stream, username);
            socket.emit("tellName", myname);
        });

        socket.on("user-disconnected", (id) => {
            console.log(peers);
            if (peers[id]) peers[id].close();
        });
    });
peer.on("call", (call) => {
    getUserMedia({ video: true, audio: true },
        function(stream) {
            call.answer(stream); // Answer the call with an A/V stream.
            const video = document.createElement("video");
            call.on("stream", function(remoteStream) {
                addVideoStream(video, remoteStream, OtherUsername);
            });
        },
        function(err) {
            console.log("Failed to get local stream", err);
        }
    );
});

peer.on("open", (id) => {
    socket.emit("join-room", roomId, id, myname);
});

socket.on("createMessage", (message) => {
    var ul = document.getElementById("messageadd");
    var li = document.createElement("li");
    li.className = "message";
    li.appendChild(document.createTextNode(message));
    ul.appendChild(li);
});

socket.on("AddName", (username) => {
    OtherUsername = username;
    console.log(username);
});

const RemoveUnusedDivs = () => {
    //
    alldivs = videoGrids.getElementsByTagName("div");
    for (var i = 0; i < alldivs.length; i++) {
        e = alldivs[i].getElementsByTagName("video").length;
        if (e == 0) {
            alldivs[i].remove();
        }
    }
};

const connectToNewUser = (userId, streams, myname) => {
    const call = peer.call(userId, streams);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        //       console.log(userVideoStream);
        addVideoStream(video, userVideoStream, myname);
    });
    call.on("close", () => {
        video.remove();
        RemoveUnusedDivs();
    });
    peers[userId] = call;
};

const cancel = () => {
    $("#getCodeModal").modal("hide");
};

const copy = async() => {
    const roomid = document.getElementById("roomid").innerText;
    await navigator.clipboard.writeText("http://localhost:3030/join/" + roomid);
};
const invitebox = () => {
    $("#getCodeModal").modal("show");
};

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        document.getElementById("mic").style.color = "red";
    } else {
        document.getElementById("mic").style.color = "white";
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

const VideomuteUnmute = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    console.log(getUserMedia);
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        document.getElementById("video").style.color = "red";
    } else {
        document.getElementById("video").style.color = "white";
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};

const showchat = () => {
    if (chat.hidden == false) {
        chat.hidden = true;
    } else {
        chat.hidden = false;
    }
};

const addVideoStream = (videoEl, stream, name) => {
    videoEl.srcObject = stream;
    videoEl.addEventListener("loadedmetadata", () => {
        videoEl.play();
    });
    const h1 = document.createElement("h1");
    const h1name = document.createTextNode(name);
    h1.appendChild(h1name);
    const videoGrid = document.createElement("div");
    videoGrid.classList.add("video-grid");
    videoGrid.appendChild(h1);
    videoGrids.appendChild(videoGrid);
    videoGrid.append(videoEl);
    RemoveUnusedDivs();
    let totalUsers = document.getElementsByTagName("video").length;
    if (totalUsers > 1) {
        for (let index = 0; index < totalUsers; index++) {
            document.getElementsByTagName("video")[index].style.width =
                100 / totalUsers + "%";
        }
    }
};


// function rainBg(){
//     document.getElementById("rain").style.display="block"
//     document.getElementById("city").style.display="none"

// }
function updateSpotifyPlayer() {
    // Get the user's input from the text field
    var userInput = document.getElementById('spotifyUrl').value;

    // Extract the playlist ID from the Spotify URL
    var playlistId = getPlaylistIdFromUrl(userInput);

    // Generate the Spotify player iframe with the updated playlist ID
    var iframeCode = generateSpotifyIframe(playlistId);

    // Update the content of the 'spotifyPlayer' div with the new iframe code
    document.getElementById('spotifyPlayer').innerHTML = iframeCode;
}

function getPlaylistIdFromUrl(url) {
    // Implement logic to extract the playlist ID from the Spotify URL
    // Assuming the playlist ID is the last part of the URL
    var parts = url.split('/');
    return parts[parts.length - 1];
}

function generateSpotifyIframe(playlistId) {
    // Generate the Spotify iframe code with the provided playlist ID
    var iframeCode = '<iframe src="https://open.spotify.com/embed/playlist/' + playlistId + '" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>';
    return iframeCode;
}


function changeBackground(){
    let  bgBtn= document.getElementById("backgrounds")
    if (bgBtn.style.display === "block") {
        bgBtn.style.display = "none";
    } else {
        bgBtn.style.display = "block";
    }
}
function music(){
    let  spotifyBtn= document.getElementById("spotify-player")
    if (spotifyBtn.style.display === "block") {
        spotifyBtn.style.display = "none";
    } else {
        spotifyBtn.style.display = "block";
    }
}
function rainBg() {
    // Switch the display property of the images
    var rainImage = document.getElementById("rain");
    var cityImage = document.getElementById("city");
    var seaImage = document.getElementById("sea");
    var treeImage = document.getElementById("tree");
    var firefliesImage = document.getElementById("fireflies");
    var laptopImage = document.getElementById("laptop");

    if (rainImage.style.display === "none") {
        rainImage.style.display = "block";
        cityImage.style.display = "none";
        seaImage.style.display = "none";
        laptopImage.style.display = "none";
        treeImage.style.display = "none";
        seaImage.style.display = "none";
        firefliesImage.style.display = "none";

    } 
}
function treeBg() {
    // Switch the display property of the images
    var rainImage = document.getElementById("rain");
    var cityImage = document.getElementById("city");
    var seaImage = document.getElementById("sea");
    var treeImage = document.getElementById("tree");
    var firefliesImage = document.getElementById("fireflies");
    var laptopImage = document.getElementById("laptop");

    if (treeImage.style.display === "none") {
        rainImage.style.display = "none";
        cityImage.style.display = "none";
        seaImage.style.display = "none";
        laptopImage.style.display = "none";
        treeImage.style.display = "block";
        seaImage.style.display = "none";
        firefliesImage.style.display = "none";

    } 
}
    function cityBg() {
    // Switch the display property of the images
    var rainImage = document.getElementById("rain");
    var cityImage = document.getElementById("city");
    var seaImage = document.getElementById("sea");
    var treeImage = document.getElementById("tree");
    var firefliesImage = document.getElementById("fireflies");
    var laptopImage = document.getElementById("laptop");

    if (cityImage.style.display === "none") {
        rainImage.style.display = "none";
        cityImage.style.display = "block";
        seaImage.style.display = "none";
        laptopImage.style.display = "none";
        treeImage.style.display = "none";
        seaImage.style.display = "none";
        firefliesImage.style.display = "none";

    } 
    
}
function laptopBg() {
    // Switch the display property of the images
    var rainImage = document.getElementById("rain");
    var cityImage = document.getElementById("city");
    var seaImage = document.getElementById("sea");
    var treeImage = document.getElementById("tree");
    var firefliesImage = document.getElementById("fireflies");
    var laptopImage = document.getElementById("laptop");

    if (laptopImage.style.display === "none") {
        rainImage.style.display = "none";
        cityImage.style.display = "none";
        seaImage.style.display = "none";
        laptopImage.style.display = "block";
        treeImage.style.display = "none";
        seaImage.style.display = "none";
        firefliesImage.style.display = "none";

    } 
    
}
function firefliesBg() {

    var rainImage = document.getElementById("rain");
    var cityImage = document.getElementById("city");
    var seaImage = document.getElementById("sea");
    var treeImage = document.getElementById("tree");
    var firefliesImage = document.getElementById("fireflies");
    var laptopImage = document.getElementById("laptop");

    if (firefliesImage.style.display === "none") {
        rainImage.style.display = "none";
        cityImage.style.display = "none";
        seaImage.style.display = "none";
        laptopImage.style.display = "none";
        treeImage.style.display = "none";
        seaImage.style.display = "none";
        firefliesImage.style.display = "block";

    } 
}
function seaBg() {
    // Switch the display property of the images
    var rainImage = document.getElementById("rain");
    var cityImage = document.getElementById("city");
    var seaImage = document.getElementById("sea");
    var treeImage = document.getElementById("tree");
    var firefliesImage = document.getElementById("fireflies");
    var laptopImage = document.getElementById("laptop");

    if (seaImage.style.display === "none") {
        rainImage.style.display = "none";
        cityImage.style.display = "none";
        seaImage.style.display = "block";
        laptopImage.style.display = "none";
        treeImage.style.display = "none";
        firefliesImage.style.display = "none";

    } 
}
