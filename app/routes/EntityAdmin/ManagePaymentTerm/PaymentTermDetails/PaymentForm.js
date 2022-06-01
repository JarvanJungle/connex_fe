import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { AvField } from "availity-reactstrap-validation";
import {
    Card, CardBody, CardHeader, FormGroup, Col, Row
} from "components";
import { formatDateTime } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";

const PaymentForm = (props) => {
    const { t } = useTranslation();
    const {
        headerName,
        isCreate,
        isEdit,
        form,
        updateForm
    } = props;

    return (
        <>
            <Card className="mb-4">
                <CardHeader tag="h6">
                    {headerName}
                </CardHeader>
                <CardBody className="p-4">
                    <FormGroup>
                        <Row xs="12" className="d-flex mx-0">
                            <Col xs="12" md="6" className="label-required">
                                <AvField
                                    type="text"
                                    name="ptName"
                                    label={t("PaymentTermName")}
                                    placeholder={t("EnterPaymentTermName")}
                                    validate={{
                                        required: { value: true, errorMessage: t("PaymentTermNameIsRequired") }
                                    }}
                                    disabled={!isCreate}
                                    value={form.ptName}
                                    onChange={(e) => { updateForm("ptName", e.target.value); }}
                                />
                            </Col>
                        </Row>
                        <Row xs="12" className="d-flex mx-0">
                            <Col xs="10" md="6" className="label-required number-input">
                                <AvField
                                    type="number"
                                    name="ptDays"
                                    label={t("PaymentTermPayIn")}
                                    placeholder={t("EnterPaymentTermPayIn")}
                                    validate={{
                                        required: { value: true, errorMessage: t("PaymentTermPayInIsRequired") },
                                        min: { value: 0 }
                                    }}
                                    disabled={!isCreate}
                                    value={form.ptDays}
                                    onChange={(e) => { updateForm("ptDays", e.target.value); }}
                                />
                            </Col>
                            <span className="mt-4 pt-3">
                                days
                            </span>
                        </Row>
                        <Row xs="12" className="d-flex mx-0">
                            <Col xs="12" md="6">
                                <AvField
                                    type="textarea"
                                    name="ptRemarks"
                                    maxLength={500}
                                    label={t("PaymentTermRemarks")}
                                    placeholder={t("EnterPaymentTermRemarks")}
                                    validate={{
                                        required: { value: false, errorMessage: t("PaymentTermRemarksIsRequired") }
                                    }}
                                    disabled={!isEdit}
                                    value={form.ptRemarks}
                                    onChange={(e) => { updateForm("ptRemarks", e.target.value); }}
                                />
                            </Col>
                        </Row>
                    </FormGroup>
                </CardBody>
            </Card>
        </>
    );
};

PaymentForm.propTypes = {
    isCreate: PropTypes.bool.isRequired,
    isEdit: PropTypes.bool.isRequired,
    form: PropTypes.instanceOf(Object).isRequired,
    updateForm: PropTypes.func.isRequired
};

export default PaymentForm;
