import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label,
    Tooltip,
    CustomInput
} from "components";
import { formatNumberForRow, formatNumberPercentForRow, formatDisplayDecimal } from "helper/utilities";
import { HorizontalInput } from "../../../components";
import { PAGE_STAGE } from "../../Helper";

export default function SummaryDetails(props) {
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
        onChangeProject,
        totalAmount,
        subTitle = ""
    } = props;

    const [tooltipOpen, setTooltipOpen] = useState(false);
    const toggle = () => setTooltipOpen(!tooltipOpen);
    useEffect(() => {
        const originalContractSum = Number(totalAmount) || 0;
        setFieldValue("originalContractSum", originalContractSum);
        setFieldValue("adjustedContractSum", originalContractSum + Number(values.agreedVariationOrderSum || 0));
        setFieldValue("remeasuredContractSum", originalContractSum + Number(values.bqContingencySum || 0));
        setFieldValue("remeasuredContractSum", originalContractSum * Number(values.retentionCappedPercentage || 0));
    }, [totalAmount]);

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("Summary Detail")}
            </CardHeader>
            <CardBody>
                <Row>
                    { subTitle &&  <Col xs={12} className="mb-3">
                        <span>{subTitle}</span>
                    </Col>}
                    <Col xs={12}>
                        <HorizontalInput
                            name="originalContractSum"
                            label={t("Original Contract Sum")}
                            type="text"
                            value={formatDisplayDecimal(values.originalContractSum, 2, values.currencyCode)}
                            disabled
                        />
                        {
                            values.contractType === "REMEASUREMENT"
                             && (
                                 <>
                                     <HorizontalInput
                                         name="bqContingencySum"
                                         label={t("BQ Contingency Sum")}
                                         type="text"
                                         value={formatDisplayDecimal(values.bqContingencySum, 2, values.currencyCode)}
                                         disabled
                                         className="label-required"
                                     />
                                     <HorizontalInput
                                         name="remeasuredContractSum"
                                         label={t("Remeasured Contract Sum")}
                                         type="text"
                                         value={formatDisplayDecimal(values.remeasuredContractSum, 2, values.currencyCode)}
                                         disabled
                                     />
                                 </>
                             )
                        }

                        <HorizontalInput
                            name="agreedVariationOrderSum"
                            label={t("Agreed Variation Order Sum")}
                            type="text"
                            value={formatDisplayDecimal(values.agreedVariationOrderSum, 2, values.currencyCode)}
                            disabled
                        />
                        <HorizontalInput
                            name="adjustedContractSum"
                            label={t("Adjusted Contact Sum")}
                            value={formatDisplayDecimal(values.adjustedContractSum, 2, values.currencyCode)}
                            type="text"
                            disabled
                        />
                        <Row>
                            <Col md={4} lg={4} className="d-flex">
                                <Label className="p-0">{t("IncludeVariationForRetentionCap")}</Label>
                                <i className="fa fa-info-circle" id="tooltip" style={{ fontSize: "20px" }} />
                                <Tooltip placement="top" isOpen={tooltipOpen} target="tooltip" toggle={toggle}>
                                    {t("VariationSumWillBeIncludedInTheCalculationOfRetentionCapIfThisFieldIsChecked")}
                                </Tooltip>
                            </Col>
                            <Col md={8} lg={8}>
                                <CustomInput
                                    type="checkbox"
                                    id="includeVariationCheckbox"
                                    name="includeVariation"
                                    errors={errors.includeVariation}
                                    touched={touched.includeVariation}
                                    checked={values.includeVariation}
                                    // onChange={(e) => setFieldValue("includeVariation", e.target.checked)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <HorizontalInput
                            name="retentionPercentage"
                            label={t("Retention (% Current Works Certified)")}
                            type="text"
                            disabled
                            value={formatNumberPercentForRow({ value: values.retentionPercentage })}
                            className="label-required"
                        />
                        <HorizontalInput
                            name="retentionCappedPercentage"
                            label={t("Retention Capped At (% Total Benchmark)")}
                            type="text"
                            disabled
                            className="label-required"
                            value={formatNumberPercentForRow({ value: values.retentionCappedPercentage })}
                        />
                        <HorizontalInput
                            name="retentionAmountCappedAt"
                            label={t("Retention Amount Capped At")}
                            type="text"
                            disabled
                            value={formatDisplayDecimal(values.retentionAmountCappedAt, 2, values.currencyCode)}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
}
