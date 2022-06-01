import React from "react";
import {
    Row, Card, CardBody,
    CardHeader, Col, Label, SelectInput
} from "components";
import classNames from "classnames";
import { Field, ErrorMessage } from "formik";
import HorizontalInput from "./HorizontalInput";

const RequestTerms = (props) => {
    const {
        t, errors, touched,
        isBuyer, poStatus,
        prCreator, setDirty,
        setFieldValue, supplierAddress, values
    } = props;

    const onChangeAddress = (e) => {
        const { value } = e.target;
        const address = supplierAddress.find((item) => item.uuid === value);
        setFieldValue("addressUuid", value);
        setFieldValue("addressLabel", address.addressLabel);
        setFieldValue("addressFirstLine", address.addressFirstLine);
        setFieldValue("addressSecondLine", address.addressSecondLine);
        setFieldValue("city", address.city);
        setFieldValue("state", address.state);
        setFieldValue("country", address.country);
        setFieldValue("postalCode", address.postalCode);
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
                {isBuyer && (
                    <>
                        {/* <HorizontalInput
                            name="addressLabel"
                            label={t("SupplierBillingAddress")}
                            type="text"
                            placeholder=""
                            errors={errors.addressLabel}
                            touched={touched.addressLabel}
                            disabled={!["PENDING_REVIEW", "SENT_BACK", "RECALLED"].includes(poStatus) || !prCreator}
                        /> */}
                        <SelectInput
                            name="addressUuid"
                            label={t("SupplierBillingAddress")}
                            placeholder={t("PleaseSelectAddress")}
                            errors={errors.addressLabel}
                            touched={touched.addressLabel}
                            options={supplierAddress}
                            optionLabel="addressLabel"
                            optionValue="uuid"
                            onChange={(e) => onChangeAddress(e)}
                            value={values.addressUuid}
                            disabled={!["PENDING_REVIEW", "SENT_BACK", "RECALLED"].includes(poStatus) || !prCreator}
                        />
                        <HorizontalInput
                            name="addressFirstLine"
                            label={t("AddressLine1")}
                            type="text"
                            placeholder=""
                            errors={errors.addressFirstLine}
                            touched={touched.addressFirstLine}
                            disabled
                        />
                        <HorizontalInput
                            name="addressSecondLine"
                            label={t("AddressLine2")}
                            type="text"
                            placeholder=""
                            errors={errors.addressSecondLine}
                            touched={touched.addressSecondLine}
                            disabled
                        />
                        <HorizontalInput
                            name="city"
                            label={t("City")}
                            type="text"
                            placeholder=""
                            errors={errors.city}
                            touched={touched.city}
                            disabled
                        />
                        <HorizontalInput
                            name="state"
                            label={t("StateProvince")}
                            type="text"
                            placeholder=""
                            errors={errors.state}
                            touched={touched.state}
                            disabled
                        />
                        <HorizontalInput
                            name="country"
                            label={t("Country")}
                            type="text"
                            placeholder=""
                            errors={errors.country}
                            touched={touched.country}
                            disabled
                        />
                        <HorizontalInput
                            name="postalCode"
                            label={t("ZipCode")}
                            type="text"
                            placeholder=""
                            errors={errors.postalCode}
                            touched={touched.postalCode}
                            disabled
                        />
                    </>
                )}
                <Row className="form-group mb-0">
                    <Col md={4} lg={4}>
                        <Label className="p-0">{t("Note")}</Label>
                    </Col>
                    <Col md={8} lg={8}>
                        <Field name="remarks">
                            {({ field }) => (
                                <textarea
                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                    {...field}
                                    className={
                                        classNames(
                                            "form-control",
                                            { "is-invalid": errors.remarks && touched.remarks }
                                        )
                                    }
                                    maxLength={3000}
                                    rows={5}
                                    placeholder={t("EnterNote")}
                                    disabled={!["PENDING_REVIEW", "SENT_BACK", "RECALLED"].includes(poStatus) || !prCreator}
                                    onChange={(evt) => {
                                        setDirty();
                                        setFieldValue("remarks", evt.target.value);
                                    }}
                                />
                            )}
                        </Field>
                        <ErrorMessage name="remarks" component="div" className="invalid-feedback" />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default RequestTerms;
