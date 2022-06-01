import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput, SelectInput } from "../../components";

const RequestTermsComponent = (props) => {
    const {
        t, errors,
        touched,
        addresses,
        handleChange,
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
                        <SelectInput
                            name="deliveryAddress"
                            label={t("DeliveryAddress")}
                            className="label-required"
                            placeholder={t("PleaseSelectDeliveryAddress")}
                            errors={errors.deliveryAddress}
                            touched={touched.deliveryAddress}
                            options={addresses}
                            optionLabel="addressLabel"
                            optionValue="uuid"
                            onChange={handleChange}
                            value={values.deliveryAddress}
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
                            onChange={handleChange}
                            value={values.deliveryDate}
                            errors={errors.deliveryDate}
                            touched={touched.deliveryDate}
                            className="label-required"
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
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default RequestTermsComponent;
