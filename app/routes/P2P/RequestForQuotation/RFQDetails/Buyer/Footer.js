import React from "react";
import StickyFooter from "components/StickyFooter";
import { Row, Button } from "components";
import { RFQ_CONSTANTS } from "../../helper";
import { shortlistFormSchema, reopenFormSchema, rfqFormSchema } from "../../helper";

const Footer = React.memo(({
    t,
    showToast,
    rfqDetails,
    dirty,
    errors,
    values,
    setFieldValue,
    onBackPressHandler,
    loading,
    rfqPermission,
    modalCancelRef,
    modalRef,
    onSavePressHandler,
    onSendToVendorsPressHandler,
    onUpdatePressHandler,
    onReOpenRFQPressHandler,
    onShortlistRFQPressHandler,
    onApprovePressHandler,
    onConvertToPOPressHandler,
    setValidationSchema,
    setShowReason,
    approvalConfig,
    handleSubmit,
    isSubmitting
}) => (
    <StickyFooter>
        <Row className="mx-0 px-3 justify-content-between">
            {loading && (<></>)}
            {!loading && (
                <>
                    <Button
                        color="secondary"
                        onClick={() => onBackPressHandler()}
                    >
                        {t("Back")}
                    </Button>
                    {rfqDetails.rfqStatus === RFQ_CONSTANTS.PENDING_ISSUE
                        && (rfqPermission?.read && rfqPermission?.write)
                        && (
                            <Row className="mx-0">
                                <Button
                                    color="danger"
                                    className="mr-3"
                                    type="submit"
                                    onClick={
                                        () => modalCancelRef?.current?.toggleModal()
                                    }
                                >
                                    {t("Cancel")}
                                </Button>
                                <Button
                                    color="secondary"
                                    className="mr-3"
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={
                                        () => {
                                            handleSubmit();
                                            if (!dirty || (dirty && Object.keys(errors).length)) {
                                                showToast("error", "Validation error, please check your input.");
                                                return;
                                            }

                                            onSavePressHandler(values);
                                        }
                                    }
                                >
                                    {t("SaveAsDraft")}
                                </Button>
                                <Button
                                    color="primary"
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={
                                        () => {
                                            handleSubmit();

                                            if (!dirty || (dirty && Object.keys(errors).length)) {
                                                showToast("error", "Validation error, please check your input.");
                                                return;
                                            }

                                            onSendToVendorsPressHandler(values);
                                        }
                                    }
                                >
                                    {t("SendToVendors")}
                                </Button>
                            </Row>
                        )}
                    {(rfqDetails.rfqStatus === RFQ_CONSTANTS.PENDING_QUOTATION
                    || rfqDetails.rfqStatus === RFQ_CONSTANTS.QUOTATION_IN_PROGRESS)
                        && (rfqPermission?.read && rfqPermission?.write)
                        && rfqDetails.rfqCreator === true
                        && (
                            <Row className="mx-0">
                                <Button
                                    color="warning"
                                    className="mr-3"
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={
                                        async () => {
                                            handleSubmit();

                                            if (!dirty || (dirty && Object.keys(errors).length)) {
                                                showToast("error", "Validation error, please check your input.");
                                                setValidationSchema(rfqFormSchema);
                                                return;
                                            }

                                            const valid = await rfqFormSchema.isValid(values);
                                            if (!valid) {
                                                showToast("error", "Validation error, please check your input.");
                                                setValidationSchema(rfqFormSchema);
                                                return;
                                            }

                                            onUpdatePressHandler(values);
                                        }
                                    }
                                >
                                    {t("UpdateRFQ")}
                                </Button>
                                <Button
                                    color="danger"
                                    className=""
                                    type="submit"
                                    onClick={() => modalRef?.current?.toggleModal()}
                                >
                                    {t("CloseRFQ")}
                                </Button>
                            </Row>
                        )}
                    {rfqDetails.rfqStatus === RFQ_CONSTANTS.CLOSED
                        && (rfqPermission?.read && rfqPermission?.write)
                        && (
                            <Row className="mx-0">
                                <Button
                                    color="primary"
                                    type="button"
                                    className="mr-2"
                                    disabled={isSubmitting}
                                    onClick={
                                        () => {
                                            handleSubmit();

                                            const today = new Date();
                                            const date = new Date(values.dueDate);
                                            if (!dirty || (dirty && Object.keys(errors).length)) {
                                                showToast("error", "Validation error, please check your input.");
                                                setValidationSchema(reopenFormSchema);
                                                return;
                                            }
                                            if (date.getTime() - today.getTime() < 0) {
                                                showToast("error", "Validation error, please check your input.");
                                                setValidationSchema(reopenFormSchema);
                                                return;
                                            }

                                            onReOpenRFQPressHandler(values);
                                        }
                                    }
                                >
                                    {t("ReopenRFQ")}
                                </Button>
                                <Button
                                    color="primary"
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={
                                        () => {
                                            handleSubmit();

                                            if (!dirty || (dirty && Object.keys(errors).length)) {
                                                showToast("error", "Validation error, please check your input.");
                                                setValidationSchema(shortlistFormSchema);
                                                return;
                                            }
                                            if (approvalConfig && !values.approvalRouteUuid) {
                                                showToast("error", "Validation error, please check your input.");
                                                setValidationSchema(shortlistFormSchema);
                                                return;
                                            }

                                            onShortlistRFQPressHandler(values, setFieldValue);
                                        }
                                    }
                                >
                                    {t("ShortlistVendors")}
                                </Button>
                            </Row>
                        )}
                    {rfqDetails.rfqStatus === RFQ_CONSTANTS.PENDING_APPROVAL
                        && rfqDetails.rfqCreator === true && (
                        <Row className="mx-0">
                            <Button
                                color="warning"
                                type="submit"
                                onClick={() => setShowReason(true)}
                            >
                                {t("Recall")}
                            </Button>
                        </Row>
                    )}
                    {rfqDetails.rfqStatus === RFQ_CONSTANTS.PENDING_APPROVAL
                        && rfqDetails.approverRole === true && (
                        <Row className="mx-0">
                            <Button
                                color="warning"
                                type="submit"
                                className="mr-3"
                                onClick={() => setShowReason(true)}
                            >
                                {t("SendBack")}
                            </Button>
                            <Button
                                color="primary"
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => {
                                    handleSubmit();
                                    onApprovePressHandler();
                                }}
                            >
                                {t("Approve")}
                            </Button>
                        </Row>
                    )}
                    {(rfqDetails.rfqStatus === RFQ_CONSTANTS.RECALLED
                    || rfqDetails.rfqStatus === RFQ_CONSTANTS.SENT_BACK)
                        && (rfqPermission?.read && rfqPermission?.write)
                        && (
                            <Row className="mx-0">
                                <Button
                                    color="primary"
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => {
                                        handleSubmit();
                                        onShortlistRFQPressHandler(values);
                                    }}
                                >
                                    {t("SubmitForApproval")}
                                </Button>
                            </Row>
                        )}
                    {(rfqDetails.rfqStatus === RFQ_CONSTANTS.SHORTLISTED
                        && rfqDetails.rfqType === "One-off")
                        && (rfqPermission?.read && rfqPermission?.write)
                        && (
                            <Row className="mx-0">
                                <Button
                                    color="primary"
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => {
                                        handleSubmit();
                                        onConvertToPOPressHandler(setFieldValue);
                                    }}
                                >
                                    {t("ConvertToOrder")}
                                </Button>
                            </Row>
                        )}
                    {(rfqDetails.rfqStatus === RFQ_CONSTANTS.SHORTLISTED
                        && rfqDetails.rfqType === "Contract")
                        && (rfqPermission?.read && rfqPermission?.write)
                        && (
                            <Row className="mx-0">
                                <Button
                                    color="primary"
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => {
                                        handleSubmit();
                                        onConvertToPOPressHandler(setFieldValue);
                                    }}
                                >
                                    {t("ConvertToContract")}
                                </Button>
                            </Row>
                        )}
                </>
            )}
        </Row>
    </StickyFooter>
));

export default Footer;
