import React, { useState, useCallback, useEffect } from "react";
import Navigation from "../Navigation/Navigation";
import { useMinterContract } from "../../hooks";
import Loader from "../../components/ui/Loader";
import { getMyTokens } from "../../utils/minter";
import List from "../../components/ui/List";
import "./Profile.scss";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState([]);
  const minterContract = useMinterContract();

  const getAssets = useCallback(async () => {
    try {
      setLoading(true);
      // fetch all nfts I own from the smart contract
      const allNfts = await getMyTokens(minterContract);
      if (!allNfts) return;
      setNfts(allNfts);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [minterContract]);

  useEffect(() => {
    try {
      if (minterContract) {
        getAssets();
      }
    } catch (error) {
      console.log({ error });
    }
  }, [minterContract, getAssets]);

  return (
    <>
      <Navigation />
      {!loading ? (
        <div className="app__profile">
          <div className="app__profile-subtitle">
            My NFTs
            <hr className="hr__class" />
          </div>
          <div className="my-nfts">
            {nfts.length === 0 ? (
              <div className="no-nft-msg">Nothing to display</div>
            ) : (
              nfts.map((nft) => (
                <div className="nft-card">
                  <div className="card-img">
                    <img src={nft.image} alt={nft.description} />
                  </div>
                  <div className="card-body">
                    <div className="body-details">
                      <div className="body-name">{nft.name}</div>
                      <div>{nft.description}</div>
                      <div>
                        {nft.attributes.map((attri) => (
                          <div className="card-attribute">
                            <div className="t-type">{attri.trait_type}</div>
                            <div>{attri.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card-action">
                      <List tokenId={nft.tokenId}/>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Profile;
