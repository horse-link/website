# About

Horse Link https://horse.link is an Ethereum based DeFi protocol that allows particpants to wager on sports markets using ERC20 tokens.

Traditionaly, sports betting is a multi-billion dollar industry that is dominated by a few large companies. Horse Link aims to disrupt this industry by providing a decentralized alternative that is more transparent, fair, and secure.

The "House" or "Book makers" set the odds on the events and take a percentage of the winnings. Horse Link is a decentralized protocol that allows anyone to become a book maker by creating their own market or adding liquidty to a Vault that the market draws from. 

The protocol is designed to be as fair as possible by using a bonding curve to set the odds. The protocol also uses a bonding curve to set the fees that is distributed to Vault share holders. The potentail payout assimptopes to 0 as the size of the bet increases with respect to amount of liqudity in the Vault.

The market will find an equlibrium between the depth of the Vault and the size of the bet.

# How it works

Horse Link’s smart contract guaranteed bets are always placed within the slippage band of the constant product function.  Like other AMM protocols based on curve functions, bets based within the range of slippage based on the potential payout will be placed.  

The total (potential) return on a stake is determined by the constant product function.  The constant product function is a linear function that is defined by the following equation:

Tp = S * D

Where 

* Tp is the total profit
* S is Stake
* D is the decimal odd

The liquidity is locked in the market contract until after the participant claims their payout.

## Vaults

ERC4626 Vaults are created to allow users to deposit ERC20 tokens into a smart contract and earn dividends on their deposits.

# Market makers

Market makers can run the the dapp and set their own odds

# The API
Our own odds can be found at https://api.horse.link/.  These requests are signed by the owner.

## Goerli

Owner: `0x1Ab4C6d9e25Fc65C917aFBEfB4E963C400Fb9814`  
Mock USDC : `0xaF2929Ed6758B0bD9575e1F287b85953B08E50BC`  
Mock DAI: `0x70b481B732822Af9beBc895779A6e261DC3D6C8B`  
LP Token: `0xB678cF41Fec0DF2D4bF69cE0297311B993deE11b`  
USDC Vault: `0x00c23DC7a7B4b01b0008E2f9f45a558D76764dF6`  
DAI Vault: `0x25b49a6b3649D3Cbd3617B553Bedb98939967Fc9`  
DAI Market: `0xe9BC1f42bF75C59b245d39483E97C3A70c450c9b`  
Registry: `0x5Df377d600A40fB6723e4Bf10FD5ee70e93578da`

### Notes

`npx truffle run verify Registry@0xA8Fc4232581deC73e65C6095d410b480c6EaB56E --network goerli`

## Poly Mumbia

Owner: `0xfDBe64ec50cA548c7A304959D0f385A01D315a71`  
Horse Link: `0xEedD810CDf9FE1B107Ae2350be71985764f552fF`  
Horse ERC20 Token: `0x8254Ad903D06d3F2B9524D2Bc7bEc584d9548EF9`
