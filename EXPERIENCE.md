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
   4) Utilize a DEX Aggregator with zero-cost meta TXs (like 1inch AggregationProtocol V5). (Here is the SwapHelper.sol that I wrote back when I was in Locus Finance - https://github.com/locus-finance/vaultsV2/blob/main/contracts/utils/SwapHelper.sol). I'd also use LinkWellNode.com and their free Chainlink custom nodes to come up with one that in the example.

## 3. UniV3 contract exaplanation.

Here is a core contract of Uniswap V3, the pair - https://github.com/Uniswap/v3-core/blob/main/contracts/UniswapV3Pool.sol

### The core logic

Factory creates a pair. The market price is constant and answers to the equation of `x * y = k`, like with U2.

The price range is divided in small parts called 'ticks'. The price itself is contained in form of square root. That is to utilize logarithmic properties of the cumulative price, namely - additions could replace multiplying and substractions - division. Which are themselves costly operations.

Like this: `tick = log1.0001(sqrt(price))`. Why 1.0001? Well because it a form of base point: 1 BPS = 0,0001% 

And base points are widely used in the finance and quite frankly useful when it comes to a library of tech analysis algorithms.

As a liquidity provider you could mint an instance of EIP721 (NFT) and place your liquidity into a specific range of ticks. An when the price would come into the range - you'd earn as a holder of the NFT position fees. You could also manage your position to place the liquidity in the price range that is most needed right now. (like Venus Protocol).

It is widely accepted that with this approach you could mint a lesser position (than in U2) and earn more fees.

Not to mention in the pair contract there are embedded oracle. That is because the price itself not only is a square root, it is also a cumulative price. And if you'd measure cumulative prices on the U3 each and every swap then you could calculate a Time-Weighted Average Price (TWAP) like this:

Measure each tx: `tickCumulative += currentTick * timeElapsedBetweenLastMeasureAndNow`

`TWAP = (tickCumulative2 - tickCumulative1) / (timestamp2 - timestamp1)`

And voila, you have some pretty good and unbiased oracle!

### The main use case - `Swap`

It basically rebalances over all of the ticks in the pool the incoming liquidity, calculates an exact amounts of tokens to be sent in and out, and takes the fees accounting them between the NFT-position holders.

In V4 - here is new feature: hooks, you can implement some arbitrary logic in the beginning and the end of the operation.