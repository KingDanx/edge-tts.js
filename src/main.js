import EdgeSocket from "./edge-tts.js";

const socket = new EdgeSocket({
  voice: "en-US-GuyNeural",
  text: "This is a test of the system 1 2 3",
  // pitch: "+100Hz",
});

socket.connect();

// import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

// const tts = new MsEdgeTTS();
// await tts.setMetadata(
//   "en-IE-ConnorNeural",
//   OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS
// );

// tts.toFile("./example_audio.webm", "Hachi, how are you?");
