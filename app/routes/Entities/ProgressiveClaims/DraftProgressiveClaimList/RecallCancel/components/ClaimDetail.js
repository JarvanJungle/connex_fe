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
import { PAGE_STAGE } from "../../Helper";

export default function ClaimDetail(props) {
    const { t } = useTranslation();

    const {
        values,
        errors,
        touched,
        setFieldValue,
        draftClaim
    } = props;

    useEffect(() => {
        const { totalDataOriginalOrder = {}, totalDataUnfixedGoods = {} } = draftClaim;
        const { cumulativeClaimedMainConWorksTotalAmount = 0 } = totalDataOriginalOrder;
        const { cumulativeClaimedUnfixedTotalAmount = 0 } = totalDataUnfixedGoods;

        setFieldValue("cumulativeMainConWorks", cumulativeClaimedMainConWorksTotalAmount);
        setFieldValue("cumulativeUnfixedGoodsAndMaterials", cumulativeClaimedUnfixedTotalAmount);

        setFieldValue("cumulativeClaimed",
            Number(cumulativeClaimedMainConWorksTotalAmount)
        + Number(cumulativeClaimedUnfixedTotalAmount)
        + Number(values.cumulativeAgreedVariationOrder || 0));
    }, [JSON.stringify(draftClaim.totalDataOriginalOrder), JSON.stringify(draftClaim.totalDataUnfixedGoods)]);

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("Claim Details")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="cumulativeMainConWorks"
                            label={t("Cumulative Claimed For Main-Con Works")}
                            type="text"
                            value={formatDisplayDecimal(values.cumulativeMainConWorks, 2, values.currencyCode)}
                            disabled
                        />
                        <HorizontalInput
                            name="cumulativeUnfixedGoodsAndMaterials"
                            label={t("Cumulative Claimed For Unfixed Goods and Materials on Site")}
                            type="text"
                            value={formatDisplayDecimal(values.cumulativeUnfixedGoodsAndMaterials, 2, values.currencyCode)}
                            disabled
                        />
                        <HorizontalInput
                            name="cumulativeAgreedVariationOrder"
                            label={t("Cumulative Claimed For Agreed Variation Order")}
                            type="text"
                            value={formatDisplayDecimal(values.cumulativeAgreedVariationOrder, 2, values.currencyCode)}
                            disabled
                        />
                        <HorizontalInput
                            name="cumulativeClaimed"
                            label={t("Cumulative Claimed")}
                            type="text"
                            value={formatDisplayDecimal(values.cumulativeClaimed, 2, values.currencyCode)}
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
}
