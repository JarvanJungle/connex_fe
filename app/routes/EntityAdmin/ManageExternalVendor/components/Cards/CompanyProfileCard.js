/* eslint-disable max-len */
/* eslint-disable import/no-absolute-path */
/* eslint-disable import/extensions */
import React, { useState, useEffect } from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label
} from "components";
import { Checkbox } from "primereact/checkbox";
import { v4 as uuidv4 } from "uuid";
import Countries from "/public/assets/Countries.jsx";
import {
    Field, ErrorMessage
} from "formik";
import classNames from "classnames";
import TaxRecordDataService from "services/TaxRecordService";
import useToast from "routes/hooks/useToast";
import HorizontalInput from "../HorizontalInput";

const CompanyProfileCard = (props) => {
    const showToast = useToast();
    const {
        t,
        onCompanyProfileCBChange,
        onCountryOfOriginChange,
        onTaxCodeChange,
        onGstRegChange,
        paymentTerms,
        bankAccounts,
        values,
        errors,
        touched,
        handleChange,
        setFieldValue,
        isEdit,
        isCreate
    } = props;

    const [listStates, setListStates] = useState({
        taxRecords: [],
        companyUuid: null
    });

    const getCompanyRole = () => {
        const companyRole = JSON.parse(localStorage.getItem("companyRole"));
        setListStates((prevStates) => ({
            ...prevStates,
            companyUuid: companyRole.companyUuid
        }));
        return companyRole;
    };

    const retrieveTaxRecords = async () => {
        try {
            const companyRole = getCompanyRole();
            const response = await TaxRecordDataService.getTaxRecords(
                companyRole.companyUuid
            );
            const taxRecords = response.data.data;
            if (taxRecords.length > 0) {
                setListStates((prevStates) => ({
                    ...prevStates,
                    taxRecords
                }));
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            showToast("error", error.response.data.message);
        }
    };

    const disabled = !isEdit && !isCreate;

    useEffect(() => {
        retrieveTaxRecords();
    }, []);

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {`${t("CompanyProfile")}`}
            </CardHeader>
            <CardBody>
                <Col lg={12}>
                    <Row className="d-lg-flex align-items-center">
                        <Col lg={6}>
                            <Row>
                                <Col md={4} lg={4}>
                                    <Label className="p-0">{t("BusinessRole")}</Label>
                                </Col>
                                <Col md={8} lg={8}>
                                    <Row>
                                        <Col md={6} lg={6}>
                                            <div className="p-field-checkbox">
                                                <Checkbox
                                                    name="buyer"
                                                    inputId="buyer"
                                                    checked={values.buyer}
                                                    onChange={(e) => onCompanyProfileCBChange("buyer", e.checked, values, setFieldValue)}
                                                    disabled={disabled}
                                                />
                                                <label htmlFor="buyer" className="mb-0">{t("MyBuyer")}</label>
                                            </div>
                                        </Col>
                                        <Col md={6} lg={6}>
                                            <div className="p-field-checkbox">
                                                <Checkbox
                                                    name="seller"
                                                    inputId="seller"
                                                    checked={values.seller}
                                                    onChange={(e) => onCompanyProfileCBChange("seller", e.checked, values, setFieldValue)}
                                                    disabled={disabled}
                                                />
                                                <label htmlFor="seller" className="mb-0">{t("MySupplier")}</label>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                        <Col lg={6} />
                    </Row>
                    <Row className="d-lg-flex">
                        <Col lg={6}>
                            <HorizontalInput
                                name="companyCode"
                                label={t("CompanyCode")}
                                type="text"
                                placeholder={t("EnterCompanyCode")}
                                className="label-required"
                                upperCase
                                errors={errors.companyCode}
                                touched={touched.companyCode}
                                disabled={!isCreate}
                            />
                        </Col>
                        <Col lg={6}>
                            <HorizontalInput
                                name="companyName"
                                label={t("CompanyName")}
                                type="text"
                                placeholder={t("EnterCompanyName")}
                                className="label-required"
                                upperCase
                                errors={errors.companyName}
                                touched={touched.companyName}
                                disabled={disabled}
                            />
                        </Col>
                    </Row>
                    <Row className="d-lg-flex">
                        <Col lg={6}>
                            <HorizontalInput
                                name="uen"
                                type="text"
                                label={t("CompanyRegNo")}
                                placeholder={t("EnterCompanyRegNo")}
                                className="label-required"
                                upperCase
                                errors={errors.uen}
                                touched={touched.uen}
                                disabled={disabled}
                            />
                        </Col>
                        <Col lg={6}>
                            <Row className="form-group label-required">
                                <Col md={4} lg={4}>
                                    <Label className="p-0">{t("CountryOfOrigin")}</Label>
                                </Col>
                                <Col md={8} lg={8}>
                                    <Field name="countryOfOrigin">
                                        {({ field }) => (
                                            <select
                                                // eslint-disable-next-line max-len
                                                // eslint-disable-next-line react/jsx-props-no-spreading
                                                {...field}
                                                className={
                                                    classNames("form-control", {
                                                        "is-invalid":
                                                            errors.countryOfOrigin
                                                            && touched.countryOfOrigin
                                                    })
                                                }
                                                onChange={(e) => onCountryOfOriginChange(e.target.value, values, setFieldValue)}
                                                disabled={disabled}
                                            >
                                                <option value="" hidden defaultValue>{t("SelectCountryOfOrigin")}</option>
                                                {Countries.countries
                                                    .map((country) => (
                                                        <option key={uuidv4()} value={country.name}>
                                                            {country.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        )}
                                    </Field>
                                    <ErrorMessage name="countryOfOrigin" component="div" className="invalid-feedback" />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className="d-lg-flex">
                        <Col lg={6}>
                            <Row className="form-group label-required">
                                <Col md={4} lg={4}>
                                    <Label className="p-0">{t("PaymentTerm")}</Label>
                                </Col>
                                <Col md={8} lg={8}>
                                    <Field name="paymentTerm">
                                        {({ field }) => (
                                            <select
                                                // eslint-disable-next-line max-len
                                                // eslint-disable-next-line react/jsx-props-no-spreading
                                                {...field}
                                                className={
                                                    classNames("form-control", {
                                                        "is-invalid":
                                                            errors.paymentTerm
                                                            && touched.paymentTerm
                                                    })
                                                }
                                                disabled={disabled}
                                            >
                                                <option value="" hidden defaultValue>{t("PleaseSelectPaymentTerm")}</option>
                                                {paymentTerms.slice().sort((a, b) => a.ptDays - b.ptDays)
                                                    .map((paymentTerm) => (
                                                        <option
                                                            key={uuidv4()}
                                                            value={paymentTerm.ptUuid}
                                                        >
                                                            {paymentTerm.ptName}
                                                        </option>
                                                    ))}
                                            </select>
                                        )}
                                    </Field>
                                    <ErrorMessage name="paymentTerm" component="div" className="invalid-feedback" />
                                </Col>
                            </Row>
                        </Col>
                        <Col lg={6}>
                            {
                                (values.buyer && values.seller)
                                    || (values.buyer && !values.seller)
                                    ? (
                                        <Row className="form-group">
                                            <Col md={4} lg={4}>
                                                <Label className="p-0">{t("BankAccToReceivePay")}</Label>
                                            </Col>
                                            <Col md={8} lg={8}>
                                                <Field name="bankAccToReceivePayment">
                                                    {({ field }) => (
                                                        <select
                                                            // eslint-disable-next-line react/jsx-props-no-spreading
                                                            {...field}
                                                            className={
                                                                classNames("form-control", {
                                                                    "is-invalid": errors.bankAccToReceivePayment
                                                                        && touched.bankAccToReceivePayment
                                                                })
                                                            }
                                                            disabled={disabled}
                                                        >
                                                            <option value="" hidden defaultValue>{t("SelectBankAccToReceivePay")}</option>
                                                            <option value=""> </option>
                                                            {bankAccounts.map((bankAccount) => (
                                                                <option
                                                                    key={uuidv4()}
                                                                    value={bankAccount.uuid}
                                                                >
                                                                    {`${bankAccount.bankLabel} (${bankAccount.bankAccountNo})`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </Field>
                                                <ErrorMessage name="bankAccToReceivePayment" component="div" className="invalid-feedback" />
                                            </Col>
                                        </Row>
                                    ) : (
                                        <></>
                                    )
                            }
                        </Col>
                    </Row>
                    {
                        // eslint-disable-next-line no-nested-ternary
                        (((values.buyer && values.seller) || !values.buyer && values.seller) && values.gstRegBusiness) ? (
                            <div>
                                <Row className="d-lg-flex">
                                    <Col lg={6}>
                                        <div className="p-field-checkbox">
                                            <Checkbox
                                                name="gstRegBusiness"
                                                inputId="taxRegisteredBusiness"
                                                checked={values.gstRegBusiness}
                                                onChange={(e) => onGstRegChange(e.checked, values, setFieldValue)}
                                                disabled={disabled}
                                            />
                                            <label htmlFor="taxRegisteredBusiness" className="mb-0">{t("TaxRegisteredBusiness")}</label>
                                        </div>
                                    </Col>
                                    <Col lg={6}>
                                        <HorizontalInput
                                            name="gstRegNo"
                                            label={t("TaxRegNo")}
                                            type="text"
                                            placeholder={t("EnterTaxRegNo")}
                                            className="label-required"
                                            errors={errors.gstRegNo}
                                            touched={touched.gstRegNo}
                                            disabled={disabled}
                                            upperCase
                                        />
                                    </Col>
                                </Row>
                                <Row className="d-lg-flex">
                                    <Col lg={6}>
                                        <Row className="form-group label-required">
                                            <Col md={4} lg={4}>
                                                <Label className="p-0">{t("TaxCode")}</Label>
                                            </Col>
                                            <Col md={8} lg={8}>
                                                <Field name="taxUuid">
                                                    {({ field }) => (
                                                        <select
                                                            // eslint-disable-next-line max-len
                                                            // eslint-disable-next-line react/jsx-props-no-spreading
                                                            {...field}
                                                            className={
                                                                classNames("form-control", {
                                                                    "is-invalid":
                                                                        errors.taxUuid
                                                                        && touched.taxUuid
                                                                })
                                                            }
                                                            onChange={(e) => {
                                                                console.log(e.target.value);
                                                                console.log(listStates.taxRecords);
                                                                onTaxCodeChange(e.target.value, values, setFieldValue, listStates.taxRecords);
                                                            }}
                                                            disabled={disabled}
                                                        >
                                                            <option value="" hidden defaultValue>{t("SelectTaxCode")}</option>
                                                            {listStates.taxRecords.filter((taxRecord) => taxRecord.active)
                                                                .map((taxRecord) => (
                                                                    <option key={uuidv4()} value={taxRecord.uuid}>
                                                                        {taxRecord.taxCode}
                                                                    </option>
                                                                ))}
                                                        </select>
                                                    )}
                                                </Field>
                                                <ErrorMessage name="taxUuid" component="div" className="invalid-feedback" />
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col lg={6}>
                                        <HorizontalInput
                                            name="taxPercentage"
                                            label={t("TaxPercentage")}
                                            type="text"
                                            placeholder={t("TaxPercentage")}
                                            className="label-required"
                                            upperCase
                                            errors={errors.taxPercentage}
                                            touched={touched.taxPercentage}
                                            disabled
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )
                            : (<></>)
                    }

                    {
                        // eslint-disable-next-line no-nested-ternary
                        (((values.buyer && values.seller) || !values.buyer && values.seller) && !values.gstRegBusiness) ? (

                            <Row className="d-lg-flex">
                                <Col lg={6}>
                                    <div className="p-field-checkbox">
                                        <Checkbox
                                            name="gstRegBusiness"
                                            inputId="taxRegisteredBusiness"
                                            checked={values.gstRegBusiness}
                                            onChange={handleChange}
                                            disabled={disabled}
                                        />
                                        <label htmlFor="taxRegisteredBusiness" className="mb-0">{t("TaxRegisteredBusiness")}</label>
                                    </div>
                                </Col>
                            </Row>
                        )
                            : (<></>)
                    }
                </Col>
            </CardBody>
        </Card>
    );
};

export default CompanyProfileCard;
