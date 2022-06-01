import React from "react";
import { useTranslation } from "react-i18next";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { PURCHASE_ORDER_ROUTES } from "routes/P2P/PurchaseOrder";
import URL_CONFIG from "services/urlConfig";
import { HorizontalInput } from "../../../components";

export default function InitialSetting(props) {
    const { t } = useTranslation();

    const {
        pageState,
        values,
        role = "MAIN_QS" // "ARCHITECT"
    } = props;

    let componentMainQS;
    switch (role) {
    case "MAIN_QS":
        componentMainQS = (
            <>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="pcNumber"
                            label={t("DeveloperProgressClaimNo")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="dpcNumber"
                            label={t("DraftProgressClaimNo")}
                            type="text"
                            disabled
                            hyperlink={values.dpcUuid ? {
                                url: `${URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST_CREATE.replace(":dpcUuid", values.dpcUuid)}`,
                                blank: true
                            } : null}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="dwoNumber"
                            label={t("DeveloperWorkOrderNo.")}
                            type="text"
                            disabled
                            hyperlink={values.dwoUuid ? {
                                url: `${PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_DETAIL}?uuid=${values.dwoUuid}`,
                                blank: true
                            } : null}
                        />
                    </Col>
                </Row>
            </>
        );
        break;
    case "ARCHITECT":
        componentMainQS = (
            <>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="pcNumber"
                            label={t("Offical progress Claim No.")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="dpcNumber"
                            label={t("DraftProgressClaimNo")}
                            type="text"
                            disabled
                            hyperlink={values.dpcUuid ? {
                                url: `${URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST_CREATE.replace(":dpcUuid", values.dpcUuid)}`,
                                blank: true
                            } : null}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contractWorkOrderNo"
                            label={t("Contractor Work Order No.")}
                            type="text"
                            disabled
                            hyperlink={values.dwoUuid ? {
                                url: `${PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_DETAIL}?uuid=${values.dwoUuid}`,
                                blank: true
                            } : null}
                        />
                    </Col>
                </Row>
            </>
        );

        break;
    default:
        componentMainQS = (
            <>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="pcNumber"
                            label={t("DeveloperProgressClaimNo")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="dpcNumber"
                            label={t("DraftProgressClaimNo")}
                            type="text"
                            disabled
                            hyperlink={values.dpcUuid ? {
                                url: `${URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST_CREATE.replace(":dpcUuid", values.dpcUuid)}`,
                                blank: true
                            } : null}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="dwoNumber"
                            label={t("DeveloperWorkOrderNo")}
                            type="text"
                            disabled
                            hyperlink={values.dwoUuid ? {
                                url: `${PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_DETAIL}?uuid=${values.dwoUuid}`,
                                blank: true
                            } : null}
                        />
                    </Col>
                </Row>
            </>
        );

        break;
    }

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">{t("InitialSettings")}</CardHeader>
            <CardBody>
                {componentMainQS}
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="pcStatus"
                            label={t("Status")}
                            type="text"
                            disabled
                            value={values?.pcStatus?.replaceAll("_", " ")}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="currencyCode"
                            label={t("Currency")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
                {
                    values.project
                    && (
                        <>
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
                            <Row>
                                <Col xs={12}>
                                    <HorizontalInput
                                        name="tradeCode"
                                        label={t("ProjectTrade")}
                                        type="text"
                                        disabled
                                    />
                                </Col>
                            </Row>
                        </>
                    )
                }

            </CardBody>
        </Card>
    );
}
