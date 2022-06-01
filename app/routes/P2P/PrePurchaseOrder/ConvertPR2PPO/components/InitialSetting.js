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
import URL_CONFIG from "services/urlConfig";
import { HorizontalInput, SelectInput } from "../../components";

const InitialSetting = (props) => {
    const {
        t,
        values,
        errors,
        touched,
        handleChange,
        currencies,
        projects,
        disabled,
        onChangeProject
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("InitialSettings")}
            </CardHeader>
            <CardBody>
                {
                    values.pprNumber
                    && (
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
                                                pathname: URL_CONFIG.PPR_ROUTING.DETAIL_PRE_REQUISITIONS,
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
                    )
                }
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="prNumber"
                            label={t("PurchaseRequestNo")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="prStatus"
                            label={t("Status")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className=" label-required form-group">
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
                                            onChange={handleChange}
                                            disabled
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
                    </Col>
                </Row>
                {
                    (values.project === true || values.project === "true")
                    && (
                        <Row>
                            <Col xs={12}>
                                <SelectInput
                                    name="projectCode"
                                    label={t("Project")}
                                    className="label-required"
                                    placeholder={t("PleaseSelectProject")}
                                    errors={errors.projectCode}
                                    touched={touched.projectCode}
                                    options={projects}
                                    optionLabel="projectCode"
                                    optionValue="projectCode"
                                    disabled={disabled}
                                    onChange={(e) => onChangeProject(e)}
                                    value={values.projectCode}
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
