async function Buy(index) {
    let AmountIn = amount;

    let walletBalance = await web3js.eth.getBalance(
        addresses[index]
    );

    if (
      parseInt(walletBalance) >=
      parseInt(AmountIn) + parseInt(6093830000000000)  //manual gas limit
    ) {

      let count = await web3js.eth.getTransactionCount(
        addresses[index]

      );

      let Path = [wbnb, tokenAddress];
      let AmountOut = 0;
      let deadline = parseInt(100000000000);
      let RouterContract = new web3js.eth.Contract(
        routerAbi,
        RouterAddress
      );
      let data = await RouterContract.methods
        .swapExactETHForTokens(
          AmountOut,
          Path,
          addresses[index],
          deadline
        )
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