import React, { useState, forwardRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Modal from "react-bootstrap/Modal";
import { Input } from "reactstrap";
import { Button } from "../../components";

const ActionModal = forwardRef((props, ref) => {
    const {
        title, body, button, color, action, textCancel, colorCancel, hasInput, colorTitle
    } = props;
    const { t } = useTranslation();
    const [isShow, setIsShow] = useState(false);
    const [input, setInput] = useState(null);

    const toggleModal = () => {
        setIsShow(!isShow);
    };

    const handleAction = () => {
        toggleModal();
        if (action) {
            action(input);
        }
    };

    useImperativeHandle(ref, () => ({ toggleModal }));

    return (
        <Modal show={isShow} onHide={toggleModal}>
            <Modal.Header closeButton>
                <Modal.Title className={`text-${colorTitle || color}`}>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {body}
                {hasInput && (
                    <Input
                        type="textarea"
                        value={input || ""}
                        onChange={(e) => setInput(e?.target.value)}
                        required
                    />
                )}

            </Modal.Body>
            <Modal.Footer>
                {action
                    ? (
                        <Button
                            variant="secondary"
                            onClick={toggleModal}
                            color={colorCancel}
                        >
                            {t(textCancel)}
                        </Button>
                    )
                    : <></>}
                <Button variant="primary" onClick={handleAction} color={color}>
                    {button}
                </Button>
            </Modal.Footer>
        </Modal>
    );
});

ActionModal.displayName = "ActionModal";

ActionModal.propTypes = {
    title: PropTypes.string.isRequired,
    body: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    button: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired,
    textCancel: PropTypes.string,
    colorCancel: PropTypes.string,
    hasInput: PropTypes.bool,
    data: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
};

ActionModal.defaultProps = {
    textCancel: "Cancel",
    colorCancel: "link",
    hasInput: false,
    data: null
};

export default ActionModal;
