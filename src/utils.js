import constants from "./constants";
import { hash, randomUUID } from "crypto";

/**
 * @returns {string}
 */
export function buildWebSocketURL() {
  let url = constants.WSS_URL;
  url += "&Sec-MS-GEC-Version=";
  url += generateSecMsGec();
  url += "&ConnectionId=";
  url += uuid();
  return url;
}

/**
 * @returns {string}
 */
function generateSecMsGec() {
  const now = new Date();
  const unixTimestamp = Math.floor(now.getTime() / 1000);
  const S_TO_NS = 1e9;

  let ticks = unixTimestamp + constants.WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= S_TO_NS / 100;

  const strToHash = `${Math.floor(ticks)}${constants.TRUSTED_CLIENT_TOKEN}`;

  return hash("sha256", strToHash, "hex").toUpperCase();
}

/**
 * @returns @returns {string} - uuid is used in headers
 */
export function uuid() {
  return randomUUID().replaceAll("-", "");
}

export function* splitTextByByteLength(text, byteLength) {
  if (typeof text === "string") {
    text = Buffer.from(text, "utf-8");
  } else if (!Buffer.isBuffer(text)) {
    throw new TypeError("text must be a string or a Buffer");
  }

  if (byteLength <= 0) {
    throw new RangeError("byteLength must be greater than 0");
  }

  while (text.length > byteLength) {
    // Find the last space within the byteLength limit
    let splitAt = text.lastIndexOf(" ".charCodeAt(0), byteLength);

    // If no space is found, split at byteLength
    if (splitAt === -1) {
      splitAt = byteLength;
    }

    // Ensure all '&' are terminated with a ';'
    while (text.slice(0, splitAt).includes("&".charCodeAt(0))) {
      const ampersandIndex = text.lastIndexOf("&".charCodeAt(0), splitAt);
      if (text.slice(ampersandIndex, splitAt).includes(";".charCodeAt(0))) {
        break;
      }
      splitAt = ampersandIndex - 1;
      if (splitAt < 0) {
        throw new Error("Maximum byte length is too small or invalid text");
      }
      if (splitAt === 0) {
        break;
      }
    }

    // Extract and yield the segment
    const newText = text.slice(0, splitAt).toString("utf-8").trim();
    if (newText) {
      yield newText;
    }
    if (splitAt === 0) {
      splitAt = 1;
    }
    text = text.slice(splitAt);
  }

  const newText = text.toString("utf-8").trim();
  if (newText) {
    yield newText;
  }
}
