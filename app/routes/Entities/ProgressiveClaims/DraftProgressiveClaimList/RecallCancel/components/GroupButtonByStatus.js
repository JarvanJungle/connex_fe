import React from "react";
import {
    Row,
    Button
} from "components";
import useToast from "routes/hooks/useToast";
import { DPC_STATUS } from "../../Helper";

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
        switch (detailDataState.dpcStatus) {
        case DPC_STATUS.CREATED:
            return (
                <>
                    <Button
                        color="primary"
                        className=""
                        type="submit"
                        onClick={() => {
                            onSavePressHandler(values, DPC_STATUS.CREATED);
                        }}
                    >
                        {t("Issue")}
                    </Button>
                </>
            );
        case DPC_STATUS.PENDING_ACKNOWLEDGEMENT:
            if (detailDataState.mainQs) {
                return (
                    <>
                        <Button
                            color="primary"
                            type="submit"
                            onClick={() => {
                                onSavePressHandler(
                                    values,
                                    DPC_STATUS.PENDING_ACKNOWLEDGEMENT
                                );
                            }}
                        >
                            {t("Acknowledge")}
                        </Button>
                    </>
                );
            }
            break;
        case DPC_STATUS.PENDING_VALUATION:
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
                                    DPC_STATUS.PENDING_SUBMISSION
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
                                    DPC_STATUS.PENDING_VALUATION
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
        case DPC_STATUS.PENDING_SUBMISSION:
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
                                    DPC_STATUS.PENDING_SUBMISSION
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
                                    DPC_STATUS.PENDING_VALUATION
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

        case DPC_STATUS.PENDING_APPROVAL:
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
                                    DPC_STATUS.PENDING_APPROVAL
                                );
                            }}
                        >
                            {t("Approve")}
                        </Button>
                    </>
                );
            }
            break;
        case DPC_STATUS.PENDING_REVERT:
            if (detailDataState.mainQs) {
                return (
                    <>
                        <Button
                            color="primary"
                            className="mr-3"
                            type="submit"
                            onClick={() => {
                                onSavePressHandler(values, DPC_STATUS.PENDING_REVERT);
                            }}
                        >
                            {t("Revert")}
                        </Button>
                    </>
                );
            }
            break;
        case DPC_STATUS.PENDING_ACKNOWLEDGE_DRAFT_VALUATION:
            return (
                <>
                    {!isBuyer && (
                        <Button
                            color="primary"
                            className="mr-3"
                            type="submit"
                            onClick={() => {
                                onSavePressHandler(
                                    values,
                                    DPC_STATUS.PENDING_ACKNOWLEDGE_DRAFT_VALUATION
                                );
                            }}
                        >
                            {t("Acknowledge")}
                        </Button>
                    )}
                </>
            );
        case DPC_STATUS.PENDING_OFFICIAL_CLAIMS_SUBMISSION:
            return (
                <>
                    {!isBuyer && (
                        <Button
                            color="primary"
                            className="mr-3"
                            type="submit"
                            onClick={() => {
                                onSavePressHandler(
                                    values,
                                    DPC_STATUS.PENDING_OFFICIAL_CLAIMS_SUBMISSION
                                );
                            }}
                        >
                            {t("Convert to Actual Claim")}
                        </Button>
                    )}
                </>
            );
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
