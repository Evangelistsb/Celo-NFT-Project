import { useContractKit } from "@celo-tools/use-contractkit";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

const Bid = ({
  fromEthers,
  sealsContract,
  placeBid,
  dealId,
  highestBid,
  minBid,
}) => {
  const [show, setShow] = useState(false);
  const [bidAmount, setBidAmount] = useState();
  const { performActions } = useContractKit();

  const handleBid = async () => {
    setShow(false);
    await placeBid(
      performActions,
      sealsContract,
      dealId,
      highestBid,
      minBid,
      bidAmount
    );
  };
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <div className="card-button" onClick={handleShow}>
        Place Bid
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Place a bid</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Control
                type="text"
                placeholder={Number(fromEthers(highestBid == 0 ? minBid : highestBid)) + 1}
                onChange={(e) => setBidAmount(e.target.value)}
                min={fromEthers(highestBid == 0 ? minBid : highestBid)}
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleBid()}>
            Bid
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Bid;
