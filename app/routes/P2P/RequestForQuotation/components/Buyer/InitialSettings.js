/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import {
    Row, Card, CardBody, CardHeader, Col, HorizontalInput, Label
} from "components";
import { Field, ErrorMessage } from "formik";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";
import { Link } from "react-router-dom";
import URL_CONFIG from "services/urlConfig";

const InitialSettings = (props) => {
    const {
        t,
        errors, touched,
        currencies,
        values,
        isConvertPR,
        disabled,
        isCreate,
        setFieldValue,
        gridApi,
        loading
    } = props;

    const onChangeCurrency = (event) => {
        const { value } = event.target;
        setFieldValue("currencyCode", value);
        const currency = currencies.find(
            (item) => item.currencyCode === value
        );
        gridApi.forEachNode((node) => {
            if (node?.data) node.setDataValue("sourceCurrency", currency);
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
                            disabled
                            loading={loading}
                        />
                    </Col>
                </Row>
                {values.pprNumber && (
                    <Row>
                        <Col xs={12}>
                            <Row className="form-group">
                                <Col md={4} lg={4}>
                                    <Label className="p-0">{t("PrePurchaseRequestNo")}</Label>
                                </Col>
                                <Col md={8} lg={8}>
                                    <div
                                        className="form-control"
                                        style={{
                                            backgroundColor: "#F9FAFC"
                                        }}
                                    >
                                        <Link to={{
                                            pathname:
                                                URL_CONFIG.PPR_ROUTING.DETAIL_PRE_REQUISITIONS,
                                            search: `?uuid=${values.pprUuid}`
                                        }}
                                        >
                                            <span
                                                style={{
                                                    color: "#4472C4",
                                                    textDecoration: "underline"
                                                }}
                                            >
                                                {values.pprNumber}
                                            </span>
                                        </Link>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                )}
                {isConvertPR && values.projectCode && (
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="projectCode"
                                errors={errors.projectCode}
                                touched={touched.projectCode}
                                value={values.projectCode}
                                label={t("Project")}
                                type="text"
                                disabled
                                loading={loading}
                            />
                        </Col>
                    </Row>
                )}
                {(!isConvertPR || !isCreate) && (
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="rfqStatus"
                                errors={errors.rfqStatus}
                                touched={touched.rfqStatus}
                                value={values.rfqStatus}
                                label={t("Status")}
                                type="text"
                                disabled
                                loading={loading}
                            />
                        </Col>
                    </Row>
                )}
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
                                            className={
                                                classNames(
                                                    "form-control",
                                                    { "is-invalid": errors.currencyCode && touched.currencyCode }
                                                )
                                            }
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
            </CardBody>
        </Card>
    );
};

export default InitialSettings;
