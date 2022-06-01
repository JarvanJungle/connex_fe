import React from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Row,
    Label
} from "components";
import { HorizontalInput, SelectInput } from "routes/P2P/PurchaseRequest/components";
import { ErrorMessage, Field } from "formik";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";

const DWRInitialSettings = (props) => {
    const {
        t,
        values,
        touched,
        viewMode,
        handleChange,
        dirty,
        setFieldValue,
        errors,
        currencies
    } = props;
    const currenciesOptions = currencies.map(item => {
        item.currencyLabel = `${item.currencyName} (+${item.currencyCode})`;
        return item;
    });
    return (
        <>
            <Card className="mb-4">
                <CardHeader tag="h6">{t("InitialSettings")}</CardHeader>
                <CardBody>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="wrNumber"
                                label={t("DeveloperWorkRequestNo")}
                                type="text"
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="status"
                                label={t("Status")}
                                type="text"
                                disabled
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
                                        disabled={values.project || viewMode}
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
                    {/* <Row>
                        <Col xs={12}>
                            <SelectInput
                                name="currencyCode"
                                label={t("Currency")}
                                className="label-required"
                                placeholder={t("PleaseSelectACurrency")}
                                errors={errors.currencyCode}
                                touched={touched.currencyCode}
                                options={currenciesOptions}
                                optionLabel="currencyLabel"
                                optionValue="currencyCode"
                                onChange={(e) => {
                                    const { value } = e.target;
                                    if (value) {
                                        setFieldValue("currencyCode", value);
                                        const selectedCurrency = currencies.find((item) => item.currencyCode === value);
                                        if (selectedCurrency) {
                                            setFieldValue("currencyName", selectedCurrency.currencyName);
                                            setFieldValue("currencyUuid", selectedCurrency.uuid);
                                        }
                                    }
                                }}
                                value={values.currencyCode}
                                disabled={values.project}
                            />
                        </Col>
                    </Row> */}
                </CardBody>
            </Card>
        </>
    );
};

export default DWRInitialSettings;
