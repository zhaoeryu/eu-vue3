import { JSEncrypt } from 'jsencrypt';

const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJ7ajt/v+aA25UPRgU/wh3+jjIk4VVJA1mMp7tBktPSOF7jxzm+G+2VK5MIYpomN7LPb90XraofsD7NT1iK0j/0CAwEAAQ==';

/**
 * 加密
 * @param {String} txt 需要加密的数据
 * @returns {*} 加密后的数据
 */
export function encrypt(txt: string) {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  return encryptor.encrypt(txt);
}
