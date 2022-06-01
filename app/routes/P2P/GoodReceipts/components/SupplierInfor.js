/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label
} from "components";
import { HorizontalInput } from "routes/PreRequisitions/RaisePreRequisitions/components";
import ExtVendorService from "services/ExtVendorService";
import {
    Field, ErrorMessage
} from "formik";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";
import GR_CONSTANTS from "../constants/constants";

const SupplierInfor = (props) => {
    const {
        t,
        disabled,
        values,
        touched,
        errors,
        suppliers,
        setFieldValue,
        companyUuid
    } = props;

    const [contactNumber, setContactNumber] = useState("");

    useEffect(() => {
        const { countryCode } = values;
        setContactNumber(`${countryCode ? (`+${countryCode}`) : ""} ${values.contactNumber || ""}`);
    }, [values]);

    const onSelectSupplier = async (event) => {
        const { target } = event;
        const { value } = target;
        const supplier = suppliers.find((item) => item.companyCode === value);
        const { defaultSupplierUser } = supplier ?? { };
        const response = await ExtVendorService.getExternalVendorDetails(
            companyUuid, supplier.uuid
        );
        const { data } = response.data;
        setFieldValue("supplierCode", value);
        setFieldValue("supplierUuid", supplier.uuid);
        setFieldValue("supplierName", data.companyName);
        setFieldValue("contactName", defaultSupplierUser.fullName);
        setFieldValue("contactEmail", defaultSupplierUser.emailAddress);
        setFieldValue("contactNumber", defaultSupplierUser.workNumber);
        setFieldValue("country", data.countryOfOrigin);
        setFieldValue("companyRegNo", data.uen);
        setFieldValue("countryCode", defaultSupplierUser.countryCode);
    };

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("SupplierInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        {
                            (disabled
                                || values.grType === GR_CONSTANTS.PO
                                || values.grType === GR_CONSTANTS.DO
                            )
                            && (
                                <HorizontalInput
                                    name="supplierCode"
                                    label={t("SupplierCode")}
                                    type="text"
                                    value={values.supplierCode}
                                    placeholder=""
                                    errors={errors.supplierCode}
                                    touched={touched.supplierCode}
                                    values={values.supplierCode}
                                    disabled
                                />
                            )
                        }
                        {
                            !disabled
                            && values.grType !== GR_CONSTANTS.PO
                            && values.grType !== GR_CONSTANTS.DO
                            && (
                                <Row className="form-group">
                                    <Col md={4}>
                                        <Label className="p-0">{t("SupplierCode")}</Label>
                                    </Col>
                                    <Col md={8}>
                                        <Field name="supplierCode">
                                            {({ field }) => (
                                                <select
                                                    {...field}
                                                    className={
                                                        classNames(
                                                            "form-control",
                                                            { "is-invalid": errors.supplierCode && touched.supplierCode }
                                                        )
                                                    }
                                                    disabled={disabled}
                                                    onChange={onSelectSupplier}
                                                    value={values.supplierCode}
                                                >
                                                    <option value="" hidden defaultValue>{t("PleaseSelectSupplier")}</option>
                                                    {suppliers
                                                        .map((supplier) => (
                                                            <option
                                                                key={uuidv4()}
                                                                value={supplier.companyCode}
                                                            >
                                                                {
                                                                    supplier.companyCode
                                                                        === values.supplierCode
                                                                        ? supplier.companyCode
                                                                        : `${supplier.companyCode} (${supplier.companyName})`
                                                                }
                                                            </option>
                                                        ))}
                                                </select>
                                            )}
                                        </Field>
                                        <ErrorMessage name="supplierCode" component="div" className="invalid-feedback" />
                                    </Col>
                                </Row>
                            )
                        }
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="supplierName"
                            label={t("SupplierName")}
                            type="text"
                            value={values.supplierName}
                            placeholder=""
                            errors={errors.supplierName}
                            touched={touched.supplierName}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contactName"
                            label={t("ContactName")}
                            type="text"
                            value={values.contactName}
                            placeholder=""
                            errors={errors.contactName}
                            touched={touched.contactName}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contactEmail"
                            label={t("ContactEmail")}
                            type="text"
                            value={values.contactEmail}
                            placeholder=""
                            errors={errors.contactEmail}
                            touched={touched.contactEmail}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contactNumber"
                            label={t("ContactNumber")}
                            type="text"
                            placeholder=""
                            errors={errors.contactNumber}
                            touched={touched.contactNumber}
                            value={contactNumber}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="country"
                            label={t("Country")}
                            type="text"
                            placeholder=""
                            errors={errors.country}
                            touched={touched.country}
                            value={values.country}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="companyRegNo"
                            label={t("CompanyRegNo")}
                            type="text"
                            placeholder=""
                            errors={errors.companyRegNo}
                            touched={touched.companyRegNo}
                            value={values.companyRegNo}
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default SupplierInfor;
