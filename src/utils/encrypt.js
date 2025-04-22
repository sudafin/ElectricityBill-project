import JSEncrypt from 'jsencrypt';

export function encryptWithRSA(data, publicKey) {
  try {
    // 检查输入参数
    if (!data || !publicKey) {
      throw new Error('数据和公钥不能为空');
    }

    // 创建 JSEncrypt 实例
    const encrypt = new JSEncrypt();

    // 设置公钥
    encrypt.setPublicKey(publicKey);

    // 加密数据
    const encrypted = encrypt.encrypt(data);

    return encrypted;

  } catch (error) {
    console.error('RSA加密错误:', error);
    throw error;
  }
}