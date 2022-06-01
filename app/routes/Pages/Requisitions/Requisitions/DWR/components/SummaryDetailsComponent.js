import React, { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Row,
    CustomInput,
    Label,
    Tooltip
} from "components";
import { Checkbox } from "primereact/checkbox";
import { HorizontalInput, SelectInput } from "routes/P2P/PurchaseRequest/components";

let timeout = null;
const SummaryDetailsComponent = (props) => {
    const {
        t,
        values,
        touched,
        viewMode,
        handleChange,
        dirty,
        setFieldValue,
        errors,
        dwrItems,
        onChangeList
    } = props;
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const toggle = () => setTooltipOpen(!tooltipOpen);

    const autoFillRententionPercentItem = (value) => {
        if (dwrItems && dwrItems.length) {
            const newDataDWRItems = dwrItems.map((item) => {
                if (item.groupName.length === 1) {
                    return {
                        ...item,
                        retentionPercentage: Number(value)
                    };
                } return item;
            });
            onChangeList(newDataDWRItems);
        }
    };
    useEffect(() => {
        if (dwrItems && dwrItems.length > 0) {
            let total = 0;
            dwrItems.forEach((item) => {
                const { quantity, unitPrice, totalAmount } = item;
                if (item.groupNumber.length === 1) {
                    total += totalAmount || 0;
                }
            });
            setFieldValue("originalContractSum", total.toFixed(2));

            if (values.retentionCappedPercentage) {
                setFieldValue("retentionAmountCappedAt", ((total * Number(values.retentionCappedPercentage)) / 100).toFixed(2));
            }

            if (values) {
                setFieldValue("remeasuredContractSum", (total + Number(values.bqContingencySum)).toFixed(2));
            }
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
                                type="number"
                                errors={errors.originalContractSum}
                                touched={touched.originalContractSum}
                                onChange={(e) => {
                                    const { value } = e.target;
                                    if (value) {
                                        setFieldValue("bqContingencySum", value);
                                        if (values.originalContractSum != null) {
                                            const remeasuredContractSum = Number(value) + Number(values.originalContractSum);
                                            setFieldValue("remeasuredContractSum", remeasuredContractSum);
                                        }
                                    } else {
                                        setFieldValue("bqContingencySum", "");
                                    }
                                }}
                                disabled
                                placeholder={t("AutoCalculatedBasedOnTheWorkBreakdownBelow")}
                            />
                        </Col>
                    </Row>
                    {
                        values.contractType === "REMEASUREMENT"
                        && (
                            <>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="bqContingencySum"
                                            label={t("BQContingencySum")}
                                            type="number"
                                            className="label-required"
                                            errors={errors.bqContingencySum}
                                            touched={touched.bqContingencySum}
                                            onChange={(e) => {
                                                const { value } = e.target;
                                                if (value) {
                                                    setFieldValue("bqContingencySum", Number(value));
                                                    if (values.originalContractSum != null) {
                                                        const remeasuredContractSum = Number(value) + Number(values.originalContractSum);
                                                        setFieldValue("remeasuredContractSum", Number(remeasuredContractSum).toFixed(2));
                                                    }
                                                } else {
                                                    setFieldValue("bqContingencySum", "");
                                                }
                                            }}
                                            placeholder={t("EnterBQContingencySum")}
                                            disabled={viewMode}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="remeasuredContractSum"
                                            label={t("RemeasuredContractSum")}
                                            type="number"
                                            errors={errors.remeasuredContractSum}
                                            touched={touched.remeasuredContractSum}
                                            disabled
                                        />
                                    </Col>
                                </Row>
                            </>
                        )
                    }

                    <Row>
                        <Col md={4} lg={4} className="d-flex">
                            <Label className="p-0">{t("IncludeVariationForRetentionCap")}</Label>
                            <i className="fa fa-info-circle ml-2" id="tooltip" style={{ fontSize: "20px" }} />
                            <Tooltip placement="top" isOpen={tooltipOpen} target="tooltip" toggle={toggle} style={{ textAlign: "left" }}>

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
                                onChange={(e) => setFieldValue("includeVariation", e.target.checked)}
                                disabled={viewMode}
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
                                type="number"
                                className="label-required"
                                errors={errors.retentionPercentage}
                                touched={touched.retentionPercentage}
                                onChange={(e) => {
                                    const { value } = e.target;
                                    clearTimeout(timeout);
                                    setFieldValue("retentionPercentage", value);
                                    timeout = setTimeout(() => {
                                        autoFillRententionPercentItem(value);
                                    }, 300);
                                }}
                                placeholder={t("10%")}
                                disabled={viewMode}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="retentionCappedPercentage"
                                label={t("RetentionCappedAt")}
                                type="number"
                                className="label-required"
                                errors={errors.retentionCappedPercentage}
                                touched={touched.retentionCappedPercentage}
                                onChange={(e) => {
                                    const { value } = e.target;
                                    if (value) {
                                        setFieldValue("retentionCappedPercentage", value);
                                        if (values.originalContractSum !== null) {
                                            const retentionAmountCappedAt = (Number(values.originalContractSum) * Number(value)) / 100;
                                            setFieldValue("retentionAmountCappedAt", Number(retentionAmountCappedAt).toFixed(2));
                                        }
                                    } else {
                                        setFieldValue("retentionCappedPercentage", "");
                                    }
                                }}
                                placeholder={t("5%")}
                                disabled={viewMode}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="retentionAmountCappedAt"
                                label={t("RetentionAmountCappedAt")}
                                type="number"
                                errors={errors.retentionAmountCappedAt}
                                touched={touched.retentionAmountCappedAt}
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
