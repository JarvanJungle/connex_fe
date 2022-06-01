import React from "react";
import StickyFooter from "components/StickyFooter";
import { Row, Button } from "components";
import { PO_STATUS } from "./helper";

const Footer = React.memo(({
    t,
    showToast,
    poDetailsStates,
    dirty,
    errors,
    values,
    permission,
    isBuyer,
    setEnableConversation,
    setPODetailsStates,
    onBackPressHandler,
    onIssuePressHandler,
    previewModalRef,
    refActionModalCancel,
    refActionModalRecall,
    onClosePressHandler,
    onSubmitPressHandler,
    onAcknowledgePressHandler,
    onApprovePressHandler,
    setShowReasonSendBack,
    setShowReasonCancel,
    setAllTouched
}) => {
    const renderButtonAction = () => {
        const { poDetails, supplierAck } = poDetailsStates;
        if (!poDetails || !permission) return (<></>);

        const {
            status, poRequester, doCreated, userInfo
        } = poDetails;

        const creatorRole = (permission?.read && permission?.write);
        const approvalRole = (permission?.read && permission?.approve);
        if (!creatorRole && !approvalRole) return (<></>);

        if (isBuyer) {
            const { approverRole, hasApproved, prCreator } = userInfo;
            if (status === PO_STATUS.PENDING_ISSUE && poRequester) {
                setEnableConversation(true);
                return (
                    <Button
                        color="primary"
                        type="submit"
                        onClick={
                            () => {
                                setAllTouched();
                                if (!dirty
                                    || (dirty && Object.keys(errors).length)) {
                                    if (errors?.approvalRouteUuid && Object.keys(errors).length === 1) {
                                        showToast("error", errors?.approvalRouteUuid);
                                        return;
                                    }
                                    showToast("error", "Validation error, please check your input.");
                                    return;
                                }
                                onIssuePressHandler(values);
                            }
                        }
                    >
                        {t("Issue")}
                    </Button>
                );
            }

            if (status === PO_STATUS.ISSUED && supplierAck !== PO_STATUS.ACKNOWLEDGED && poRequester) {
                return (
                    <Button
                        color="danger"
                        onClick={() => refActionModalCancel.current.toggleModal()}
                    >
                        {t("Cancel")}
                    </Button>
                );
            }

            if ((supplierAck === PO_STATUS.ACKNOWLEDGED
                || status === PO_STATUS.PARTIALLY_DELIVERED)
                && status !== PO_STATUS.CLOSED
                && poRequester
            ) {
                return (
                    <Button
                        color="warning"
                        onClick={() => setShowReasonCancel(true)}
                    >
                        {t("MarkCompleted")}
                    </Button>
                );
            }

            if (status === PO_STATUS.DELIVERED && poRequester) {
                return (
                    <Button
                        color="secondary"
                        onClick={() => onClosePressHandler()}
                        disabled
                    >
                        {t("MarkCompleted")}
                    </Button>
                );
            }

            if (status === PO_STATUS.PENDING_REVIEW && poRequester) {
                setEnableConversation(true);
                return (
                    <Row className="mx-0">
                        <Button
                            style={{
                                border: "1px solid #7b7b7b7b",
                                padding: "2px 8px",
                                background: "#fff",
                                height: 34
                            }}
                            className="text-secondary mr-2"
                            type="button"
                            onClick={previewModalRef?.current?.toggle}
                        >
                            {t("PreviewPO")}
                        </Button>
                        <Button
                            color="danger"
                            className="mr-2"
                            onClick={() => refActionModalCancel.current.toggleModal()}
                        >
                            {t("Cancel")}
                        </Button>
                        <Button
                            color="primary"
                            onClick={
                                () => {
                                    setAllTouched();
                                    if (!dirty
                                        || (dirty && Object.keys(errors).length)) {
                                        if (errors?.approvalRouteUuid && Object.keys(errors).length === 1) {
                                            showToast("error", errors?.approvalRouteUuid);
                                            return;
                                        }
                                        showToast("error", "Validation error, please check your input.");
                                        return;
                                    }
                                    onSubmitPressHandler(values);
                                }
                            }
                        >
                            {t("Issue")}
                        </Button>
                    </Row>
                );
            }

            if (status === PO_STATUS.PENDING_APPROVAL && poRequester) {
                return (
                    <Row className="mx-0">
                        <Button
                            color="danger"
                            className="mr-2"
                            onClick={() => refActionModalCancel.current.toggleModal()}
                        >
                            {t("Cancel")}
                        </Button>
                        <Button
                            color="warning"
                            onClick={() => refActionModalRecall.current.toggleModal()}
                        >
                            {t("Recall")}
                        </Button>
                    </Row>
                );
            }

            if (status === PO_STATUS.PENDING_APPROVAL && approverRole && !hasApproved) {
                setEnableConversation(true);
                return (
                    <Row className="mx-0">
                        <Button
                            color="danger"
                            className="mr-2"
                            type="submit"
                            onClick={() => setPODetailsStates((prevStates) => ({
                                ...prevStates,
                                showReason: true
                            }))}
                        >
                            {t("Reject")}
                        </Button>
                        <Button
                            color="warning"
                            type="submit"
                            className="mr-2"
                            onClick={() => setShowReasonSendBack(true)}
                        >
                            {t("SendBack")}
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            onClick={() => onApprovePressHandler()}
                        >
                            {t("Approve")}
                        </Button>
                    </Row>
                );
            }

            if (status === PO_STATUS.RECALLED && prCreator) {
                setEnableConversation(true);
                return (
                    <Row className="mx-0">
                        <Button
                            color="danger"
                            className="mr-2"
                            onClick={() => refActionModalCancel.current.toggleModal()}
                        >
                            {t("Cancel")}
                        </Button>
                        <Button
                            color="primary"
                            onClick={
                                () => {
                                    if (!dirty
                                        || (dirty && Object.keys(errors).length)) {
                                        if (errors?.approvalRouteUuid && Object.keys(errors).length === 1) {
                                            showToast("error", errors?.approvalRouteUuid);
                                            return;
                                        }
                                        showToast("error", "Validation error, please check your input.");
                                        return;
                                    }
                                    onSubmitPressHandler(values);
                                }
                            }
                        >
                            {t("Issue")}
                        </Button>
                    </Row>
                );
            }

            if (status === PO_STATUS.SENT_BACK && prCreator) {
                setEnableConversation(true);
                return (
                    <Row className="mx-0">
                        <Button
                            color="primary"
                            onClick={
                                () => {
                                    setAllTouched();
                                    if (!dirty
                                        || (dirty && Object.keys(errors).length)) {
                                        if (errors?.approvalRouteUuid && Object.keys(errors).length === 1) {
                                            showToast("error", errors?.approvalRouteUuid);
                                            return;
                                        }
                                        showToast("error", "Validation error, please check your input.");
                                        return;
                                    }
                                    onSubmitPressHandler(values);
                                }
                            }
                        >
                            {t("Issue")}
                        </Button>
                    </Row>
                );
            }
        }

        if (!isBuyer) {
            if (doCreated) return (<></>);
            if (status === PO_STATUS.PARTIALLY_DELIVERED || status === PO_STATUS.CANCELLED) return (<></>);
            if (status !== PO_STATUS.REJECTED && (supplierAck === PO_STATUS.VIEWED || supplierAck === PO_STATUS.NOT_VIEWED)) {
                setEnableConversation(true);
                return (
                    <div>
                        <Button
                            color="danger"
                            onClick={() => setPODetailsStates((prevStates) => ({
                                ...prevStates,
                                showReason: true
                            }))}
                            className="mr-2"
                        >
                            {t("Reject")}
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => onAcknowledgePressHandler()}
                        >
                            {t("Acknowledge")}
                        </Button>
                    </div>
                );
            }
        }

        return (<></>);
    };

    return (
        <StickyFooter>
            <Row className="mx-0 px-3 justify-content-between">
                <Button
                    color="secondary"
                    onClick={() => onBackPressHandler()}
                >
                    {t("Back")}
                </Button>
                {renderButtonAction(dirty, errors, values)}
            </Row>
        </StickyFooter>
    );
});

export default Footer;
