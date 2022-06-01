/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useRef, useState } from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    SelectInput,
    HorizontalInput,
    Label,
    FormGroup,
    MultiSelect
} from "components";
import { ErrorMessage, Field } from "formik";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";
import BankAccountService from "services/BankAccountService/BankAccountService";
import useToast from "routes/hooks/useToast";
import CreatableSelect from "react-select/creatable";
import PaymentBatchService from "services/PaymentBatchService/PaymentBatchService";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { PAYMENT_BATCH_CONSTANTS } from "../helper";

const PaymentDetails = (props) => {
    const showToast = useToast();
    const {
        t,
        disabled,
        values,
        touched,
        errors,
        bankAccounts,
        emails,
        paymentMethods,
        handleChange,
        setFieldValue,
        companyUuid,
        chargeBearers
    } = props;
    const [paymentMethodConverted, setPaymentMethodConverted] = useState("");
    const [bankAccount, setBankAccount] = useState("");

    const [integrationProductList, setIntegrationProductList] = useState([]);
    const [isShowChargeBearer, setIsShowChargeBearer] = useState(false);

    const convertPaymentMethod = (method) => {
        switch (method) {
            case PAYMENT_BATCH_CONSTANTS.MANUAL:
                return PAYMENT_BATCH_CONSTANTS.MANUAL_BANK_TRANSFER;
            case PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION:
                return PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION;
            default:
                return method;
        }
    };

    const onChangePaymentMethod = async (e) => {
        const { value } = e.target;
        // if (value === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION) {
        //     showToast("error", "Payment method isn't supported. Please choose another one");
        // }

        setFieldValue("paymentMethod", value);
        setFieldValue("productType", "");
        setFieldValue("chargeBearer", "");

        if ((value === PAYMENT_BATCH_CONSTANTS.MANUAL
            || value === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION)
            && !values.sourceBankAccount
        ) {
            const bankAccountDefaults = bankAccounts.filter(
                (item) => item.defaultAccount
            );
            if (bankAccountDefaults.length > 0) {
                const bankInfo = bankAccountDefaults[0];
                const { uuid } = bankAccountDefaults[0];
                try {
                    const bankIntegrationProduct = await PaymentBatchService.getIntegrationProduct(companyUuid, uuid);
                    if (bankIntegrationProduct.data.status === RESPONSE_STATUS.OK) {
                        setIntegrationProductList(bankIntegrationProduct?.data?.data?.mtBankProductDtoList);
                    }
                } catch (err) {
                    console.log(err);
                }
                BankAccountService.getBankAccountDetails(
                    companyUuid, bankAccountDefaults[0].uuid
                ).then((response) => {
                    const {
                        branch, swiftCode, bankLabel, country
                    } = response
                        && response.data
                        && response.data.data;
                    setFieldValue("sourceBankAccount", uuid);
                    setFieldValue("bankName", bankInfo?.bankName);
                    setFieldValue("bankAccountNo", bankInfo?.bankAccountNo);
                    setFieldValue("accountHolder", bankInfo?.accountHolderName);
                    setFieldValue("branch", branch);
                    setFieldValue("country", country);
                    setFieldValue("swiftCode", swiftCode);
                    setFieldValue("bankLabel", bankLabel);
                });
            }
        }
    };

    const onChangeBankAccount = async (e) => {
        const uuid = e.target.value;
        const bankInfo = bankAccounts.find((item) => item.uuid === uuid);
        const response = await BankAccountService.getBankAccountDetails(companyUuid, uuid);
        const {
            branch, swiftCode, bankLabel, country
        } = response && response.data && response.data.data;
        try {
            const bankIntegrationProduct = await PaymentBatchService.getIntegrationProduct(companyUuid, uuid);
            if (bankIntegrationProduct.data.status === RESPONSE_STATUS.OK) {
                setIntegrationProductList(bankIntegrationProduct?.data?.data?.mtBankProductDtoList);
            }
        } catch (err) {
            console.log(err);
        }
        setFieldValue("productType", "");
        setFieldValue("chargeBearer", "");
        setFieldValue("sourceBankAccount", uuid);
        setFieldValue("bankName", bankInfo?.bankName);
        setFieldValue("bankAccountNo", bankInfo?.bankAccountNo);
        setFieldValue("accountHolder", bankInfo?.accountHolderName);
        setFieldValue("branch", branch);
        setFieldValue("swiftCode", swiftCode);
        setFieldValue("bankLabel", bankLabel);
        setFieldValue("country", country);
    };

    const onChangeIntegrationProduct = async (e) => {
        const uuid = e.target.value;
        setFieldValue("productType", uuid);
    };

    useEffect(() => {
        if (disabled && values.paymentMethod) {
            setPaymentMethodConverted(convertPaymentMethod(values.paymentMethod));
        }
    }, [values.paymentMethod]);

    useEffect(() => {
        if (disabled && values.sourceBankAccount) {
            // const bankInfo = bankAccounts.find((item) => item.uuid === values.sourceBankAccount);
            setBankAccount(`${values?.bankLabel} (${values?.bankAccountNo})`);
        }
    }, [values.sourceBankAccount]);

    const [selected, setSelected] = useState();
    const selectedRef = useRef();

    const handleChangeCreatable = (
        newValue
    ) => {
        setSelected(newValue);
        setFieldValue("emailsNotification", newValue.map((item) => item?.label));
    };

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("PaymentDetails")}
            </CardHeader>
            <CardBody>
                {/* Payment Method */}
                <Row>
                    <Col xs={12}>
                        {
                            !disabled
                            && (
                                <SelectInput
                                    name="paymentMethod"
                                    label={t("PaymentMethod")}
                                    placeholder={t("PleaseSelectPaymentMethod")}
                                    options={paymentMethods}
                                    optionLabel="name"
                                    optionValue="value"
                                    errors={errors.paymentMethod}
                                    touched={touched.paymentMethod}
                                    value={values.paymentMethod}
                                    onChange={onChangePaymentMethod}
                                    className="label-required"
                                    disabled={disabled}
                                />
                            )
                        }
                        {
                            disabled
                            && (
                                <HorizontalInput
                                    name="paymentMethod"
                                    label={t("PaymentMethod")}
                                    type="text"
                                    value={paymentMethodConverted}
                                    placeholder=""
                                    errors={errors.paymentMethod}
                                    touched={touched.paymentMethod}
                                    className="label-required"
                                    disabled
                                />
                            )
                        }
                    </Col>
                </Row>
                {/* Bank Account */}
                {
                    (values.paymentMethod === PAYMENT_BATCH_CONSTANTS.MANUAL
                        || values.paymentMethod === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION
                    )
                    && (
                        <Row>
                            <Col xs={12}>
                                {
                                    !disabled
                                    && (
                                        <Row className="form-group label-required">
                                            <Col md={4} lg={4}>
                                                <Label className="p-0">{t("BankAccount")}</Label>
                                            </Col>
                                            <Col md={8} lg={8}>
                                                <Field name="sourceBankAccount">
                                                    {({ field }) => (
                                                        <select
                                                            {...field}
                                                            className={
                                                                classNames("form-control", {
                                                                    "is-invalid": errors.sourceBankAccount
                                                                        && touched.sourceBankAccount
                                                                })
                                                            }
                                                            onChange={onChangeBankAccount}
                                                            disabled={disabled}
                                                        >
                                                            <option value="" hidden defaultValue>{t("SelectBankAccount")}</option>
                                                            {bankAccounts.map((bank) => (
                                                                <option
                                                                    key={uuidv4()}
                                                                    value={bank.uuid}
                                                                >
                                                                    {`${bank.bankLabel} (${bank.bankAccountNo})`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </Field>
                                                <ErrorMessage name="sourceBankAccount" component="div" className="invalid-feedback" />
                                            </Col>
                                        </Row>
                                    )
                                }
                                {
                                    disabled
                                    && (
                                        <HorizontalInput
                                            name="bankAccount"
                                            label={t("BankAccount")}
                                            type="text"
                                            value={bankAccount}
                                            placeholder=""
                                            errors={errors.bankAccount}
                                            touched={touched.bankAccount}
                                            className="label-required"
                                            disabled
                                        />
                                    )
                                }
                            </Col>
                        </Row>
                    )
                }
                {/* Bank Integration Product */}
                {
                    (values.paymentMethod === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION)
                    && (
                        <Row>
                            <Col xs={12}>
                                {
                                    !disabled
                                    && (
                                        <SelectInput
                                            name="productType"
                                            label={t("BankIntegrationProduct")}
                                            placeholder={t("PleaseSelectBankIntegrationProduct")}
                                            options={integrationProductList}
                                            optionLabel="productDesc"
                                            optionValue="productType"
                                            errors={errors.productType}
                                            touched={touched.productType}
                                            value={values.productType}
                                            onChange={onChangeIntegrationProduct}
                                            className="label-required"
                                            disabled={disabled}
                                        />
                                    )
                                }
                                {
                                    disabled
                                    && (
                                        <HorizontalInput
                                            name="productType"
                                            label={t("BankIntegrationProduct")}
                                            type="text"
                                            value={values.productType}
                                            placeholder=""
                                            errors={errors.productType}
                                            touched={touched.productType}
                                            className="label-required"
                                            disabled
                                        />
                                    )
                                }
                            </Col>
                        </Row>
                    )
                }
                {/* Charge Bearer */}
                {
                    (values.paymentMethod === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION && values.productType === "TT")
                    && (
                        <Row>
                            <Col xs={12}>
                                {
                                    !disabled
                                    && (
                                        <SelectInput
                                            name="chargeBearer"
                                            label={t("Charge Bearer")}
                                            placeholder={t("Please select Charge Bearer")}
                                            options={chargeBearers}
                                            optionLabel="label"
                                            optionValue="value"
                                            errors={errors.chargeBearer}
                                            touched={touched.chargeBearer}
                                            value={values.chargeBearer}
                                            onChange={handleChange}
                                            className="label-required"
                                            disabled={disabled}
                                        />
                                    )
                                }
                                {
                                    disabled
                                    && (
                                        <HorizontalInput
                                            name="chargeBearer"
                                            label={t("Charge Bearer")}
                                            type="text"
                                            value={values.chargeBearer}
                                            placeholder=""
                                            errors={errors.chargeBearer}
                                            touched={touched.chargeBearer}
                                            className="label-required"
                                            disabled
                                        />
                                    )
                                }
                            </Col>
                        </Row>
                    )
                }
                {/* Cheque Number */}
                {
                    values.paymentMethod === PAYMENT_BATCH_CONSTANTS.CHEQUE
                    && (
                        <Row>
                            <Col xs={12}>
                                <HorizontalInput
                                    name="chequeNumber"
                                    label={t("ChequeNumber")}
                                    type="text"
                                    value={values.chequeNumber}
                                    placeholder={t("PleaseEnterChequeNumber")}
                                    errors={errors.chequeNumber}
                                    touched={touched.chequeNumber}
                                    className="label-required"
                                    disabled={disabled}
                                />
                            </Col>
                        </Row>
                    )
                }
                {
                    (values.paymentMethod === PAYMENT_BATCH_CONSTANTS.MANUAL
                        || values.paymentMethod === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION
                    )
                    && (
                        <>
                            {/* Bank Name */}
                            <Row>
                                <Col xs={12}>
                                    <HorizontalInput
                                        name="bankName"
                                        label={t("BankName")}
                                        type="text"
                                        value={values.bankName}
                                        placeholder=""
                                        errors={errors.bankName}
                                        touched={touched.bankName}
                                        disabled
                                    />
                                </Col>
                            </Row>
                            {/* Bank Account No. */}
                            <Row>
                                <Col xs={12}>
                                    <HorizontalInput
                                        name="bankAccountNo"
                                        label={t("BankAccountNo")}
                                        type="text"
                                        value={values.bankAccountNo}
                                        placeholder=""
                                        errors={errors.bankAccountNo}
                                        touched={touched.bankAccountNo}
                                        disabled
                                    />
                                </Col>
                            </Row>
                            {/* Bank Account Holder */}
                            <Row>
                                <Col xs={12}>
                                    <HorizontalInput
                                        name="accountHolder"
                                        label={t("BankAccountHolder")}
                                        type="text"
                                        value={values.accountHolder}
                                        placeholder=""
                                        errors={errors.accountHolder}
                                        touched={touched.accountHolder}
                                        disabled
                                    />
                                </Col>
                            </Row>
                            {/* Bank Account Branch */}
                            <Row>
                                <Col xs={12}>
                                    <HorizontalInput
                                        name="branch"
                                        label={t("BankAccountBranch")}
                                        type="text"
                                        value={values.branch}
                                        placeholder=""
                                        errors={errors.branch}
                                        touched={touched.branch}
                                        disabled
                                    />
                                </Col>
                            </Row>
                            {/* Swift Code */}
                            <Row>
                                <Col xs={12}>
                                    <HorizontalInput
                                        name="swiftCode"
                                        label={t("SwiftCode")}
                                        type="text"
                                        value={values.swiftCode}
                                        placeholder=""
                                        errors={errors.swiftCode}
                                        touched={touched.swiftCode}
                                        disabled
                                    />
                                </Col>
                            </Row>
                        </>
                    )
                }
                {/* Execution Date */}
                {
                    (values.paymentMethod === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION)
                    && (
                        <>
                            <Row>
                                <Col xs={12}>
                                    <HorizontalInput
                                        name="executionDate"
                                        label={t("ExecutionDate")}
                                        type="date"
                                        value={values.executionDate}
                                        placeholder=""
                                        errors={errors.executionDate}
                                        touched={touched.executionDate}
                                        className="label-required"
                                        disabled={disabled}
                                    />
                                </Col>
                            </Row>
                            {!disabled && (
                                <Row>
                                    <Col xs={4} md={4} className="label-required">
                                        <Label>{t("NotificationEmailList")}</Label>
                                    </Col>
                                    <Col xs={8} md={8} className="mb-3">
                                        <CreatableSelect
                                            ref={selectedRef}
                                            isClearable
                                            isMulti
                                            onChange={handleChangeCreatable}
                                            options={emails}
                                            value={selected}
                                        />
                                    </Col>
                                </Row>
                            )}
                            {
                                disabled
                                && (
                                    <HorizontalInput
                                        name="emailsNotificationText"
                                        label={t("NotificationEmailList")}
                                        type="text"
                                        value={values.emailsNotificationText}
                                        placeholder=""
                                        errors={errors.emailsNotificationText}
                                        touched={touched.emailsNotificationText}
                                        className="label-required"
                                        disabled
                                    />
                                )
                            }

                        </>
                    )
                }
                {/* Payment Release Date */}
                {
                    values.paymentMethod !== PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION
                    && (
                        <Row>
                            <Col xs={12}>
                                <HorizontalInput
                                    name="paymentReleaseDate"
                                    label={t("PaymentReleaseDate")}
                                    type="date"
                                    value={values.paymentReleaseDate}
                                    placeholder=""
                                    errors={errors.paymentReleaseDate}
                                    touched={touched.paymentReleaseDate}
                                    className="label-required"
                                    disabled={disabled}
                                />
                            </Col>
                        </Row>
                    )
                }
                {/* Remarks */}
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="remarks"
                            label={t("Remarks")}
                            type="textarea"
                            value={values.remarks}
                            placeholder=""
                            errors={errors.remarks}
                            touched={touched.remarks}
                            disabled={disabled}
                            maxLength={200}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default PaymentDetails;
