import React from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Row
} from "components";
import { HorizontalInput, SelectInput } from "routes/P2P/PurchaseRequest/components";
import { CONTRACT_TYPE_LIST } from "helper/constantsDefined";

const DWRGeneralInformation = (props) => {
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
                            <HorizontalInput
                                name="workReferenceNumber"
                                label={t("WorkReferenceNo")}
                                type="text"
                                errors={errors.workReferenceNumber}
                                touched={touched.workReferenceNumber}
                                onChange={handleChange}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="workRequisitionTitle"
                                label={t("WorkReferenceTitle")}
                                type="text"
                                className="label-required"
                                errors={errors.workRequisitionTitle}
                                touched={touched.workRequisitionTitle}
                                onChange={handleChange}
                                disabled
                            />
                        </Col>
                    </Row>
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
                            <SelectInput
                                name="approvalRouteUuid"
                                label={t("ApprovalRoute")}
                                className="label-required"
                                placeholder={t("PleaseSelectApprovalRoute")}
                                errors={errors.approvalRouteUuid}
                                touched={touched.approvalRouteUuid}
                                options={approvalRoutes}
                                optionLabel="approvalName"
                                optionValue="uuid"
                                onChange={(e) => onChangeApprovalRoute(e, setFieldValue)}
                                value={values.approvalRouteUuid}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="approvalSequence"
                                label={t("ApprovalSequence")}
                                type="text"
                                placeholder=""
                                errors={errors.approvalSequence}
                                touched={touched.approvalSequence}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="dwrDate"
                                label={t("WorkRequisitionDate")}
                                type="date"
                                placeholder=""
                                errors={errors.dwrDate}
                                touched={touched.dwrDate}
                                className="label-required"
                                disabled
                            />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </>
    )
};

export default DWRGeneralInformation;