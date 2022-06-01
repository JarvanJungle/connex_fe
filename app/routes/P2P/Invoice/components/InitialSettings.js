import React, { useEffect } from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput } from "routes/PreRequisitions/RaisePreRequisitions/components";
import { DVPC_INVOICE_TYPE } from "../helper/constant";

const InitialSettings = (props) => {
    const {
        t,
        values,
        touched,
        errors,
        currencies,
        setFieldValue,
        enablePrefix,
        opcDetail = {}
    } = props;

    useEffect(() => {
        if (values.currencyCode) {
            const currency = currencies.find((item) => item.currencyCode === values.currencyCode);
            if (currency) {
                setFieldValue("currency", `${currency.currencyName} (+${currency.currencyCode})`);
            }
        }
    }, [values.currencyCode, currencies]);

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("InitialSettings")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="invoiceNo"
                            label={t("InvoiceNo")}
                            type="text"
                            value={values.invoiceNo}
                            className={enablePrefix ? "label-required" : ""}
                            placeholder=""
                            errors={errors.invoiceNo}
                            touched={touched.invoiceNo}
                            disabled={!enablePrefix}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="currency"
                            label={t("Currency")}
                            type="text"
                            value={values.currency}
                            placeholder=""
                            errors={errors.currency}
                            touched={touched.currency}
                            disabled
                        />
                    </Col>
                </Row>
                {
                    opcDetail && opcDetail.invoiceType === DVPC_INVOICE_TYPE.DVPC_INVOICE_PROJECT.key
                    && (
                        <Row>
                            <Col xs={12}>
                                <HorizontalInput
                                    name="project"
                                    label={t("Project")}
                                    type="text"
                                    value={values.project || ""}
                                    placeholder=""
                                    errors={errors.project}
                                    touched={touched.project}
                                    disabled
                                />
                            </Col>
                        </Row>
                    )
                }
            </CardBody>
        </Card>
    );
};

export default InitialSettings;
