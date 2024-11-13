import { buildWebSocketURL } from "./utils";
import constants from "./constants";

export default class EdgeSocket {
  constructor() {
    this.url = buildWebSocketURL();
    this.socket = null;
  }

  /**
   * @returns {void}
   */
  connect() {
    const socket = new WebSocket(this.url, {
      headers: constants.WSS_HEADERS,
    });

    socket.addEventListener("error", (e) => console.log(e));
    socket.addEventListener("close", (e) => console.log(e));
    socket.addEventListener("open", () =>
      console.log("connected to the socket server")
    );
    socket.addEventListener("message", ({ data, headers }) =>
      console.log(data, headers)
    );

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
