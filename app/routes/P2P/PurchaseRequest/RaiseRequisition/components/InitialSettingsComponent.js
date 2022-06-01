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
import { makeStyles } from "@material-ui/core/styles";
import {
    Field, ErrorMessage
} from "formik";
import { RadioButton } from "primereact/radiobutton";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";
import { HorizontalInput, MultiSelectInput } from "../../components";

const useStyles = makeStyles({
    "clear-all": {
        color: "#4472C4",
        textDecoration: "underline",
        cursor: "pointer",
        background: "unset",
        border: "unset"
    }
});

const InitialSettingsComponent = (props) => {
    const classes = useStyles();
    const {
        t, values, errors,
        touched,
        suppliers,
        currencies,
        setFieldValue,
        handleChange,
        enablePrefix
    } = props;

    const onDeleteSupplier = (companyCode) => {
        const newSupplier = values.supplierCode.filter(
            (supplier) => supplier.companyCode !== companyCode
        );
        setFieldValue("supplierCode", newSupplier);
    };

    return (
        <Card>
            <CardHeader tag="h6">
                {t("InitialSettings")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="prNumber"
                            errors={errors.prNumber}
                            touched={touched.prNumber}
                            className={enablePrefix ? "label-required" : ""}
                            label={t("PurchaseRequestNo")}
                            type="text"
                            disabled={!enablePrefix}
                        />
                    </Col>
                </Row>
                <Row className="label-required form-group">
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
                                    disabled={values.project}
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
                <Row className="form-group">
                    <Col xs={4}>
                        <Label className="p-0">{t("HaveASupplier")}</Label>
                    </Col>
                    <Col xs={4}>
                        <Field name="isSupplier">
                            {({ field }) => (
                                <Row className="align-items-center mx-0">
                                    <RadioButton
                                        {...field}
                                        inputId="isSupplier"
                                        checked={values.isSupplier}
                                        value
                                    />
                                    <Label htmlFor="isSupplier" className="mb-0 ml-2">
                                        {t("Yes")}
                                    </Label>
                                </Row>
                            )}
                        </Field>
                    </Col>
                    <Col xs={4}>
                        <Field name="isSupplier">
                            {({ field }) => (
                                <Row className="align-items-center mx-0">
                                    <RadioButton
                                        {...field}
                                        inputId="isSupplier"
                                        checked={!values.isSupplier}
                                        value={false}
                                    />
                                    <Label htmlFor="isSupplier" className="mb-0 ml-2">
                                        {t("No")}
                                    </Label>
                                </Row>
                            )}
                        </Field>
                    </Col>
                </Row>

                {
                    values.isSupplier
                    && (
                        <>
                            <Row>
                                <Col xs={12}>
                                    <MultiSelectInput
                                        name="supplierCode"
                                        label={t("SupplierCode")}
                                        className="label-required"
                                        placeholder={t("PleaseSelectASupplier")}
                                        errors={errors.supplierCode}
                                        touched={touched.supplierCode}
                                        options={suppliers}
                                        optionLabel="companyLabel"
                                        optionLabelSelected="companyCode"
                                        disabled={!values.isSupplier}
                                    />
                                </Col>
                            </Row>
                            <Row className="justify-content-end mx-0">
                                <button
                                    type="button"
                                    className={`${classes["clear-all"]}`}
                                    onClick={() => setFieldValue("supplierCode", [])}
                                >
                                    {t("ClearAll")}
                                </button>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    <Label className="p-0">{t("SupplierName")}</Label>
                                </Col>
                                <Col xs={8}>
                                    <div className="form-control" style={{ height: "auto", minHeight: "36px" }}>
                                        {
                                            values.supplierCode.map((supplier, index) => (
                                                <Row
                                                    key={uuidv4()}
                                                    className={
                                                        classNames(
                                                            "mx-0 justify-content-between align-items-center",
                                                            { "mb-1": index !== (values.supplierCode.length - 1) }
                                                        )
                                                    }
                                                >
                                                    <div>{supplier.companyName}</div>
                                                    <button
                                                        type="button"
                                                        style={{
                                                            color: "red",
                                                            cursor: "pointer",
                                                            background: "unset",
                                                            border: "none"
                                                        }}
                                                        onClick={() => onDeleteSupplier(supplier.companyCode)}
                                                    >
                                                        <i className="fa fa-times" />
                                                    </button>
                                                </Row>
                                            ))
                                        }
                                    </div>
                                </Col>
                            </Row>
                        </>
                    )
                }
            </CardBody>
        </Card>
    );
};

export default InitialSettingsComponent;
