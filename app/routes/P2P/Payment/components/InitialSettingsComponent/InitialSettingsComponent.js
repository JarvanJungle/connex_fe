import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    HorizontalInput
} from "components";

const InitialSettingsComponent = (props) => {
    const {
        t, values, errors,
        touched
    } = props;
    return (
        <>
            <Card className="mb-3">
                <CardHeader tag="h6">
                    {t("InitialSettings")}
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="paymentNumber"
                                label={t("Payment No.")}
                                type="text"
                                value={values.paymentNumber}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="paymentReferenceNo"
                                label={t("Payment Reference No.")}
                                type="text"
                                placeholder="Enter Payment Reference No."
                                errors={errors.paymentReferenceNo}
                                touched={touched.paymentReferenceNo}
                                className="label-required"
                                value={values.paymentReferenceNo}
                                disabled={!values.isEdit}
                            />
                        </Col>
                    </Row>
                </CardBody>
                <CardBody>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="currency"
                                label={t("Currency")}
                                type="text"
                                value={values.currencyName ? `${values.currencyName} (+${values.currency})` : values.currency}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="beneficiary"
                                label={t("Beneficiary")}
                                type="text"
                                value={values.beneficiary}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="remarks"
                                label={t("Remarks")}
                                type="textarea"
                                value={values.remarks}
                                disabled={!values.isEdit}
                                maxLength={500}
                                rows={3}
                            />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </>
    );
};

export default InitialSettingsComponent;
