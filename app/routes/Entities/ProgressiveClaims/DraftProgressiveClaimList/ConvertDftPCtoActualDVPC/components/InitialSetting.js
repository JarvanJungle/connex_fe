import React from "react";
import { useTranslation } from "react-i18next";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput } from "../../../components";

export default function InitialSetting(props) {
    const { t } = useTranslation();

    const {
        values
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
                        </>
                    )
                }

            </CardBody>
        </Card>
    );
}
