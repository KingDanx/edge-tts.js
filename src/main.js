import EdgeSocket from "./edge-tts";

const socket = new EdgeSocket({
  voice: "en-US-GuyNeural",
  text: "This is a test of the system 1 2 3",
  // pitch: "+100Hz",
});

socket.connect();
