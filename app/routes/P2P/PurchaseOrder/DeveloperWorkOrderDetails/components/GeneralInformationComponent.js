import React from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Row
} from "components";
import HorizontalInput from "routes/P2P/PurchaseOrder/DeveloperWorkOrderDetails/components/HorizontalInput";
import { SelectInput } from "routes/P2P/PurchaseRequest/components";
import CUSTOM_CONSTANTS, { CONTRACT_TYPE_LIST, DWO_STATUSES } from "helper/constantsDefined";
import {
    convertDate2String,
    convertToLocalTime
} from "helper/utilities";

const GeneralInformationComponent = (props) => {
    const {
        t,
        values,
        touched,
        handleChange,
        dirty,
        setFieldValue,
        errors,
        approvalRoutes,
        onChangeApprovalRoute
    } = props;

    return (
        <>
            <Card className="mb-4">
                <CardHeader tag="h6">{t("GeneralInformation")}</CardHeader>
                <CardBody>
                    <Row>
                        <Col xs={12}>
                            <SelectInput
                                name="contractType"
                                label={t("ContractType")}
                                className="label-required"
                                placeholder={t("PleaseSelectContractType")}
                                errors={errors.contractType}
                                touched={touched.contractType}
                                options={CONTRACT_TYPE_LIST}
                                optionLabel="name"
                                optionValue="value"
                                onChange={handleChange}
                                value={values.contractType}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="dwoRefNumber"
                                label={t("WorkOrderReferenceNo")}
                                type="text"
                                errors={errors.dwoRefNumber}
                                touched={touched.dwoRefNumber}
                                onChange={handleChange}
                                disabled={!(values.dwoStatus === DWO_STATUSES.PENDING_ISSUE)}
                                value={values.dwoRefNumber || ""}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="dwoTitle"
                                label={t("WorkOrderReferenceTitle")}
                                type="text"
                                className="label-required"
                                errors={errors.dwoTitle}
                                touched={touched.dwoTitle}
                                value={values.dwoTitle || ""}
                                onChange={handleChange}
                                disabled={!(values.dwoStatus === DWO_STATUSES.PENDING_ISSUE)}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="dwoDate"
                                label={t("WorkOrderDate")}
                                type="text"
                                placeholder=""
                                errors={errors.dwoDate}
                                touched={touched.dwoDate}
                                value={convertToLocalTime(values.dwoDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss) || ""}
                                onChange={handleChange}
                                disabled={!(values.dwoStatus === DWO_STATUSES.PENDING_ISSUE)}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="dateOfConfirmation"
                                label={t("DateOfConfirmation")}
                                type="text"
                                placeholder=""
                                errors={errors.dateOfConfirmation}
                                touched={touched.dateOfConfirmation}
                                disabled
                                value={values.vendorAckStatus === "ACKNOWLEDGED" ? convertToLocalTime(values.dateOfConfirmation, CUSTOM_CONSTANTS.YYYYMMDDHHmmss) : ""}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="remarks"
                                label={t("Remarks")}
                                type="text"
                                placeholder=""
                                errors={errors.remarks}
                                touched={touched.remarks}
                                value={values.remarks || ""}
                                disabled={!(values.dwoStatus === DWO_STATUSES.PENDING_ISSUE)}
                            />
                        </Col>
                    </Row>

                </CardBody>
            </Card>
        </>
    );
};

export default GeneralInformationComponent;
