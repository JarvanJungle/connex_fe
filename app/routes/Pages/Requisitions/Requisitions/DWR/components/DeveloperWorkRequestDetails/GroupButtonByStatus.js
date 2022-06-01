import React from "react";
import {
    Row,
    Button
} from "components";
import useToast from "routes/hooks/useToast";
import { DWR_STATUSES, DWR_ACTIONS } from "helper/constantsDefined";
import { has } from "lodash";

const GroupButtonByStatus = (props) => {
    const {
        t,
        dirty,
        errors,
        values,
        onSavePressHandler,
        detailDataState = {}
    } = props;
    const showToast = useToast();
    
    const handleRenderByStatus = () => {
        if (detailDataState.dwrCreator
            || detailDataState.hasApproved
            || detailDataState.approverRole) {
            switch (detailDataState.dwrStatus) {
            case DWR_STATUSES.PENDING_APPROVAL:
                if (detailDataState.dwrCreator) {
                    return (
                        <>
                            <Button
                                color="danger"
                                className="mr-3"
                                type="button"
                                onClick={
                                    () => {
                                        onSavePressHandler(values, DWR_ACTIONS.CANCEL);
                                    }
                                }
                            >
                                {t("Cancel")}
                            </Button>
                            <Button
                                color="danger"
                                className=""
                                type="button"
                                onClick={
                                    () => {
                                        onSavePressHandler(values, DWR_ACTIONS.RECALL);
                                    }
                                }
                            >
                                {t("Recall")}
                            </Button>
                        </>
                    );
                }
                if (detailDataState.hasApproved || detailDataState.approverRole) {
                    return (
                        <>
                            <Button
                                color="warning"
                                className="mr-3"
                                type="button"
                                onClick={
                                    () => {
                                        onSavePressHandler(values, DWR_ACTIONS.SEND_BACK);
                                    }
                                }
                            >
                                {t("SendBack")}
                            </Button>
                            <Button
                                color="danger"
                                className="mr-3"
                                type="button"
                                onClick={
                                    () => {
                                        onSavePressHandler(values, DWR_ACTIONS.REJECT);
                                    }
                                }
                            >
                                {t("Reject")}
                            </Button>
                            <Button
                                color="primary"
                                type="button"
                                onClick={
                                    () => {
                                        onSavePressHandler(values, DWR_ACTIONS.APPROVE);
                                    }
                                }
                            >
                                {t("Approve")}
                            </Button>
                        </>
                    );
                }
                break;
            case DWR_STATUSES.PENDING_CONVERT_TO_DVWO:
                return (
                    <>
                        <Button
                            color="danger"
                            className="mr-3"
                            type="button"
                            onClick={
                                () => {
                                    onSavePressHandler(values, DWR_ACTIONS.CANCEL);
                                }
                            }
                        >
                            {t("Cancel")}
                        </Button>
                        <Button
                            color="primary"
                            type="button"
                            onClick={
                                () => {
                                    onSavePressHandler(values, DWR_ACTIONS.CONVERT_TO_DVWO);
                                }
                            }
                        >
                            {t("Convert")}
                        </Button>
                    </>
                );
            case DWR_STATUSES.SENT_BACK:
            case DWR_STATUSES.RECALLED:
                return (
                    <>
                        <Button
                            color="danger"
                            className="mr-3"
                            type="button"
                            onClick={
                                () => {
                                    onSavePressHandler(values, DWR_ACTIONS.CANCEL);
                                }
                            }
                        >
                            {t("Cancel")}
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            onClick={
                                () => {
                                    if (!dirty
                                        || (dirty && Object.keys(errors).length)) {
                                        showToast("error", "Validation error, please check your input.");
                                        return;
                                    }
                                    onSavePressHandler(values, DWR_ACTIONS.SUBMIT);
                                }
                            }
                        >
                            {t("Submit")}
                        </Button>
                    </>
                );
            case DWR_STATUSES.PENDING_SUBMISSION:
                return (
                    <>
                        <Button
                            color="danger"
                            className="mr-3"
                            type="button"
                            onClick={
                                () => {
                                    onSavePressHandler(values, DWR_ACTIONS.CANCEL);
                                }
                            }
                        >
                            {t("Cancel")}
                        </Button>
                        <Button
                            color="secondary"
                            className="mr-3"
                            type="submit"
                            onClick={
                                () => {
                                    if (!dirty
                                        || (dirty && Object.keys(errors).length)) {
                                        showToast("error", "Validation error, please check your input.");
                                        return;
                                    }
                                    onSavePressHandler(values, DWR_ACTIONS.SAVE_AS_DRAFT);
                                }
                            }
                        >
                            {t("SaveAsDraft")}
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            onClick={
                                () => {
                                    if (!dirty
                                        || (dirty && Object.keys(errors).length)) {
                                        showToast("error", "Validation error, please check your input.");
                                        return;
                                    }
                                    onSavePressHandler(values, DWR_ACTIONS.SUBMIT);
                                }
                            }
                        >
                            {t("Submit")}
                        </Button>
                    </>
                );
            default:
                break;
            }
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
