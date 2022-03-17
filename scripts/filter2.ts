import { ethers, network } from "hardhat";
import { Token } from "../typechain/Token";

const MNEMONIC = "curious tuition pig century panic believe item more warfare hungry cancel bounce";

(async () => {
    const deployer = await ethers.getNamedSigner("deployer");

    const aaaContract: Token = await ethers.getContract("AAAToken", deployer);    
    const bbbContract: Token = await ethers.getContract("BBBToken");

    const recipientWallet = ethers.Wallet.fromMnemonic(MNEMONIC);
    const recipientSigner = recipientWallet.connect(ethers.provider);

    const aaaTransferFilter = aaaContract.filters.Transfer(deployer.address, null);
    const lastBlock = await ethers.provider.getBlockNumber();
    aaaContract.on(aaaTransferFilter, (from, to, amount, event) => {
        if (event.blockNumber <= lastBlock) return;
        const amountEth = ethers.utils.formatUnits(amount, 18);
        console.log(`${from} -> ${to}: ${amountEth} AAA`);
    });

    const amountAAA = ethers.utils.parseUnits("1", 18);
    const tx = await aaaContract.transfer(recipientWallet.address, amountAAA);
    tx.wait(2);

    const recipientBalance = await aaaContract.balanceOf(recipientWallet.address);
    const recipientBalanceAAA = ethers.utils.formatUnits(recipientBalance, 18);

    console.log("recipient balance: %s AAA", recipientBalanceAAA);

})();