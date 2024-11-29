require("colors");
const Config = require("./src/config");
const Bot = require("./src/bot");
const { Header } = require("./src/Header");

const tunda = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  Header();
  console.log("⏳ Mohon tunggu sebentar...\n".yellow);
  await tunda(2000);
  const config = new Config();

  const bot = new Bot(config);

  const singleToken =
    "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzA3MzA0MzMzNzA4MDk5NTg0IiwiaWF0IjoxNzMyODQzNjczLCJleHAiOjE3MzQwNTMyNzN9.5COiNJVFISdntHfXV1dQ5g3VwQj1i43TblwuJnHyUFEx-PSQ-tKrdRe5zUpAygNcu93HzKBy7mBv7ixausZKnQ";

  bot.connect(singleToken).catch((err) => console.log(`❌ ${err.message}`.red));

  process.on("SIGINT", () => {
    console.log(`\n👋 ${"Mematikan aplikasi...".green}`);
    process.exit(0);
  });
}

main().catch((error) => console.log(`❌ ${error.message}`.red));
