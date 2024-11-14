import { buildWebSocketURL } from "./utils";
import constants from "./constants";
import fs from "fs";
import TTS from "./tts";

export default class EdgeSocket {
  constructor(tts) {
    this.url = buildWebSocketURL();
    this.socket = null;
    this.tts = new TTS(tts);
    this.writeStream = fs.createWriteStream("output.mp3");
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
      console.log("Connection closed.");
      writeStream.end(); // Finalize the file
    });
    socket.addEventListener("open", () => {
      const command = this.tts.generateCommand();
      console.log(command);
      socket.send(command);
      setTimeout(() => {
        socket.send(this.tts.generateSSML());
      }, 500);
    });
    socket.addEventListener("message", ({ data }) => {
      console.log(data);
      if (Buffer.isBuffer(data)) {
        console.log("Received binary data");
        this.tts.mp3 = Buffer.concat([this.tts.mp3, data]);
        this.writeStream.write(data);
        // Process or store the data
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
}
