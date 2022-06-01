/* eslint-disable import/extensions */
/* eslint-disable import/no-absolute-path */
import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label
} from "components";
import {
    Field, ErrorMessage
} from "formik";
import DialCodes from "/public/assets/DialCodes.js";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";
import HorizontalInput from "../HorizontalInput";

const ContactPersonCard = (props) => {
    const {
        t,
        values,
        errors,
        touched,
        isEdit,
        isCreate
    } = props;

    const disabled = !isEdit && !isCreate;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("MainContactPerson")}
            </CardHeader>
            <CardBody>
                <Col lg={12}>
                    <Row>
                        <Col lg={6}>
                            <HorizontalInput
                                name="fullName"
                                label={t("FullName")}
                                type="text"
                                placeholder={t("EnterFullName")}
                                className="label-required"
                                errors={errors.fullName}
                                touched={touched.fullName}
                                disabled={disabled}
                            />
                        </Col>
                        <Col lg={6}>
                            <Row>
                                <Col md={4} lg={4} className="label-required">
                                    <Label className="p-0">{t("ContactNumber")}</Label>
                                </Col>
                                <Col md={8} lg={8}>
                                    <Row>
                                        <Col md={3} lg={3} className="pr-0">
                                            <Field name="countryCode">
                                                {({ field }) => (
                                                    <select
                                                        // eslint-disable-next-line max-len
                                                        // eslint-disable-next-line react/jsx-props-no-spreading
                                                        {...field}
                                                        className={
                                                            classNames("form-control", {
                                                                "is-invalid":
                                                                    errors.countryCode
                                                                    && touched.countryCode
                                                            })
                                                        }
                                                        disabled={disabled}
                                                    >
                                                        <option value="" hidden defaultValue>{t("DialCode")}</option>
                                                        {DialCodes.dialCodes
                                                            .map((dialCode) => (
                                                                <option
                                                                    key={uuidv4()}
                                                                    value={dialCode.value}
                                                                    data-subtext={dialCode.label}
                                                                >
                                                                    {values.countryCode && values.countryCode === dialCode.value ? `+${dialCode.value}` : `${dialCode.label} (+${dialCode.value})`}
                                                                </option>
                                                            ))}
                                                    </select>
                                                )}
                                            </Field>
                                            <ErrorMessage name="countryCode" component="div" className="invalid-feedback" />
                                        </Col>
                                        <Col md={9} lg={9} className="pl-2">
                                            <Field
                                                type="text"
                                                name="workNumber"
                                                placeholder={t("EnterPhoneNumber")}
                                                className={classNames("form-control", {
                                                    "is-invalid": touched.workNumber
                                                        && errors.workNumber
                                                })}
                                                disabled={disabled}
                                            />
                                            <ErrorMessage name="workNumber" component="div" className="invalid-feedback" />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={6}>
                            <HorizontalInput
                                name="emailAddress"
                                label={t("Email")}
                                type="text"
                                placeholder={t("EnterEmail")}
                                className="label-required"
                                errors={errors.emailAddress}
                                touched={touched.emailAddress}
                                disabled={disabled}
                            />
                        </Col>
                        <Col lg={6} />
                    </Row>
                </Col>
            </CardBody>
        </Card>
    );
};

export default ContactPersonCard;
