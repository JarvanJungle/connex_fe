/* eslint-disable max-len */
import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label,
    Input,
    HorizontalInput
} from "components";
import { Field, ErrorMessage } from "formik";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";
import InputTextFiled from "./InputTextFiled";

const ProjectDetailsInformationCard = (props) => {
    const {
        t, errors, touched,
        addresses, currencies, handleChange,
        setFieldValue, isDetail, isEdit,
        values
    } = props;

    const formatBudget = (number) => Number(number).toLocaleString("en", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const onChangeAddress = (e) => {
        handleChange(e);
        const { value } = e.target;
        const addressSelected = addresses.find((address) => address.uuid === value);
        setFieldValue("addressFirstLine", addressSelected.addressFirstLine);
        setFieldValue("addressSecondLine", addressSelected.addressSecondLine);
        setFieldValue("postalCode", addressSelected.postalCode);
        setFieldValue("country", addressSelected.country);
        setFieldValue("state", addressSelected.state);
        setFieldValue("city", addressSelected.city);
    };
    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("ProjectForecastInformation")}
            </CardHeader>
            <CardBody>
                <Col lg={12}>
                    <Row>
                        <Col lg={6}>
                            <Row className="label-required form-group">
                                <Col md={4} lg={4}>
                                    <Label className="p-0">{t("ProjectCode")}</Label>
                                </Col>
                                <Col md={8} lg={8}>
                                    <Field
                                        name="projectCode"
                                        type="text"
                                        onChange={handleChange}
                                        onBlur={(e) => {
                                            errors.projectCode = true;
                                            touched.projectCode = true;
                                            setFieldValue("projectCode", e.target.value.trim());
                                        }}
                                        value={values.projectCode}
                                        maxLength={10}
                                        disabled={isEdit || isDetail}
                                        placeholder={t("ProjectCode")}
                                        className={classNames(
                                            "form-control",
                                            { "is-invalid": errors.projectCode && touched.projectCode }
                                        )}
                                    />
                                    <ErrorMessage name="projectCode" component="div" className="invalid-feedback" />
                                </Col>
                            </Row>
                        </Col>
                        <Col lg={6}>
                            <HorizontalInput
                                name="projectTitle"
                                label={t("ProjectTitle")}
                                type="text"
                                placeholder={t("EnterProjectTitle")}
                                className="label-required"
                                errors={errors.projectTitle}
                                touched={touched.projectTitle}
                                disabled={isDetail && !isEdit}
                                value={values.projectTitle}
                                onChange={handleChange}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={6}>
                            <HorizontalInput
                                name="erpProjectCode"
                                label={t("ERP Project Code")}
                                type="text"
                                placeholder={t("ERP Project Code")}
                                disabled={isDetail && !isEdit}
                                value={values.erpProjectCode}
                                onChange={handleChange}
                            />
                        </Col>
                        <Col lg={6} />
                    </Row>

                    <Row>
                        <Col lg={6}>
                            <HorizontalInput
                                name="startDate"
                                label={t("StartDate")}
                                type="date"
                                placeholder={t("EnterStartDate")}
                                className="label-required"
                                errors={errors.startDate}
                                touched={touched.startDate}
                                disabled={isDetail && !isEdit}
                                value={values.startDate}
                                onChange={handleChange}
                            />
                        </Col>
                        <Col lg={6}>
                            <HorizontalInput
                                name="endDate"
                                label={t("EndDate")}
                                type="date"
                                placeholder={t("EnterEndDate")}
                                className="label-required"
                                errors={errors.endDate}
                                touched={touched.endDate}
                                disabled={isDetail && !isEdit}
                                value={values.endDate}
                                onChange={handleChange}
                            />
                        </Col>
                    </Row>

                    {
                        !isDetail
                            ? (
                                <Row>
                                    <Col lg={6}>
                                        <Row className="form-group label-required">
                                            <Col md={4} lg={4}>
                                                <Label className="p-0">{t("Currency")}</Label>
                                            </Col>
                                            <Col md={8} lg={8}>
                                                <Field name="currency">
                                                    {({ field }) => (
                                                        <select
                                                            // eslint-disable-next-line max-len
                                                            // eslint-disable-next-line react/jsx-props-no-spreading
                                                            {...field}
                                                            className={
                                                                classNames("form-control", {
                                                                    "is-invalid":
                                                                        errors.currency
                                                                        && touched.currency
                                                                })
                                                            }
                                                        >
                                                            <option value="" hidden defaultValue>{t("PleaseSelectCurrency")}</option>
                                                            {currencies
                                                                .sort((a, b) => a?.currencyName?.localeCompare(b?.currencyName))
                                                                .map((currency) => (
                                                                    <option
                                                                        key={uuidv4()}
                                                                        value={currency.currencyCode}
                                                                    >
                                                                        {`${currency.currencyName} (+${currency.currencyCode})`}
                                                                    </option>
                                                                ))}
                                                        </select>
                                                    )}
                                                </Field>
                                                <ErrorMessage name="currency" component="div" className="invalid-feedback" />
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col lg={6}>
                                        <HorizontalInput
                                            name="overallBudget"
                                            label={t("OverallBudget")}
                                            type="text"
                                            placeholder={t("EnterProjectBudget")}
                                            className="label-required"
                                            errors={errors.overallBudget}
                                            touched={touched.overallBudget}
                                            value={values.overallBudget}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                            ) : (
                                <>
                                    <Row>
                                        <Col lg={6}>
                                            <InputTextFiled
                                                label={t("Currency")}
                                                disabled={isDetail}
                                                className="label-required"
                                                name="currency"
                                                type="text"
                                                value={values.currency}
                                            />
                                        </Col>
                                        <Col lg={6}>
                                            <InputTextFiled
                                                label={t("OverallBudget")}
                                                disabled={isDetail}
                                                className="label-required"
                                                name="overallBudget"
                                                type="text"
                                                value={`${values.currency} ${formatBudget(values.overallBudget)}`}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col lg={6}>
                                            <InputTextFiled
                                                label={t("ApprovedPRBudget")}
                                                disabled={isDetail}
                                                name="approvedPrBudget"
                                                type="text"
                                                value={`${values.currency} ${formatBudget(values.approvedPrBudget)}`}
                                            />
                                        </Col>
                                        <Col lg={6}>
                                            <InputTextFiled
                                                label={t("IssuedPOBudget")}
                                                disabled={isDetail}
                                                name="issuedPoBudget"
                                                type="text"
                                                value={`${values.currency} ${formatBudget(values.issuedPoBudget)}`}
                                            />
                                        </Col>
                                    </Row>
                                </>
                            )
                    }

                    <Row>
                        <Col lg={6}>
                            <Row className="form-group label-required">
                                <Col md={4} lg={4}>
                                    <Label className="p-0">{t("ProjectAddress")}</Label>
                                </Col>
                                <Col md={8} lg={8}>
                                    <Field name="addressUuid">
                                        {({ field }) => (
                                            <select
                                                // eslint-disable-next-line max-len
                                                // eslint-disable-next-line react/jsx-props-no-spreading
                                                {...field}
                                                className={
                                                    classNames("form-control", {
                                                        "is-invalid":
                                                            errors.addressUuid
                                                            && touched.addressUuid
                                                    })
                                                }
                                                onChange={onChangeAddress}
                                                disabled={isDetail && !isEdit}
                                            >
                                                <option value="" hidden defaultValue>{t("PleaseSelectProjectAddress")}</option>
                                                {addresses
                                                    .sort((a, b) => a?.addressLabel?.localeCompare(b?.addressLabel))
                                                    .map((address) => (
                                                        <option key={uuidv4()} value={address.uuid}>
                                                            {address.addressLabel}
                                                        </option>
                                                    ))}
                                            </select>
                                        )}
                                    </Field>
                                    <ErrorMessage name="addressUuid" component="div" className="invalid-feedback" />
                                </Col>
                            </Row>
                        </Col>
                        <Col lg={6} />
                    </Row>

                    <Row>
                        <Col lg={6}>
                            <HorizontalInput
                                name="addressFirstLine"
                                label={t("AddressLine1")}
                                type="text"
                                placeholder={t("AddressLine1")}
                                errors={errors.addressFirstLine}
                                touched={touched.addressFirstLine}
                                value={values.addressFirstLine}
                                onChange={handleChange}
                                disabled
                            />
                        </Col>
                        <Col lg={6}>
                            <HorizontalInput
                                name="addressSecondLine"
                                label={t("AddressLine2")}
                                type="text"
                                placeholder={t("AddressLine2")}
                                errors={errors.addressSecondLine}
                                touched={touched.addressSecondLine}
                                value={values.addressSecondLine}
                                onChange={handleChange}
                                disabled
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={6}>
                            <HorizontalInput
                                name="postalCode"
                                label={t("PostalCode")}
                                type="text"
                                placeholder={t("PostalCode")}
                                errors={errors.postalCode}
                                touched={touched.postalCode}
                                value={values.postalCode}
                                onChange={handleChange}
                                disabled
                            />
                        </Col>
                        <Col lg={6}>
                            <HorizontalInput
                                name="country"
                                label={t("Country")}
                                type="text"
                                placeholder={t("Country")}
                                errors={errors.country}
                                touched={touched.country}
                                value={values.country}
                                onChange={handleChange}
                                disabled
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={6}>
                            <HorizontalInput
                                name="state"
                                label={t("StateProvince")}
                                type="text"
                                placeholder={t("StateProvince")}
                                errors={errors.state}
                                touched={touched.state}
                                value={values.state}
                                onChange={handleChange}
                                disabled
                            />
                        </Col>
                        <Col lg={6}>
                            <HorizontalInput
                                name="city"
                                label={t("City")}
                                type="text"
                                placeholder={t("City")}
                                errors={errors.city}
                                touched={touched.city}
                                value={values.city}
                                onChange={handleChange}
                                disabled
                            />
                        </Col>
                    </Row>

                    <Row className="form-group label-required">
                        <Col lg={2}>
                            <Label className="p-0 mr-1">{t("ProjectForecastDescription")}</Label>
                        </Col>
                        <Col xs={10}>
                            <Field name="projectDescription">
                                {({ field }) => (
                                    <Input
                                        {...field}
                                        type="textarea"
                                        rows={5}
                                        className={
                                            classNames("form-control", {
                                                "is-invalid":
                                                    errors.projectDescription
                                                    && touched.projectDescription
                                            })
                                        }
                                        placeholder={t("EnterProjectDescription")}
                                        disabled={isDetail && !isEdit}
                                    />
                                )}
                            </Field>
                            <ErrorMessage name="projectDescription" component="div" className="invalid-feedback" />
                        </Col>
                    </Row>
                </Col>
            </CardBody>
        </Card>
    );
};

export default ProjectDetailsInformationCard;
