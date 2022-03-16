import { ethers } from "hardhat";

const GREETER_ROPSTEN_ADDR = "0x257C65d7A1aAc3d5B246b3F9492340c209E8a858";
const GREETER_RINKEBY_ADDR = "0x41e7cE87BB82C1F9841c5d37eB304E78d8a846cD";

const GREETER_ABI = [
    "function greet() public view returns (string memory)",
    "function setGreeting(string memory _greeting) public",
];

async function main() {
    const signer = await ethers.getNamedSigner("user");

    console.log("Using hardhat-deploy-ethers: getContract");
    const contract1 = await ethers.getContract("Greeter", signer);
    const greeting1 = await contract1.greet();
    console.log("Greeting is: %s", greeting1);

    console.log("Using hardhat-deploy-ethers: getContractAt");
    const contract2 = await ethers.getContractAt(GREETER_ABI, GREETER_ROPSTEN_ADDR, signer);
    const greeting2 = await contract2.greet();
    console.log("Greeting is: %s", greeting2);
    
    console.log("Using pure ethers");
    const contract3 = new ethers.Contract(GREETER_ROPSTEN_ADDR, GREETER_ABI, signer);
    const greeting3 = await contract3.greet();
    console.log("Greeting is: %s", greeting3);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });