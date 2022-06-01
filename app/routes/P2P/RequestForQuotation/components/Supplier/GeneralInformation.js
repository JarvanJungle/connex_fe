import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput } from "components";

const GeneralInformation = (props) => {
    const {
        t, errors,
        touched,
        values,
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
                            placeholder=""
                            type="textarea"
                            rows={1}
                            className="label-required"
                            errors={errors.rfqTitle}
                            touched={touched.rfqTitle}
                            loading={loading}
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
                            value={values.procurementType}
                            loading={loading}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="requester"
                            label={t("SentBy")}
                            type="text"
                            placeholder=""
                            errors={errors.requester}
                            touched={touched.requester}
                            value={values.requester}
                            loading={loading}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="submittedDate"
                            label={t("SentOn")}
                            type="text"
                            placeholder=""
                            errors={errors.submittedDate}
                            touched={touched.submittedDate}
                            value={values.submittedDate}
                            disabled
                            className="mb-0"
                            loading={loading}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default GeneralInformation;
