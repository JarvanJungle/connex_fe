import React, { useEffect, useState } from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    HorizontalInput
} from "components";
import { SelectInput } from "routes/PreRequisitions/RaisePreRequisitions/components";
import { OfficialProgressiveClaimService } from "services/OfficialProgressiveClaimService";
import useToast from "routes/hooks/useToast";
import { INVOICE_CONSTANTS } from "../helper";
import { DVPC_INVOICE_TYPE } from "../helper/constant";

const InvoiceDetailsComponent = (props) => {
    const {
        t,
        disabled,
        options,
        values,
        touched,
        errors,
        onChangeInvoiceType,
        onChangePc,
        currentCompany,
        isBuyer,
        isOPC = false,
        opcDetail = {}
    } = props;
    const showToast = useToast();
    const [architects, setArchitects] = useState([]);
    const loadArchitects = async () => {
        try {
            const res = await OfficialProgressiveClaimService.getArchitectClaimMcList(currentCompany.companyUuid, isBuyer);
            const array = res.data.data.map((item) => ({
                label: item.pcNumber,
                value: item.pcUuid
            }));
            setArchitects(array);
        } catch (error) {
            showToast(
                "error",
                error.response ? error.response.data.message : error.message
            );
        }
    };
    useEffect(() => {
        if (isOPC) {
            loadArchitects();
        }
    }, [isOPC]);
    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("InvoiceDetails")}
            </CardHeader>
            <CardBody>
                {
                    opcDetail && Object.keys(opcDetail).length
                    && [DVPC_INVOICE_TYPE.DVPC_INVOICE_PROJECT.key, DVPC_INVOICE_TYPE.DVPC_INVOICE_NON_PROJECT.key].includes(opcDetail.invoiceType)
                        ? (
                            <>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="invoiceType"
                                            label={t("InvoiceType")}
                                            type="text"
                                            value={opcDetail.invoiceType === DVPC_INVOICE_TYPE.DVPC_INVOICE_PROJECT.key ? "OPC Invoice" : "NON-OPC Invoice"}
                                            placeholder=""
                                            disabled
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="opcNumber"
                                            label={t("Official Progress Claim No.")}
                                            type="text"
                                            value={opcDetail?.pcNumber || ""}
                                            placeholder=""
                                            disabled
                                        />
                                    </Col>
                                </Row>
                            </>
                        )
                        : (
                            <>
                                <Row>
                                    <Col xs={12}>
                                        <SelectInput
                                            name="invoiceType"
                                            label={t("InvoiceType")}
                                            placeholder={t("PleaseSelectInvoiceType")}
                                            errors={errors.invoiceType}
                                            touched={touched.invoiceType}
                                            options={options}
                                            optionLabel="label"
                                            optionValue="value"
                                            onChange={(event) => onChangeInvoiceType(event)}
                                            value={values.invoiceType}
                                            disabled={disabled}
                                            className="label-required"
                                        />
                                    </Col>
                                </Row>
                                {
                                    isOPC
                    && (
                        <Row>
                            <Col xs={12}>
                                <SelectInput
                                    name="opcNumber"
                                    label={t("Official Progress Claim No.")}
                                    placeholder={t("PleaseSelectInvoiceType")}
                                    errors={errors.opcNumber}
                                    touched={touched.opcNumber}
                                    options={architects}
                                    optionLabel="label"
                                    optionValue="value"
                                    onChange={(event) => onChangePc(event)}
                                    // value={values.pcNumber}
                                    disabled={disabled}
                                    className="label-required"
                                />
                            </Col>
                        </Row>
                    )
                                }
                            </>
                        )
                }

            </CardBody>
        </Card>
    );
};

export default InvoiceDetailsComponent;
