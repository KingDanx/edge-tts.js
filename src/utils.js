import constants from "./constants.js";
import { createHash, randomUUID } from "crypto";

/**
 * @returns {string}
 */
export function buildWebSocketURL() {
  let url = constants.WSS_URL;
  url += "&Sec-MS-GEC=";
  url += generateSecMsGec();
  url += "&Sec-MS-GEC-Version=";
  url += constants.SEC_MS_GEC_VERSION;
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

  return createHash("sha256").update(strToHash).digest("hex").toUpperCase();
}

/**
 * @returns @returns {string} - uuid is used in headers
 */
export function uuid() {
  return randomUUID().replaceAll("-", "");
}
