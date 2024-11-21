import EdgeTTS from "./edge-tts.js";

const __dirname = import.meta.dirname;

//? Reach out to the voices end point and store the voices
const voices = await EdgeTTS.getVoices();

const randomVoice = Math.floor(Math.random() * voices.length);
const randomVoice2 = Math.floor(Math.random() * voices.length);

const randomNumber = Math.round(Math.random() * 100);
const randomSign = randomNumber > 50 ? "+" : "-";

//? Setting up an EdgeTTS object with parameters
const edgeTTS = new EdgeTTS({
  voice: voices[randomVoice].ShortName,
  text: "this is a test. this is a test",
  pitch: `${randomSign}${randomNumber}Hz`,
  fileType: EdgeTTS.fileTypes.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
});

//? Generate a TTS file with the stored parameters in the base directory
await edgeTTS.ttsToFile();

//? Update the tts parameters
edgeTTS.tts.setVoiceParams({
  voice: voices[randomVoice2].ShortName,
  text: "this is a secondary test with a random voice",
  pitch: "+20Hz",
  rate: "-20%",
  fileType: EdgeTTS.fileTypes.WEBM_24KHZ_16BIT_MONO_OPUS,
});

//? Generate a new file with the new parameters in a passed directory
await edgeTTS.ttsToFile(__dirname);

//? Update parameters to throw and error
edgeTTS.tts.setVoiceParams({
  text: null,
});

//? Print out error
await edgeTTS.ttsToFile().catch((e) => console.error(e));
