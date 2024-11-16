// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./libraries/MoeMerchantLib.sol";
import "./abstracts/mantle/AgniMultihopOpsStrategyHelper.sol";

contract ArbitrageExample is AgniMultihopOpsStrategyHelper {
    using MoeMerchantLib for address;

    address public immutable usdc;
    address public immutable wmnt;

    error NoArbitrageOpportunityFound();
    error InsufficientProfit(uint256 profit, uint256 initialAmount);

    constructor(address _usdc, address _wmnt) {
        usdc = _usdc;
        wmnt = _wmnt;
    }

    function executeArbitrage(
        uint256 amountUsdc,
        uint32 agniTwapRangeSecs,
        uint256 slippageBps
    ) external {
        uint256 moeQuote = MoeMerchantLib.moeMerchantSwapSingle(
            usdc,
            wmnt,
            amountUsdc,
            slippageBps,
            consultPrice
        );

        uint256 agniQuote = usdcToWmntQuote(agniTwapRangeSecs, amountUsdc);

        if (moeQuote > agniQuote) {
            uint256 wmntReceived = MoeMerchantLib.moeMerchantSwapSingle(
                usdc,
                wmnt,
                amountUsdc,
                slippageBps,
                consultPrice
            );
            uint256 usdcProfit = wmntToUsdcSwap(
                agniTwapRangeSecs,
                slippageBps,
                wmntReceived
            );

            if (usdcProfit <= amountUsdc) {
                revert InsufficientProfit(usdcProfit, amountUsdc);
            }
        } else if (agniQuote > moeQuote) {
            uint256 wmntReceived = usdcToWmntSwap(
                agniTwapRangeSecs,
                slippageBps,
                amountUsdc
            );
            uint256 usdcProfit = MoeMerchantLib.moeMerchantSwapSingle(
                wmnt,
                usdc,
                wmntReceived,
                slippageBps,
                consultPrice
            );

            if (usdcProfit <= amountUsdc) {
                revert InsufficientProfit(usdcProfit, amountUsdc);
            }
        } else {
            revert NoArbitrageOpportunityFound();
        }
    }

    function consultPrice(
        address from,
        uint256 amount,
        address to
    ) external view returns (uint256) {
        // need to use oracle from the libs
        return amount * 1000 / 995;
    }

    function approveTokens(address token, address spender) external {
        IERC20(token).approve(spender, type(uint256).max);
    }
}
