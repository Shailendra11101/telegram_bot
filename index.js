const TelegramBot = require("node-telegram-bot-api");
const { ethers, JsonRpcProvider } = require("ethers");
const botToken = "6418721491:AAGu3j2J6fRzhtxe4PC2-gHxBZyP0w-lghQ"; 
const bot = new TelegramBot(botToken, { polling: true });
const web3 = require("web3");
const wbnb = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
const RouterAddress = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";

const routerAbi = require("./RouterAbi.json");

const bscTestnetProvider = new JsonRpcProvider(
  "https://data-seed-prebsc-2-s2.binance.org:8545"
); // BSC Testnet provider
const web3js = new web3(
  new web3.providers.HttpProvider(
    "https://data-seed-prebsc-2-s2.binance.org:8545"
  )
);

const addresses = [];
// Function to create wallets
async function createWallets(chatId) {
  // Generate three BSC testnet wallets and addresses
  const wallets = [];
  const walletBalances = [];
  for (let i = 0; i < 3; i++) {
    const wallet = ethers.Wallet.createRandom();
    wallets.push(wallet);
    addresses.push(wallet.address);
    let walletBalance = await web3js.eth.getBalance(wallet.address);
    walletBalances.push(walletBalance);
  }

  // Obtain and display the private keys of the generated wallets
  const privateKeys = wallets.map((wallet) => wallet.privateKey);

  // Send the addresses and private keys to the user
  let message = "Your wallets have been created!\n\n";
  for (let i = 0; i < 3; i++) {
    message += `Address ${i + 1}: ${addresses[i]}\nPrivate Key ${i + 1}: ${
      privateKeys[i]
    } Wallet Balance ${i + 1}: ${walletBalances[i]}  \n \n`;
  }

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
function buy(addresses,index,chatId, tokenAddress, amount) {
  // Verify the token address
  if (!isValidAddress(tokenAddress)) {
    bot.sendMessage(
      chatId,
      "Invalid token address. Please enter a valid Ethereum address."
    );
    return;
  }
  console.log(chatId, "==========11===========");
  console.log(tokenAddress, "==========11===========");
  console.log(amount, "==========11===========");
  console.log(addresses, "==========11===========");
  console.log(index, "==========11===========");


  let AmountIn = amount;
  async function execution() {
    let walletBalance = await web3js.eth.getBalance(addresses[index]);

    if (
      parseInt(walletBalance) >=
      parseInt(AmountIn) + parseInt(6093830000000000) //manual gas limit
    ) {
      let count = await web3js.eth.getTransactionCount(addresses[index]);

      let Path = [wbnb, tokenAddress];
      let AmountOut = 0;
      let deadline = parseInt(100000000000);
      let RouterContract = new web3js.eth.Contract(routerAbi, RouterAddress);
      let data = await RouterContract.methods
        .swapExactETHForTokens(AmountOut, Path, addresses[index], deadline)
        .encodeABI();

      let estimates_gas = await web3js.eth.estimateGas({
        from: addresses[index],
        to: RouterAddress,
        data: data,
        value: AmountIn,
      });

      // gas calculate
      let gasLimit = web3js.utils.toHex(estimates_gas * 3);
      let gasPrice_bal = await web3js.eth.getGasPrice();
      let gasPrice = web3js.utils.toHex(gasPrice_bal);

      var rawTransaction = {
        from: senderAddressArray[index],
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        to: RouterAddress,
        data: data,
        value: AmountIn,
        nonce: web3js.utils.toHex(count),
      };

      const common = Common.default.forCustomChain(
        "mainnet",
        {
          name: "bnb",
          networkId: 97,
          chainId: 97,
        },
        "petersburg"
      );

      var transaction = new Tx(rawTransaction, { common });
      transaction.sign(privateKeyArray[index]);

      let hash1 = await web3js.eth.sendSignedTransaction(
        "0x" + transaction.serialize().toString("hex")
      );
      console.log("Transaction hash: ", hash1.logs[0].transactionHash);
      currentPrice = await calculatePrice();

      if (targetPrice > currentPrice) {
        console.log("reached", currentPrice, targetPrice);
        return;
      } else {
        console.log("Notreached", currentPrice, targetPrice);
        index = (index + 1) % senderAddressArray.length;
        await Buy(index);
        return hash1;
        // return;
      }
    }
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
    bot.sendMessage(chatId, "Please enter the token address:");
    bot.once("message", (msg) => {
      const tokenAddress = msg.text.trim();
      bot.sendMessage(chatId, "Please enter the amount to buy:");
      bot.once("message", (msg) => {
        const amount = parseFloat(msg.text.trim());
        bot.sendMessage(chatId, "please chose the wallet number:");
        bot.once("message", (msg) => {
          const index = parseFloat(msg.text.trim())-1;
          
          buy(wallets,index,chatId, tokenAddress, amount);
        });
        
      });
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
