import { ethers, network } from "hardhat";

const { ROPSTEN_URL, ACCOUNT2_ADDRESS } = process.env;

const MNEMONIC =
  "curious tuition pig century panic believe item more warfare hungry cancel bounce";

(async () => {
  // explicit network (ignores the "--network" hardhat flag)
  const provider = new ethers.providers.JsonRpcProvider(ROPSTEN_URL);
  console.log("network: ", network.name);

  const wallet = ethers.Wallet.fromMnemonic(MNEMONIC);

  const balance = await provider.getBalance(wallet.address);
  const balanceEth = ethers.utils.formatEther(balance);
  console.log("from: ", wallet.address);
  console.log("balance: %s ETH", balanceEth);
  const signer = wallet.connect(provider);
  const recipient = ACCOUNT2_ADDRESS;
  const nonce = await provider.getTransactionCount(wallet.address, "latest");
  const amount = ethers.utils.parseUnits("0.1", "ether");
  const gasPrice = await provider.getGasPrice();
  const gasLimit = ethers.utils.hexlify(1000000);
  const tx = {
    from: wallet.address,
    to: recipient,
    value: amount,
    gasPrice,
    nonce,
    gasLimit,
  };
  const res = await signer.sendTransaction(tx);
  console.log(res);
})();
