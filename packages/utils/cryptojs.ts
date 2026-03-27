import CryptoJS from 'crypto-js'

// AES 密钥和 IV（必须和后端一致）
const AES_KEY = CryptoJS.enc.Utf8.parse('aGHldqP6v46hIB97AWhy+O4TV32R0shy') // 32 字节
const AES_IV = CryptoJS.enc.Utf8.parse('TFQTdsE3izhZP0Dh') // 16 字节

// 加密函数
const encryptPassword = (password: string) => {
  const encrypted = CryptoJS.AES.encrypt(password, AES_KEY, {
    iv: AES_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.toString() // Base64 格式
}

export default encryptPassword
