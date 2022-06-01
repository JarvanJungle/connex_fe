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
import InputDateTime from "routes/components/InputDateTime/InputDateTime";
import { RFQ_CONSTANTS } from "../../helper";

const RequestTerms = (props) => {
    const {
        t, errors,
        touched,
        addresses,
        rfqTypes,
        handleChange,
        values,
        disabled,
        loading
    } = props;

    return (
        <Card>
            <CardHeader tag="h6" loading={loading}>
                {t("RequestTerms")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <SelectInput
                            name="rfqType"
                            label={t("RFQType")}
                            className="label-required"
                            placeholder={t("PleaseSelectRFQType")}
                            errors={errors.rfqType}
                            touched={touched.rfqType}
                            options={rfqTypes}
                            optionLabel="label"
                            optionValue="value"
                            onChange={handleChange}
                            value={values.rfqType}
                            disabled={disabled}
                            loading={loading}
                        />
                    </Col>
                </Row>
                {values.rfqType !== "One-off" && (
                    <>
                        <Row>
                            <Col xs={12}>
                                <HorizontalInput
                                    name="validityStartDate"
                                    label={t("ValidityStartDate")}
                                    type="date"
                                    onChange={handleChange}
                                    value={values.validityStartDate}
                                    errors={errors.validityStartDate}
                                    touched={touched.validityStartDate}
                                    className="label-required"
                                    disabled={disabled && !values.isUpdate}
                                    loading={loading}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <HorizontalInput
                                    name="validityEndDate"
                                    label={t("ValidityEndDate")}
                                    type="date"
                                    onChange={handleChange}
                                    value={values.validityEndDate}
                                    errors={errors.validityEndDate}
                                    touched={touched.validityEndDate}
                                    className="label-required"
                                    disabled={disabled && !values.isUpdate}
                                    loading={loading}
                                />
                            </Col>
                        </Row>
                    </>
                )}
                <Row>
                    <Col xs={12}>
                        <InputDateTime
                            placeholderText={t("PleaseSelectValidDueDate")}
                            showTimeInput
                            dateFormat="dd/MM/yyyy, HH:mm:ss"
                            timeFormat="HH:mm"
                            name="dueDate"
                            label={t("DueDate")}
                            onChange={handleChange}
                            value={values.dueDate}
                            errors={errors.dueDate}
                            touched={touched.dueDate}
                            className="label-required"
                            disabled={
                                disabled
                                && !values.isUpdate
                                && values.rfqStatus !== RFQ_CONSTANTS.CLOSED
                            }
                            loading={loading}
                        />
                    </Col>
                </Row>
                {!(disabled && !values.isUpdate) && (
                    <Row>
                        <Col xs={12}>
                            <SelectInput
                                name="deliveryAddress"
                                label={t("DeliveryAddress")}
                                className="label-required"
                                placeholder={t("PleaseSelectDeliveryAddress")}
                                errors={errors.deliveryAddress}
                                touched={touched.deliveryAddress}
                                options={addresses}
                                optionLabel="addressLabel"
                                optionValue="uuid"
                                onChange={handleChange}
                                value={values.deliveryAddress}
                                disabled={disabled && !values.isUpdate}
                                loading={loading}
                            />
                        </Col>
                    </Row>
                )}
                {(disabled && !values.isUpdate) && (
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="deliveryAddress"
                                label={t("DeliveryAddress")}
                                type="text"
                                onChange={handleChange}
                                value={values.deliveryAddress}
                                errors={errors.deliveryAddress}
                                touched={touched.deliveryAddress}
                                className="label-required"
                                disabled
                                loading={loading}
                            />
                        </Col>
                    </Row>
                )}
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="deliveryDate"
                            label={t("DeliveryDate")}
                            type="date"
                            onChange={handleChange}
                            value={values.deliveryDate}
                            errors={errors.deliveryDate}
                            touched={touched.deliveryDate}
                            className="label-required"
                            disabled={disabled && !values.isUpdate}
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
                            disabled={disabled && !values.isUpdate}
                            loading={loading}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default RequestTerms;
