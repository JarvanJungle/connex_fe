import React from "react";
import { StickyFooter } from "components/StickyFooter/StickyFooter";
import { Row, Button } from "components";
import { CONTRACT_REQUEST_LIST_STATUS } from "helper/constantsDefined";

function StickyFooterSubmit(props) {
    const {
        t,
        errors,
        history,
        dirty,
        values,
        onSaveAsDraftPressHandler,
        onCreatePressHandler,
        showToast,
        contractStatus,
        setDisplayRejectReasonDialog,
        setDisplaySendBackReasonDialog,
        setDisplayRecallReasonDialog,
        setDisplayCancelReasonDialog,
        approveContractRequest,
        convertToContract,
        contractData,
        handleSubmit
    } = props;

    const showSaveAsDraft = () => {
        if (contractStatus !== CONTRACT_REQUEST_LIST_STATUS.RECALLED
            && contractStatus !== CONTRACT_REQUEST_LIST_STATUS.SEND_BACK
            && contractStatus !== CONTRACT_REQUEST_LIST_STATUS.CONVERTED_TO_CONTRACT) {
            return (
                <Button
                    color="secondary"
                    type="button"
                    className="mr-3"
                    onClick={() => {
                        handleSubmit();
                        if (!dirty || (dirty && Object.keys(errors).length)) {
                            showToast("error", "Validation error, please check your input.");
                            return;
                        }
                        onSaveAsDraftPressHandler(values);
                    }}
                >
                    {t("SaveAsDraft")}
                </Button>
            );
        }

        return <></>;
    };

    const buttonPendingApprovalState = () => {
        switch (contractStatus) {
        case CONTRACT_REQUEST_LIST_STATUS.PENDING_APPROVAL:
            if (contractData?.contractCreator) {
                return (
                    <>
                        <Button
                            color="danger"
                            className="mr-3"
                            type="button"
                            label={t("Cancel")}
                            onClick={() => setDisplayCancelReasonDialog(true)}
                        >
                            <span>{t("Cancel")}</span>
                        </Button>
                        <Button
                            color="warning"
                            className="mr-3"
                            type="button"
                            label={t("Recall")}
                            onClick={() => setDisplayRecallReasonDialog(true)}
                        >
                            <span>{t("Recall")}</span>
                        </Button>
                    </>
                );
            }

            if (contractData?.approverRole) {
                return (
                    <>
                        {/* SEND BACK BUTTON */}
                        <Button
                            color="warning"
                            className="mr-3"
                            type="button"
                            label={t("Send Back")}
                            onClick={() => setDisplaySendBackReasonDialog(true)}
                        >
                            <span>{t("Send Back")}</span>
                        </Button>
                        {/* REJECT BUTTON */}
                        <Button
                            color="danger"
                            className="mr-3"
                            type="button"
                            label={t("Reject")}
                            onClick={() => setDisplayRejectReasonDialog(true)}
                        >
                            <span>{t("Reject")}</span>
                        </Button>
                        {/* APPROVE BUTTON */}
                        <Button
                            color="primary"
                            className="mr-3"
                            type="button"
                            label={t("Approve")}
                            onClick={() => {
                                approveContractRequest();
                            }}
                        >
                            <span>{t("Approve")}</span>
                        </Button>
                    </>
                );
            }
            break;
        case CONTRACT_REQUEST_LIST_STATUS.PENDING_CONVERSION:
            if (contractData?.contractCreator) {
                return (
                    <>
                        <Button
                            color="primary"
                            className="mr-3"
                            type="button"
                            label={t("Convert to Contract")}
                            onClick={() => convertToContract()}
                        >
                            <span>{t("Convert to Contract")}</span>
                        </Button>
                    </>
                );
            }
            return <></>;
        case CONTRACT_REQUEST_LIST_STATUS.CONVERTED_TO_CONTRACT:
            return <></>;
        default:
            if ((contractData?.contractCreator || contractData?.contractCreator === undefined)
                && contractStatus !== CONTRACT_REQUEST_LIST_STATUS.REJECTED) {
                return (
                    <>
                        {showSaveAsDraft(contractStatus)}
                        <Button
                            color="primary"
                            type="button"
                            onClick={() => {
                                handleSubmit();
                                if (!dirty || (dirty && Object.keys(errors).length)) {
                                    showToast("error", "Validation error, please check your input.");
                                    return;
                                }

                                onCreatePressHandler(values);
                            }}
                        >
                            {t(contractStatus === CONTRACT_REQUEST_LIST_STATUS.RECALLED ? "Submit" : "Create")}
                        </Button>
                    </>
                );
            }
        }

        return <></>;
    };

    return (
        <div>
            <StickyFooter>
                <Row className="mx-0 px-3 justify-content-between">
                    <Button
                        color="secondary"
                        onClick={() => history.goBack()}
                    >
                        {t("Back")}
                    </Button>
                    <Row className="mx-0">
                        {contractData && contractData.converted ? "" : buttonPendingApprovalState()}
                    </Row>
                </Row>
            </StickyFooter>
        </div>
    );
}

export default StickyFooterSubmit;
