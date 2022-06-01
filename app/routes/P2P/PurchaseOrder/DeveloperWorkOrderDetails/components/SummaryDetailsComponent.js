import React, { useEffect } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Row,
    CustomInput,
    Label,
    HorizontalInput,
    SelectInput
} from "components";
import { Checkbox } from "primereact/checkbox";
import { formatNumberForRow } from "helper/utilities";
import { CONTRACT_TYPES } from "helper/constantsDefined";

const SummaryDetailsComponent = (props) => {
    const {
        t,
        values,
        touched,
        handleChange,
        dirty,
        setFieldValue,
        errors,
        dwrItems
    } = props;

    useEffect(() => {
        if (dwrItems && dwrItems.length > 0) {
            let total = 0;
            dwrItems.forEach((item) => {
                const { quantity, unitPrice } = item;
                if (quantity && unitPrice) {
                    total += Number(quantity) * Number(unitPrice);
                }
            });
            setFieldValue("originalContractSum", total);
        }
    }, [dwrItems]);

    return (
        <>
            <Card>
                <CardHeader tag="h6">{t("SummaryDetails")}</CardHeader>
                <CardBody>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="originalContractSum"
                                label={t("OriginalContractSum")}
                                type="text"
                                errors={errors.originalContractSum}
                                touched={touched.originalContractSum}
                                value={formatNumberForRow({ value: values.originalContractSum })}
                                disabled
                            />
                        </Col>
                    </Row>
                    {values.contractType !== CONTRACT_TYPES.LUMP_SUM && (
                        <>
                            <Row>
                                <Col xs={12}>
                                    <HorizontalInput
                                        name="bqContingencySum"
                                        label={t("BQContingencySum")}
                                        type="text"
                                        className="label-required"
                                        value={formatNumberForRow({ value: values.bqContingencySum })}
                                        errors={errors.bqContingencySum}
                                        touched={touched.bqContingencySum}
                                        onChange={(e) => {
                                            const { value } = e.target;
                                            if (value) {
                                                setFieldValue("bqContingencySum", value);
                                                if (values.originalContractSum != null) {
                                                    const remeasuredContractSum = Number(value) + Number(values.originalContractSum);
                                                    setFieldValue("remeasuredContractSum", remeasuredContractSum);
                                                }
                                            }
                                        }}
                                        disabled
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12}>
                                    <HorizontalInput
                                        name="remeasuredContractSum"
                                        label={t("RemeasuredContractSum")}
                                        type="text"
                                        errors={errors.remeasuredContractSum}
                                        touched={touched.remeasuredContractSum}
                                        value={formatNumberForRow({ value: values.remeasuredContractSum })}
                                        disabled
                                    />
                                </Col>
                            </Row>
                        </>
                    )}
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="agreedVariationOrderSum"
                                label={t("MainconVariationSum")}
                                type="text"
                                errors={errors.agreedVariationOrderSum}
                                touched={touched.agreedVariationOrderSum}
                                value={`${values.currencyCode} ${formatNumberForRow({ value: values.agreedVariationOrderSum })}`}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="adjustedContractSum"
                                label={t("AdjustedContractSum")}
                                type="text"
                                errors={errors.adjustedContractSum}
                                touched={touched.adjustedContractSum}
                                value={`${values.currencyCode} ${formatNumberForRow({ value: values.adjustedContractSum })}`}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={4} lg={4}>
                            <Label className="p-0">{t("IncludeVariationForRetentionCap")}</Label>
                        </Col>
                        <Col md={8} lg={8}>
                            <CustomInput
                                type="checkbox"
                                id="includeVariationCheckbox"
                                name="includeVariation"
                                errors={errors.includeVariation}
                                touched={touched.includeVariation}
                                checked={values.includeVariation}
                                disabled
                            />
                        </Col>
                        {/* <Col xs={12}>
                         <HorizontalInput
                         name="variationForRetentionCap"
                         label={t("IncludeVariationForRetentionCap")}
                         type="number"
                         errors={errors.variationForRetentionCap}
                         touched={touched.variationForRetentionCap}
                         />
                         </Col> */}
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="retentionPercentage"
                                label={t("RetentionCurrentWorkCertified")}
                                type="text"
                                errors={errors.retentionPercentage}
                                touched={touched.retentionPercentage}
                                value={formatNumberForRow({ value: values.retentionPercentage })}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="retentionCappedPercentage"
                                label={t("RetentionCappedAt")}
                                type="text"
                                errors={errors.retentionCappedPercentage}
                                touched={touched.retentionCappedPercentage}
                                onChange={(e) => {
                                    const { value } = e.target;
                                    if (value) {
                                        setFieldValue("retentionCappedPercentage", value);
                                        if (values.originalContractSum) {
                                            const retentionAmountCappedAt = Number(values.originalContractSum) * Number(value) / 100;
                                            setFieldValue("retentionAmountCappedAt", retentionAmountCappedAt);
                                        }
                                    }
                                }}
                                value={formatNumberForRow({ value: values.retentionCappedPercentage })}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="retentionAmountCappedAt"
                                label={t("RetentionAmountCappedAt")}
                                type="text"
                                errors={errors.retentionAmountCappedAt}
                                touched={touched.retentionAmountCappedAt}
                                value={formatNumberForRow({ value: values.retentionAmountCappedAt })}
                                disabled
                            />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </>
    );
};

export default SummaryDetailsComponent;
