import { buildWebSocketURL, splitTextByByteLength } from "./utils";
import constants from "./constants";
import fs from "fs";
import TTS from "./tts";

export default class EdgeTTS {
  constructor(tts) {
    this.url = buildWebSocketURL();
    this.socket = null;
    this.tts = new TTS(tts);
  }

  /**
   * @returns {void}
   */
  connect() {
    const socket = new WebSocket(this.url, {
      headers: constants.WSS_HEADERS,
    });

    socket.addEventListener("error", (e) => {
      console.log(e);
      socket.close();
    });
    socket.addEventListener("close", ({ reason }) => {
      console.log("Connection closed:", reason);
      fs.writeFile("output.mp3", this.tts.mp3, { encoding: "utf-8" }, (err) => {
        if (err) {
          console.error("Error writing file:", err);
        } else {
          console.log("File has been written successfully.");
        }
      });
    });
    socket.addEventListener("open", () => {
      socket.send(this.tts.generateCommand());
      // for (const segment of splitTextByByteLength(this.tts.text, 12)) {
      //   this.tts.segments.push(segment);
      // }
      // console.log(this.tts.segments);
      socket.send(this.tts.generateSSML(this.tts.segments[0]));
      // this.tts.segments.shift();
    });
    socket.addEventListener("message", (data) => {
      if (Buffer.isBuffer(data.data)) {
        // console.log("Received binary data");
        if (data.data.length >= 2) {
          const headerLength = data.data.readUInt16BE(0);
          const header = data.data.subarray(0, headerLength);
          const result = this.parseMessageText(header.toString());

          console.log(result);
          // console.log(result.Path);
          if (result.Path !== "audio") {
            return;
          }

          const payload = data.data.subarray(headerLength);
          const totalLength = this.tts.mp3.length + payload.length;
          this.tts.mp3 = Buffer.concat([this.tts.mp3, payload], totalLength);
        } else {
          console.error(
            "Received data is too short to contain a valid header."
          );
        }
        // Process or store the data
      } else if (typeof data.data === "string") {
        const result = this.parseMessageText(data.data);
        if (result.Path === "turn.end") {
          if (this.tts.segments.length > 0) {
            socket.send(this.tts.generateSSML(this.tts.segments[0]));
            this.tts.segments.shift();
          } else {
            socket.close();
          }
        }
      }
    });

    this.socket = socket;
  }

  /**
   * @returns {void}
   */
  disconnect() {
    if (this.socket !== null) {
      this.socket.close();
    }
  }

  /**
   * @param {string} data
   * @returns {void}
   */
  send(data) {
    if (this.socket !== null) {
      this.socket.send(data);
    }
  }

  /**
   * @param {string} text
   * @returns {object}
   */
  parseMessageText(text) {
    const obj = {};
    const split = text.split("\r\n");

    split
      .filter((line) => line !== "")
      .map((line) => {
        try {
          obj.metaData = JSON.parse(line);
        } catch {
          const [key, value] = line.split(":");
          obj[key] = value;
        }
      });

    return obj;
  }
}
