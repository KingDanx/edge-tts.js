import { uuid } from "./utils.js";

export default class TTS {
  constructor({
    voice = "",
    pitch = "+0Hz",
    rate = "+0%",
    volume = "+0%",
    text = "",
  }) {
    this.voice = voice;
    this.pitch = pitch;
    this.rate = rate;
    this.volume = volume;
    this.text = text;
    this.segments = [];
    this.mp3 = Buffer.alloc(0);
  }

  /**
   * @returns {string}
   */
  generateSSML(text) {
    let ssml = "";

    ssml += "X-RequestId:";
    ssml += uuid();
    ssml += "\r\nContent-Type:application/ssml+xml";
    ssml += `\r\nX-Timestamp:${new Date()}Z`;
    ssml += "\r\nPath:ssml";
    ssml +=
      "\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>";
    ssml += `\r\n\t<voice name='${this.voice}'>`;
    ssml += `\r\n\t\t<prosody pitch='${this.pitch}' rate='${this.rate}' volume='${this.volume}'>`;
    ssml += `\r\n\t\t\t${this.text}`;
    ssml += "\r\n\t\t</prosody>";
    ssml += "\r\n\t</voice>";
    ssml += "\r\n</speak>";
    return ssml;
  }

  /**
   * @returns {string}
   */
  generateCommand() {
    let command = "";
    command += `X-Timestamp:${new Date()}`;
    command += "\r\nContent-Type:application/json; charset=utf-8";
    command += "\r\nPath:speech.config";
    command += `\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":true},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n`;

    return command;
  }
}
