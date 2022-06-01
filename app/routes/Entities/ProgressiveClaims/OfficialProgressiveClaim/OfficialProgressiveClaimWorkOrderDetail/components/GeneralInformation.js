import React from "react";
import { useTranslation } from "react-i18next";
import {
    Row, Card, CardBody, CardHeader, Col
} from "components";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import useToast from "routes/hooks/useToast";
import SelectInputApproval from "routes/Entities/ProgressiveClaims/components/SelectInputApproval";
import { HorizontalInput } from "../../../components";

import { DPC_STATUS } from "../../Helper";

const GeneralInformation = React.memo(
    ({
        values,
        errors,
        touched,
        approvalRoutes = [],
        draftClaimDetail = {},
        setFieldValue,
        currentCompany = "",
        handleChange,
        isBuyer = false
    }) => {
        const { t } = useTranslation();
        const showToast = useToast();

        const checkRenderByStatus = (status) => {
            if (isBuyer && status !== DPC_STATUS.PENDING_ACKNOWLEDGEMENT) {
                return true;
            }
            return false;
        };

        const checkEditableClaimDateByStatus = (status) => {
            if (
                status === DPC_STATUS.CREATED
        || status === DPC_STATUS.RECALLED
        || status === DPC_STATUS.SENT_BACK
            ) {
                return true;
            }
            return false;
        };

        const checkEditableApprovalByStatus = (status) => {
            if (
                [
                    DPC_STATUS.PENDING_VALUATION,
                    DPC_STATUS.RECALLED,
                    DPC_STATUS.SENT_BACK,
                    DPC_STATUS.PENDING_SUBMISSION
                ].includes(status)
            ) {
                return true;
            }
            return false;
        };

        const onChangeApprovalRoute = async (e) => {
            const { value } = e.target;
            setFieldValue("approvalRouteUuid", value);
            const { companyUuid } = currentCompany;
            try {
                const response = await ApprovalMatrixManagementService.getApprovalMatrixByApprovalUuid(
                    companyUuid,
                    value
                );
                const { data } = response.data;
                const { approvalRange } = data;
                let approvalSequence = "";
                approvalRange.forEach((approval, index) => {
                    const { approvalGroups } = approval;
                    if (index === 0) {
                        approvalSequence = approvalGroups[0].group.groupName;
                    } else {
                        approvalSequence += ` > ${approvalGroups[0].group.groupName}`;
                    }
                });
                setFieldValue("approvalSequence", approvalSequence);
            } catch (error) {
                showToast(
                    "error",
                    error.response ? error.response.data.message : error.message
                );
            }
        };
        return (
            <Card className="mb-4">
                <CardHeader tag="h6">{t("General Information")}</CardHeader>
                <CardBody>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="contractType"
                                label={t("Contract Type")}
                                type="text"
                                disabled
                            />
                            <HorizontalInput
                                name="workOrderTitle"
                                label={t("Work Order Title")}
                                type="text"
                                disabled
                            />
                            <HorizontalInput
                                name="dwoDate"
                                label={t("Work Order Date")}
                                type="text"
                                disabled
                            />
                            <HorizontalInput
                                name="dateOfConfirmation"
                                label={t("Date Of Confirmation")}
                                type="text"
                                disabled
                            />
                            <HorizontalInput
                                name="remarks"
                                label={t("Remarks")}
                                type="text"
                                disabled
                            />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        );
    }
);
export default GeneralInformation;
