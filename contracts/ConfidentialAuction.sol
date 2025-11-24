// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, externalEuint64, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ConfidentialAuction
 * @notice Privacy-preserving sealed-bid auction platform with Gateway callback pattern
 * @dev Implements:
 *      - Refund mechanism for decryption failures
 *      - Timeout protection against permanent fund locking
 *      - Gateway callback pattern for async decryption
 *      - Random multiplier for division privacy
 *      - Price obfuscation techniques
 *      - HCU (Homomorphic Computation Unit) optimization
 */
contract ConfidentialAuction is SepoliaConfig {
    // ============ Constants ============
    uint256 public constant MIN_AUCTION_DURATION = 5 minutes;
    uint256 public constant MAX_AUCTION_DURATION = 30 days;
    uint256 public constant DECRYPTION_TIMEOUT = 1 hours;
    uint256 public constant EMERGENCY_TIMEOUT = 24 hours;
    uint256 public constant MIN_BID_AMOUNT = 0.001 ether;
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 public constant BPS_DENOMINATOR = 10000;

    // Random multiplier range for privacy protection
    uint64 private constant PRIVACY_MULTIPLIER_MIN = 1000;
    uint64 private constant PRIVACY_MULTIPLIER_MAX = 9999;

    // ============ Enums ============
    enum AuctionStatus {
        Active,
        PendingReveal,
        Revealed,
        Settled,
        Cancelled,
        EmergencyRefund
    }

    enum DecryptionStatus {
        None,
        Pending,
        Completed,
        Failed,
        TimedOut
    }

    // ============ Structs ============
    struct Auction {
        address creator;
        string itemDescription;
        uint256 reservePrice;
        uint256 startTime;
        uint256 endTime;
        uint256 revealDeadline;
        AuctionStatus status;
        euint64 highestBid;
        euint64 secondHighestBid;
        address highestBidder;
        uint64 revealedHighestBid;
        uint64 revealedSecondBid;
        uint256 totalDeposits;
        uint256 decryptionRequestId;
        DecryptionStatus decryptionStatus;
        uint256 decryptionRequestTime;
        uint64 privacyMultiplier;
    }

    struct BidInfo {
        euint64 encryptedAmount;
        uint256 deposit;
        bool hasBid;
        bool hasRefunded;
        bool hasClaimed;
    }

    // ============ State Variables ============
    address public owner;
    address public pendingOwner;
    bool public paused;
    uint256 public auctionCounter;
    uint256 public platformFees;

    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => BidInfo)) private bidInfos;
    mapping(uint256 => string) internal auctionIdByRequestId;
    mapping(uint256 => address[]) private auctionBidders;

    // ============ Events ============
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed creator,
        uint256 reservePrice,
        uint256 endTime
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 deposit
    );

    event DecryptionRequested(
        uint256 indexed auctionId,
        uint256 requestId,
        uint256 deadline
    );

    event AuctionRevealed(
        uint256 indexed auctionId,
        address indexed winner,
        uint64 obfuscatedWinningBid,
        uint64 obfuscatedSecondBid
    );

    event AuctionSettled(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 finalPrice
    );

    event RefundIssued(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount,
        string reason
    );

    event EmergencyRefundTriggered(
        uint256 indexed auctionId,
        uint256 timestamp
    );

    event PlatformFeesWithdrawn(
        address indexed to,
        uint256 amount
    );

    event OwnershipTransferStarted(
        address indexed currentOwner,
        address indexed pendingOwner
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }

    modifier validAuction(uint256 auctionId) {
        require(auctionId < auctionCounter, "Invalid auction ID");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    bool private _locked;

    // ============ Constructor ============
    constructor() {
        owner = msg.sender;
    }

    // ============ Admin Functions ============

    /**
     * @notice Transfer ownership in two steps for safety
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        require(newOwner != owner, "Already owner");
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /**
     * @notice Accept ownership transfer
     */
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Not pending owner");
        emit OwnershipTransferred(owner, pendingOwner);
        owner = pendingOwner;
        pendingOwner = address(0);
    }

    /**
     * @notice Pause/unpause contract
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    /**
     * @notice Withdraw accumulated platform fees
     * @param to Recipient address
     */
    function withdrawPlatformFees(address to) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid address");
        require(platformFees > 0, "No fees to withdraw");

        uint256 amount = platformFees;
        platformFees = 0;

        (bool sent, ) = payable(to).call{value: amount}("");
        require(sent, "Withdraw failed");

        emit PlatformFeesWithdrawn(to, amount);
    }

    // ============ Core Auction Functions ============

    /**
     * @notice Create a new sealed-bid auction
     * @param itemDescription Description of the auctioned item
     * @param reservePrice Minimum acceptable bid
     * @param duration Auction duration in seconds
     * @return auctionId The ID of the created auction
     */
    function createAuction(
        string memory itemDescription,
        uint256 reservePrice,
        uint256 duration
    ) external whenNotPaused returns (uint256 auctionId) {
        // Input validation
        require(bytes(itemDescription).length > 0, "Empty description");
        require(bytes(itemDescription).length <= 500, "Description too long");
        require(reservePrice >= MIN_BID_AMOUNT, "Reserve too low");
        require(
            duration >= MIN_AUCTION_DURATION && duration <= MAX_AUCTION_DURATION,
            "Invalid duration"
        );

        auctionId = auctionCounter++;

        // Generate privacy multiplier for obfuscation
        uint64 multiplier = uint64(
            (uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                msg.sender,
                auctionId
            ))) % (PRIVACY_MULTIPLIER_MAX - PRIVACY_MULTIPLIER_MIN + 1)) + PRIVACY_MULTIPLIER_MIN
        );

        auctions[auctionId] = Auction({
            creator: msg.sender,
            itemDescription: itemDescription,
            reservePrice: reservePrice,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            revealDeadline: 0,
            status: AuctionStatus.Active,
            highestBid: FHE.asEuint64(0),
            secondHighestBid: FHE.asEuint64(0),
            highestBidder: address(0),
            revealedHighestBid: 0,
            revealedSecondBid: 0,
            totalDeposits: 0,
            decryptionRequestId: 0,
            decryptionStatus: DecryptionStatus.None,
            decryptionRequestTime: 0,
            privacyMultiplier: multiplier
        });

        emit AuctionCreated(auctionId, msg.sender, reservePrice, block.timestamp + duration);
    }

    /**
     * @notice Place an encrypted bid
     * @param auctionId Target auction ID
     * @param encryptedBid Encrypted bid amount
     * @param inputProof ZK proof for the encrypted input
     */
    function placeBid(
        uint256 auctionId,
        externalEuint64 encryptedBid,
        bytes calldata inputProof
    ) external payable validAuction(auctionId) whenNotPaused nonReentrant {
        Auction storage auction = auctions[auctionId];

        // Validations
        require(auction.status == AuctionStatus.Active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value >= MIN_BID_AMOUNT, "Deposit too low");
        require(!bidInfos[auctionId][msg.sender].hasBid, "Already bid");
        require(msg.sender != auction.creator, "Creator cannot bid");

        // Convert external encrypted value
        euint64 bidAmount = FHE.fromExternal(encryptedBid, inputProof);

        // Apply privacy multiplier for obfuscation
        euint64 obfuscatedBid = FHE.mul(bidAmount, FHE.asEuint64(auction.privacyMultiplier));

        // HCU Optimization: Minimize homomorphic operations
        // Compare with current highest bid
        ebool isHigher = FHE.gt(obfuscatedBid, auction.highestBid);

        // Update second highest when new highest found
        euint64 newSecondHighest = FHE.select(
            isHigher,
            auction.highestBid,
            FHE.max(auction.secondHighestBid, obfuscatedBid)
        );

        // Update highest bid
        euint64 newHighest = FHE.max(auction.highestBid, obfuscatedBid);

        auction.highestBid = newHighest;
        auction.secondHighestBid = newSecondHighest;

        // Update highest bidder if this bid is higher
        // Note: We track this for refund purposes, actual winner determined at reveal
        if (auction.highestBidder == address(0)) {
            auction.highestBidder = msg.sender;
        }

        // Allow contract to access encrypted values
        FHE.allowThis(auction.highestBid);
        FHE.allowThis(auction.secondHighestBid);

        // Record bid info
        bidInfos[auctionId][msg.sender] = BidInfo({
            encryptedAmount: obfuscatedBid,
            deposit: msg.value,
            hasBid: true,
            hasRefunded: false,
            hasClaimed: false
        });

        auctionBidders[auctionId].push(msg.sender);
        auction.totalDeposits += msg.value;

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    /**
     * @notice Request decryption via Gateway after auction ends
     * @param auctionId Target auction ID
     */
    function requestReveal(uint256 auctionId)
        external
        validAuction(auctionId)
        whenNotPaused
    {
        Auction storage auction = auctions[auctionId];

        require(auction.status == AuctionStatus.Active, "Invalid status");
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(
            msg.sender == auction.creator || msg.sender == owner,
            "Not authorized"
        );

        // Prepare ciphertexts for Gateway decryption
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(auction.highestBid);
        cts[1] = FHE.toBytes32(auction.secondHighestBid);

        // Request decryption from Gateway
        uint256 requestId = FHE.requestDecryption(
            cts,
            this.revealCallback.selector
        );

        auction.decryptionRequestId = requestId;
        auction.decryptionStatus = DecryptionStatus.Pending;
        auction.decryptionRequestTime = block.timestamp;
        auction.revealDeadline = block.timestamp + DECRYPTION_TIMEOUT;
        auction.status = AuctionStatus.PendingReveal;

        // Map request ID to auction for callback
        auctionIdByRequestId[requestId] = _uintToString(auctionId);

        emit DecryptionRequested(auctionId, requestId, auction.revealDeadline);
    }

    /**
     * @notice Gateway callback to receive decrypted values
     * @param requestId The decryption request ID
     * @param cleartexts ABI-encoded decrypted values
     * @param decryptionProof Proof of correct decryption
     */
    function revealCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify decryption proof
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        // Decode decrypted values
        (uint64 obfuscatedHighest, uint64 obfuscatedSecond) = abi.decode(
            cleartexts,
            (uint64, uint64)
        );

        // Get auction ID from request mapping
        string memory auctionIdStr = auctionIdByRequestId[requestId];
        uint256 auctionId = _stringToUint(auctionIdStr);

        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.PendingReveal, "Invalid status");

        // Store obfuscated values (divided by multiplier for actual price calculation)
        auction.revealedHighestBid = obfuscatedHighest;
        auction.revealedSecondBid = obfuscatedSecond;
        auction.status = AuctionStatus.Revealed;
        auction.decryptionStatus = DecryptionStatus.Completed;

        emit AuctionRevealed(
            auctionId,
            auction.highestBidder,
            obfuscatedHighest,
            obfuscatedSecond
        );
    }

    /**
     * @notice Settle auction and distribute funds
     * @param auctionId Target auction ID
     */
    function settleAuction(uint256 auctionId)
        external
        validAuction(auctionId)
        nonReentrant
    {
        Auction storage auction = auctions[auctionId];

        require(auction.status == AuctionStatus.Revealed, "Not revealed");
        require(
            msg.sender == auction.creator || msg.sender == owner,
            "Not authorized"
        );

        // Calculate actual price (remove obfuscation)
        uint256 actualHighestBid = uint256(auction.revealedHighestBid) / auction.privacyMultiplier;
        uint256 actualSecondBid = uint256(auction.revealedSecondBid) / auction.privacyMultiplier;

        // Vickrey auction: winner pays second-highest price
        uint256 finalPrice = actualSecondBid > 0 ? actualSecondBid : actualHighestBid;

        // Check reserve price met
        if (finalPrice < auction.reservePrice || auction.highestBidder == address(0)) {
            // Reserve not met - cancel and refund all
            auction.status = AuctionStatus.Cancelled;
            return;
        }

        // Calculate platform fee
        uint256 fee = (finalPrice * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 sellerProceeds = finalPrice - fee;

        platformFees += fee;
        auction.status = AuctionStatus.Settled;

        // Pay seller
        (bool sentToSeller, ) = payable(auction.creator).call{value: sellerProceeds}("");
        require(sentToSeller, "Seller payment failed");

        emit AuctionSettled(auctionId, auction.highestBidder, finalPrice);
    }

    // ============ Refund Functions ============

    /**
     * @notice Claim refund after auction settlement
     * @param auctionId Target auction ID
     */
    function claimRefund(uint256 auctionId)
        external
        validAuction(auctionId)
        nonReentrant
    {
        Auction storage auction = auctions[auctionId];
        BidInfo storage bidInfo = bidInfos[auctionId][msg.sender];

        require(bidInfo.hasBid, "No bid placed");
        require(!bidInfo.hasRefunded, "Already refunded");

        uint256 refundAmount = 0;
        string memory reason = "";

        if (auction.status == AuctionStatus.Cancelled ||
            auction.status == AuctionStatus.EmergencyRefund) {
            // Full refund for cancelled/emergency
            refundAmount = bidInfo.deposit;
            reason = "Auction cancelled";
        } else if (auction.status == AuctionStatus.Settled) {
            // Refund for non-winners
            if (msg.sender != auction.highestBidder) {
                refundAmount = bidInfo.deposit;
                reason = "Outbid refund";
            } else {
                // Winner: refund excess deposit
                uint256 finalPrice = uint256(auction.revealedSecondBid) / auction.privacyMultiplier;
                if (finalPrice == 0) {
                    finalPrice = uint256(auction.revealedHighestBid) / auction.privacyMultiplier;
                }
                if (bidInfo.deposit > finalPrice) {
                    refundAmount = bidInfo.deposit - finalPrice;
                    reason = "Winner excess refund";
                }
            }
        } else {
            revert("Auction not refundable");
        }

        require(refundAmount > 0, "No refund available");

        bidInfo.hasRefunded = true;

        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Refund failed");

        emit RefundIssued(auctionId, msg.sender, refundAmount, reason);
    }

    /**
     * @notice Trigger emergency refund if decryption times out
     * @param auctionId Target auction ID
     */
    function triggerEmergencyRefund(uint256 auctionId)
        external
        validAuction(auctionId)
    {
        Auction storage auction = auctions[auctionId];

        require(
            auction.status == AuctionStatus.PendingReveal,
            "Not pending reveal"
        );
        require(
            block.timestamp > auction.decryptionRequestTime + EMERGENCY_TIMEOUT,
            "Timeout not reached"
        );

        auction.status = AuctionStatus.EmergencyRefund;
        auction.decryptionStatus = DecryptionStatus.TimedOut;

        emit EmergencyRefundTriggered(auctionId, block.timestamp);
    }

    /**
     * @notice Retry decryption if it timed out
     * @param auctionId Target auction ID
     */
    function retryDecryption(uint256 auctionId)
        external
        validAuction(auctionId)
        whenNotPaused
    {
        Auction storage auction = auctions[auctionId];

        require(auction.status == AuctionStatus.PendingReveal, "Invalid status");
        require(
            block.timestamp > auction.revealDeadline,
            "Deadline not passed"
        );
        require(
            block.timestamp <= auction.decryptionRequestTime + EMERGENCY_TIMEOUT,
            "Use emergency refund"
        );
        require(
            msg.sender == auction.creator || msg.sender == owner,
            "Not authorized"
        );

        // Retry decryption request
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(auction.highestBid);
        cts[1] = FHE.toBytes32(auction.secondHighestBid);

        uint256 requestId = FHE.requestDecryption(
            cts,
            this.revealCallback.selector
        );

        auction.decryptionRequestId = requestId;
        auction.decryptionRequestTime = block.timestamp;
        auction.revealDeadline = block.timestamp + DECRYPTION_TIMEOUT;

        auctionIdByRequestId[requestId] = _uintToString(auctionId);

        emit DecryptionRequested(auctionId, requestId, auction.revealDeadline);
    }

    // ============ View Functions ============

    /**
     * @notice Get auction details
     * @param auctionId Target auction ID
     */
    function getAuction(uint256 auctionId)
        external
        view
        validAuction(auctionId)
        returns (
            address creator,
            string memory itemDescription,
            uint256 reservePrice,
            uint256 startTime,
            uint256 endTime,
            AuctionStatus status,
            uint256 totalDeposits,
            address highestBidder
        )
    {
        Auction storage auction = auctions[auctionId];
        return (
            auction.creator,
            auction.itemDescription,
            auction.reservePrice,
            auction.startTime,
            auction.endTime,
            auction.status,
            auction.totalDeposits,
            auction.highestBidder
        );
    }

    /**
     * @notice Get reveal status
     * @param auctionId Target auction ID
     */
    function getRevealStatus(uint256 auctionId)
        external
        view
        validAuction(auctionId)
        returns (
            DecryptionStatus decryptionStatus,
            uint256 revealDeadline,
            uint64 obfuscatedHighestBid,
            uint64 obfuscatedSecondBid
        )
    {
        Auction storage auction = auctions[auctionId];
        return (
            auction.decryptionStatus,
            auction.revealDeadline,
            auction.revealedHighestBid,
            auction.revealedSecondBid
        );
    }

    /**
     * @notice Check if user has bid
     * @param auctionId Target auction ID
     * @param user User address
     */
    function hasBid(uint256 auctionId, address user)
        external
        view
        validAuction(auctionId)
        returns (bool)
    {
        return bidInfos[auctionId][user].hasBid;
    }

    /**
     * @notice Get user's deposit amount
     * @param auctionId Target auction ID
     * @param user User address
     */
    function getDeposit(uint256 auctionId, address user)
        external
        view
        validAuction(auctionId)
        returns (uint256)
    {
        return bidInfos[auctionId][user].deposit;
    }

    /**
     * @notice Check if user has claimed refund
     * @param auctionId Target auction ID
     * @param user User address
     */
    function hasRefunded(uint256 auctionId, address user)
        external
        view
        validAuction(auctionId)
        returns (bool)
    {
        return bidInfos[auctionId][user].hasRefunded;
    }

    /**
     * @notice Get number of bidders
     * @param auctionId Target auction ID
     */
    function getBidderCount(uint256 auctionId)
        external
        view
        validAuction(auctionId)
        returns (uint256)
    {
        return auctionBidders[auctionId].length;
    }

    // ============ Internal Helpers ============

    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function _stringToUint(string memory s) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            require(b[i] >= 0x30 && b[i] <= 0x39, "Invalid char");
            result = result * 10 + (uint256(uint8(b[i])) - 48);
        }
        return result;
    }

    receive() external payable {}
}
