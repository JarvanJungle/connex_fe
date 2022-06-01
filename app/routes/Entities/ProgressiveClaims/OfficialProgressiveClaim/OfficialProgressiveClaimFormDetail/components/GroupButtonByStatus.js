import React from "react";
import {
    Row,
    Button
} from "components";
import useToast from "routes/hooks/useToast";
import { PC_STATUS, PC_ACTION } from "../../Helper";

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
        switch (detailDataState.pcStatus) {
        case PC_STATUS.CREATED:
        case PC_STATUS.PENDING_ISSUE:
            if (!isBuyer) {
                return (
                    <>
                        <Button
                            color="primary"
                            className=""
                            type="submit"
                            onClick={() => {
                                onSavePressHandler(values, PC_ACTION.ISSUED_DEVELOPER_PROGRESS_CLAIM);
                            }}
                        >
                            {t("Issue")}
                        </Button>
                    </>
                );
            }
            break;
        case PC_STATUS.PENDING_ACKNOWLEDGEMENT:
            if (detailDataState.mainQs) {
                return (
                    <>
                        <Button
                            color="primary"
                            type="submit"
                            onClick={() => {
                                onSavePressHandler(
                                    values,
                                    PC_ACTION.ACKNOWLEDGED_OFFICIAL_PROGRESS_CLAIM
                                );
                            }}
                        >
                            {t("Acknowledge")}
                        </Button>
                    </>
                );
            }
            break;
        case PC_STATUS.PENDING_VALUATION:
            if (
                detailDataState.mainQs
              || detailDataState.nonMainQsApproverRole
            ) {
                const evaluate = draftClaim.rowDataOriginalOrder.filter(
                    (item) => !item.readyForMqs
                );

                return (
                    <>
                        <Button
                            color="secondary"
                            type="submit"
                            className="mr-3"
                            onClick={() => {
                                onSavePressHandler(
                                    values,
                                    PC_ACTION.SAVED_DEVELOPER_PROGRESS_CLAIM_AS_DRAFT
                                );
                            }}
                        >
                            {t("Save As Draft")}
                        </Button>
                        <Button
                            color={evaluate.length ? "secondary" : "primary"}
                            type="submit"
                            onClick={() => {
                                onSavePressHandler(
                                    values,
                                    PC_ACTION.SUBMITTED_VALUATED_DEVELOPER_PROGRESS_CLAIM
                                );
                            }}
                            disabled={!!evaluate.length}
                        >
                            {t("Submit")}
                        </Button>
                    </>
                );
            }
            break;
        case PC_STATUS.PENDING_SUBMISSION:
            if (
                detailDataState.mainQs
              || detailDataState.nonMainQsApproverRole
            ) {
                const evaluate = draftClaim.rowDataOriginalOrder.filter(
                    (item) => !item.readyForMqs
                );
                return (
                    <>
                        <Button
                            color="secondary"
                            type="submit"
                            className="mr-3"
                            onClick={() => {
                                onSavePressHandler(
                                    values,
                                    PC_ACTION.SAVED_DEVELOPER_PROGRESS_CLAIM_AS_DRAFT
                                );
                            }}
                        >
                            {t("Save As Draft")}
                        </Button>
                        <Button
                            color={evaluate.length ? "secondary" : "primary"}
                            type="submit"
                            onClick={() => {
                                onSavePressHandler(
                                    values,
                                    PC_ACTION.SUBMITTED_VALUATED_DEVELOPER_PROGRESS_CLAIM
                                );
                            }}
                            disabled={!!evaluate.length}
                        >
                            {t("Submit")}
                        </Button>
                    </>
                );
            }
            break;
        case PC_STATUS.PENDING_SUBMISSION_TO_ARCHITECT:
            if (
                detailDataState.mainQs
                  || detailDataState.nonMainQsApproverRole
            ) {
                return (
                    <>
                        <Button
                            color="primary"
                            type="submit"
                            className="mr-3"
                            onClick={() => {
                                onSavePressHandler(
                                    values,
                                    PC_ACTION.SUBMITTED_DEVELOPER_PROGRESS_CLAIM_TO_ARCHITECT
                                );
                            }}
                        >
                            {t("Submit to Architect")}
                        </Button>
                    </>
                );
            }
            break;
        case PC_STATUS.PENDING_EVALUATION_APPROVAL:
            if (
                (detailDataState.mainQsApproverRole
                && !detailDataState.mainQsCreator)
              || (detailDataState.nonMainQsApproverRole
                && !detailDataState.nonMainQSCreator)
            ) {
                return (
                    <>
                        <Button
                            color="primary"
                            type="submit"
                            onClick={() => {
                                onSavePressHandler(
                                    values,
                                    PC_ACTION.APPROVED_VALUATED_DEVELOPER_PROGRESS_CLAIM
                                );
                            }}
                        >
                            {t("Approve")}
                        </Button>
                    </>
                );
            }
            break;
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
