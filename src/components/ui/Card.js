import React from "react";
import PropTypes from "prop-types";
import { useContractKit } from "@celo-tools/use-contractkit";
import { useSealsContract } from "../../hooks";
import Identicon from "./Identicon";
import Bid from "./Bid";
import "./Card.scss";
import BigNumber from "bignumber.js";
import { ERC20_DECIMALS } from "../../utils/constants";

const fromEthers = (num) => {
  return BigNumber(num).shiftedBy(-ERC20_DECIMALS).toString();
};

const NftCard = ({ nft, placeBid, closeDeal }) => {
  const {
    dealId,
    tokenId,
    createdBy,
    minBid,
    highestBidder,
    highestBid,
    bidsCount,
    name,
    image,
    description,
    attributes,
  } = nft;
  const { kit, performActions } = useContractKit();
  const sealsContract = useSealsContract();
  const { defaultAccount } = kit;

  return (
    <>
      <div className="nft-card">
        <div className="card-header">
          <Identicon address={createdBy} size={50} />
          <div className="card-highest-bid">
            {highestBid === 0
              ? fromEthers(minBid)
              : fromEthers(highestBid)} CELO
          </div>
          <div className="card-token-id">{tokenId} ID</div>
        </div>
        <div className="card-img">
          <img src={image} alt={description} />
        </div>
        <div className="card-body">
          <div className="body-details">
            <div className="body-name">{name}</div>
            <div>{description}</div>
            <div>
              {attributes.map((attri) => (
                <div className="card-attribute">
                  <div className="t-type">{attri.trait_type}</div>
                  <div>{attri.value}</div>
                </div>
              ))}
            </div>
            <div className="card-deal-props">
              <div>
                <div className="card-label">Starting Bid</div>
                <div className="card-val">{fromEthers(minBid)} CELO</div>
              </div>
              <div>
                <div className="card-label">Bids Count</div>
                <div className="card-val">{bidsCount}</div>
              </div>
            </div>
          </div>
          <div className="card-action">
            {createdBy === defaultAccount ? (
              <button
                className="card-button"
                onClick={() =>
                  closeDeal(performActions, sealsContract, dealId, bidsCount)
                }
              >
                Close Deal
              </button>
            ) : highestBidder === defaultAccount ? (
              <div className="card-button-text">Deal not closed yet</div>
            ) : (
              <Bid
                placeBid={placeBid}
                fromEthers={fromEthers}
                sealsContract={sealsContract}
                dealId={dealId}
                highestBid={highestBid}
                minBid={minBid}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

NftCard.propTypes = {
  // props passed into this component
  nft: PropTypes.instanceOf(Object).isRequired,
};

export default NftCard;
