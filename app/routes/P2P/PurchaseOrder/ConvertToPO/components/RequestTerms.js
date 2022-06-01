import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput } from "components";

const RequestTerms = (props) => {
    const {
        t, errors,
        touched,
        values
    } = props;

    return (
        <Card>
            <CardHeader tag="h6">
                {t("RequestTerms")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="deliveryAddress"
                            label={t("DeliveryAddress")}
                            type="text"
                            placeholder=""
                            errors={errors.deliveryAddress}
                            touched={touched.deliveryAddress}
                            value={values.deliveryAddress}
                            className="label-required"
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="deliveryDate"
                            label={t("DeliveryDate")}
                            type="date"
                            placeholder=""
                            errors={errors.deliveryDate}
                            touched={touched.deliveryDate}
                            value={values.deliveryDate}
                            className="label-required"
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="note"
                            label={t("Note")}
                            type="textarea"
                            maxLength={3000}
                            placeholder={t("EnterNote")}
                            errors={errors.note}
                            rows={3}
                            touched={touched.note}
                            className="mb-0"
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default RequestTerms;
