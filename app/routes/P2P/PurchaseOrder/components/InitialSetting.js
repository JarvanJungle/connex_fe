import React, { useEffect } from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label
} from "components";
import { Link } from "react-router-dom";
import PR_ROUTES from "routes/P2P/PurchaseRequest/route";
import { RFQ_ROUTES } from "routes/P2P/RequestForQuotation";
import HorizontalInput from "./HorizontalInput";

const InitialSetting = (props) => {
    const {
        t,
        values,
        isBuyer,
        setFieldValue,
        enablePrefix,
        errors,
        touched
    } = props;

    useEffect(() => {
        if (values.currencyName && values.currencyCode) {
            setFieldValue("currency", `${values.currencyName} (+${values.currencyCode})`);
        }
    }, [values.currencyName, values.currencyCode]);

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("InitialSettings")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="poNumber"
                            label={t("PurchaseOrderNo")}
                            className={enablePrefix ? "label-required" : ""}
                            placeholder=""
                            errors={errors.poNumber}
                            touched={touched.poNumber}
                            type="text"
                            disabled={!enablePrefix}
                        />
                    </Col>
                </Row>
                {isBuyer && (values.prNumber || values.rfqNumber) && (
                    <Row>
                        <Col xs={12}>
                            <Row className="form-group">
                                <Col md={4} lg={4}>
                                    <Label className="p-0">{t(values.prNumber ? "PurchaseRequestNo" : "RFQNo")}</Label>
                                </Col>
                                <Col md={8} lg={8}>
                                    <div
                                        className="form-control"
                                        style={{
                                            backgroundColor: "#F9FAFC"
                                        }}
                                    >
                                        {values.prNumber && (
                                            <Link to={{
                                                pathname: PR_ROUTES
                                                    .PURCHASE_REQUISITION_DETAILS,
                                                search: `?uuid=${values.prUuid}`
                                            }}
                                            >
                                                <span
                                                    style={{
                                                        color: "#4472C4",
                                                        textDecoration: "underline"
                                                    }}
                                                >
                                                    {values.prNumber}
                                                </span>
                                            </Link>
                                        )}
                                        {values.rfqNumber && (
                                            <Link to={{
                                                pathname: RFQ_ROUTES.RFQ_DETAILS,
                                                search: `?uuid=${values.rfqUuid}`
                                            }}
                                            >
                                                <span
                                                    style={{
                                                        color: "#4472C4",
                                                        textDecoration: "underline"
                                                    }}
                                                >
                                                    {values.rfqNumber}
                                                </span>
                                            </Link>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                )}
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="poStatus"
                            label={t("Status")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="currency"
                            label={t("Currency")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
                {Boolean(values.project) && isBuyer && (
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="projectCode"
                                label={t("Project")}
                                type="text"
                                disabled
                            />
                        </Col>
                    </Row>
                )}
            </CardBody>
        </Card>
    );
};

export default InitialSetting;
