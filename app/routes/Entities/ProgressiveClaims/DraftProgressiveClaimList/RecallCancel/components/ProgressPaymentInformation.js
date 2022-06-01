import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label
} from "components";
import {
    ErrorMessage,
    Field
} from "formik";
import DatePicker, { CalendarContainer } from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import classNames from "classnames";
import moment from "moment";
import { HorizontalInput } from "../../../components";
import { DPC_STATUS } from "../../Helper";

let timer;
export default function ProgressPaymentInformation(props) {
    const { t } = useTranslation();
    const {
        values,
        errors,
        touched,
        handleChange,
        setFieldValue,
        draftClaimDetail = {}
    } = props;

    function getToalDaysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    const onChangeDate = (value) => {
        const month = moment(value).month() + 1;
        const year = moment(value).year();
        const dayInMonth = getToalDaysInMonth(month, year);
        setFieldValue("claimPeriodEndDate", `${dayInMonth}/${month}/${year}`);
        setFieldValue("claimPeriodStartDate", `1/${month}/${year}`);
        setFieldValue("paymentClaimReferenceMonth", `${year}-${month}`);
    };

    useEffect(() => {
        let paymentClaimReferenceMonthFormat = "";
        if (values.paymentClaimReferenceMonth) {
            const momentObject = moment(values.paymentClaimReferenceMonth, "YYYY-M");
            paymentClaimReferenceMonthFormat = (momentObject.isValid() ? momentObject : moment(values.paymentClaimReferenceMonth, "M-YYYY")).format("MMM YYYY");
        }
        setFieldValue("paymentClaimReferenceMonthFormat", paymentClaimReferenceMonthFormat);
    }, [values.paymentClaimReferenceMonth])

    const checkEditableByStatus = (status) => {
        if (
            status === DPC_STATUS.CREATED
            || status === DPC_STATUS.RECALLED
            || status === DPC_STATUS.SENT_BACK
        ) {
            return true;
        } return false;
    };
    const MyContainer = ({ className, children }) => (
        <div style={{ padding: 0 }}>
            <CalendarContainer className={className}>
                <div style={{ position: "relative" }}>{children}</div>
            </CalendarContainer>
        </div>
    );
    return (
        <Card className="mb-4">
            <CardHeader tag="h6">{t("Progress Payment Information")}</CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <Row className="label-required form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("Payment Claim Reference No.")}</Label>
                            </Col>
                            <Col md={8} lg={8}>

                                <input
                                    defaultValue={values.paymentClaimReferenceNo}
                                    name="paymentClaimReferenceNo"
                                    label={t("Payment Claim Reference No.")}
                                    type="text"
                                    disabled={!checkEditableByStatus(draftClaimDetail.dpcStatus)}
                                    className={
                                        classNames(
                                            "form-control",
                                            { "is-invalid": errors.paymentClaimReferenceNo && touched.paymentClaimReferenceNo }
                                        )
                                    }
                                    onChange={(e) => {
                                        clearTimeout(timer);
                                        const { value } = e.target;
                                        timer = setTimeout(
                                            () => {
                                                setFieldValue("paymentClaimReferenceNo", value);
                                                timer = null;
                                            }, 1000
                                        );
                                    }}
                                />
                                {errors.paymentClaimReferenceNo && touched.paymentClaimReferenceNo && <div className="invalid-feedback">{t("PleaseEnterValidPaymentClaimReferenceNo")}</div>}
                            </Col>

                        </Row>

                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className="label-required form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("Payment Claim Reference Month")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <Field
                                    name="paymentClaimReferenceMonthFormat"
                                >
                                    {
                                        ({ form, field }) => (
                                            <DatePicker
                                                id="paymentClaimReferenceMonthFormat"
                                                {...field}
                                                onChange={(date) => onChangeDate(date)}
                                                showMonthYearPicker
                                                className={
                                                    classNames(
                                                        "form-control",
                                                        { "is-invalid": errors.paymentClaimReferenceMonth && touched.paymentClaimReferenceMonthFormat }
                                                    )
                                                }
                                                calendarContainer={MyContainer}
                                                disabled={!checkEditableByStatus(draftClaimDetail.dpcStatus)}
                                            />
                                        )
                                    }

                                </Field>
                                <ErrorMessage name="paymentClaimReferenceMonth" component="div" className="invalid-feedback d-block" />
                            </Col>

                        </Row>
                        {/* <HorizontalInput
                            errors={errors.paymentClaimReferenceMonth}
                            touched={touched.paymentClaimReferenceMonth}
                            name="paymentClaimReferenceMonth"
                            label={t("Payment Claim Reference Month")}
                            type="month"
                            className="label-required"
                            onChange={
                                (e) => {
                                    onChangeDate(e);
                                    handleChange(e);
                                }
                            }
                            disabled={!checkEditableByStatus(draftClaimDetail.dpcStatus)}
                        /> */}
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="claimPeriodStartDate"
                            label={t("Claim Period - Start Date")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="claimPeriodEndDate"
                            label={t("Claim Period - End Date")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
}
