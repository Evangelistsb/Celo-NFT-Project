// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract Seals is Ownable, IERC721Receiver {
    // NFT contract to interract with
    IERC721 immutable nftContract;
    // total number of deals created
    uint256 private dealsCreated;
    uint256 private dealsClosed;
    // cost of placing auction on this platform
    uint256 constant _plaformPrice = 1 ether;
    address payable platformOwner;

    struct Deal {
        address payable createdBy;
        uint256 id;
        uint256 tokenId;
        uint256 minBid;
        address payable highestBidder;
        uint256 highestBid;
        uint256 bidsCount;
        bool ended;
    }

    // mapping containing all deals on this platform
    mapping(uint256 => Deal) private deals;
    mapping(uint256 => bool) private exists;

    event CreateDeal(address indexed dealer, uint256 dealId, uint256 minBid);
    event ReturnBid(uint256 dealId, address indexed to, uint256 amount);
    event PlaceBid(uint256 dealId, address indexed bidder);

    modifier created(uint256 _dealId) {
        require(
            deals[_dealId].createdBy == msg.sender,
            "Only deal creator can perform this action"
        );
        _;
    }

    modifier exist(uint256 _dealId) {
        require(exists[_dealId], "Query of nonexistent deal");
        _;
    }

    constructor(address _nftContractAddress) {
        nftContract = IERC721(_nftContractAddress);
        platformOwner = payable(msg.sender);
    }

    /// @dev create a new deal and add to platform
    function createDeal(uint256 _tokenId, uint256 _minBid) external payable {
        require(msg.value == _plaformPrice, "Placement price sent too low");
        require(
            _minBid > 1 ether,
            "Minimum bid amount must be greater than 1 ether"
        );
        // first approve this contract to use token
        // nftContract.approve(address(this), _tokenId);
        // first transfer nft to this contract
        require(
            nftContract.ownerOf(_tokenId) == msg.sender &&
                nftContract.getApproved(_tokenId) == address(this),
            "Caller is not owner of NFT or contract hasn't been approved"
        );
        nftContract.safeTransferFrom(msg.sender, address(this), _tokenId);
        // confirm if nft has been transferred successfully
        require(
            nftContract.ownerOf(_tokenId) == address(this),
            "Failed to transfer NFT to this contract"
        );
        // create an auction deal
        deals[dealsCreated] = Deal(
            payable(msg.sender),
            dealsCreated,
            _tokenId,
            _minBid,
            payable(address(0)),
            0,
            0,
            false
        );
        exists[dealsCreated] = true;
        emit CreateDeal(msg.sender, dealsCreated, _minBid);
        dealsCreated++;
    }

    /// @dev place bid on already existing auction on the platform
    /// @notice previous bidder(if any) is paid back his initial bid amount
    function placeBid(uint256 _dealId) external payable exist(_dealId) {
        Deal storage deal = deals[_dealId];
        require(deal.createdBy != msg.sender, "You can't bid on your own deal");
        require(
            deal.highestBidder != msg.sender,
            "You can't bid again because you are already the highest bidder"
        );
        require(
            msg.value > deal.minBid && msg.value > deal.highestBid,
            "Funds sent not enough to bid on this deal"
        );
        address payable prevBidder = deal.highestBidder;
        uint256 prevBidAmount = deal.highestBid;
        // update deal with new details
        deal.highestBidder = payable(msg.sender);
        deal.highestBid = msg.value;
        deal.bidsCount++;
        // return funds back to previous bidder
        if ((prevBidAmount > 0) && (prevBidder != address(0))) {
            (bool sent, ) = prevBidder.call{value: prevBidAmount}("");
            require(sent, "Failed to return funds to previous bidder");
            emit ReturnBid(_dealId, msg.sender, prevBidAmount);
        }
        emit PlaceBid(_dealId, msg.sender);
    }

    /// @dev close a currently active deal
    function closeDeal(uint256 _dealId)
        external
        exist(_dealId)
        created(_dealId)
    {
        Deal storage deal = deals[_dealId];
        require(!deal.ended, "Auction is over");
        require(
            deal.bidsCount > 0,
            "You must have atleast one bid before closing a deal"
        );
        // transfer token to highest bidder
        nftContract.safeTransferFrom(
            address(this),
            deal.highestBidder,
            deal.tokenId
        );
        require(
            nftContract.ownerOf(deal.tokenId) == deal.highestBidder,
            "Failed to transfer token to highest bidder"
        );
        uint256 dealValue = deal.highestBid;
        // reset deal properties
        deal.highestBidder = payable(address(0));
        deal.highestBid = 0;
        deal.bidsCount = 0;
        deal.minBid = 0;
        deal.ended = true;
        // send deal bid to deal owner
        (bool sentToCreator, ) = payable(deal.createdBy).call{value: dealValue}(
            ""
        );
        require(sentToCreator, "Failed to send funds to deal creator");
        // send placement fee to plaform owner after successfully closing a deal
        (bool sentToOwner, ) = platformOwner.call{value: _plaformPrice}("");
        require(sentToOwner, "Failed to send funds to plaform account");
        dealsClosed++;
    }

    /// @dev allows creator of a deal to cancel a deal's auction
    /// @notice bidder(if any) is paid back his bidding amount
    function cancelDeal(uint256 _dealId)
        public
        exist(_dealId)
        created(_dealId)
    {
        Deal storage deal = deals[_dealId];
        require(!deal.ended, "Auction is over");
        // transfer token back to deal creator
        nftContract.safeTransferFrom(
            address(this),
            deal.createdBy,
            deal.tokenId
        );
        require(
            nftContract.ownerOf(deal.tokenId) == deal.createdBy,
            "Failed to transfer token to highest bidder"
        );
        address bidder = deal.highestBidder;
        uint256 bidAmount = deal.highestBid;
        // reset deal properties
        deal.highestBidder = payable(address(0));
        deal.highestBid = 0;
        deal.bidsCount = 0;
        deal.minBid = 0;
        deal.ended = true;
        dealsClosed++;

        if (bidder != address(0) && bidAmount > 0) {
            (bool success, ) = payable(bidder).call{value: bidAmount}("");
            require(success, "Paying bidder back failed");
        }
        // initial payment when creating a deal is refunded
        (bool sent, ) = payable(deal.createdBy).call{value: _plaformPrice}("");
        require(sent, "Failed to send funds to plaform account");
    }

    /// @dev get details about a deal from the platform
    function getDeal(uint256 _dealId) public view returns (Deal memory) {
        return (deals[_dealId]);
    }

    /// @dev get all active deals left on the platform
    function activeDeals() public view returns (Deal[] memory) {
        uint256 activeCount = dealsCreated - dealsClosed;
        uint256 index = 0;
        Deal[] memory _deals = new Deal[](activeCount);
        for (uint256 i = 0; i < dealsCreated; i++) {
            // if deal has not ended
            if (!deals[i].ended) {
                _deals[index++] = deals[i];
            }
        }
        return _deals;
    }

    /// @dev get price of placing a deal on this platform
    function plaformPrice() public pure returns (uint256) {
        return _plaformPrice;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return bytes4(this.onERC721Received.selector);
    }
}
