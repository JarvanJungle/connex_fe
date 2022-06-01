import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label
} from "components";
import HorizontalInput from "./HorizontalInput";
import SelectInput from "./SelectInput";

const RequestTerms = (props) => {
    const {
        t, errors,
        touched,
        addresses,
        setFieldValue,
        values,
        disabled
    } = props;

    const onChangeAddress = (e) => {
        const { value } = e.target;
        const address = addresses.find((item) => item.uuid === value);
        setFieldValue("addressUuid", value);
        setFieldValue("address", address);
    };

    return (
        <Card>
            <CardHeader tag="h6">
                {t("RequestTerms")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="paymentTerms"
                            label={t("PaymentTerms")}
                            type="text"
                            placeholder=""
                            errors={errors.paymentTerms}
                            touched={touched.paymentTerms}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <SelectInput
                            name="addressUuid"
                            label={t("SupplierBillingAddress")}
                            placeholder={t("PleaseSelectAddress")}
                            errors={errors.addressUuid}
                            touched={touched.addressUuid}
                            options={addresses}
                            optionLabel="addressLabel"
                            optionValue="uuid"
                            onChange={(e) => onChangeAddress(e)}
                            value={values.addressUuid}
                            disabled={disabled}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className="form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("AddressLine1")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <input
                                    className="form-control"
                                    defaultValue={values.address.addressFirstLine}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className="form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("AddressLine2")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <input
                                    className="form-control"
                                    defaultValue={values.address.addressSecondLine}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className="form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("City")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <input
                                    className="form-control"
                                    defaultValue={values.address.city}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className="form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("StateProvince")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <input
                                    className="form-control"
                                    defaultValue={values.address.state}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className="form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("Country")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <input
                                    className="form-control"
                                    defaultValue={values.address.country}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className="form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("ZipCode")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <input
                                    className="form-control"
                                    defaultValue={values.address.postalCode}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="remarks"
                            label={t("Note")}
                            type="textarea"
                            placeholder={t("EnterNote")}
                            errors={errors.remarks}
                            rows={3}
                            touched={touched.remarks}
                            className="mb-0"
                            disabled={disabled}
                            maxLength={3000}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default RequestTerms;
