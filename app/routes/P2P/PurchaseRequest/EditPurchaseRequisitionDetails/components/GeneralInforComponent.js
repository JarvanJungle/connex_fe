import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput, SelectInput } from "../../components";

const GeneralInforComponent = (props) => {
    const {
        t, errors,
        touched,
        procurementTypes,
        approvalRoutes,
        handleChange,
        values,
        onChangeApprovalRoute,
        disabled
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("GeneralInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="prTitle"
                            label={t("PRTitle")}
                            type="textarea"
                            rows={1}
                            placeholder={t("EnterPRTitle")}
                            className="label-required"
                            errors={errors.prTitle}
                            touched={touched.prTitle}
                            disabled={disabled}
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
                            disabled={disabled}
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
                            onChange={(e) => onChangeApprovalRoute(e)}
                            value={values.approvalRouteUuid}
                            disabled={disabled || !values.approvalConfig}
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
                            value={values.approvalSequence}
                            errors={errors.approvalSequence}
                            touched={touched.approvalSequence}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="requester"
                            label={t("Requester")}
                            type="text"
                            placeholder=""
                            value={values.requester}
                            errors={errors.requester}
                            touched={touched.requester}
                            disabled
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
                            value={values.submittedDate}
                            errors={errors.submittedDate}
                            touched={touched.submittedDate}
                            className="mb-0"
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default GeneralInforComponent;
