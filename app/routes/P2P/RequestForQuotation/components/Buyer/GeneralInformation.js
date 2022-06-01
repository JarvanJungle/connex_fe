import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput, SelectInput } from "components";
import { RFQ_CONSTANTS } from "../../helper";

const GeneralInformation = (props) => {
    const {
        t, errors,
        touched,
        procurementTypes,
        handleChange,
        values,
        disabled,
        isConvertPR,
        approvalRoutes,
        rfqPermission,
        loading
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6" loading={loading}>
                {t("GeneralInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="rfqTitle"
                            label={t("RFQTitle")}
                            type="textarea"
                            rows={1}
                            placeholder={t("PleaseEnterRFQTitle")}
                            className="label-required"
                            errors={errors.rfqTitle}
                            touched={touched.rfqTitle}
                            disabled={disabled}
                            loading={loading}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <SelectInput
                            name="procurementType"
                            label={t("ProcurementType")}
                            className="label-required"
                            placeholder={t("PleaseSelectProcurementType")}
                            errors={errors.procurementType}
                            touched={touched.procurementType}
                            options={procurementTypes}
                            optionLabel="label"
                            optionValue="value"
                            onChange={handleChange}
                            value={values.procurementType}
                            disabled={disabled || isConvertPR}
                            loading={loading}
                        />
                    </Col>
                </Row>
                {(values.rfqStatus === RFQ_CONSTANTS.CLOSED
                    || values.rfqStatus === RFQ_CONSTANTS.RECALLED
                    || values.rfqStatus === RFQ_CONSTANTS.PENDING_APPROVAL.replaceAll("_", " ")
                    || values.rfqStatus === RFQ_CONSTANTS.SHORTLISTED
                    || values.rfqStatus === RFQ_CONSTANTS.SENT_BACK.replaceAll("_", " ")
                ) && (
                    <>
                        <Row>
                            <Col xs={12}>
                                {(values.rfqStatus === RFQ_CONSTANTS.CLOSED
                                    || values.rfqStatus === RFQ_CONSTANTS.RECALLED
                                    || values.rfqStatus === RFQ_CONSTANTS.SENT_BACK.replaceAll("_", " ")
                                )
                                    && (
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
                                            onChange={handleChange}
                                            value={values.approvalRouteUuid}
                                            disabled={
                                                (rfqPermission?.read
                                                    && !rfqPermission?.write)
                                                || !values?.approvalConfig
                                            }
                                            loading={loading}
                                        />
                                    )}
                                {!(values.rfqStatus === RFQ_CONSTANTS.CLOSED
                                    || values.rfqStatus === RFQ_CONSTANTS.RECALLED
                                    || values.rfqStatus === RFQ_CONSTANTS.SENT_BACK.replaceAll("_", " ")
                                )
                                    && (
                                        <HorizontalInput
                                            name="approvalRouteName"
                                            label={t("ApprovalRoute")}
                                            className="label-required"
                                            type="text"
                                            placeholder=""
                                            errors={errors.approvalRouteName}
                                            touched={touched.approvalRouteName}
                                            disabled
                                            value={values.approvalRouteName}
                                            loading={loading}
                                        />
                                    )}
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
                                    value={values.approvalSequence}
                                    loading={loading}
                                />
                            </Col>
                        </Row>
                    </>
                )}
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="requester"
                            label={t("Requester")}
                            type="text"
                            placeholder=""
                            errors={errors.requester}
                            touched={touched.requester}
                            value={values.requester}
                            disabled
                            loading={loading}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="submittedDate"
                            label={t("SubmittedDate")}
                            type="text"
                            placeholder=""
                            errors={errors.submittedDate}
                            touched={touched.submittedDate}
                            disabled
                            className="mb-0"
                            value={values.submittedDate}
                            loading={loading}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default GeneralInformation;
