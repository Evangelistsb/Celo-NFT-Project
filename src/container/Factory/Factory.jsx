import React, { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import { uploadToIpfs, mintToken } from "../../utils/minter";
import { useContractKit } from "@celo-tools/use-contractkit";
import { useMinterContract } from "../../hooks";
import {
  NotificationSuccess,
  NotificationError,
} from "../../components/ui/Notifications";

const Factory = () => {
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [ipfsImage, setIpfsImage] = useState();
  const [attributes, setAttributes] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState();
  const { performActions } = useContractKit();
  const minterContract = useMinterContract();

  // confirm if all form data has been filled
  const isFormFilled = () =>
    name && ipfsImage && description && attributes.length === 1;

  // close the popup modal
  const handleClose = () => {
    setShow(false);
    setAttributes([]);
  };

  // display the popup modal
  const handleShow = () => setShow(true);

  // add an attribute to an NFT
  const setAttributesFunc = (e, trait_type) => {
    const { value } = e.target;
    const attributeObject = {
      trait_type,
      value,
    };
    const arr = attributes;

    // check if attribute already exists
    const index = arr.findIndex((el) => el.trait_type === trait_type);

    if (index >= 0) {
      // update the existing attribute
      arr[index] = {
        trait_type,
        value,
      };
      setAttributes(arr);
      return;
    }

    // add a new attribute
    setAttributes((oldArray) => [...oldArray, attributeObject]);
  };

  // mint new NFT
  const save = async (data) => {
    try {
      setLoading(true);
      // create an nft functionality
      await mintToken(minterContract, performActions, data);
      toast(<NotificationSuccess text="Updating NFT list...." />);
      // navigate("/");
      // window.location.reload();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create an NFT." />);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={handleShow}>Factory</div>

      {/* Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Mint a digital item and foever own it!</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <FloatingLabel
              controlId="inputLocation"
              label="Name"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Name"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </FloatingLabel>

            <FloatingLabel
              controlId="inputDescription"
              label="Description of item"
              className="mb-3"
            >
              <Form.Control
                as="textarea"
                placeholder="description"
                style={{ height: "80px" }}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </FloatingLabel>

            <Form.Control
              type="file"
              className={"mb-3"}
              onChange={async (e) => {
                const imageUrl = await uploadToIpfs(e);
                if (!imageUrl) {
                  alert("failed to upload image");
                  return;
                }
                setIpfsImage(imageUrl);
              }}
              placeholder="Item image"
            ></Form.Control>

            <Form.Label>
              <h5>Attributes</h5>
            </Form.Label>

            <FloatingLabel
              controlId="inputLocation"
              label="Art type"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Music, Picture, Sketch etc."
                onChange={(e) => {
                  setAttributesFunc(e, "art_type");
                }}
              />
            </FloatingLabel>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>

          <Button
            variant="dark"
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                name,
                description,
                ipfsImage,
                attributes,
              });
              handleClose();
            }}
          >
            Mint
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Factory;
