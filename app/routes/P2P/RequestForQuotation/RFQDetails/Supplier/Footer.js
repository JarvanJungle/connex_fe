import React, {useMemo} from "react";
import StickyFooter from "components/StickyFooter";
import { Row, Button } from "components";
import { useAuthenticated } from "routes/hooks";
import { RFQ_CONSTANTS } from "../../helper";

const Footer = (props) => {
    const {
        t,
        showToast,
        rfqDetails,
        dirty,
        errors,
        values,
        onSubmitQuotePressHandler,
        onUpdateQuotePressHandler,
        onBackPressHandler,
        loading,
        handleSubmit,
        isSubmitting
    } = props;

    const isAuthenticated = useAuthenticated();

    const canUnconnectedSupplierUpdate = useMemo(
        () => rfqDetails?.rfqStatus === RFQ_CONSTANTS.QUOTATION_IN_PROGRESS
            && rfqDetails?.quoteSubmitted
            && !isAuthenticated,
        [rfqDetails, isAuthenticated]
    );

    return (
        <StickyFooter>
            <Row className="mx-0 px-3 justify-content-between">
                {loading && (<></>)}
                {!loading && (
                    <>
                        {isAuthenticated ? (
                            <Button
                                color="secondary"
                                onClick={onBackPressHandler}
                            >
                                {t("Back")}
                            </Button>
                        ) : <div />}
                        {(
                            (rfqDetails?.rfqStatus === RFQ_CONSTANTS.PENDING_QUOTATION
                                && !rfqDetails?.quoteSubmitted)
                            || (rfqDetails?.rfqStatus === RFQ_CONSTANTS.QUOTATION_IN_PROGRESS
                                && !rfqDetails?.quoteSubmitted))
                            && (
                                <Row className="mx-0">
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

                                                onSubmitQuotePressHandler(values);
                                            }
                                        }
                                    >
                                        {t("SubmitQuote")}
                                    </Button>
                                </Row>
                            )}
                        {rfqDetails?.rfqStatus === RFQ_CONSTANTS.QUOTATION_IN_PROGRESS
                            && rfqDetails?.quoteSubmitted && isAuthenticated && (
                            <Row className="mx-0">
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

                                            onUpdateQuotePressHandler(values);
                                        }
                                    }
                                >
                                    {t("UpdateQuote")}
                                </Button>
                            </Row>
                        )}
                        {/* Unconnected supplier do update (Same as submit) */}
                        {canUnconnectedSupplierUpdate && (
                            <Row className="mx-0">
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

                                            onSubmitQuotePressHandler(values);
                                        }
                                    }
                                >
                                    {t("UpdateQuote")}
                                </Button>
                            </Row>
                        )}
                    </>
                )}
            </Row>
        </StickyFooter>
    );
};

export default Footer;
