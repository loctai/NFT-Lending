import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  CovenantAccept,
  CovenantLiquidate,
  CovenantListed,
  CovenantReturnNFT,
  CovenantUnlisted,
  OwnershipTransferred
} from "../generated/LoanNFT/LoanNFT"

export function createCovenantAcceptEvent(
  itemId: BigInt,
  borrower: Address,
  daysToRent: BigInt,
  timeExpired: BigInt
): CovenantAccept {
  let covenantAcceptEvent = changetype<CovenantAccept>(newMockEvent())

  covenantAcceptEvent.parameters = new Array()

  covenantAcceptEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )
  covenantAcceptEvent.parameters.push(
    new ethereum.EventParam("borrower", ethereum.Value.fromAddress(borrower))
  )
  covenantAcceptEvent.parameters.push(
    new ethereum.EventParam(
      "daysToRent",
      ethereum.Value.fromUnsignedBigInt(daysToRent)
    )
  )
  covenantAcceptEvent.parameters.push(
    new ethereum.EventParam(
      "timeExpired",
      ethereum.Value.fromUnsignedBigInt(timeExpired)
    )
  )

  return covenantAcceptEvent
}

export function createCovenantLiquidateEvent(
  itemId: BigInt
): CovenantLiquidate {
  let covenantLiquidateEvent = changetype<CovenantLiquidate>(newMockEvent())

  covenantLiquidateEvent.parameters = new Array()

  covenantLiquidateEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )

  return covenantLiquidateEvent
}

export function createCovenantListedEvent(
  itemId: BigInt,
  nftContract: Address,
  tokenId: BigInt,
  tokenAdr: Address,
  price: BigInt,
  priceBorrow: BigInt,
  maxDays: BigInt,
  status: i32,
  borrower: Address,
  lender: Address
): CovenantListed {
  let covenantListedEvent = changetype<CovenantListed>(newMockEvent())

  covenantListedEvent.parameters = new Array()

  covenantListedEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )
  covenantListedEvent.parameters.push(
    new ethereum.EventParam(
      "nftContract",
      ethereum.Value.fromAddress(nftContract)
    )
  )
  covenantListedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  covenantListedEvent.parameters.push(
    new ethereum.EventParam("tokenAdr", ethereum.Value.fromAddress(tokenAdr))
  )
  covenantListedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )
  covenantListedEvent.parameters.push(
    new ethereum.EventParam(
      "priceBorrow",
      ethereum.Value.fromUnsignedBigInt(priceBorrow)
    )
  )
  covenantListedEvent.parameters.push(
    new ethereum.EventParam(
      "maxDays",
      ethereum.Value.fromUnsignedBigInt(maxDays)
    )
  )
  covenantListedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )
  covenantListedEvent.parameters.push(
    new ethereum.EventParam("borrower", ethereum.Value.fromAddress(borrower))
  )
  covenantListedEvent.parameters.push(
    new ethereum.EventParam("lender", ethereum.Value.fromAddress(lender))
  )

  return covenantListedEvent
}

export function createCovenantReturnNFTEvent(
  itemId: BigInt
): CovenantReturnNFT {
  let covenantReturnNftEvent = changetype<CovenantReturnNFT>(newMockEvent())

  covenantReturnNftEvent.parameters = new Array()

  covenantReturnNftEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )

  return covenantReturnNftEvent
}

export function createCovenantUnlistedEvent(itemId: BigInt): CovenantUnlisted {
  let covenantUnlistedEvent = changetype<CovenantUnlisted>(newMockEvent())

  covenantUnlistedEvent.parameters = new Array()

  covenantUnlistedEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )

  return covenantUnlistedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
