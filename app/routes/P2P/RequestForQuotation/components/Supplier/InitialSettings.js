/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import {
    Row, Card, CardBody, CardHeader, Col, HorizontalInput, Label
} from "components";
import { Field, ErrorMessage } from "formik";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";

const InitialSettings = (props) => {
    const {
        t,
        errors, touched,
        setFieldValue,
        currencies,
        values,
        disabled,
        loading,
        gridApi,
        rfqToken
    } = props;

    const onChangeCurrency = (event) => {
        const { value } = event.target;
        setFieldValue("currencyCode", value);
        const currency = currencies.find(
            (item) => item.currencyCode === value
        );
        gridApi.forEachNode((node) => {
            if (node?.data && node?.data?.itemCode.length === 1) {
                node.setDataValue("sourceCurrency", currency);
            }
        });
    };

    return (
        <Card className="mb-4">
            <CardHeader tag="h6" loading={loading}>
                {t("InitialSettings")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="rfqNumber"
                            errors={errors.rfqNumber}
                            touched={touched.rfqNumber}
                            value={values.rfqNumber}
                            label={t("RFQNo")}
                            type="text"
                            loading={loading}
                            disabled
                        />
                    </Col>
                </Row>

                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="rfqStatus"
                            errors={errors.rfqStatus}
                            touched={touched.rfqStatus}
                            value={values.rfqStatus}
                            label={t("Status")}
                            type="text"
                            loading={loading}
                            disabled
                        />
                    </Col>
                </Row>

                {(disabled || rfqToken) && (
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="currencyCode"
                                errors={errors.currencyCode}
                                touched={touched.currencyCode}
                                value={
                                    values.currencyName
                                        ? `${values.currencyName} (+${values.currencyCode})`
                                        : ""
                                }
                                className="label-required"
                                label={t("Currency")}
                                type="text"
                                loading={loading}
                                disabled
                            />
                        </Col>
                    </Row>
                )}

                {(!disabled && !rfqToken) && (
                    <Row className="label-required form-group">
                        <Col md={4} lg={4}>
                            {!loading && (<Label className="p-0">{t("Currency")}</Label>)}
                            {loading && (<div className="phl-col-6" />)}
                        </Col>
                        <Col md={8} lg={8}>
                            {!loading && (
                                <>
                                    <Field name="currencyCode">
                                        {({ field }) => (
                                            <select
                                                {...field}
                                                className={classNames(
                                                    "form-control",
                                                    { "is-invalid": errors.currencyCode && touched.currencyCode }
                                                )}
                                                disabled={String(values.project) === "true" || disabled}
                                                onChange={onChangeCurrency}
                                                value={values.currencyCode}
                                            >
                                                <option value="" hidden defaultValue>{t("PleaseSelectACurrency")}</option>
                                                {currencies
                                                    .map((option) => (
                                                        <option
                                                            key={uuidv4()}
                                                            value={option.currencyCode}
                                                        >
                                                            {`${option.currencyName} (+${option.currencyCode})`}
                                                        </option>
                                                    ))}
                                            </select>
                                        )}
                                    </Field>
                                    <ErrorMessage name="currencyCode" component="div" className="invalid-feedback" />

                                </>
                            )}
                            {loading && (<div className="phl-col-12" />)}
                        </Col>
                    </Row>
                )}
            </CardBody>
        </Card>
    );
};

export default InitialSettings;
