# Theory

## Three main types of memory of a smart-contract.

1) `storage` - basically a pointer into a state of the contract which is part of the global state. The global state is a Merkle tree append-only data structure with Hash Map interface. Op codes: `SSTORE`, `SLOAD`. Utilized with dynamically-sized data types within Solidity. Cannot be utilized with function params of `external` or `public` functions.
2) `memory` - a Binary Heap based gas-free to read array of slots that is not stored in the global state. Utilized with dynamically-sized data types within Solidity. Op codes: `MSTORE<N>`, `MLOAD<N>`.
3) `calldata` - it is basically an immutable registry of EVM-word-sided. Linear array. It is free to read from it, but you cannot write to it. Only utilized within an external function parameters. Op codes: `CALLDATACOPY`

### Extra type

**Transient** (`uint256 transient inaccessibleBetweenTxs`) type of memory. A bit cheaper `storage` that is only readable or writeable within one transaction (either external or internal). Op codes: `TSTORE`, `TLOAD`.

Sources:

* https://github.com/wolflo/evm-opcodes/blob/main/gas.md
* https://docs.soliditylang.org/en/latest/contracts.html

## How much the cheapest TX costs? Why?

Well, the cheapest one would be just straight ETH transfer without any body. It costs 21000 gas.

Why? Well, I don't know to be honest, but the Source telling me that it is a base fee. And since I do not add any additional intrinsic value to the TX (neither calling something nor reading something in a state-change manner) I would only spent the specified amount.

UPD. The break down of this 21000 gas is:

* 9000 - two accounts balances write operation;
* 3000 - ECDSA (v, r, s)-vector (signer primitives) recovery and verification;
* 6800 - storing on actual disk device;
* 2200 - (2100:  `SSTORE` into untouched slot) + (100: if no TX body was provided).

Sources: 

* https://ethereum-magicians.org/t/some-medium-term-dust-cleanup-ideas/6287#why-do-txs-cost-21000-gas-1
* https://ethereum.org/en/developers/docs/gas/

## What will happen if do `DELEGATECALL` within a `DELEGATECALL`?

Well, it's a bit costly but the context of the TX will be propogated throughout all levels of the call. So the `msg.sender` of a contract or EOA who started the chain would be accessible in the bottom of the stack. (Since EVM is a stack machine.) And if it is indeed a contract - it's storage would be utilized.

Source: https://docs.soliditylang.org/en/latest/contracts.html#libraries 

## What will happen if `DELEGATECALL` reverted?

Well, the TX (both write and read) would fail and the data of the revert would be pushed up to the traceback back to the context of the start of the calling of `DELEGATECALL`.

Also, if the call was made like this: `(bool success, bytes memory returndata) = target.delegatecall(data);`

and `success` is `false` and the rest of the logic desided to throw - it reverts of course, but if not - it does nothing.

Here is the implementation where it reverts: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/448efeea6640bbbc09373f03fbc9c88e280147ba/contracts/utils/Address.sol#L96 

## What is swap callback? Why do we need this?

* If this is about Uniswap V4 hooks - swap callback can be utilized in a lot of things.
  * For example: TWAMM - the first swap in callback splits the large sum into a smaller ones so the slippage become less painful (https://blog.uniswap.org/v4-twamm-hook).
* If this is about `safeTransfer<From>` OZ callback (or like EIP777 - https://eips.ethereum.org/EIPS/eip-777#hooks) - to ensure that the contract expects the tokens and can process them correctly. 
* If this is about TX swap callback on some front end - well, to ensure that everything on the DEX went well =)
