const TelegramBot = require("node-telegram-bot-api");
const { ethers, JsonRpcProvider } = require("ethers");
const botToken = "6418721491:AAGu3j2J6fRzhtxe4PC2-gHxBZyP0w-lghQ";
const bot = new TelegramBot(botToken, { polling: true });
const Web3 = require("web3");
const wbnb = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
const RouterAddress = "0x9ac64cc6e4415144c455bd8e4837fea55603e5c3";
const busd = "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7";
const routerAbi = require("./RouterAbi.json");
const Common = require("ethereumjs-common");
const Tx = require("ethereumjs-tx").Transaction;




const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://data-seed-prebsc-2-s2.binance.org:8545"
  )
);

let wallet;
async function createWallets(chatId) {
  wallet = await ethers.Wallet.createRandom();
  console.log(wallet.address);
  console.log(wallet.privateKey);

  const address = wallet.address;
  const privateKeys = wallet.privateKey;
  let message = "Your wallets have been created!\n\n";

  message += `Address : ${address}\nPrivate Key: ${privateKeys} \n \n`;

  // Inline keyboard with "buy" and "sell" options
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "buy token", callback_data: "/buy" }],
        [{ text: "sell token", callback_data: "/sell" }],
      ],
    },
  };

  // Send the message with the inline keyboard options
  bot.sendMessage(chatId, message, options);
}

// Helper function to verify if a given string is a valid Ethereum address
function isValidAddress(address) {
  if (!address) return false;
  if (!/^0x[0-9A-Fa-f]{40}$/.test(address)) return false;
  return true;
}

// Function to initiate the buying process
function buy(wallet, chatId, tokenAddress, amount) {
  // Verify the token address
  console.log(chatId, "==========11===========");
  if (!isValidAddress(tokenAddress)) {
    bot.sendMessage(
      chatId,
      "Invalid token address. Please enter a valid Ethereum address."
    );
    return;
  }
  console.log(wallet,"=============00=============")
  console.log(tokenAddress, "==========11===========");
  console.log(amount, "==========12===========");
  console.log(wallet.address, "==========13===========");

  let AmountIn = amount;
  async function execution() {
    // let walletBalance = await web3js.eth.getBalance(addresses[index]);

    let count = web3js.eth.getTransactionCount(wallet.address);
    console.log("==========11123===========");

    let Path = [wbnb, tokenAddress];
    console.log("==========1114234===========");

    console.log("==========3435===========");

    let deadline = parseInt(100000000000);
    console.log("==========58465===========");

    let RouterContract = new web3js.eth.Contract(routerAbi, RouterAddress);
    console.log("==========22555===========", wallet.address);

    let data = await RouterContract.methods
      .swapExactETHForTokens(
        AmountIn,
        Path,
        wallet.address,
        deadline
      )
      .encodeABI();
    console.log("==========22222===========",data);

    // gas calculate
    let gasLimit = web3js.utils.toHex(200000);
    let gasPrice_bal = await web3js.eth.getGasPrice();
    let gasPrice = web3js.utils.toHex(gasPrice_bal);

    var rawTransaction = {
      from: wallet.address,
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      to: RouterAddress,
      data: data,
      value: AmountIn,
      nonce: web3js.utils.toHex(count),
    };
    console.log("==========33333===========");

    const common = Common.default.forCustomChain(
      "mainnet",
      {
        name: "BSC-testnet",
        networkId: 97,
        chainId: 97,
      },
      "petersburg"
    );
    console.log("==========44444===========");

    var transaction = new Tx(rawTransaction, { common });
    console.log("===========99999990=====",wallet.privateKey)
    const privateKeyBuffer = Buffer.from(wallet.privateKey.slice(2), 'hex');
    transaction.sign(privateKeyBuffer);
    console.log("==========55555===========");

    let hash1 = await web3js.eth.sendSignedTransaction(
      "0x" + transaction.serialize().toString("hex")
    );

    console.log("==========666666===========");

    console.log("Transaction hash: ", hash1.logs[0].transactionHash);

    console.log("==========7777777===========");

    return hash1;
    // return;
  }
  execution();
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
    bot.sendMessage(chatId, "Contact us functionality is not implemented yet.");
  } else if (command === "/buy") {
    bot.answerCallbackQuery(query.id);

    const tokenAddress = busd;
    bot.sendMessage(chatId, "Please enter the amount to buy:");
    bot.once("message", (msg) => {
      const amount = parseFloat(msg.text.trim());
     
        console.log("calling buy");
        console.log(wallet);
        console.log(chatId);
        console.log(tokenAddress);
        console.log(amount);

        buy(wallet, chatId, tokenAddress, amount);
      
    });
  } else if (command === "/sell") {
    bot.answerCallbackQuery(query.id);
    // Implement the "sell" functionality here
    bot.sendMessage(chatId, "Sell functionality is not implemented yet.");
  }
});

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const response = match[1];
  bot.sendMessage(chatId, response);
});
