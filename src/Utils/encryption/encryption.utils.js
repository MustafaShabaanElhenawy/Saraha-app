import CryptoJS from "crypto-js";

export const encrypt = (plainText) => {
  return CryptoJS.AES.encrypt(plainText, process.env.ENC_SECRET).toString();
};

export const decrypt = (ciphertext) => {
  return CryptoJS.AES.decrypt(ciphertext, process.env.ENC_SECRET).toString(
    CryptoJS.enc.Utf8
  );
};
