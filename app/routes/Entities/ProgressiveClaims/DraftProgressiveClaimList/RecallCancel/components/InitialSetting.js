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
import { HorizontalInput } from "../../../components";

export default function InitialSetting(props) {
    const { t } = useTranslation();

    const {
        pageState,
        values,
        errors,
        touched,
        typeOfRequisitions,
        natureOfRequisitions,
        projects,
        handleChange,
        setFieldValue,
        onChangeNature,
        onChangeProject
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">{t("InitialSettings")}</CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="dpcNumber"
                            label={t("DraftProgressClaimNo.")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="dwoNumber"
                            label={t("DeveloperWorkOrderNo.")}
                            type="text"
                            hyperlink={values.dwoUuid ? {
                                url: `${PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_DETAIL}?uuid=${values.dwoUuid}`,
                                blank: true
                            } : null}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="dpcStatus"
                            label={t("DPCStatus")}
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
