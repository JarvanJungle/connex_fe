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
    let {
        t, errors,
        touched,
        addresses,
        handleChange,
        values
    } = props;
    values.address = {
        addressLabel: "l1",
        addressFirstLine: "addressline1",
        addressSecondLine: "addressline2",
        city: "MYD",
        state: "TN",
        country: "Albania",
        postalCode: "6089568",
        uuid: "c627bf44-4b54-4399-a902-630908cf68cc"
    }
    values.deliveryDate = "2022-05-31T07:00:00Z"

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
                            value={values.address.uuid}
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
                            value={values.deliveryDate}
                            errors={errors.deliveryDate}
                            touched={touched.deliveryDate}
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

export default RequestTermsComponent;
