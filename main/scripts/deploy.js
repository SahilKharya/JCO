// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  // const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  // const lockedAmount = hre.ethers.utils.parseEther("1");
  const [deployer] = await hre.ethers.getSigners();
  console.log(deployer.address);
  const address1 = deployer.address;
  const address2 = '0x32134762047E8611B371AeFa13A9625ac39477aB';
  const address3 = '0x2b6f9CF3dAa5f270BEF7eB9e2Ac17827588d9DEF';

  // console.log(await deployer.getBalance())
  // console.log("await deployer.getBalance()")

  // const Treasury = await hre.ethers.getContractFactory("Treasury");
  // const treasury = await Treasury.deploy();
  // console.log(treasury.address)
  // await treasury.deployed
  // // await treasury.deployTransaction.wait(6)

  // const JCO = await hre.ethers.getContractFactory("JCO");
  // const jco = await JCO.deploy(treasury.address, "JCO_Poly", "JPO");
  // console.log(jco.address)
  // const Fundraising = await hre.ethers.getContractFactory("Fundraising");
  // const fundraising = await Fundraising.deploy([address1, address2], 2, jco.address);
  // console.log(fundraising.address)
  // const Rewards = await hre.ethers.getContractFactory("Rewards");
  // const rewards = await Rewards.deploy([address1, address2], 2, jco.address);

  // console.log(rewards.address)


  // const Team = await hre.ethers.getContractFactory("Team");
  // const team = await Team.deploy([address1, address2], 2, jco.address);
  // console.log(team.address)
  // const Advisors = await hre.ethers.getContractFactory("Advisors");
  // const advisors = await Advisors.deploy([address1, address2], 2, jco.address);
  // console.log(advisors.address)
  // const Marketing = await hre.ethers.getContractFactory("Marketing");
  // const marketing = await Marketing.deploy([address1, address2], 2, jco.address);
  // console.log(marketing.address)
  // const Exchange = await hre.ethers.getContractFactory("Exchange");
  // const exchange = await Exchange.deploy([address1, address2], 2, jco.address);
  // console.log(exchange.address)
  // const Foundation = await hre.ethers.getContractFactory("Foundation");
  // const foundation = await Foundation.deploy([address1, address2], 2, jco.address);
  // console.log(foundation.address)
  // const Staking = await hre.ethers.getContractFactory("Staking");
  // const staking = await Staking.deploy([address1, address2], 2, jco.address);
  // console.log(staking.address)
  // console.log("staking.address")

  // const MultiSig_Treasury = await hre.ethers.getContractFactory("MultiSig_Treasury");
  // const multiSig_Treasury = await MultiSig_Treasury.deploy([address1, address2, address3], 3, jco.address, treasury.address);
  // console.log(multiSig_Treasury.address)

  const token = "0xBAE4e6cFF10056179B0cbA47C29d466d17FCdAD1"
  const treas = "0x545ba7170FED7E625CC8d702760060c994D65CF0"
  const mul = "0x4967333aeDC32852c42F011E9C4A299007b776F3"
  const fund = "0x0F665c4E402f1E4F6Fbd7c55e728A4bF0b52e969"
  const rew = "0x7e6b535b2188E59138c51D2cB1CaF0dDFE00f3E8"

  const tea = "0x7C9F04e23629b67298A565e6678347436436BFd1";
  const adv = "0x332FE2286b017C1F9E8773E5E620fa0ebd3a9bA0"
  const mar = "0xF305335a39A9102b5FB8A4FebB5A2800D4E74038"
  const exc = "0x6B8c9f387Dc4df3306cA3Ba925DCdAfbBC42d68A"
  const fou = "0x5801209e41f8E67ae9023EBA6C1c4dF74A381c33"
  const sta = "0xd5c87444C74Ca285d7E73dc75b3090F1746DDFdA"
  const man = "0x066558bFC300Ecb1793B3629be165955Fe37D8f2"
  const JCO_Manager = await hre.ethers.getContractFactory("JCO_Manager");
  const jco_Manager = await JCO_Manager.deploy(token,
    treas,
    mul,
    fund,
    rew, tea, adv, mar, exc, fou, sta);
  await jco_Manager.deployed
  await jco_Manager.deployTransaction.wait(5);
  console.log(jco_Manager.address)




  // await run(`verify:verify`, {
  //   address: "0x545ba7170FED7E625CC8d702760060c994D65CF0"
  // })
  // await run(`verify:verify`, {
  //   address: "0xBAE4e6cFF10056179B0cbA47C29d466d17FCdAD1",
  //   contract: "contracts/JCO.sol:JCO", //Filename.sol:ClassName
  //   constructorArguments: ["0x545ba7170FED7E625CC8d702760060c994D65CF0", "JCO_Poly", "JPO"],
  // })
  // console.log('trasu')
  // await run(`verify:verify`, {
  //   address: "0x0F665c4E402f1E4F6Fbd7c55e728A4bF0b52e969",
  //   contract: "contracts/1_Fundraising.sol:Fundraising", //Filename.sol:ClassName
  //   constructorArguments: [[address1, address2], 2, "0xBAE4e6cFF10056179B0cbA47C29d466d17FCdAD1"],
  // })
  // console.log('fund vvv')

  // await run(`verify:verify`, {
  //   address: "0x4967333aeDC32852c42F011E9C4A299007b776F3",
  //   contract: "contracts/MultiSig_Treasury.sol:MultiSig_Treasury", //Filename.sol:ClassName
  //   constructorArguments: [[address1, address2, address3], 3, token, treas],
  // })
  console.log('multi vvv')

  await run(`verify:verify`, {
    address: "0x066558bFC300Ecb1793B3629be165955Fe37D8f2",
    // contract: "contracts/Manager.sol:JCO_Manager", //Filename.sol:ClassName
    constructorArguments: [token,
      treas,
      mul,
      fund,
      rew, tea, adv, mar, exc, fou, sta],
  })
  console.log('last vvv')

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
