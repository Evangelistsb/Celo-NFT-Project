import React from "react";
import { Notification } from "./components/ui/Notifications";
import Cover from "./components/Cover";
import { useContractKit } from "@celo-tools/use-contractkit";
import { Nav, Home } from "./container";
import { useBalance, useMinterContract, useSealsContract } from "./hooks";
import "./index.css";
import "./App.scss";

const App = function AppWrapper() {  
  /*
    address : fetch the connected wallet address
    destroy: terminate connection to user wallet
    connect : connect to the celo blockchain
     */
  const { address, connect } = useContractKit();

  // get celo balance of address
  const { getBalance } = useBalance();

  // initialize the NFT and platform contract
  const minterContract = useMinterContract();
  const sealsContract = useSealsContract();

  return (
    <div className="app__base">
      <Notification />
      {address ? (
        <>
          <Nav />
          <Home
            updateBalance={getBalance}
            sealsContract={sealsContract}
            minterContract={minterContract}
          />
        </>
      ) : (
        <Cover name="Seals" connect={connect} />
      )}
    </div>
  );
};

export default App;
