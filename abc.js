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
  async function buyToken(tokenAddress, amountInBNB) {
    const tokenContract = new web3.eth.Contract(ABI, tokenAddress);
    const bnbAmountInWei = web3.utils.toWei(amountInBNB.toString(), 'ether');
    
    try {
      // Get the estimated amount of tokens you'll receive for the given BNB amount
      const estimatedTokens = await tokenContract.methods.getAmountOut(bnbAmountInWei).call();
      console.log('Estimated Tokens:', estimatedTokens);
  
      // Send the transaction to buy the tokens
      const tx = await tokenContract.methods.swapExactETHForTokens(
        estimatedTokens, // Min amount of tokens you expect to receive
        [], // You can add the router address and your wallet address here
        defaultAccount.address, // Your wallet address
        Date.now() + 1000 * 60 // Set an expiration time for the transaction (1 minute from now)
      ).send({ from: defaultAccount.address, value: bnbAmountInWei });
  
      console.log('Transaction Hash:', tx.transactionHash);
    } catch (err) {
      console.error('Error buying tokens:', err);
    }
  }
  