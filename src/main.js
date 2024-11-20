import EdgeSocket from "./edge-tts.js";

const socket = new EdgeSocket({
  voice: "en-US-GuyNeural",
  text: "This is a test of the system 1 2 3 4",
  pitch: "+100Hz",
});
console.log("dog");
socket.connect();
