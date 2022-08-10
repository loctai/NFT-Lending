import { BigInt } from "@graphprotocol/graph-ts"
import {
  CovenantAccept,
  CovenantLiquidate,
  CovenantListed,
  CovenantReturnNFT,
  CovenantUnlisted,
} from "../generated/LoanNFT/LoanNFT"
import { Event, Covenant } from "../generated/schema"

export function handleCovenantAccept(event: CovenantAccept): void {
  let entryId = event.params.nftContract.toHex().concat('-').concat(event.params.tokenId.toString()).concat('-').concat(event.params.itemId.toString())
  let covenant = Covenant.load(entryId) 
  
  if (covenant != null) {
    covenant.timestamp = event.block.timestamp
    covenant.borrowedAt = event.block.timestamp
    covenant.daysBorrow = event.params.daysToRent
    covenant.status = "LOCKED"
    covenant.borrower = event.params.borrower
    covenant.save()
  }
  // register  event
  let eventId = event.params.nftContract.toHex().concat('-').concat(event.params.tokenId.toString()).concat('-').concat(event.block.timestamp.toString())
  let eventItem = new Event(eventId)
  eventItem.timestamp = event.block.timestamp	
  eventItem.nftContract = event.params.nftContract
  eventItem.tokenId = event.params.tokenId
  eventItem.action = 'LoanAccept'
  eventItem.actionAddress = event.params.borrower
  eventItem.params = event.params.nftContract.toHex().concat('-').concat(event.params.tokenId.toString()).concat('-').concat(event.params.itemId.toString())		 	
  eventItem.save()
}

export function handleCovenantLiquidate(event: CovenantLiquidate): void {
  let entryId = event.params.nftContract.toHex().concat('-').concat(event.params.tokenId.toString()).concat('-').concat(event.params.itemId.toString())
  let covenant = Covenant.load(entryId) 
  
  if (covenant != null) {
      covenant.timestamp = event.block.timestamp
      covenant.status = "LIQUIDATE"
      covenant.save()
  }
  // register  event
  let eventId = event.params.nftContract.toHex().concat('-').concat(event.params.tokenId.toString()).concat('-').concat(event.block.timestamp.toString())
  let eventItem = new Event(eventId)
  eventItem.timestamp = event.block.timestamp	
  eventItem.nftContract = event.params.nftContract
  eventItem.tokenId = event.params.tokenId
  eventItem.action = 'Liquidate'
  eventItem.actionAddress = covenant?.lender || event.block.author;
  eventItem.params = event.params.nftContract.toHex().concat('-').concat(event.params.tokenId.toString()).concat('-').concat(event.params.itemId.toString())		 	
  eventItem.save()
}

export function handleCovenantListed(event: CovenantListed): void {
  let entryId = event.params.nftContract.toHex().concat('-').concat(event.params.tokenId.toString()).concat('-').concat(event.params.itemId.toString())
  let covenant = Covenant.load(entryId);
  if (covenant == null) {
      covenant = new Covenant(entryId)
  }
  covenant.timestamp = event.block.timestamp
  covenant.txhash = event.transaction.hash.toHexString()
  covenant.logIndex = event.transactionLogIndex

  covenant.nftContract = event.params.nftContract
  covenant.tokenId = event.params.tokenId
  covenant.itemId = event.params.itemId
  covenant.lender = event.params.lender
  covenant.borrower = event.params.borrower
  covenant.tokenAdr = event.params.tokenAdr
  covenant.price = event.params.price
  covenant.priceBorrow = event.params.priceBorrow
  covenant.maxDays = event.params.maxDays
  covenant.status = "LISTING"
  covenant.daysBorrow = BigInt.fromI32(0)
  covenant.borrowedAt = BigInt.fromI32(0)
  covenant.save()

  // register  event
  let eventId = event.params.nftContract.toHex().concat('-').concat(event.params.tokenId.toString()).concat('-').concat(event.block.timestamp.toString())
  let eventItem = new Event(eventId)
  eventItem.timestamp = event.block.timestamp	
  eventItem.nftContract = event.params.nftContract
  eventItem.tokenId = event.params.tokenId
  eventItem.action = 'LoanCreated'
  eventItem.actionAddress = event.params.lender
  eventItem.params = event.params.tokenAdr.toHex().concat('-').concat(event.params.price.toString()).concat('-').concat(event.params.priceBorrow.toString())		 	
  eventItem.save()
    
  
}

export function handleCovenantReturnNFT(event: CovenantReturnNFT): void {
  let entryId = event.params.nftContract.toHex().concat('-').concat(event.params.tokenId.toString()).concat('-').concat(event.params.itemId.toString())
  let covenant = Covenant.load(entryId) 
  
  if (covenant != null) {
      covenant.timestamp = event.block.timestamp
      covenant.status = "RETURN_NFT"
      covenant.save()
  }
  // register  event
  let eventId = event.params.nftContract.toHex().concat('-').concat(event.params.tokenId.toString()).concat('-').concat(event.block.timestamp.toString())
  let eventItem = new Event(eventId)
  eventItem.timestamp = event.block.timestamp	
  eventItem.nftContract = event.params.nftContract
  eventItem.tokenId = event.params.tokenId
  eventItem.action = 'ReturnNFT'
  eventItem.actionAddress = covenant?.borrower || event.block.author;
  eventItem.params = event.params.nftContract.toHex().concat('-').concat(event.params.tokenId.toString()).concat('-').concat(event.params.itemId.toString())		 	
  eventItem.save()
}

export function handleCovenantUnlisted(event: CovenantUnlisted): void {
  let entryId = event.params.nftContract.toHex().concat('-').concat(event.params.tokenId.toString()).concat('-').concat(event.params.itemId.toString())
  let covenant = Covenant.load(entryId) 
  
  if (covenant != null) {
      covenant.timestamp = event.block.timestamp
      covenant.status = "UNLIST"
      covenant.save()
  }
  // register  event
  let eventId = event.params.nftContract.toHex().concat('-').concat(event.params.tokenId.toString()).concat('-').concat(event.block.timestamp.toString())
  let eventItem = new Event(eventId)
  eventItem.timestamp = event.block.timestamp	
  eventItem.nftContract = event.params.nftContract
  eventItem.tokenId = event.params.tokenId
  eventItem.action = 'UnList'
  eventItem.actionAddress = covenant?.lender || event.block.author;
  eventItem.params = event.params.nftContract.toHex().concat('-').concat(event.params.tokenId.toString()).concat('-').concat(event.params.itemId.toString())		 	
  eventItem.save()
}