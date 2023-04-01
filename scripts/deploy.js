const { ethers, run, network } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();

  const signerFactory = await ethers.getContractFactory("DocumentSigner");
  const contract = await signerFactory.deploy();
  await contract.deployed();
  console.log(`Contract address: ${contract.address}`);

  console.log(network.config);
  if (network.config.chainId === 97) {
    await contract.deployTransaction.wait(6);
    await verify(contract.address, []); // так как при деплоинге нашего контрнакта в конструкторе пусто (а в нашем примере нет конструктора) то  и массив пустой
  }

  const txResponse = await contract.setNote("YA_667");
  await txResponse.wait(1);
  const myNote = await contract.getNote();
  console.log(`myNote: ${myNote}`);
}

async function verify(contractAddress, arguments) {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: arguments,
    });
  } catch (e) {
    if (e.message.toLowerCase.include("already verified")) {
      console.log("The contract already verified");
    } else {
      console.log(e);
    }
  }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
