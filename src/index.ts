import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { sm4 } from "sm-crypto-v2";
import dotenv from "dotenv";

dotenv.config(); // 加载 .env 文件

// 配置常量
const KEY = process.env.SM4_KEY || ""; // SM4 密钥，16 字节
const INPUT_FILE = path.resolve(__dirname, "../hanzi.txt");
const COMPRESSED_FILE = path.resolve(__dirname, "../hanzi.zip");
const ENCRYPTED_FILE = path.resolve(__dirname, "../hanzi.bin");
const DECOMPRESSED_FILE = path.resolve(__dirname, "../hanzi.decompressed.zip");
const DECRYPTED_PATH = path.resolve(__dirname, "../decrompressed/");

// 压缩文件
function compressFile(inputPath: string, outputPath: string): void {
  const zip = new AdmZip();
  zip.addLocalFile(inputPath);
  zip.writeZip(outputPath);
  console.log(`File compressed: ${outputPath}`);
}

// 加密文件
function encryptFile(inputPath: string, outputPath: string, key: string): void {
  const inputData = fs.readFileSync(inputPath);
  const encryptedData = sm4.encrypt(inputData, key, { output: "array" });
  fs.writeFileSync(outputPath, Buffer.from(encryptedData));
  console.log(`File encrypted: ${outputPath}`);
}

// 解密文件
function decryptFile(inputPath: string, outputPath: string, key: string): void {
  const encryptedData = fs.readFileSync(inputPath);
  const decryptedData = sm4.decrypt(new Uint8Array(encryptedData), key, {
    output: "array",
  });
  fs.writeFileSync(outputPath, Buffer.from(decryptedData));
  console.log(`File decrypted: ${outputPath}`);
}

// 解压缩文件
function decompressFile(inputPath: string, outputPath: string): void {
  const zip = new AdmZip(inputPath);
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  zip.extractAllTo(outputPath, true);
  // const extractedFilePath = path.join(
  //   path.dirname(outputPath),
  //   path.basename(outputPath)
  // );
  // fs.renameSync(extractedFilePath, outputPath); // 重命名解压的文件为指定名称
  console.log(`File decompressed: ${outputPath}`);
}

// 主流程
function main() {
  // Step 1: 压缩 hanzi.txt -> hanzi.zip
  compressFile(INPUT_FILE, COMPRESSED_FILE);

  // Step 2: 加密 hanzi.zip -> hanzi.bin
  encryptFile(COMPRESSED_FILE, ENCRYPTED_FILE, KEY);

  // Step 3: 解密 hanzi.bin -> hanzi.decompressed.zip
  decryptFile(ENCRYPTED_FILE, DECOMPRESSED_FILE, KEY);

  // Step 4: 解压缩  hanzi.decompressed.zip 到 hanzi.decrypted.txt
  decompressFile(DECOMPRESSED_FILE, DECRYPTED_PATH);
}

// 执行主流程
main();
