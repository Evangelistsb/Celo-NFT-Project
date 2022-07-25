import { useContractKit } from "@celo-tools/use-contractkit";
import { useMinterContract, useSealsContract } from "../../hooks";
import Seals from "../../contracts/Seals-address.json";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { createDeal } from "../../utils/minter";

const List = ({ tokenId }) => {
  const [show, setShow] = useState(false);
  const [minBid, setMinBid] = useState();
  const { performActions } = useContractKit();
  const minterContract = useMinterContract();
  const sealsContract = useSealsContract();
  const sealsAddress = Seals.Seals;

  const handleList = async () => {
    await createDeal(
      performActions,
      minterContract,
      sealsContract,
      sealsAddress,
      tokenId,
      minBid
    );
    setShow(false);
  };
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div className="card-button">
      <div className="card-text" onClick={handleShow}>
        List
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Minimum Bid amount</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Control
                type="text"
                placeholder="1"
                onChange={(e) => setMinBid(e.target.value)}
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleList()}>
            List
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default List;
