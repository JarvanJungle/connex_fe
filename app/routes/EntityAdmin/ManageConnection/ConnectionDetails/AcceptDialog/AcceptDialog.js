import React, { useState, useEffect, useRef } from "react";
import {
    Button,
    ButtonToolbar
} from "components";
import Modal from "react-bootstrap/Modal";
import { AvField, AvForm } from "availity-reactstrap-validation";
import { v4 as uuidv4 } from "uuid";
import PropTypes from "prop-types";
import URL_CONFIG from "services/urlConfig";
import _ from "lodash";

function AcceptDialog(props) {
    const {
        detailsStates, t, handleHideDialog, handleAccept, history
    } = props;
    const [step, setStep] = useState(1);
    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);
    const formRef = useRef();

    const redirectToCreateVendor = () => {
        let {
            addressDtoList,
            companyRegistrationNumber,
            country,
            entityName,
            paymentTerm,
            gstNo,
            gstApplicable,
            contactInformation,
            connectionUuid
        } = detailsStates.companyDetails;
        addressDtoList = addressDtoList.map((address) => _.omit(address, ["companyUuid", "uuid"]));

        const connectionVendorProps = {
            buyer: true,
            seller: true,
            addressesDto: addressDtoList,
            uen: companyRegistrationNumber,
            countryOfOrigin: country,
            companyName: entityName,
            // paymentTerm,
            gstRegNo: gstNo === "N/A" ? "" : gstNo,
            gstRegBusiness: gstApplicable ? "Registered" : "Non Registered",
            supplierUserList: [{
                default: true,
                countryCode: contactInformation.countryCode || "65",
                workNumber: contactInformation.workNumber,
                fullName: contactInformation.name,
                emailAddress: contactInformation.email
            }]
        };
        history.push({
            pathname: URL_CONFIG.CREATE_EXT_VENDOR,
            search: `?connectionUuid=${connectionUuid}`,
            state: {
                connectionVendor: connectionVendorProps
            }
        });
    };

    const handleStep = (st) => {
        switch (st) {
        case 1:
            return `${t("Are you sure you want to accept")} ?`;
        case 2:
            return (
                <>
                    <div className="text-center">
                        <p>Associate this vendor as:</p>
                    </div>
                    <ButtonToolbar className="justify-content-center">
                        <Button
                            color="primary"
                            className="mb-2 mr-2 px-3"
                            // TODO: use history.push here to navigate to create new supplier screen
                            onClick={redirectToCreateVendor}
                        >
                            {t("NewVendor")}
                        </Button>
                        <Button
                            color="primary"
                            className="mb-2 mr-2 px-3"
                            onClick={nextStep}
                        >
                            {t("ExistingVendor")}
                        </Button>
                    </ButtonToolbar>
                </>
            );
        case 3:
            return (
                <AvForm onValidSubmit={handleAccept} ref={formRef}>
                    <AvField
                        label={t("SelectVendorFromList")}
                        type="select"
                        name="supplier"
                        validate={{
                            required: { value: true, errorMessage: t("RequiredField") }
                        }}
                    >
                        <option disabled value="">{t("PleaseSelectAValue")}</option>
                        {
                            detailsStates.suppliers.map((supplier, index) => (
                                <option
                                    key={uuidv4()}
                                    value={index}
                                >
                                    {`${supplier.companyName} (${supplier.uen})`}
                                </option>
                            ))
                        }
                    </AvField>
                </AvForm>
            );
        default:
            return "";
        }
    };

    useEffect(() => {
        if (detailsStates.acceptShow) setStep(1);
    }, [detailsStates.acceptShow]);

    return (
        <Modal show={detailsStates.acceptShow} onHide={handleHideDialog} className="modal-outline-primary">
            <Modal.Header closeButton>
                <Modal.Title className="text-primary">{t("Accept")}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {handleStep(step)}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={step === 1 ? handleHideDialog : prevStep} color="link" className="text-primary">
                    {step === 1 ? t("Cancel") : t("Cancel")}
                </Button>
                {
                    step !== 2 && (
                        <Button variant="primary" onClick={step === 3 ? () => formRef.current?.handleSubmit() : nextStep} color="primary">
                            {t("Confirm")}
                        </Button>
                    )
                }
            </Modal.Footer>

        </Modal>
    );
}

AcceptDialog.propTypes = {
    detailsStates: PropTypes.instanceOf(Object).isRequired,
    t: PropTypes.func.isRequired,
    handleHideDialog: PropTypes.func.isRequired,
    handleAccept: PropTypes.func.isRequired,
    history: PropTypes.instanceOf(Object).isRequired
};

export default AcceptDialog;
