import { types } from 'hardhat/config';
import { abi as FACTORY_ABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json';
import { abi as PAIR_ABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';

export default (task: any) =>
  task('pair', 'Asks their balances and subscribes to their events.')
    .addOptionalParam(
      'tokenA',
      'Define token A of pair.',
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      types.string,
    )
    .addOptionalParam(
      'tokenB',
      'Define token B of pair.',
      "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
      types.string,
    )
    .addOptionalParam(
      'factory',
      'Define U3 factory.',
      "0x1F98431c8aD98523631AE4a59f267346ea31F984", // Uniswap V3 Factory
      types.string,
    )
    .addOptionalParam(
      'fee',
      'Define U3 pair fee.',
      100n,
      types.bigint,
    )
    .setAction(
      async ({ tokenA, tokenB, factory, fee }: any, hre: any) => {
        const factoryInstance = await hre.ethers.getContractAt(FACTORY_ABI, factory);
        
        // should be this: 0x3416cF6C708Da44DB2624D63ea0AAef7113527C6
        const pair = await hre.ethers.getContractAt(PAIR_ABI, await factoryInstance.getPool(tokenA, tokenB, fee));
        
        console.log(`Starting to listen Swap event of pair: ${await pair.getAddress()}`);
        await pair.on("Swap", (args: any) => {
          console.log('Received args:');
          console.log(args);
        });
      },
    );
