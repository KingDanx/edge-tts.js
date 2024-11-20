import { buildWebSocketURL } from "./utils.js";
import fs from "fs";
import TTS from "./tts.js";
import constants from "./constants.js";
import path, { resolve } from "path";
import WebSocket from "ws";

export default class EdgeTTS {
  static fileTypes = constants.OUTPUT_FORMATS;

  static async getVoices() {
    try {
      const response = await fetch(constants.VOICE_LIST_URL, {
        headers: constants.VOICE_HEADERS,
      });

      const data = await response.json();

      return data;
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  constructor(tts) {
    this.url = buildWebSocketURL();
    this.tts = new TTS(tts);
    this.file = Buffer.alloc(0);
  }

  /**
   * @param {string} directory
   * @returns {Promise}
   */
  ttsToFile(directory = "") {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url, {
        headers: constants.WSS_HEADERS,
      });

      socket.binaryType = "arraybuffer";

      socket.addEventListener("error", (e) => {
        socket.close();
        reject(e);
      });

      socket.addEventListener("close", (e) => {
        const endIndex = this.tts.text.length > 20 ? 20 : this.tts.text.length;
        const fileName = `${this.tts.voice}-${this.tts.text
          .slice(0, endIndex)
          .trim()}${this.tts.fileType.ext}`;
        const filePath = path.join(directory, fileName);

        fs.writeFile(filePath, this.file, (err) => {
          if (err) {
            console.error("Error writing file:", err);
          }
          resolve(filePath);
        });
      });

      socket.addEventListener("open", () => {
        socket.send(this.tts.generateCommand());
        socket.send(this.tts.generateSSML());
      });

      socket.addEventListener("message", (data) => {
        if (data.data instanceof ArrayBuffer) {
          const buffer = Buffer.from(data.data);
          if (buffer.length >= 2) {
            const headerLength = buffer.readUInt16BE(0) + "\r\n".length;
            const header = buffer.subarray(0, headerLength);
            const result = this.parseMessageText(header.toString());

            if (result.Path !== "audio") {
              return;
            }

            const payload = buffer.subarray(headerLength);
            const totalLength = this.file.length + payload.length;
            this.file = Buffer.concat([this.file, payload], totalLength);
          } else {
            console.error(
              "Received data is too short to contain a valid header."
            );
          }
        } else if (typeof data.data === "string") {
          const result = this.parseMessageText(data.data);
          if (result.Path === "turn.end") {
            socket.close(0);
          }
        }
      });
    });
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
