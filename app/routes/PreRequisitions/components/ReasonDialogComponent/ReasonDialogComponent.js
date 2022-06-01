import { InputTextarea } from "primereact/inputtextarea";
import React, { useEffect, useState } from "react";
import {
    Row, Col, Label, Button
} from "components";
import { PPR_SUBMIT_STATUS } from "helper/purchasePreRequisitionConstants";
import classes from "../PreRequisitionComponents.module.scss";

const ReasonDialogComponent = (props) => {
    const {
        t,
        submitState,
        submitAction,
        onHide
    } = props;

    const [reason, setReason] = useState(null);
    const [isSubmit, setIsSubmit] = useState(true);
    const [submitButtonTitle, setSubmitButtonTitle] = useState(null);

    const handleOnSubmit = () => {
        if (!reason) {
            setIsSubmit(false);
            return;
        }
        setIsSubmit(true);
        submitAction(reason);
    };

    const handleReasonOnChange = (e) => {
        setIsSubmit(true);
        setReason(e.target.value);
        if (e.target.value === "") {
            setIsSubmit(false);
        }
    };

    useEffect(() => {
        switch (submitState) {
        case PPR_SUBMIT_STATUS.SEND_BACK: setSubmitButtonTitle("Send Back"); break;
        case PPR_SUBMIT_STATUS.REJECT: setSubmitButtonTitle("Reject"); break;
        default:
            break;
        }
    }, [submitState]);

    return (
        <div id={`reason${submitState}`}>
            <Col
                md={12}
                lg={12}
            >
                <Row className="py-1 label-required">
                    <Col
                        md={4}
                        lg={4}
                    >
                        <Label>{`${t("Reason")}`}</Label>
                    </Col>
                </Row>
                <Row className="py-1">
                    <Col
                        md={12}
                        lg={12}
                    >
                        <InputTextarea
                            className={classes["doxa-input"]}
                            value={reason}
                            onChange={(e) => handleReasonOnChange(e)}
                            rows={3}
                            cols={30}
                            autoResize
                            placeholder={`${t("Please enter Reason")}...`}
                        />
                    </Col>
                    <Col>
                        { !isSubmit
                            && (
                                <div className="reason">
                                    Please enter valid reason
                                </div>
                            )}
                    </Col>
                </Row>

                <Row className="py-1">
                    <Col
                        md={12}
                        lg={12}
                    >
                        <Row>
                            <Col
                                md={6}
                                lg={6}
                                className="doxa-row-float-left"
                            />
                            <Col
                                md={6}
                                lg={6}
                                className="doxa-row-float-right"
                            >
                                <Button
                                    color="secondary"
                                    className="mr-3"
                                    type="button"
                                    label={t("Close")}
                                    onClick={() => onHide()}
                                >
                                    {t("Close")}
                                </Button>
                                <Button
                                    color="primary"
                                    className="mr-3"
                                    type="button"
                                    label={t(`${submitButtonTitle}`)}
                                    onClick={() => handleOnSubmit()}
                                >
                                    {t(`${submitButtonTitle}`)}
                                </Button>
                            </Col>

                        </Row>
                    </Col>
                </Row>
            </Col>

        </div>

    );
};

export default ReasonDialogComponent;
