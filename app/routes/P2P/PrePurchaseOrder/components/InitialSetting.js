/* eslint-disable max-len */
import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label
} from "components";
import { ErrorMessage, Field } from "formik";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";
import PR_ROUTES from "../../PurchaseRequest/route";
import HorizontalInput from "./HorizontalInput";

const InitialSetting = (props) => {
    const {
        t,
        values,
        errors,
        touched,
        handleChange,
        currencies
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("InitialSettings")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <Row className="form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("PurchaseRequestNo")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <div
                                    className="form-control"
                                    style={{
                                        backgroundColor: "#F9FAFC"
                                    }}
                                >
                                    {
                                        values.prNumber
                                        && (
                                            <Link to={{
                                                pathname: PR_ROUTES.PURCHASE_REQUISITION_DETAILS,
                                                search: `?uuid=${values.prUuid}`
                                            }}
                                            >
                                                <span
                                                    style={{
                                                        color: "#4472C4",
                                                        textDecoration: "underline"
                                                    }}
                                                >
                                                    {values.prNumber}
                                                </span>
                                            </Link>
                                        )
                                    }
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="prePoNumber"
                            label={t("PrePONo")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="prePoStatus"
                            label={t("Status")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
                <Row className="form-group label-required">
                    <Col md={4} lg={4}>
                        <Label className="p-0">{t("Currency")}</Label>
                    </Col>
                    <Col md={8} lg={8}>
                        <Field name="currencyCode">
                            {({ field }) => (
                                <select
                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                    {...field}
                                    className={
                                        classNames(
                                            "form-control",
                                            { "is-invalid": errors.currencyCode && touched.currencyCode }
                                        )
                                    }
                                    disabled
                                    onChange={handleChange}
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
                    </Col>
                </Row>
                {
                    Boolean(values.project)
                    && (
                        <Row>
                            <Col xs={12}>
                                <HorizontalInput
                                    name="projectCode"
                                    label={t("SelectProject")}
                                    type="text"
                                    className="label-required"
                                    disabled
                                />
                            </Col>
                        </Row>
                    )
                }
            </CardBody>
        </Card>
    );
};

export default InitialSetting;
