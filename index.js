require("colors");
const fs = require("fs");
const Config = require("./src/config");
const Bot = require("./src/bot");
const { Header } = require("./src/Header");
const readline = require("readline");

const tunda = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fungsi untuk membaca input pengguna
const promptUser = (query) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

// Fungsi untuk membaca file proxy.txt
const readProxiesFromFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject("❌ Error reading the proxy file".red);
      } else {
        const proxies = data
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line !== "");
        resolve(proxies);
      }
    });
  });
};

// Fungsi untuk membaca token dari file token.txt
const readTokenFromFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject("❌ Error reading the token file".red);
      } else {
        resolve(data.trim());
      }
    });
  });
};

async function main() {
  Header();
  console.log("⏳ Mohon tunggu sebentar...\n".yellow);
  await tunda(2000);

  const config = new Config();
  const bot = new Bot(config);

  let singleToken;
  try {
    singleToken = await readTokenFromFile("token.txt");
    console.log(`🔑 ${"Token berhasil dibaca dari token.txt".green}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  const useProxy = await promptUser(
    "Apakah Anda ingin menggunakan proxy? (y/n): "
  );

  let proxyConfigs = [];

  if (useProxy.toLowerCase() === "y") {
    try {
      const proxies = await readProxiesFromFile("proxy.txt");
      console.log(proxies);

      proxyConfigs = proxies.map((proxy) => {
        const [host, port, username, password] = proxy.split(":");
        return {
          host,
          port: parseInt(port, 10),
          username: username || null,
          password: password || null,
        };
      });

      console.log(
        `🔗 ${"Menggunakan proxy dari proxy.txt untuk koneksi".cyan}`
      );
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  } else {
    console.log(`🔗 ${"Koneksi tanpa proxy".cyan}`);
  }

  const connections = proxyConfigs.map((proxyConfig) =>
    bot
      .connect(singleToken, proxyConfig)
      .catch((err) => console.log(`❌ ${err.message}`.red))
  );

  await Promise.all(connections);

  process.on("SIGINT", () => {
    console.log(`\n👋 ${"Mematikan aplikasi...".green}`);
    process.exit(0);
  });
}

main().catch((error) => console.log(`❌ ${error.message}`.red));
