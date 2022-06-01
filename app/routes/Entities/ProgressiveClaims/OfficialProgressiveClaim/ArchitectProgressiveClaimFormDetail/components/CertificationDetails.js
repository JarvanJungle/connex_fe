import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { formatNumberForRow } from "helper/utilities";
import { HorizontalInput } from "../../../components";
import { PC_STATUS, ACE_STATUS } from "../../Helper";

export default function CertificationDetails(props) {
    const { t } = useTranslation();

    const {
        values,
        isBuyer,
        draftClaimDetail = {},
        setFieldValue,
        draftClaim,
        forceRender = false
    } = props;

    const checkRenderComponent = (status) => {
        if (
            (isBuyer) || ([ACE_STATUS.PENDING_CONVERT_TO_INVOICE].includes(status)) || forceRender
        ) {
            return true;
        } return false;
    };

    const checkRenderElement = (status, isMainQS) => {
        if (
            isMainQS || ([ACE_STATUS.PENDING_CONVERT_TO_INVOICE].includes(status))
        ) {
            return true;
        } return false;
    };
    useEffect(() => {
        const { totalDataOriginalOrder = {}, totalDataUnfixedGoods = {} } = draftClaim;
        const {
            cumulativeCertifiedMainConWorksTotalAmount = 0,
            cumulativeCertifiedWorkDoneTotalAmount = 0
        } = totalDataOriginalOrder;
        const {
            cumulativeCertifiedUnfixedTotalAmount = 0,
            cumulativeBalanceWorkDone = 0
        } = totalDataUnfixedGoods;
        setFieldValue("cumulativeCertMainconWorks", cumulativeCertifiedMainConWorksTotalAmount);
        setFieldValue("cumulativeCertUnfixedGoodsMaterials", cumulativeCertifiedUnfixedTotalAmount);

        const cumulativeCertified = cumulativeCertifiedMainConWorksTotalAmount
            + cumulativeCertifiedUnfixedTotalAmount
            + Number(values.cumulativeCertAgreedVarOrder || 0);

        const retentionCumulativeWorkDone = cumulativeCertifiedWorkDoneTotalAmount + cumulativeBalanceWorkDone + 0;
        const lessFinalRetentionAmnt = Number(values.retentionAmountCappedAt) > Number(retentionCumulativeWorkDone)
            ? Number(retentionCumulativeWorkDone) : Number(values.retentionAmountCappedAt);
        setFieldValue("lessFinalRetentionAmnt", values.lessFinalRetentionAmnt || lessFinalRetentionAmnt);
        setFieldValue("retentionCumulativeWorkDone", values.retentionCumulativeWorkDone || retentionCumulativeWorkDone);
        setFieldValue("cumulativeCertified", cumulativeCertified);
        const amntCertPayments = cumulativeCertified
            - lessFinalRetentionAmnt
            + values.addCertRetentionWorkDone
            - values.lessPrevCumulPayments;
        setFieldValue("amntCertPayments", amntCertPayments);
    }, [JSON.stringify(draftClaim.totalDataOriginalOrder), JSON.stringify(draftClaim.totalDataUnfixedGoods)]);

    return (
        <>
            {
                checkRenderComponent(draftClaimDetail.aceStatus)
                    ? (
                        <Card className="mb-4">
                            <CardHeader tag="h6">{t("Certification Details")}</CardHeader>
                            <CardBody>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="cumulativeCertMainconWorks"
                                            label={t("Cumulative Certified For Main-Con Works.")}
                                            type="text"
                                            disabled
                                            value={`${values?.currencyCode} ${formatNumberForRow({ value: values.cumulativeCertMainconWorks })}`}
                                        />
                                    </Col>
                                </Row>
                                {
                                    checkRenderElement(draftClaimDetail.aceStatus, draftClaimDetail.mainQs)
                                    && (
                                        <Row>
                                            <Col xs={12}>
                                                <HorizontalInput
                                                    name="cumulativeCertUnfixedGoodsMaterials"
                                                    label={t("Cumulative Certified For Unfixed Goods and Materials on Site")}
                                                    type="text"
                                                    disabled
                                                    value={`${values?.currencyCode} ${formatNumberForRow({ value: values.cumulativeCertUnfixedGoodsMaterials })}`}
                                                />
                                            </Col>
                                        </Row>
                                    )
                                }

                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="cumulativeCertAgreedVarOrder"
                                            label={t("Cumulative Certified For Agreed Variation Order")}
                                            type="text"
                                            disabled
                                            value={`${values?.currencyCode} ${formatNumberForRow({ value: values.cumulativeCertAgreedVarOrder })}`}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="cumulativeCertified"
                                            label={t("Cumulative Certified")}
                                            type="text"
                                            disabled
                                            value={`${values?.currencyCode} ${formatNumberForRow({ value: values.cumulativeCertified })}`}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="retentionCumulativeWorkDone"
                                            label={t("Retention of Cumulative Work Done")}
                                            type="text"
                                            disabled
                                            value={`${values?.currencyCode} ${formatNumberForRow({ value: values.retentionCumulativeWorkDone })}`}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="retentionAmountCappedAt"
                                            label={t("Retention Amount Capped At")}
                                            type="text"
                                            disabled
                                            value={`${values?.currencyCode} ${formatNumberForRow({ value: values.retentionAmountCappedAt })}`}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="lessFinalRetentionAmnt"
                                            label={t("Less: Final Retention Amount")}
                                            type="text"
                                            disabled
                                            value={`${values?.currencyCode} ${formatNumberForRow({ value: values.lessFinalRetentionAmnt })}`}
                                        />
                                    </Col>
                                </Row>
                                {
                                    checkRenderElement(draftClaimDetail.aceStatus, draftClaimDetail.mainQs)
                                    && (
                                        <Row>
                                            <Col xs={12}>
                                                <HorizontalInput
                                                    name="addCertRetentionWorkDone"
                                                    label={t("Add: Certified Retention Release Of Work Done")}
                                                    type="text"
                                                    disabled
                                                    value={`${values?.currencyCode} ${formatNumberForRow({ value: values.addCertRetentionWorkDone })}`}
                                                />
                                            </Col>
                                        </Row>
                                    )
                                }
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="lessPrevCumulPayments"
                                            label={t("Less: Previous Cumulative Payments")}
                                            type="text"
                                            disabled
                                            value={`${values?.currencyCode} ${formatNumberForRow({ value: values.lessPrevCumulPayments })}`}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="amntCertPayments"
                                            label={t("Amount Certified for This Payment")}
                                            type="text"
                                            disabled
                                            value={`${values?.currencyCode} ${formatNumberForRow({ value: values.amntCertPayments })}`}
                                        />
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    ) : null
            }
        </>

    );
}
