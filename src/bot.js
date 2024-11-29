const axios = require("axios");
const crypto = require("crypto");

class Bot {
  constructor(config) {
    this.config = config;
  }

  async connect(token, proxy = null) {
    try {
      const userAgent = "Mozilla/5.0 ... Safari/537.3";
      const infoAkun = await this.getSession(token, userAgent, proxy);

      console.log(
        `✅ ${"Terhubung ke sesi".green} dengan UID: ${infoAkun.uid}`
      );

      console.log("");

      const interval = setInterval(async () => {
        try {
          await this.kirimPing(infoAkun, token, userAgent, proxy);
        } catch (error) {
          console.log(`❌ ${"Kesalahan ping".red}: ${error.message}`);
        }
      }, this.config.retryInterval);

      if (!process.listenerCount("SIGINT")) {
        process.once("SIGINT", () => {
          clearInterval(interval);
          console.log("\n👋 Mematikan aplikasi...");
        });
      }
    } catch (error) {
      console.log(`❌ ${"Kesalahan koneksi".red}: ${error.message}`);
    }
  }

  async getSession(token, userAgent, proxy) {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          Accept: "application/json",
        },
      };

      if (proxy) {
        config.proxy = this.konfigurasiProxy(proxy);
      }

      const response = await axios.post(this.config.sessionURL, {}, config);
      return response.data.data;
    } catch (error) {
      throw new Error("Permintaan sesi gagal");
    }
  }

  async kirimPing(infoAkun, token, userAgent, proxy) {
    const uid = infoAkun.uid || crypto.randomBytes(8).toString("hex");
    const browserId =
      infoAkun.browser_id || crypto.randomBytes(8).toString("hex");

    const dataPing = {
      id: uid,
      browser_id: browserId,
      timestamp: Math.floor(Date.now() / 1000),
      version: "2.2.7",
    };

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          Accept: "application/json",
        },
      };

      if (proxy) {
        config.proxy = this.konfigurasiProxy(proxy);
      }

      await axios.post(this.config.pingURL, dataPing, config);
      console.log(`📡 ${"Ping terkirim".cyan} untuk UID: ${uid}`);
    } catch (error) {
      throw new Error("Permintaan ping gagal");
    }
  }

  konfigurasiProxy(proxy) {
    return proxy && proxy.host
      ? {
          host: proxy.host,
          port: parseInt(proxy.port),
          auth:
            proxy.username && proxy.password
              ? { username: proxy.username, password: proxy.password }
              : undefined,
        }
      : undefined;
  }
}

module.exports = Bot;
