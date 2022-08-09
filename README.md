# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```


```
    {
        events(first: 5) {
            id
            timestamp
            nftContract
            tokenId
            action
            actionAddress
            params
        }
        covenants(first: 1000, where:{timestamp_gt:1660040036}, orderBy:timestamp, orderDirection:asc) {
            id
            timestamp
            txhash
            logIndex
            nftContract
            tokenId
            itemId
            lender
            borrower
            tokenId
            tokenAdr
            price
            priceBorrow
            maxDays
            daysBorrow
            status
            borrowedAt
        }
    }

```