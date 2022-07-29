import { useContractKit } from "@celo-tools/use-contractkit";
import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import Nft from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import { closeDeal, placeBid, getActiveDeals } from "../../utils/minter";
import "./Home.scss";

const Home = ({ updateBalance, sealsContract, minterContract }) => {
  const { address, kit } = useContractKit();  
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAssets = useCallback(async () => {
    try {
      setLoading(true);
      // fetch all nfts from the smart contract
      const allNfts = await getActiveDeals(sealsContract, minterContract);
      if (!allNfts) return;
      setNfts(allNfts);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [sealsContract]);

  useEffect(() => {
    try {
      if (address && sealsContract) {
        getAssets();
        updateBalance();
      }
    } catch (error) {
      console.log({ error });
    }
  }, [sealsContract, address, getAssets]);
 
  if (address) {
    return (
      <div className="app__market">
        {!loading ? (
          <div className="app__market-market">
            <div className="app__market-heading">
              <h1 className="app__market-title">Market</h1>
            </div>
            <div className="app__market-body">
              {/* display all NFTs */}
              {nfts.length == 0 ? (
                <div>No NFT to display at the moment</div>
              ) : (
                nfts.map((_nft) => (
                  <Nft
                    key={_nft.tokenId}
                    nft={{
                      ..._nft,
                    }}
                    placeBid={placeBid}
                    closeDeal={closeDeal}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          <Loader />
        )}
      </div>
    );
  }
  return null;
};

Home.propTypes = {
  // props passed into this component
  nftContract: PropTypes.instanceOf(Object),
  updateBalance: PropTypes.func.isRequired,
};

Home.defaultProps = {
  nftContract: null,
};

export default Home;
