import EdgeSocket from "./websocket";
import TTS from "./tts";

const socket = new EdgeSocket({
  voice: "en-US-GuyNeural",
  text: "hello hachi the famed slayer of azeroth",
});

socket.connect();
