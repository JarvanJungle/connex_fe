import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label,
    CustomInput
} from "components";
import { SelectInput } from "routes/P2P/PurchaseRequest/components";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import useToast from "routes/hooks/useToast";
import { ErrorMessage, Field } from "formik";
import classNames from "classnames";
import SelectInputApproval from "routes/Entities/ProgressiveClaims/components/SelectInputApproval";
import { HorizontalInput } from "../../../components";

import { ACE_STATUS } from "../../Helper";

const GeneralInformation = React.memo(({
    values,
    errors,
    touched,
    approvalRoutes = [],
    draftClaimDetail = {},
    setFieldValue,
    currentCompany = "",
    handleChange,
    isBuyer = false,
    role = "Main_QS" // "ARCHITECT"
}) => {
    const { t } = useTranslation();
    // const {
    //     values,
    //     errors,
    //     touched,
    //     approvalRoutes = [],
    //     draftClaimDetail = {},
    //     setFieldValue,
    //     currentCompany = "",
    //     handleChange,
    //     isBuyer = false
    // } = props;
    const showToast = useToast();

    const checkRenderByStatus = (status) => true;

    const checkEditableClaimDateByStatus = (status) => false;

    const checkEditableApprovalByStatus = (status) => {
        if ([ACE_STATUS.PENDING_ARCHITECT_REVIEW].includes(status)) {
            return true;
        } return false;
    };

    const onChangeApprovalRoute = async (e) => {
        const { value } = e.target;
        setFieldValue("approvalRouteUuid", value);
        const { companyUuid } = currentCompany;
        try {
            const response = await ApprovalMatrixManagementService
                .getApprovalMatrixByApprovalUuid(companyUuid, value);
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
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };
    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("General Information")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contractType"
                            label={t("Contract Type")}
                            type="text"
                            disabled
                            value={values?.contractType?.replaceAll("_", " ")}
                        />
                        <HorizontalInput
                            name="workOrderTitle"
                            label={t("Work Order Title")}
                            type="text"
                            disabled
                        />
                        <HorizontalInput
                            name="paymentResponseReferenceNo"
                            label={t("Payment Response Reference No.")}
                            type="text"
                            disabled
                        />

                        <HorizontalInput
                            errors={errors.claimDate}
                            touched={touched.claimDate}
                            name="claimDate"
                            label={t("Claim Date")}
                            type="date"
                            className="label-required"
                            disabled={!checkEditableClaimDateByStatus(draftClaimDetail.aceStatus)}
                        />
                        <HorizontalInput
                            name="invoiceStatus"
                            label={t("Invoice Status")}
                            type="text"
                            disabled={!checkEditableClaimDateByStatus(draftClaimDetail.aceStatus)}
                        />
                        {
                            checkRenderByStatus(draftClaimDetail.aceStatus)
                            && (
                                <>
                                    {
                                        checkEditableApprovalByStatus(draftClaimDetail.aceStatus)
                                            ? (
                                                <SelectInputApproval
                                                    id="approvalRouteUuid"
                                                    name="approvalRouteUuid"
                                                    label={t("ApprovalRoute")}
                                                    className="label-required"
                                                    placeholder={t("PleaseSelectApprovalRoute")}
                                                    errors={errors.approvalRouteUuid}
                                                    touched={touched.approvalRouteUuid}
                                                    options={approvalRoutes}
                                                    optionLabel="approvalName"
                                                    optionValue="uuid"
                                                    onChange={(e) => {
                                                        onChangeApprovalRoute(e);
                                                        handleChange(e);
                                                    }}
                                                    value={values.approvalRouteUuid}
                                                    messageValidate={t("PleaseSelectValidApprovalRoute")}
                                                // disabled={!checkEditableApprovalByStatus(draftClaimDetail.daceStatus)}
                                                />
                                            ) : (
                                                <HorizontalInput
                                                    name="approvalRouteName"
                                                    label={t("ApprovalRoute")}
                                                    type="text"
                                                    placeholder=""
                                                    disabled
                                                />
                                            )
                                    }
                                    <HorizontalInput
                                        name="approvalRouteSequence"
                                        label={t("ApprovalSequence")}
                                        type="text"
                                        placeholder=""
                                        errors={errors.approvalRouteSequence}
                                        touched={touched.approvalRouteSequence}
                                        disabled
                                    />
                                </>
                            )
                        }
                        {
                            <Row>
                                <Col md={4} lg={4} className="d-flex">
                                    <Label className="p-0">{t("eSign Routing?*")}</Label>
                                </Col>
                                <Col md={8} lg={8}>
                                    <CustomInput
                                        type="checkbox"
                                        id="eSignRoutingCheckbox"
                                        name="isESignRouting"
                                        errors={errors.isESignRouting}
                                        touched={touched.isESignRouting}
                                        checked={values.isESignRouting}
                                        onChange={(e) => setFieldValue("isESignRouting", e.target.checked)}
                                    // disabled
                                    />
                                </Col>
                            </Row>
                        }
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
});
export default GeneralInformation;
