// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Minter is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Minters", "MNTS") {}

    mapping(address => uint[]) ownedNfts;

    function safeMint(string memory uri) public {
        require(bytes(uri).length > 0, "Empty uri");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        ownedNfts[msg.sender].push(tokenId);
        _safeMint(payable(msg.sender), tokenId);
        _setTokenURI(tokenId, uri);
    }

    /// @dev get all NFTs "msg.sender" has minted
    function myNfts() public view returns (uint256[] memory) {
        uint256[] memory tokens = new uint256[](balanceOf(msg.sender));
        uint256 index = 0;
        for (uint256 i = 0; i < ownedNfts[msg.sender].length; i++) {
            if (ownerOf(ownedNfts[msg.sender][i]) == msg.sender) {
                tokens[index++] = ownedNfts[msg.sender][i];
            }
        }
        return tokens;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
