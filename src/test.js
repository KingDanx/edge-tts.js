import EdgeTTS from "./edge-tts.js";

const __dirname = import.meta.dirname;

const voices = await EdgeTTS.getVoices();

const randomVoice = Math.floor(Math.random() * voices.length);

const randomNumber = Math.round(Math.random() * 100);

const tts = new EdgeTTS({
  voice: voices[randomVoice].ShortName,
  text: "this is a test. this is a test",
  pitch: `${randomNumber > 50 ? "+" : "-"}${randomNumber}Hz`,
  fileType: EdgeTTS.fileTypes.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
});

tts.ttsToFile();
