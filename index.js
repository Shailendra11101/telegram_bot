const TelegramBot = require("node-telegram-bot-api");
const { ethers, JsonRpcProvider } = require("ethers");

const botToken = "6418721491:AAGu3j2J6fRzhtxe4PC2-gHxBZyP0w-lghQ"; // Replace with your actual bot token
const bot = new TelegramBot(botToken, { polling: true });

const bscTestnetProvider = new JsonRpcProvider(
  "https://data-seed-prebsc-2-s2.binance.org:8545"
); // BSC Testnet provider

// Function to create wallets
function createWallets(chatId) {
  // Generate three BSC testnet wallets and addresses
  const wallets = [];
  const addresses = [];
  for (let i = 0; i < 3; i++) {
    const wallet = ethers.Wallet.createRandom();
    wallets.push(wallet);
    addresses.push(wallet.address);
  }

  // Obtain and display the private keys of the generated wallets
  const privateKeys = wallets.map((wallet) => wallet.privateKey);

  // Send the addresses and private keys to the user
  let message = "Your wallets have been created!\n\n";
  for (let i = 0; i < 3; i++) {
    message += `Address ${i + 1}: ${addresses[i]}\nPrivate Key ${i + 1}: ${
      privateKeys[i]
    }\n\n`;
  }
  bot.sendMessage(chatId, message);
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Create a list of available commands and their purposes
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "create wallet", callback_data: "/create" }],
        [{ text: "contact us", callback_data: "other" }],
      ],
    },
  };

  bot.sendMessage(chatId, "Choose an option:", options);
});

bot.onText(/\/create/, (msg) => {
  const chatId = msg.chat.id;
  createWallets(chatId);
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const command = query.data;

  if (command === "/create") {
    // Use bot.answerCallbackQuery to call the /create command
    bot.answerCallbackQuery(query.id);
    createWallets(chatId);
  } else if (command === "other") {
    // Replace this line with the functionality for the "contact us" command.
    bot.sendMessage(chatId, );
  }
});

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const response = match[1];
  bot.sendMessage(chatId, response);
});
