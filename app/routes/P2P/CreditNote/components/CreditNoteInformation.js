import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label,
    SelectInput,
    HorizontalInput
} from "components";
import { Field } from "formik";
import { RadioButton } from "primereact/radiobutton";
import InvoiceService from "services/InvoiceService/InvoiceService";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";
import { INVOICE_ROUTES } from "routes/P2P/Invoice";
import { roundNumberWithUpAndDown } from "helper/utilities";

const CreditNoteInformation = (props) => {
    const {
        t,
        disabled,
        values,
        touched,
        errors,
        setFieldValue,
        companyUuid,
        isBuyer,
        invoices,
        showToast,
        setDirty,
        setCNAmountTotal,
        currencies,
        enablePrefix
    } = props;

    const onChangeReferenceInvoice = async (event) => {
        setDirty();
        try {
            const { value } = event && event.target;
            setFieldValue("invoiceUuid", value);
            const response = await InvoiceService.getInvDetails(companyUuid, value, isBuyer);
            const { status, data, message } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                const {
                    invoiceItemDtoList, currencyCode,
                    invoiceNo, invoiceDate, projectTitle
                } = data;
                const currency = currencies.find((item) => item.currencyCode === currencyCode);
                setFieldValue("invoiceNumber", invoiceNo);
                setFieldValue("currencyCode", currencyCode);
                setFieldValue("projectTitle", projectTitle || "");
                setFieldValue("invoiceDate", invoiceDate);
                const listItem = invoiceItemDtoList.map((item) => ({
                    itemDescription: item.itemName,
                    itemQuantity: item.invoiceQty,
                    unitPrice: item.invoiceUnitPrice,
                    exchangeRate: currency?.exchangeRate || 1,
                    netPrice: roundNumberWithUpAndDown(
                        Number(item.invoiceQty) * Number(item.invoiceUnitPrice)
                    ),
                    taxCode: item.invoiceTaxCode ? item.invoiceTaxCode : (values?.defaultTax?.taxCode || ""),
                    taxPercent: item.invoiceTaxCodeValue ? item.invoiceTaxCodeValue : (values?.defaultTax?.taxRate || ""),
                    notes: "",
                    uomCode: item.uom,
                    invItemCode: item.itemCode,
                    invItemDescription: item.itemDescription,
                    invItemModel: item.model,
                    invItemSize: item.size,
                    invItemBrand: item.brand,
                    glAccount: item.glCode,
                    costCode: item?.costCode,
                    departmentCode: item?.departmentCode,
                    currencyCode: currency,
                    uuid: uuidv4()
                }));
                setFieldValue("itemList", listItem);
                const subTotal = roundNumberWithUpAndDown(listItem.reduce((sum, item) => sum
                    + roundNumberWithUpAndDown(item.netPrice), 0));
                const diffTax = listItem.some((item) => item.taxPercent !== listItem[0]?.taxPercent);
                let tax;
                if (diffTax) {
                    tax = roundNumberWithUpAndDown(listItem.reduce((sum, item) => {
                        const result = roundNumberWithUpAndDown((roundNumberWithUpAndDown(item.netPrice)
                            * item.taxPercent) / 100);
                        return sum + result;
                    }, 0));
                } else {
                    tax = roundNumberWithUpAndDown((subTotal * listItem[0]?.taxPercent) / 100);
                }
                // const tax = roundNumberWithUpAndDown(listItem.reduce((sum, item) => {
                //     const result = roundNumberWithUpAndDown((roundNumberWithUpAndDown(item.netPrice)
                //         * item.taxPercent) / 100);
                //     return sum + result;
                // }, 0));
                const total = roundNumberWithUpAndDown(subTotal + tax);
                setCNAmountTotal({
                    subTotal,
                    tax,
                    total
                });
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("CreditNoteInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="creditNoteNumber"
                            label={t("CreditNoteNo")}
                            type="text"
                            value={values.creditNoteNumber}
                            placeholder=""
                            className={enablePrefix ? "label-required" : ""}
                            errors={errors.creditNoteNumber}
                            touched={touched.creditNoteNumber}
                            disabled={!enablePrefix}
                        />
                    </Col>
                </Row>
                {
                    !isBuyer
                    && (
                        <Row className="form-group">
                            <Col xs={4}>
                                <Label className="p-0">{t("Reference to Existing Invoice?")}</Label>
                            </Col>
                            <Col xs={4}>
                                <Field name="referenceToInvoice">
                                    {({ field }) => (
                                        <Row className="align-items-center mx-0">
                                            <RadioButton
                                                {...field}
                                                checked={values.referenceToInvoice}
                                                value
                                                disabled={disabled}
                                            />
                                            <Label className="mb-0 ml-2">
                                                {t("Yes")}
                                            </Label>
                                        </Row>
                                    )}
                                </Field>
                            </Col>
                            <Col xs={4}>
                                <Field name="referenceToInvoice">
                                    {({ field }) => (
                                        <Row className="align-items-center mx-0">
                                            <RadioButton
                                                {...field}
                                                checked={!values.referenceToInvoice}
                                                value={false}
                                                disabled={disabled}
                                            />
                                            <Label className="mb-0 ml-2">
                                                {t("No")}
                                            </Label>
                                        </Row>
                                    )}
                                </Field>
                            </Col>
                        </Row>
                    )
                }
                {
                    Boolean(values.referenceToInvoice)
                    && (
                        <Row>
                            <Col xs={12}>
                                {
                                    !disabled
                                    && (
                                        <SelectInput
                                            name="invoiceUuid"
                                            label={t("ReferenceInvoice")}
                                            placeholder={t("PleaseSelectReferenceInvoice")}
                                            options={invoices}
                                            optionLabel="invoiceNo"
                                            optionValue="invoiceUuid"
                                            onChange={(e) => onChangeReferenceInvoice(e)}
                                            errors={errors.invoiceUuid}
                                            touched={touched.invoiceUuid}
                                            value={values.invoiceUuid}
                                            className={!isBuyer ? "label-required" : ""}
                                            disabled={disabled || !values.supplierCode}
                                        />
                                    )
                                }
                                {
                                    disabled
                                    && (
                                        <Row className="form-group">
                                            <Col md={4} lg={4} className={!isBuyer ? "label-required" : ""}>
                                                <Label className="p-0">{t("ReferenceInvoice")}</Label>
                                            </Col>
                                            <Col md={8} lg={8}>
                                                <div
                                                    className="form-control"
                                                    style={{
                                                        backgroundColor: "#F9FAFC"
                                                    }}
                                                >
                                                    <Link to={{
                                                        pathname: INVOICE_ROUTES.INV_DETAILS,
                                                        search: `?uuid=${values.invoiceUuid}`
                                                    }}
                                                    >
                                                        <span
                                                            style={{
                                                                color: "#4472C4",
                                                                textDecoration: "underline"
                                                            }}
                                                        >
                                                            {values.invoiceNumber}
                                                        </span>
                                                    </Link>
                                                </div>
                                            </Col>
                                        </Row>

                                    )
                                }
                            </Col>
                        </Row>
                    )
                }
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="creditNoteDate"
                            label={t("CreditNoteDate")}
                            type="date"
                            value={values.creditNoteDate}
                            placeholder=""
                            errors={errors.creditNoteDate}
                            touched={touched.creditNoteDate}
                            disabled={disabled}
                            className="label-required"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="remarks"
                            label={t("Remarks")}
                            type="textarea"
                            rows={3}
                            value={values.remarks}
                            placeholder={t("PleaseEnterRemark")}
                            errors={errors.remarks}
                            touched={touched.remarks}
                            disabled={disabled}
                            maxLength={500}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default CreditNoteInformation;
