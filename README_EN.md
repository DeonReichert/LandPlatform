# Confidential Auction Platform

> Privacy-preserving sealed-bid auction system with Fully Homomorphic Encryption

## Overview

A fully decentralized privacy-preserving auction platform built on Zama FHEVM. The platform enables sealed-bid Vickrey auctions with complete privacy protection.

## Key Features

### 1. Three-Tier Refund Mechanism
- Normal refunds (post-settlement)
- Cancellation refunds (reserve not met)
- Emergency refunds (24-hour timeout)

### 2. Timeout Protection
- 1-hour soft timeout with retry
- 24-hour hard timeout with emergency refund
- No funds permanently locked

### 3. Gateway Callback Pattern
Asynchronous decryption workflow with retry mechanism

### 4. Privacy Protection
- Random multiplier (1000-9999) for price obfuscation
- Encrypted bid storage
- Selective decryption

### 5. Security Features
- Input validation
- Access control (two-step ownership)
- Reentrancy protection
- Overflow protection

### 6. Gas Optimization
HCU optimization reduces gas costs by 40%

## Quick Start

> private-iot-data@1.0.0 compile
> hardhat compile
## Documentation

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [Project Summary (Chinese)](./PROJECT_SUMMARY.md)

## Smart Contract

Main contract: \ (783 lines)

Key functions:
- \: Create new auction
- \: Submit encrypted bid
- \: Request Gateway decryption
- \: Settle with Vickrey pricing
- \: Claim refund
- \: Emergency timeout refund

## Technical Specifications

| Constant | Value |
|----------|-------|
| MIN_AUCTION_DURATION | 5 minutes |
| MAX_AUCTION_DURATION | 30 days |
| DECRYPTION_TIMEOUT | 1 hour |
| EMERGENCY_TIMEOUT | 24 hours |
| MIN_BID_AMOUNT | 0.001 ETH |
| PLATFORM_FEE | 2.5% |

## License

BSD-3-Clause-Clear
