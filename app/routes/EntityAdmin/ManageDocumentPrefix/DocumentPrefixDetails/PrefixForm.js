import React, {useEffect, useState} from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Row,
    FormGroup,
    Input,
    Label,
    Table,
    MultiSelect,
    CustomInput
} from "components";
import { Field, ErrorMessage } from "formik";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { stringCompareIgnoreCase } from "helper/utilities";
import {useSelector} from "react-redux";

const PREFIX_TYPES = [
    {
        name: "Configure",
        value: "Configure"
    },
    {
        name: "System Default",
        value: "Default"
    },
    {
        name: "Manual Key In",
        value: "Manual"
    }
];
const NUMBER_OF_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const DATE_PREFIX = [
    {
        name: "YYYY",
        value: "YYYY",
        sample: "2021"
    },
    {
        name: "YY",
        value: "YY",
        sample: "21"
    },
    {
        name: "YYMM",
        value: "YYMM",
        sample: "2108"
    },
    {
        name: "MMYY",
        value: "MMYY",
        sample: "0821"
    },
    {
        name: "None",
        value: "",
        sample: ""
    }
];
const CONFIGURED_PREFIX = ["Purchase Order", "Rental/Leasing Order", "Repair Order", "Invoice", "Delivery Order"];

const PrefixForm = (props) => {
    const { errors,
        values,
        touched,
        handleChange,
        dirty,
        setFieldValue,
        isEdit
    } = props;
    const [hasProjectPermission, setHasProjectPermission] = useState(false);
    const permissionReducer = useSelector((state) => state.permissionReducer);

    const { t } = useTranslation();

    const isConfigurePrefix = (functionName) => {
        return CONFIGURED_PREFIX.findIndex((prefix) => stringCompareIgnoreCase(prefix, functionName)) >= 0;
    }

    useEffect(() => {
        if (values.type === "Configure") {
            const { prefix, dateDynamicPrefix = "", startingNumberFormat, projectCode } = values;
            const dateDynamicObj = DATE_PREFIX.find((date) => date.value === dateDynamicPrefix);
            const dateDynamicSample = dateDynamicObj ? dateDynamicObj.sample : "";
            const projectCodePrefix = (projectCode === "true" || projectCode === true) ? "PROJ" : "TS";
            let prefixList = [];
            prefixList.push(prefix);
            if (projectCodePrefix && dateDynamicSample) {
                prefixList.push(`${projectCodePrefix}${dateDynamicSample}`);
            } else {
                prefixList.push(projectCodePrefix);
                prefixList.push(dateDynamicSample);
            }
            prefixList.push(startingNumberFormat);
            let prefixSampleFormat = "";
            prefixList.map((value) => {
                if (value) {
                    prefixSampleFormat += prefixSampleFormat ? `-${value}` : `${value}`;
                }
            })
            setFieldValue("prefixSampleFormat", prefixSampleFormat);
        }
    }, [values]);

    useEffect(() => {
        console.log(touched, errors);
    }, [touched]);

    useEffect(() => {
        if (permissionReducer) {
            setHasProjectPermission(permissionReducer?.userPermission?.ADMIN?.features?.find((e) => e.featureCode === "project")?.actions?.write);
        }
    }, [permissionReducer]);

    return (
        <>
            <Card className="mb-4">
                <CardHeader tag="h6">{t("DocumentPrefixDetails")}</CardHeader>
                <CardBody className="p-4">
                    <Row className="d-flex mx-0">
                        <Col md={4}>
                            <Label>{t("Document")}</Label>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Input
                                    className="form-control"
                                    type="text"
                                    name="functionName"
                                    tag={Field}
                                    invalid={errors.functionName && touched.functionName}
                                    disabled
                                />
                                <ErrorMessage name="functionName" component="div" className="invalid-feedback" />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row className="d-flex mx-0">
                        <Col md={4}>
                            <Label>{t("PrefixStatus")}</Label>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Field name="type">
                                    {({ field }) => (
                                        <select
                                            {...field}
                                            className={`form-control${(errors.type && touched.type) ? " is-invalid" : ""}`}
                                            disabled={!isEdit}
                                        >
                                            <option value="">{t("SelectPrefixStatus")}</option>
                                            {
                                                <>
                                                    {PREFIX_TYPES
                                                        .map((prefixType, index) => (
                                                            <option key={index} value={prefixType.value}>
                                                                {prefixType.name}
                                                            </option>
                                                        ))}
                                                </>

                                                // Config Prefix

                                                // isConfigurePrefix(values.functionName) ? (

                                                // ) : (
                                                //     <>
                                                //         {PREFIX_TYPES
                                                //             .filter((prefixType) => prefixType.name !== "Configure")
                                                //             .map((prefixType, index) => (
                                                //                 <option key={index} value={prefixType.value}>
                                                //                     {prefixType.name}
                                                //                 </option>
                                                //             ))}
                                                //     </>
                                                // )
                                            }
                                        </select>
                                    )}
                                </Field>
                                <ErrorMessage name="type" component="div" className="invalid-feedback" />
                            </FormGroup>
                        </Col>
                    </Row>
                    {
                        values.type !== "Manual" && (
                            <Row className="d-flex mx-0">
                                <Col md={4}>
                                    <Label>{t("DefaultDocumentNumber")}</Label>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Input
                                            className="form-control"
                                            type="text"
                                            name="prefixSampleOutput"
                                            tag={Field}
                                            invalid={errors.defaultDocumentNumber && touched.defaultDocumentNumber}
                                            disabled
                                        />
                                        <ErrorMessage name="prefixSampleOutput" component="div" className="invalid-feedback" />
                                    </FormGroup>
                                </Col>
                            </Row>
                        )
                    }
                    {
                        values.type === "Configure" && (
                            <>
                                <Row className="d-flex mx-0">
                                    <Col md={4} className="label-required">
                                        <Label>{t("Prefix")}</Label>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Input
                                                className="form-control"
                                                type="text"
                                                name="prefix"
                                                tag={Field}
                                                invalid={errors.prefix && touched.prefix}
                                                disabled={!isEdit}
                                            />
                                            <ErrorMessage name="prefix" component="div" className="invalid-feedback" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row className="d-flex mx-0">
                                    <Col md={4}>
                                        <Label>{t("DynamicPrefix")}</Label>
                                    </Col>
                                    <Col md={3}>
                                        <Label>{`${t("Setup")} 1 (${t("SelectOnlyOne")})`}</Label>
                                        <FormGroup>
                                            <CustomInput
                                                type="radio"
                                                name={`projectCode`}
                                                label={t("VendorCode")}
                                                id={`vendorCode`}
                                                value={false}
                                                className="align-middle"
                                                onChange={handleChange}
                                                checked={values.projectCode === false || values.projectCode === "false"}
                                                disabled={!isEdit}
                                            />
                                            {hasProjectPermission && (
                                                <CustomInput
                                                    type="radio"
                                                    name={`projectCode`}
                                                    label={t("ProjectCode")}
                                                    id={`projectCode`}
                                                    value={true}
                                                    className="align-middle"
                                                    onChange={handleChange}
                                                    checked={values.projectCode === true || values.projectCode === "true"}
                                                    disabled={!isEdit}
                                                />
                                            )}
                                        </FormGroup>
                                    </Col>
                                    <Col md={4}>
                                        <Label>{`${t("Setup")} 2 (${t("SelectOnlyOne")})`}</Label>
                                        <FormGroup>
                                            {
                                                DATE_PREFIX.map((prefix, index) => {
                                                    return (
                                                        <CustomInput
                                                            key={index}
                                                            type="radio"
                                                            name={`dateDynamicPrefix`}
                                                            label={prefix.name}
                                                            id={`dateDynamicPrefix${index}`}
                                                            value={prefix.value}
                                                            className="align-middle"
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                setFieldValue("dateDynamicPrefix", value);
                                                                setFieldValue("dateDynamic", _.isEmpty(value) ? false : true);
                                                            }}
                                                            checked={values.dateDynamicPrefix != null ? (values.dateDynamicPrefix === prefix.value) : false}
                                                            disabled={!isEdit}
                                                        />
                                                    )
                                                })
                                            }
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row className="d-flex mx-0">
                                    <Col md={4} className="label-required">
                                        <Label>{t("NumberOfDigits")}</Label>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Field name="numberOfDigits">
                                                {({ field }) => (
                                                    <select
                                                        {...field}
                                                        className={`form-control ${(errors.numberOfDigits && touched.numberOfDigits) ? "is-invalid" : ""}`}
                                                        onChange={(e) => {
                                                            let value = e.target.value;
                                                            if (value) {
                                                                value = Number(value);
                                                                setFieldValue("numberOfDigits", value);
                                                                const startingNumberFormat = (values.defaultCurrentNumber ? values.defaultCurrentNumber : "1").toString().padStart(value, '0');
                                                                setFieldValue("startingNumberFormat", startingNumberFormat);
                                                            }
                                                        }}
                                                        disabled={!isEdit}
                                                    >
                                                        <option value="">{t("SelectADigit")}</option>
                                                        {NUMBER_OF_DIGITS
                                                            .map((number, index) => (
                                                                <option key={index} value={number}>
                                                                    {number}
                                                                </option>
                                                            ))}
                                                    </select>
                                                )}
                                            </Field>
                                            <ErrorMessage name="numberOfDigits" component="div" className="invalid-feedback" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row className="d-flex mx-0">
                                    <Col md={4}>
                                        <Label>{t("RunningNumberStartsFrom")}</Label>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Input
                                                className="form-control"
                                                type="text"
                                                name="startingNumberFormat"
                                                tag={Field}
                                                invalid={errors.startingNumberFormat && touched.startingNumberFormat}
                                                disabled={!isEdit || !values.editStartingNumber}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setFieldValue("startingNumber", parseInt(value.replace(/[^0-9\.]+/g, '')));
                                                    setFieldValue("startingNumberFormat", value);
                                                }}
                                            />
                                            <ErrorMessage name="startingNumberFormat" component="div" className="invalid-feedback" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row className="d-flex mx-0">
                                    <Col md={4}>
                                        <Label>{t("SampleOutput")}</Label>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Input
                                                className="form-control"
                                                type="text"
                                                name="prefixSampleFormat"
                                                tag={Field}
                                                invalid={errors.prefixSampleFormat && touched.prefixSampleFormat}
                                                disabled
                                            />
                                            <ErrorMessage name="prefixSampleFormat" component="div" className="invalid-feedback" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </>
                        )
                    }
                </CardBody>
            </Card>
        </>
    );
};

export default PrefixForm;
