import React from "react";
import {
    Row, Card, CardBody,
    CardHeader, Col, Label
} from "components";
import { Link } from "react-router-dom";
import URL_CONFIG from "services/urlConfig";
import { FEATURE } from "helper/constantsDefined";
import { HorizontalInput } from "../../components";

const InitialSetting = ({ t, values, convertFrom }) => (
    <Card className="mb-4">
        <CardHeader tag="h6">
            {t("InitialSettings")}
        </CardHeader>
        <CardBody>
            {convertFrom === FEATURE.PR && (
                <>
                    {values.pprNumber && (
                        <Row>
                            <Col xs={12}>
                                <Row className="form-group">
                                    <Col md={4} lg={4}>
                                        <Label className="p-0">{t("PrePurchaseRequestNo")}</Label>
                                    </Col>
                                    <Col md={8} lg={8}>
                                        <div
                                            className="form-control"
                                            style={{
                                                backgroundColor: "#F9FAFC"
                                            }}
                                        >
                                            <Link to={{
                                                pathname: URL_CONFIG.PPR_ROUTING
                                                    .DETAIL_PRE_REQUISITIONS,
                                                search: `?uuid=${values.pprUuid}`
                                            }}
                                            >
                                                <span
                                                    style={{
                                                        color: "#4472C4",
                                                        textDecoration: "underline"
                                                    }}
                                                >
                                                    {values.pprNumber}
                                                </span>
                                            </Link>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    )}
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="prNumber"
                                label={t("PurchaseRequestNo")}
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
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="currencyCode"
                                label={t("Currency")}
                                type="text"
                                className="label-required"
                                value={values.currencyCode}
                                disabled
                            />
                        </Col>
                    </Row>
                    {(String(values.project) === "true") && (
                        <Row>
                            <Col xs={12}>
                                <HorizontalInput
                                    name="projectCode"
                                    label={t("Project")}
                                    type="text"
                                    className="label-required"
                                    value={values.projectCode}
                                    disabled
                                />
                            </Col>
                        </Row>
                    )}
                </>
            )}
            {convertFrom !== FEATURE.PR && (
                <>
                    {values.pprNumber && (
                        <Row>
                            <Col xs={12}>
                                <Row className="form-group">
                                    <Col md={4} lg={4}>
                                        <Label className="p-0">{t("PrePurchaseRequestNo")}</Label>
                                    </Col>
                                    <Col md={8} lg={8}>
                                        <div
                                            className="form-control"
                                            style={{
                                                backgroundColor: "#F9FAFC"
                                            }}
                                        >
                                            <Link to={{
                                                pathname: URL_CONFIG.PPR_ROUTING
                                                    .DETAIL_PRE_REQUISITIONS,
                                                search: `?uuid=${values.pprUuid}`
                                            }}
                                            >
                                                <span
                                                    style={{
                                                        color: "#4472C4",
                                                        textDecoration: "underline"
                                                    }}
                                                >
                                                    {values.pprNumber}
                                                </span>
                                            </Link>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    )}
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
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="currencyCode"
                                label={t("Currency")}
                                type="text"
                                className="label-required"
                                value={values.currencyCode}
                                disabled
                            />
                        </Col>
                    </Row>
                </>
            )}
        </CardBody>
    </Card>
);

export default InitialSetting;
