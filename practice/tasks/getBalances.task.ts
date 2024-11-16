import { types } from 'hardhat/config';

export default (task: any) =>
    task('balances', 'Asks their balances and subscribes to their events.')
    .addOptionalParam(
      'tokens',
      'Define tokens to be asked.',
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,0xdAC17F958D2ee523a2206206994597C13D831ec7,0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", // usdc, usdt, wstETH
      types.string,
    )
    .addOptionalParam(
      'sender',
      'Define a sender to be scanned.',
      "0x8A3e74407aAD1682c91A175E39424c90ACfc81bd", // some person with usdt
      types.string,
    )
    .setAction(
      async ({ tokens, sender }: any, hre: any) => {
        const tokensArray = tokens.split(",");
        const EIP20_ABI = [
          "function balanceOf(address owner) view returns (uint256)",
          "function symbol() view returns (string)",
        ];
        for (let i = 0; i < tokensArray.length; i++) {
          const erc20 = await hre.ethers.getContractAt(EIP20_ABI, tokensArray[i]);
          console.log(`Token ${await erc20.symbol()} balance of (${sender}) is: ${hre.ethers.formatUnits(await erc20.balanceOf(sender), 6)}`);
        }
      },
    );
  