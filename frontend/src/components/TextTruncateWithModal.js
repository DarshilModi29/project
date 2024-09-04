import React, { useState } from "react";
import { Modal, ModalBody } from "reactstrap";

const TextTruncateWithModal = ({ data }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");

  const toggleModal = () => setModalOpen(!modalOpen);

  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const handleTextClick = (text) => {
    setModalText(text);
    toggleModal();
  };

  const strippedText = stripHtmlTags(data);

  return (
    <>
      <td
        className="text-truncate"
        style={{ maxWidth: "150px", cursor: "pointer" }}
        onClick={() => handleTextClick(data)}
      >
        {strippedText}
      </td>
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalBody>
          <div dangerouslySetInnerHTML={{ __html: modalText }} />
        </ModalBody>
      </Modal>
    </>
  );
};

export default TextTruncateWithModal;
