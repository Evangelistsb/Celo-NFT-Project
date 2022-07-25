import React, {useEffect} from "react";
import { useContractKit } from "@celo-tools/use-contractkit";
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useBalance, useSealsContract } from "../../hooks";
import Wallet from "../../components/wallet/Wallet";
import "./Navigation.scss";
import Factory from "../Factory/Factory";

const Navigation = () => {
  /*
    address : fetch the connected wallet address
    destroy: terminate connection to user wallet
    connect : connect to the celo blockchain
     */
  const { address, destroy, kit } = useContractKit();

  //  fetch user's celo balance using hook
  const { balance, getBalance } = useBalance();
  const sealsContract  = useSealsContract();

  useEffect(() => {
    if (sealsContract) getBalance();
  }, [sealsContract]);

  return (
    <div className="app__nav">
      <div className="app__nav-list">
        <div className="app__title">
          <Link to="/">Seals</Link>
          <div className="app__title-subtitle">
            Seal a deal on the blockchain today
          </div>
        </div>
        <div className="app__nav-item">
          <Link to="/">Home</Link>
        </div>
        <div className="app__nav-item">
          <Link to="/profile">Profile</Link>
        </div>
        <div className="app__nav-item mint-btn">
          <Factory/>
        </div>
      </div>
      <Nav className="app__nav-more">
        <Nav.Item>
          {/*display user wallet*/}
          <Wallet
            address={address}
            amount={balance.CELO}
            symbol="CELO"
            destroy={destroy}
          />
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default Navigation;
