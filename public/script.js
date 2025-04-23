const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const chatInput = document.getElementById('chatInput');
const messages = document.getElementById('messages');
const shareScreenBtn = document.getElementById('shareScreenBtn');

let localStream;
let peerConnection;
const config = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

// Get user's camera and mic
navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
  localStream = stream;
  localVideo.srcObject = stream;

  const roomId = 'test-room';  // Set your room ID here
  socket.emit('join-room', roomId);
});

socket.on('chat-message', msg => {
  appendMessage(`Stranger: ${msg}`);
});

function appendMessage(msg) {
  const div = document.createElement('div');
  div.textContent = msg;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Screen sharing button
shareScreenBtn.addEventListener('click', () => {
  navigator.mediaDevices.getDisplayMedia({ video: true }).then(screen => {
    const screenTrack = screen.getVideoTracks()[0];
    const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
    if (sender) {
      sender.replaceTrack(screenTrack);
    }

    screenTrack.onended = () => {
      const camTrack = localStream.getVideoTracks()[0];
      sender.replaceTrack(camTrack);
    };
  });
});