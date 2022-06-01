import React, {
    useState, forwardRef, useImperativeHandle
} from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-bootstrap/Modal";
import {
    Button, Col, Form, FormGroup, Input, Label, Row
} from "reactstrap";
import PropTypes from "prop-types";
import { CustomInput } from "components";

// Decimal places should be in range [0, 15]
const DECIMAL_PLACES_OPTIONS = [...Array(16).keys()];

const DecimalPlacesEditModal = forwardRef((props, ref) => {
    const {
        action
    } = props;
    const { t } = useTranslation();
    const [isShow, setIsShow] = useState(false);
    const [decimalPlaces, setDecimalPlaces] = useState(props?.decimalPlaces);
    const [roundType, setRoundType] = useState(props?.roundType);

    const toggle = () => {
        setIsShow(!isShow);
    };

    const handleAction = () => {
        toggle();
        action(decimalPlaces, roundType);
    };

    useImperativeHandle(ref, () => ({ toggle }));

    return (
        <Modal show={isShow} onHide={toggle}>
            <Modal.Body>
                <Form>
                    <FormGroup>
                        <Label>{t("DecimalPlaces")}</Label>
                        <Input
                            type="select"
                            value={decimalPlaces}
                            onChange={(e) => setDecimalPlaces(e.target.value)}
                        >
                            {DECIMAL_PLACES_OPTIONS.map((i) => <option value={i} key={`decimal-places-${i}`}>{i}</option>)}
                        </Input>
                    </FormGroup>
                </Form>
                <Row onChange={(e) => setRoundType(e?.target?.value)}>
                    <Col xs={4}>
                        <CustomInput
                            id="roundTypeDown"
                            type="radio"
                            name="roundType"
                            value="down"
                            inline
                            checked={roundType === "down"}
                            className="custom-control"
                            label={t("RoundDown")}
                        />
                    </Col>
                    <Col xs={4}>
                        <CustomInput
                            id="roundTypeNormal"
                            type="radio"
                            name="roundType"
                            value="normal"
                            inline
                            defaultChecked
                            checked={roundType === "normal"}
                            className="custom-control"
                            label={t("Round")}
                        />
                    </Col>
                    <Col xs={4}>
                        <CustomInput
                            id="roundTypeUp"
                            type="radio"
                            name="roundType"
                            value="up"
                            inline
                            checked={roundType === "up"}
                            className="custom-control"
                            label={t("RoundUp")}
                        />
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={toggle} color="secondary">
                    {t("Close")}
                </Button>
                <Button variant="primary" onClick={handleAction} color="primary">
                    {t("Apply")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
});

DecimalPlacesEditModal.displayName = "DecimalPlacesEditModal";

DecimalPlacesEditModal.propTypes = {
    action: PropTypes.func.isRequired,
    decimalPlaces: PropTypes.number.isRequired,
    roundType: PropTypes.string.isRequired
};

export default DecimalPlacesEditModal;
