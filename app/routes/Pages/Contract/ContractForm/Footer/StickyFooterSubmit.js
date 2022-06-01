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
        setDisplayTerminateReasonDialog,
        approveContract,
        issueContract,
        acknowledgementContract,
        contractData,
        isBuyer,
        isESign,
        handleSubmit
    } = props;

    const buttonPendingApprovalState = () => {
        switch (contractStatus) {
        case CONTRACT_REQUEST_LIST_STATUS.PENDING_APPROVAL_CONTRACT:
            if (contractData?.contractCreator) {
                return (
                    <>
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
                                approveContract();
                            }}
                        >
                            <span>{t("Approve")}</span>
                        </Button>
                    </>
                );
            }
            break;
        case CONTRACT_REQUEST_LIST_STATUS.PENDING_ISSUE_CONTRACT:
            if (contractData?.contractCreator) {
                return (
                    <>
                        <Button
                            color="primary"
                            className="mr-3"
                            type="button"
                            label={t("Issue")}
                            onClick={() => issueContract()}
                        >
                            <span>{t("Issue")}</span>
                        </Button>
                    </>
                );
            }
            return <></>;
        case CONTRACT_REQUEST_LIST_STATUS.PENDING_ACKNOWLEDGEMENT:
            if (!contractData?.contractCreator && !isBuyer) {
                return (
                    <>
                        <Button
                            color="primary"
                            className="mr-3"
                            type="button"
                            label={t("Acknowledgement")}
                            onClick={() => acknowledgementContract()}
                        >
                            <span>{t("Acknowledgement")}</span>
                        </Button>
                    </>
                );
            }
            return <></>;
        case CONTRACT_REQUEST_LIST_STATUS.COMPLETED:
            if (contractData?.contractCreator) {
                return (
                    <>
                        <Button
                            color="danger"
                            className="mr-3"
                            type="button"
                            label={t("Terminate")}
                            onClick={() => setDisplayTerminateReasonDialog(true)}
                        >
                            <span>{t("Terminate")}</span>
                        </Button>
                    </>
                );
            }
            return <></>;
        case CONTRACT_REQUEST_LIST_STATUS.TERMINATED:
            return <></>;
        default:
            return (
                <>
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
                        disabled={isESign}
                    >
                        {t("SaveAsDraft")}
                    </Button>
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
                        disabled={isESign}
                    >
                        {t("Submit")}
                    </Button>
                </>
            );
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
