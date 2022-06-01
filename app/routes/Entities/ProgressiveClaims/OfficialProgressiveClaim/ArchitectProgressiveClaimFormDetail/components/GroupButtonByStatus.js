import React from "react";
import {
    Row,
    Button
} from "components";
import useToast from "routes/hooks/useToast";
import { ACE_STATUS, ACE_ACTION } from "../../Helper";

const GroupButtonByStatus = (props) => {
    const {
        t,
        values,
        onSavePressHandler,
        detailDataState = {},
        isBuyer,
        dirty,
        errors,
        draftClaim
    } = props;
    const showToast = useToast();
    const handleRenderByStatus = () => {
        switch (detailDataState.aceStatus) {
        case ACE_STATUS.PENDING_ARCHITECT_REVIEW:
            // if (
            //     detailDataState.mainQs
            //           || detailDataState.nonMainQsApproverRole
            // ) {
            return (
                <>
                    <Button
                        color="primary"
                        type="submit"
                        className="mr-3"
                        onClick={() => {
                            onSavePressHandler(
                                values,
                                ACE_ACTION.SUBMITTED_ARCHITECT_CERTIFICATE
                            );
                        }}
                    >
                        {t("submit")}
                    </Button>
                </>
            );
            // }
            // break;
        case ACE_STATUS.PENDING_ARCHITECT_ACKNOWLEDGEMENT:
            // if (
            //     detailDataState.mainQs
            //           || detailDataState.nonMainQsApproverRole
            // ) {
            return (
                <>
                    <Button
                        color="primary"
                        type="submit"
                        onClick={() => {
                            onSavePressHandler(
                                values,
                                ACE_ACTION.ACKNOWLEDGED_ARCHITECT_CERTIFICATE_BY_ARCHITECT
                            );
                        }}
                    >
                        {t("Acknowledge")}
                    </Button>
                </>
            );
            // }
            // break;
        case ACE_STATUS.PENDING_AC_APPROVAL:
            if (
                detailDataState.architectApproverRole
            ) {
                return (
                    <>
                        <Button
                            color="warning"
                            type="submit"
                            className="mr-3"
                            onClick={() => {
                                onSavePressHandler(
                                    values,
                                    ACE_ACTION.SENT_BACK_ARCHITECT_CERTIFICATE_TO_MQS
                                );
                            }}
                        >
                            {t("SendBack")}
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            onClick={() => {
                                onSavePressHandler(
                                    values,
                                    ACE_ACTION.APPROVED_ARCHITECT_CERTIFICATE
                                );
                            }}
                        >
                            {t("Approve")}
                        </Button>
                    </>
                );
            }

            break;
        case ACE_STATUS.PENDING_MC_AC_ACKNOWLEDGEMENT:
            if (
                !isBuyer
            ) {
                return (
                    <Button
                        color="primary"
                        type="submit"
                        onClick={() => {
                            onSavePressHandler(
                                values,
                                ACE_ACTION.ACKNOWLEDGED_ARCHITECT_CERTIFICATE_BY_MC
                            );
                        }}
                    >
                        {t("Acknowledge")}
                    </Button>
                );
            }
            break;
        case ACE_STATUS.PENDING_CONVERT_TO_INVOICE:
            // if (
            //     detailDataState.mainQs
            //           || detailDataState.nonMainQsApproverRole
            // ) {
            return (
                <Button
                    color="primary"
                    type="submit"
                    onClick={() => {
                        onSavePressHandler(
                            values,
                            ACE_ACTION.CONVERTED_ARCHITECT_CERTIFICATE_TO_INVOICE
                        );
                    }}
                >
                    {t("Convert to Invoice")}
                </Button>
            );
            // }
        case ACE_STATUS.PENDING_ISSUE_ARCHITECT_CERT:
            // if (
            //     detailDataState.mainQs
            //           || detailDataState.nonMainQsApproverRole
            // ) {
            return (
                <>
                    <Button
                        color="primary"
                        type="submit"
                        className="mr-3"
                        onClick={() => {
                            onSavePressHandler(
                                values,
                                ACE_ACTION.ISSUED_ARCHITECT_CERTIFICATE_TO_MAIN_CONTRACTOR
                            );
                        }}
                    >
                        {t("Issue Certification")}
                    </Button>
                </>
            );
            // }
        default:
            break;
        }
        return null;
    };
    return (
        <Row className="mx-0">
            {handleRenderByStatus()}
        </Row>
    );
};

export default GroupButtonByStatus;
