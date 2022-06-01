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
import HorizontalInput from "routes/P2P/PurchaseOrder/DeveloperWorkOrderDetails/components/HorizontalInput";
import { SelectInput } from "../../components";

const useStyles = makeStyles({
    "clear-all": {
        color: "#4472C4",
        textDecoration: "underline",
        cursor: "pointer",
        background: "unset",
        border: "unset"
    }
});

const InitialSettingComponent = (props) => {
    const classes = useStyles();
    const {
        t, values, errors,
        touched,
        suppliers,
        currencies,
        setFieldValue,
        handleChange
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("InitialSettings")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="dwoNumber"
                            label={t("DeveloperWorkOrderNo")}
                            type="text"
                            value={values.dwoNumber || ""}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="dwrNumber"
                            label={t("DeveloperWorkRequisitionNo")}
                            type="text"
                            value={values.dwrNumber || ""}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="dwoStatus"
                            label={t("Status")}
                            type="text"
                            value={values?.dwoStatus?.replaceAll("_", " ")}
                            disabled
                        />
                    </Col>
                </Row>
                <Row className="label-required form-group">
                    <Col md={4} lg={4}>
                        <Label className="p-0">{t("Currency")}</Label>
                    </Col>
                    <Col md={8} lg={8}>
                        {/* <SelectInput
                        name="currencyCode"
                        label={t("currencyCode")}
                        className="label-required"
                        placeholder={t("PleaseSelectACurrency")}
                        errors={errors.currencyCode}
                        touched={touched.currencyCode}
                        options={currencies}
                        optionLabel="currencyName"
                        optionValue="currencyCode"
                        onChange={handleChange}
                        value={values.currencyCode}
                    /> */}
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
                                    value={values.currencyCode}
                                    disabled
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

            </CardBody>
        </Card>
    );
};

export default InitialSettingComponent;
