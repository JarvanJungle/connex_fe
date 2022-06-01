import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { formatDisplayDecimal } from "helper/utilities";
import { HorizontalInput } from "../../../components";
import { DPC_STATUS } from "../../Helper";

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
            (
                (!isBuyer
            && [
                DPC_STATUS.PENDING_ACKNOWLEDGE_DRAFT_VALUATION,
                DPC_STATUS.PENDING_OFFICIAL_CLAIMS_SUBMISSION,
                DPC_STATUS.PENDING_REVERT,
                DPC_STATUS.CONVERTED_TO_OFFICIAL_CLAIMS
            ].includes(status))
            || [
                DPC_STATUS.PENDING_VALUATION,
                DPC_STATUS.RECALLED, DPC_STATUS.PENDING_APPROVAL,
                DPC_STATUS.SENT_BACK,
                DPC_STATUS.PENDING_SUBMISSION_TO_MAIN_QS,
                DPC_STATUS.PENDING_REVERT,
                DPC_STATUS.PENDING_ACKNOWLEDGE_DRAFT_VALUATION,
                DPC_STATUS.PENDING_OFFICIAL_CLAIMS_SUBMISSION,
                DPC_STATUS.CONVERTED_TO_OFFICIAL_CLAIMS
            ].includes(status)) || forceRender
        ) {
            return true;
        } return false;
    };

    const checkRenderElement = (status, isMainQS) => {
        if (
            (isMainQS) || forceRender
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
        setFieldValue("lessFinalRetentionAmnt", lessFinalRetentionAmnt);
        setFieldValue("retentionCumulativeWorkDone", retentionCumulativeWorkDone);
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
                checkRenderComponent(draftClaimDetail.dpcStatus)
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
                                            value={formatDisplayDecimal(values.cumulativeCertMainconWorks, 2, values.currencyCode)}
                                        />
                                    </Col>
                                </Row>
                                {
                                    checkRenderElement(draftClaimDetail.dpcStatus, draftClaimDetail.mainQs)
                        && (
                            <Row>
                                <Col xs={12}>
                                    <HorizontalInput
                                        name="cumulativeCertUnfixedGoodsMaterials"
                                        label={t("Cumulative Certified For Unfixed Goods and Materials on Site")}
                                        type="text"
                                        disabled
                                        value={formatDisplayDecimal(values.cumulativeCertUnfixedGoodsMaterials, 2, values.currencyCode)}
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
                                            value={formatDisplayDecimal(values.cumulativeCertAgreedVarOrder, 2, values.currencyCode)}
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
                                            value={formatDisplayDecimal(values.cumulativeCertified, 2, values.currencyCode)}
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
                                            value={formatDisplayDecimal(values.retentionCumulativeWorkDone, 2, values.currencyCode)}
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
                                            value={formatDisplayDecimal(values.retentionAmountCappedAt, 2, values.currencyCode)}
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
                                            value={formatDisplayDecimal(values.lessFinalRetentionAmnt, 2, values.currencyCode)}
                                        />
                                    </Col>
                                </Row>
                                {
                                    checkRenderElement(draftClaimDetail.dpcStatus, draftClaimDetail.mainQs)
                        && (
                            <Row>
                                <Col xs={12}>
                                    <HorizontalInput
                                        name="addCertRetentionWorkDone"
                                        label={t("Add: Certified Retention Release Of Work Done")}
                                        type="text"
                                        disabled
                                        value={formatDisplayDecimal(values.addCertRetentionWorkDone, 2, values.currencyCode)}
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
                                            value={formatDisplayDecimal(values.lessPrevCumulPayments, 2, values.currencyCode)}
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
                                            value={formatDisplayDecimal(values.amntCertPayments, 2, values.currencyCode)}
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
