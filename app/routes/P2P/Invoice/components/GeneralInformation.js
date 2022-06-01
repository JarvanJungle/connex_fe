import React, { useEffect } from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput } from "routes/PreRequisitions/RaisePreRequisitions/components";
import { Checkbox } from "primereact/checkbox";
import IconButton from "@material-ui/core/IconButton";
import classNames from "classnames";
import { convertDate2String } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { makeStyles } from "@material-ui/core/styles";
import { InputNumberFormat } from "routes/components";
import { DVPC_INVOICE_TYPE } from "../helper/constant";

const useStyles = makeStyles({
    tooltip: {
        position: "relative",
        "& .tooltip-text": {
            visibility: "hidden",
            width: "255px",
            backgroundColor: "#868E96",
            color: "#fff",
            borderRadius: "6px",
            padding: "5px",
            position: "absolute",
            zIndex: 10000,
            top: -110,
            left: -115,
            textAlign: "left",
            fontSize: "0.8em",
            border: "1px solid #868E96"
        },
        "&:hover .tooltip-text": {
            visibility: "visible"
        }
    },
    triangle: {
        content: "",
        position: "absolute",
        top: "calc(100% + 6px)",
        right: "48%",
        marginTop: "-5px",
        borderWidth: "7px",
        borderStyle: "solid",
        borderColor: "transparent #868E96 transparent transparent",
        transform: "rotate(-90deg)"
    }
});

const GeneralInformation = (props) => {
    const classes = useStyles();
    const {
        t,
        disabled,
        setFieldValue,
        setTouched,
        handleChange,
        values,
        touched,
        errors,
        opcDetail = {}
        // isOPC = false
    } = props;

    const MILLISECOND_PER_DAY = 24 * 60 * 60 * 1000;

    useEffect(() => {
        if (values.paymentTerms
            && values.invoiceDate
            && typeof values.ptDays === "number"
            && !disabled
        ) {
            const time = new Date(values.invoiceDate).getTime()
                + values.ptDays * MILLISECOND_PER_DAY;
            const invoiceDueDate = new Date(time);

            setFieldValue("invoiceDueDate", convertDate2String(invoiceDueDate, CUSTOM_CONSTANTS.YYYYMMDD));
        }
    }, [values.paymentTerms, values.invoiceDate, values.ptDays, disabled]);
    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("GeneralInformation")}
            </CardHeader>
            <CardBody>
                {
                    [DVPC_INVOICE_TYPE.DVPC_INVOICE_PROJECT.key, DVPC_INVOICE_TYPE.DVPC_INVOICE_NON_PROJECT.key].includes(opcDetail?.invoiceType)
                        ? (
                            <>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="invoiceRefNumber"
                                            label={t("Invoice Reference No.")}
                                            type="text"
                                            value={values.invoiceRefNumber}
                                            placeholder=""
                                            errors={errors.invoiceRefNumber}
                                            touched={touched.invoiceRefNumber}
                                            className="label-required"
                                            disabled={disabled}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="invoiceDate"
                                            label={t("InvoiceDate")}
                                            type="date"
                                            value={values.invoiceDate}
                                            placeholder=""
                                            errors={errors.invoiceDate}
                                            touched={touched.invoiceDate}
                                            disabled={disabled}
                                            className="label-required"
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="invoiceDueDate"
                                            label={t("InvoiceDueDate")}
                                            type="date"
                                            value={values.invoiceDueDate}
                                            placeholder=""
                                            errors={errors.invoiceDueDate}
                                            touched={touched.invoiceDueDate}
                                            disabled={disabled}
                                            className="label-required"
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="woTitle"
                                            label={t("Work Order Title")}
                                            text="text"
                                            value={values.woTitle}
                                            placeholder=""
                                            disabled
                                        />
                                    </Col>
                                </Row>

                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="claimReferenceMonth"
                                            label={t("Claim Reference Month")}
                                            text="text"
                                            value={values.claimReferenceMonth}
                                            placeholder=""
                                            disabled
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="paymentTerms"
                                            label={t("Payment Term")}
                                            text="text"
                                            value={values.paymentTerms}
                                            placeholder=""
                                            disabled
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="note"
                                            label={t("Note")}
                                            type="textarea"
                                            value={values.note}
                                            placeholder=""
                                            disabled={disabled}
                                        />
                                    </Col>
                                </Row>
                            </>
                        )
                        : (
                            <>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="paymentTerms"
                                            label={t("PaymentTerm")}
                                            type="text"
                                            value={values.paymentTerms}
                                            placeholder=""
                                            errors={errors.paymentTerms}
                                            touched={touched.paymentTerms}
                                            disabled
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="invoiceDate"
                                            label={t("InvoiceDate")}
                                            type="date"
                                            value={values.invoiceDate}
                                            placeholder=""
                                            errors={errors.invoiceDate}
                                            touched={touched.invoiceDate}
                                            disabled={disabled}
                                            className="label-required"
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <HorizontalInput
                                            name="invoiceDueDate"
                                            label={t("InvoiceDueDate")}
                                            type="date"
                                            value={values.invoiceDueDate}
                                            placeholder=""
                                            errors={errors.invoiceDueDate}
                                            touched={touched.invoiceDueDate}
                                            disabled={disabled}
                                            className="label-required"
                                        />
                                    </Col>
                                </Row>
                                {
                                    disabled
                                && (
                                    <Row>
                                        <Col xs={12}>
                                            <HorizontalInput
                                                name="invoiceSubmittedDate"
                                                label={t("InvoiceSubmittedDate")}
                                                type="text"
                                                value={values.invoiceSubmittedDate}
                                                placeholder=""
                                                errors={errors.invoiceSubmittedDate}
                                                touched={touched.invoiceSubmittedDate}
                                                disabled={disabled}
                                            />
                                        </Col>
                                    </Row>
                                )
                                }
                                <Row>
                                    <Col xs={12}>
                                        <Row
                                            className={
                                                classNames("mx-0",
                                                    { "form-group": values.expectedAmountGiven },
                                                    { "mb-0": !values.expectedAmountGiven })
                                            }
                                        >
                                            <div className="p-field-checkbox mr-4 mb-0">
                                                <Checkbox
                                                    name="expectedAmountGiven"
                                                    onChange={(e) => {
                                                        setFieldValue("expectedAmountGiven", e.checked);
                                                        if (e.checked === false) {
                                                            setFieldValue("expectedAmount", 0);
                                                        }
                                                    }}
                                                    checked={values.expectedAmountGiven}
                                                    disabled={disabled}
                                                />
                                                <label htmlFor="expectedAmountGiven" className="mb-0">{t("Do you have an Expected Amount?")}</label>
                                            </div>
                                            <IconButton
                                                size="small"
                                                className={classes.tooltip}
                                            >
                                                <div className="tooltip-text">
                                                    {t("Expected Amount is recommended to be filled in when there is a change in unit price or qty for invoice from the PO.")}
                                                    <span className={classes.triangle} />
                                                </div>
                                                <i className="fa fa-info-circle" />
                                            </IconButton>
                                        </Row>
                                    </Col>
                                </Row>
                                {
                                    values.expectedAmountGiven
                                && (
                                    <Row>
                                        <Col xs={12}>
                                            <InputNumberFormat
                                                name="expectedAmount"
                                                label={t("ExpectedAmount")}
                                                value={values.expectedAmount}
                                                handleChange={(e) => {
                                                    setTouched({
                                                        ...touched,
                                                        expectedAmount: true
                                                    });
                                                    handleChange(e);
                                                }}
                                                mode="decimal"
                                                locale="en-US"
                                                maxFractionDigits={2}
                                                minFractionDigits={2}
                                                disabled={disabled}
                                                labelClassName="label-required"
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

export default GeneralInformation;
