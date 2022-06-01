import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    HorizontalInput
} from "components";

const TransferStatus = (props) => {
    const {
        t,
        values,
        touched,
        errors
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("TransferStatus")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="transferStatus"
                            label={t("TransferStatus")}
                            type="text"
                            value={values.transferStatus?.replace("_", " ")}
                            placeholder=""
                            errors={errors.transferStatus}
                            touched={touched.transferStatus}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="bankReply"
                            label={t("BankReply")}
                            type="textarea"
                            maxLength={500}
                            value={values.bankReply}
                            placeholder=""
                            errors={errors.bankReply}
                            touched={touched.bankReply}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="paymentReleaseDate"
                            label={t("PaymentReleaseDate")}
                            type="date"
                            value={values.paymentReleaseDate}
                            placeholder=""
                            errors={errors.paymentReleaseDate}
                            touched={touched.paymentReleaseDate}
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default TransferStatus;
