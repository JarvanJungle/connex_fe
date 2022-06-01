import React from "react";
import { Checkbox } from "primereact/checkbox";
import {
    Card, CardBody, CardHeader, Col, Row
} from "components";
import { UncontrolledTooltip } from "reactstrap";
import HorizontalInput from "../../../PurchaseOrder/components/HorizontalInput";

const OpcInvoiceDetails = (props) => {
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
                            name="invoiceNumber"
                            label={t("InvoiceNo")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="pcNumber"
                            label={t("Official Progress Claim No.")}
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
                            name="projectTitle"
                            label={t("Project")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="invoiceReferenceNumber"
                            label={t("Invoice Reference No.")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="invoiceDate"
                            label={t("Invoice Date")}
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
                        <HorizontalInput
                            name="workOrderTitle"
                            label={t("Work Order Title")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="paymentClaimReferenceMonth"
                            label={t("Claim Reference Month")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="paymentTerm"
                            label={t("Payment Term")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="note"
                            label={t("Note")}
                            type="textarea"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default OpcInvoiceDetails;
