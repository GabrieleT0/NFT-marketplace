# D-Art: Marketplace of artworks and photographs 
DApp created with smart contracts in solidity on Etherum blockchain. Every artworks and photographs is modeled as NFT, by using the OpenZeppelin ERC721 Standard.
## Prerequisites for running locally
- Truffle
- Ganache
- Node
- IPSF
## How to use
From the project main folder, 
import OpenZeppelin Contracts:
```
npm install @openzeppelin/contracts
```
Compile smart contracts with Truffle:
```
truffle compile
```
Launch Ganache and migrate smart contracts to the blockchain:
```
truffle migrate
```
Launch the IPFS local instance:
```
jsipfs daemon 
```
Start node:
```
npm start 
```
