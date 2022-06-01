import React, { useEffect, useState } from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    HorizontalInput
} from "components";

const GeneralInformation = (props) => {
    const {
        t,
        disabled,
        values,
        touched,
        errors,
        currencies
    } = props;

    const [currencyValue, setCurrencyValue] = useState("");
    useEffect(() => {
        if (values.currency && currencies.length > 0) {
            const currency = currencies.find((item) => item.currencyCode === values.currency);
            setCurrencyValue(`${currency?.currencyName} (+${currency?.currencyCode})`);
        }
    }, [values.currency, currencies]);

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("GeneralInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="paymentBatchNo"
                            label={t("PaymentBatchNo")}
                            type="text"
                            value={values.paymentBatchNo}
                            placeholder=""
                            errors={errors.paymentBatchNo}
                            touched={touched.paymentBatchNo}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="referenceNumber"
                            label={t("PaymentBatchReferenceNo")}
                            type="text"
                            value={values.referenceNumber}
                            placeholder={t("PleaseEnterPaymentBatchReferenceNo")}
                            errors={errors.referenceNumber}
                            touched={touched.referenceNumber}
                            disabled={disabled}
                            className="label-required"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="currency"
                            label={t("Currency")}
                            type="text"
                            value={currencyValue}
                            placeholder=""
                            errors={errors.currency}
                            touched={touched.currency}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="createdBy"
                            label={t("CreatedBy")}
                            type="text"
                            value={values.createdBy}
                            placeholder=""
                            errors={errors.createdBy}
                            touched={touched.createdBy}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="paymentStatus"
                            label={t("PaymentStatus")}
                            type="text"
                            value={values.paymentStatus?.replace("_", " ")}
                            placeholder=""
                            errors={errors.paymentStatus}
                            touched={touched.paymentStatus}
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default GeneralInformation;
