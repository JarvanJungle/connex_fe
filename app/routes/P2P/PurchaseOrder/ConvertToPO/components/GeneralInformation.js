import React from "react";
import {
    Row, Card, CardBody,
    CardHeader, Col
} from "components";
import { FEATURE } from "helper/constantsDefined";
import { HorizontalInput } from "../../components";

const GeneralInformation = ({
    t, errors, touched, convertFrom
}) => (
    <Card className="mb-4">
        <CardHeader tag="h6">
            {t("GeneralInformation")}
        </CardHeader>
        <CardBody>
            <Row>
                <Col xs={12}>
                    <HorizontalInput
                        name="title"
                        label={
                            convertFrom === FEATURE.PR
                                ? t("PRTitle")
                                : t("PPRTitle")
                        }
                        type="textarea"
                        rows={1}
                        placeholder=""
                        className="label-required"
                        errors={errors.title}
                        touched={touched.title}
                        disabled
                    />
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <HorizontalInput
                        name="procurementType"
                        label={t("ProcurementType")}
                        type="text"
                        placeholder=""
                        className="label-required"
                        errors={errors.procurementType}
                        touched={touched.procurementType}
                        disabled
                    />
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <HorizontalInput
                        name="approvalRouteUuid"
                        label={t("ApprovalRoute")}
                        type="text"
                        placeholder=""
                        className="label-required"
                        errors={errors.approvalRouteUuid}
                        touched={touched.approvalRouteUuid}
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
                        name="requester"
                        label={t("Requester")}
                        type="text"
                        placeholder=""
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

export default GeneralInformation;
