import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying FHEGuessingGame contract...");

  const fheGuessingGame = await deploy("FHEGuessingGame", {
    from: deployer,
    args: [],
    log: true,
    skipIfAlreadyDeployed: false,
  });

  console.log(`FHEGuessingGame deployed to: ${fheGuessingGame.address}`);

  // Verify contract on Etherscan (if on mainnet or testnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Verifying contract on Etherscan...");
    await hre.run("verify:verify", {
      address: fheGuessingGame.address,
      constructorArguments: [],
    });
  }
};

func.tags = ["FHEGuessingGame"];
func.dependencies = [];

export default func;
