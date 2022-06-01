import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    HorizontalInput,
    SelectInput
} from "components";
import { InputDateTime } from "routes/components";
import classNames from "classnames";
import { Label } from "reactstrap";
import { Field, ErrorMessage } from "formik";

const RequestTerms = (props) => {
    const {
        t, errors,
        touched,
        values,
        disabled,
        taxRecords,
        setFieldValue,
        loading,
        gridApi,
        unconnectedSupplier
    } = props;

    const onChangeTaxCode = (event) => {
        const { value } = event.target;
        const taxRecord = taxRecords.find((item) => item.taxCode === value);
        setFieldValue("taxCode", value);
        gridApi.forEachNode((node) => {
            const { data } = node;
            if (data.itemCode.length === 1) {
                if (taxRecord) node.setDataValue("taxCode", taxRecord);
                else node.setDataValue("taxCode", value);
            }
        });
    };

    return (
        <Card>
            <CardHeader tag="h6" loading={loading}>
                {t("RequestTerms")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            type="text"
                            name="rfqType"
                            label={t("RFQType")}
                            className="label-required"
                            placeholder=""
                            errors={errors.rfqType}
                            touched={touched.rfqType}
                            value={values.rfqType === "Contract" ? "Contract" : "One-off quotation"}
                            loading={loading}
                            disabled
                        />
                    </Col>
                </Row>
                {values.rfqType !== "One-off" && (
                    <>
                        <Row>
                            <Col xs={12}>
                                <InputDateTime
                                    label={t("ValidityStartDate")}
                                    disabled
                                    name="validityStartDate"
                                    placeholderText={t("PleaseSelectValidityStartDate")}
                                    className="label-required"
                                    value={values.validityStartDate}
                                    showTimeInput={false}
                                    dateFormat="dd/MM/yyyy"
                                    loading={loading}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <InputDateTime
                                    label={t("ValidityEndDate")}
                                    disabled
                                    name="validityEndDate"
                                    placeholderText={t("PleaseSelectValidityEndDate")}
                                    className="label-required"
                                    value={values.validityEndDate}
                                    showTimeInput={false}
                                    dateFormat="dd/MM/yyyy"
                                    loading={loading}
                                />
                            </Col>
                        </Row>
                    </>
                )}
                {!unconnectedSupplier && (
                    <Row>
                        <Col xs={12}>
                            <SelectInput
                                name="taxCode"
                                label={t("TaxCode")}
                                className="label-required"
                                placeholder={t("PleaseSelectTaxCode")}
                                errors={errors.taxCode}
                                touched={touched.taxCode}
                                options={taxRecords}
                                optionLabel="taxCode"
                                optionValue="taxCode"
                                onChange={onChangeTaxCode}
                                value={values.taxCode}
                                disabled={disabled}
                                loading={loading}
                            />
                        </Col>
                    </Row>
                )}
                {unconnectedSupplier && (
                    <Row>
                        <Col xs={12}>
                            <Row className="form-group label-required">
                                <Col md={4}>
                                    {!loading && (
                                        <Label className="p-0">{t("TaxCode")}</Label>
                                    )}
                                    {loading && (<div className="phl-col-6" />)}
                                </Col>
                                <Col md={8}>
                                    <Field
                                        value={values.taxCode}
                                        name="taxCode"
                                        type="text"
                                        disabled={disabled}
                                        placeholder={t("EnterTaxCode")}
                                        className={
                                            classNames(
                                                "form-control",
                                                { "is-invalid": errors.taxCode && touched.taxCode }
                                            )
                                        }
                                        onChange={onChangeTaxCode}
                                    />
                                    {!loading && (<ErrorMessage name="taxCode" component="div" className="invalid-feedback" />)}
                                    {loading && (<div className="phl-col-12" />)}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                )}
                <Row>
                    <Col xs={12}>
                        <InputDateTime
                            label={t("DueDate")}
                            disabled
                            name="dueDate"
                            placeholderText={t("PleaseSelectDueDate")}
                            className="label-required"
                            value={values.dueDate}
                            showTimeInput
                            dateFormat="dd/MM/yyyy, HH:mm:ss"
                            loading={loading}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="note"
                            label={t("Note")}
                            type="textarea"
                            maxLength={3000}
                            placeholder={t("EnterNote")}
                            errors={errors.note}
                            rows={4}
                            touched={touched.note}
                            className="mb-0"
                            loading={loading}
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default RequestTerms;
