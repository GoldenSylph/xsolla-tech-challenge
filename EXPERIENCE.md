# Experience

## 1. Arbitrage task

DEXes: UniswapV2, Uniswap V3.

Have ETH only for two swaps (on U2 and U3).

### U3 integration implementation

Well, I don't want to waste time to write an example from scratch, but here is the 'lego' parts that I'd use to implement an arbitrage contract:

Here is my helper for the strategy from Locus Finance (I wrote it) - https://github.com/locus-finance/Vaults/blob/develop/contracts/abstracts/mantle/AgniMultihopOpsStrategyHelper.sol 

and the lib for it - https://github.com/locus-finance/Vaults/blob/develop/contracts/strategies/mantle/libraries/AgniSwapLib.sol

It utilizes AgniSwap, which is basically U3 but with different tick space. So to convert that to U3, I'd changed in the utilization of `AgniSwapLib` addresses to the factory and router of U3.

### U2 integration implementation

I've also have written by me a helper contract that is - https://github.com/locus-finance/Vaults/blob/develop/contracts/strategies/mantle/libraries/MoeMerchantLib.sol

But its for MoeMerchant DEX - which is essentially a clone of U2.

So, I'd utilize the lib but with different router address (MOE_ROUTER) - U2 router.

### The arbitrage implementation

It's here under `ArbitrageExample.sol`.

## 2. Two approached I could do.

1) Utilizing zero-cost flashloans (like on Balancer for example: https://docs.balancer.fi/reference/contracts/flash-loans.html).
2) Custom swap routes optimization:
   1) Utilize low-fee blockchains to swap ETH <-> USDT.
   2) Utilize like 'better ICO' techniques: DAICO, PIP to raise some ETH to be able to afford flashloan.
   3) Utilize a chain of low liquidity pairs on Uniswap, so the arbitrage opportunity would be more likely met on those.

## 3. UniV3 contract exaplanation.

Here is a core contract of Uniswap V3, the pair - https://github.com/Uniswap/v3-core/blob/main/contracts/UniswapV3Pool.sol

