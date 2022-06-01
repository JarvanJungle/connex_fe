import React from "react";
import { Checkbox } from "primereact/checkbox";
import {
    Card, CardBody, CardHeader, Col, Row
} from "components";
import { UncontrolledTooltip } from "reactstrap";
import HorizontalInput from "../../../PurchaseOrder/components/HorizontalInput";

const InvoiceDetails = (props) => {
    const {
        t,
        readOnly = false,
        values,
        setFieldValue
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("InvoiceDetails")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="invoiceNo"
                            label={t("InvoiceNo")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="invoiceStatus"
                            label={t("Invoice Status")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="currencyCode"
                            label={t("Currency")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="paymentTerms"
                            label={t("PaymentTerm")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="invoiceDueDate"
                            label={t("Invoice Due Date")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <div className="p-field-checkbox">
                            <Checkbox
                                checked={values?.expectedAmountGiven}
                                onChange={() => setFieldValue("expectedAmountGiven", !values?.expectedAmountGiven)}
                                disabled={readOnly}
                            />
                            <span className="mb-0 ml-2">
                                {t("HaveAnExpectedAmountForThisDevice")}
                                <i className="fa fa-info-circle ml-1" id="ExpectedAmountInfo" />
                                <UncontrolledTooltip placement="top" target="ExpectedAmountInfo">
                                    {t("Expected Amount is recommended to be filled in when there is a change in unit price or qty for invoice from the PO.")}
                                </UncontrolledTooltip>
                            </span>
                        </div>
                    </Col>
                    {values?.expectedAmountGiven && (
                        <Col xs={12} className="mt-3">
                            <HorizontalInput
                                name="expectedAmount"
                                label={t("ExpectedAmount")}
                                type="text"
                                disabled={readOnly}
                                className="label-required"
                                classNameInput="text-right"
                            />
                        </Col>
                    )}
                </Row>
            </CardBody>
        </Card>
    );
};

export default InvoiceDetails;
