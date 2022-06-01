import React from "react";
import { Field } from "formik";
import { useTranslation } from "react-i18next";
import {
    Row, Card, CardBody, CardHeader, Col
} from "components";
import { HorizontalInput } from "../../components";
import { PAGE_STAGE } from "../Helper";

export default function SummaryDetails(props) {
    const { t } = useTranslation();

    const {
        pageState,
        values, errors,
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
            <CardHeader tag="h6">
                {t("Summary Detail")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="originalContractSum"
                            label={t("Original Contract Sum")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="bqContingencySum"
                            label={t("BQ Contingency Sum")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                            className="label-required"
                        />
                        <HorizontalInput
                            name="remeasuredContractSum"
                            label={t("Remeasured Contract Sum")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="agreedVariationOrderSum"
                            label={t("Agreed Variation Order Sum")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="adjustedContractSum"
                            label={t("Adjusted Contact Sum")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="includeVariation"
                            label={t("Include subcon variation for retention cap")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                        />
                        <HorizontalInput
                            name="retentionPercentage"
                            label={t("Retention")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                            className="label-required"
                        />
                        <HorizontalInput
                            name="retentionCappedPercentage"
                            label={t("Retention Capped At")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                            className="label-required"
                        />
                        <HorizontalInput
                            name="retentionAmountCappedAt"
                            label={t("Retention Amount Capped At")}
                            type="text"
                            disabled={pageState === PAGE_STAGE.DETAIL}
                            className="label-required"
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
}
