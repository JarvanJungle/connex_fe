import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    SelectInput,
    HorizontalInput
} from "components";

const RequestTermsComponent = (props) => {
    const {
        t, errors,
        touched,
        addresses,
        handleChange,
        values,
        onChangeDeliveryAddress,
        handleRolePermission
    } = props;

    return (
        <Card>
            <CardHeader tag="h6">
                {t("RequestTerms")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        {
                            (values.isEdit && handleRolePermission?.write)
                                ? (
                                    <SelectInput
                                        name="deliveryAddress"
                                        label={t("DeliveryAddress")}
                                        className="label-required"
                                        placeholder={t("PleaseSelectDeliveryAddress")}
                                        errors={errors.deliveryAddress}
                                        touched={touched.deliveryAddress}
                                        options={addresses}
                                        optionLabel="addressLabel"
                                        optionValue="addressLabel"
                                        onChange={(e) => {
                                            onChangeDeliveryAddress(e);
                                        }}
                                        value={values.deliveryAddress}
                                        disabled={!values.isEdit}
                                        colLabel={5}
                                        colValue={7}
                                    />
                                )
                                : (
                                    <HorizontalInput
                                        name="deliveryAddress"
                                        label={t("DeliveryAddress")}
                                        type="text"
                                        placeholder=""
                                        className="label-required"
                                        value={values.deliveryAddress}
                                        disabled
                                        colLabel={5}
                                        colValue={7}
                                    />
                                )
                        }
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
                            className="label-required"
                            value={values.deliveryDate}
                            disabled={!values.isEdit}
                            colLabel={5}
                            colValue={7}
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
                            value={values.note}
                            disabled={!values.isEdit}
                            colLabel={5}
                            colValue={7}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default RequestTermsComponent;
