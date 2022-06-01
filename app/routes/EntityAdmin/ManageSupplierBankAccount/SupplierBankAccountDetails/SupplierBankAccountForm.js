import React from "react";
import { useTranslation } from "react-i18next";
import Countries from "/public/assets/Countries.jsx";
import Currencies from "/public/assets/Currencies.jsx";
import { AvField } from "availity-reactstrap-validation";
import {
    Row, Card, CardBody, CardHeader, Col, FormGroup, Label, CustomInput
} from "components";
import { PAGE_STAGE } from "../helper";

export default function SupplierBankAccountForm(props) {
    const { t } = useTranslation();

    const {
        pageState,
        formData,
        onChange,
        listBank,
        handleChangeCountry,
        listSupplier,
        handleChangeSupplier,
        handleChangeActive,
        isUpdate
    } = props;
    let isFormDisable = pageState !== PAGE_STAGE.CREATE;
    if (isUpdate) {
        isFormDisable = false;
    }

    return (
        <Row>
            <Col xs={6}>
                <Card className="mb-4">
                    <CardHeader tag="h6">
                        {t("Supplier Information")}
                    </CardHeader>
                    <CardBody>
                        <FormGroup>
                            <Row>
                                <Col xs={12}>
                                    <Row>
                                        <Col xs={6} className="label-required">
                                            <Label>{t("Company Code")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            {
                                                !isFormDisable
                                                    ? (
                                                        <AvField
                                                            type="select"
                                                            name="companyCode"
                                                            validate={{
                                                                required: {
                                                                    value: true,
                                                                    errorMessage: t("LatestPriceIsRequired")
                                                                }
                                                            }}
                                                            value={formData.companyCode}
                                                            onBlur={() => { }}
                                                            onChange={handleChangeSupplier}
                                                            disabled={isFormDisable}
                                                        >
                                                            <option key="" value="">{t("Select Company Code")}</option>
                                                            {
                                                                listSupplier.map((supplier) => (
                                                                    <option
                                                                        key={supplier.companyCode}
                                                                        value={supplier.companyCode}
                                                                    >
                                                                        {`${supplier.companyCode} (${supplier.companyName})`}
                                                                    </option>
                                                                ))
                                                            }
                                                        </AvField>
                                                    ) : (
                                                        <AvField
                                                            type="text"
                                                            name="companyCode"
                                                            placeholder={t("Enter Company Name")}
                                                            value={formData.companyCode}
                                                            onBlur={() => { }}
                                                            onChange={onChange}
                                                            disabled
                                                        />
                                                    )
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6}>
                                            <Label>{t("Company Name")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="text"
                                                name="companyName"
                                                placeholder={t("Enter Company Name")}
                                                value={formData.companyName}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6}>
                                            <Label>{t("Company Reg. No.")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="text"
                                                name="companyRegNo"
                                                placeholder={t("Enter Company Reg. No.")}
                                                value={formData.companyRegNo}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6}>
                                            <Label>{t("Country of Origin")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="text"
                                                name="countryOfOrigin"
                                                placeholder={t("Enter Bank Country Of Origin")}
                                                value={formData.countryOfOrigin}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6}>
                                            <Label>{t("Payment Terms")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="text"
                                                name="paymentTerms"
                                                placeholder={t("Enter Payment Terms")}
                                                value={formData.paymentTerms}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </FormGroup>
                    </CardBody>
                </Card>
            </Col>
            <Col xs={12}>
                <Card className="mb-4">
                    <CardHeader tag="h6">
                        {t("Bank Account Information")}
                    </CardHeader>
                    <CardBody>
                        <FormGroup>
                            <Row>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={6} className="label-required">
                                            <Label>{t("Bank Label")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="text"
                                                name="bankLabel"
                                                placeholder={t("Enter Bank Label")}
                                                validate={{
                                                    required: { value: true, errorMessage: t("EnterValidBankLabel") }
                                                }}
                                                value={formData.bankLabel}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled={isFormDisable}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6} className="label-required">
                                            <Label>{t("Country")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            {
                                                !isFormDisable
                                                    ? (
                                                        <AvField
                                                            type="select"
                                                            name="country"
                                                            validate={{
                                                                required: { value: true, errorMessage: t("PleaseSelectValidCountry") }
                                                            }}
                                                            value={formData.country}
                                                            onBlur={() => { }}
                                                            onChange={handleChangeCountry}
                                                            disabled={isFormDisable}
                                                        >
                                                            <option key="" value="">{t("Select Country")}</option>
                                                            {
                                                                Countries.countries.map(
                                                                    (country) => (
                                                                        <option
                                                                            key={country.name}
                                                                            value={country.name}
                                                                        >
                                                                            {country.name}
                                                                        </option>
                                                                    )
                                                                )
                                                            }
                                                        </AvField>
                                                    ) : (
                                                        <AvField
                                                            type="text"
                                                            name="country"
                                                            placeholder={t("Enter Country")}
                                                            value={formData.country}
                                                            onBlur={() => { }}
                                                            onChange={onChange}
                                                            disabled
                                                        />
                                                    )
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6} className="label-required">
                                            <Label>{t("Bank Name")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            {
                                                !isFormDisable
                                                    ? (
                                                        <AvField
                                                            type="select"
                                                            name="bankName"
                                                            validate={{
                                                                required: { value: true, errorMessage: t("EnterValidBankName") }
                                                            }}
                                                            value={formData.bankName}
                                                            onBlur={() => { }}
                                                            onChange={onChange}
                                                            disabled={isFormDisable}
                                                        >
                                                            <option key="" value="">{t("Select Bank Name")}</option>
                                                            {
                                                                listBank.map((bank) => (
                                                                    <option
                                                                        key={bank.name}
                                                                        value={bank.name}
                                                                    >
                                                                        {bank.name}
                                                                    </option>
                                                                ))
                                                            }
                                                        </AvField>
                                                    ) : (
                                                        <AvField
                                                            type="text"
                                                            name="bankName"
                                                            placeholder={t("Enter Bank Name")}
                                                            value={formData.bankName}
                                                            onBlur={() => { }}
                                                            onChange={onChange}
                                                            disabled
                                                        />
                                                    )
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6} className="label-required">
                                            <Label>{t("Bank Account No.")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="number"
                                                name="bankAccountNo"
                                                placeholder={t("Enter Bank Account No")}
                                                validate={{
                                                    required: { value: true, errorMessage: t("EnterValidBankAccountNo") },
                                                    maxLength: { value: 16, errorMessage: "Bank Account No. must be less than 18 characters" }
                                                }}
                                                value={formData.bankAccountNo}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled={isFormDisable}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6} className="label-required">
                                            <Label>{t("Account Holder Name")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="text"
                                                name="accountHolderName"
                                                placeholder={t("Enter Full Name")}
                                                validate={{
                                                    required: { value: true, errorMessage: t("EnterValidAccountHolderName") }
                                                }}
                                                value={formData.accountHolderName}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled={isFormDisable}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6} className="label-required">
                                            <Label>{t("Currency")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            {
                                                !isFormDisable
                                                    ? (
                                                        <AvField
                                                            type="select"
                                                            name="currency"
                                                            validate={{
                                                                required: { value: true, errorMessage: t("PleaseSelectValidCurrency") }
                                                            }}
                                                            value={formData.currency}
                                                            onBlur={() => { }}
                                                            onChange={onChange}
                                                            disabled={isFormDisable}
                                                        >
                                                            <option key="" value="">{t("Select Currency")}</option>
                                                            {
                                                                Currencies.currencies.map(
                                                                    (currency) => (
                                                                        <option
                                                                            key={currency.name}
                                                                            value={currency.code}
                                                                        >
                                                                            {`${currency.name} (+${currency.code})`}
                                                                        </option>
                                                                    )
                                                                )
                                                            }
                                                        </AvField>
                                                    ) : (
                                                        <AvField
                                                            type="text"
                                                            name="currency"
                                                            placeholder={t("Enter currency")}
                                                            value={formData.currency}
                                                            onBlur={() => { }}
                                                            onChange={onChange}
                                                            disabled
                                                        />
                                                    )
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6}>
                                            <Label>{t("Swift Code")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="text"
                                                name="swiftCode"
                                                value={formData.swiftCode}
                                                placeholder={t("Enter Swift Code")}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled={isFormDisable}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6} />
                                        <Col xs={6}>
                                            <FormGroup>
                                                <CustomInput
                                                    type="checkbox"
                                                    name="defaultAccountBeforeApproval"
                                                    value={formData.defaultAccountBeforeApproval}
                                                    checked={formData.defaultAccountBeforeApproval}
                                                    id="checkboxesStackedCustom1"
                                                    label="Default bank account"
                                                    onChange={handleChangeActive}
                                                    disabled={isFormDisable}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={6} className="label-required">
                                            <Label>{t("Branch")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="text"
                                                name="branch"
                                                value={formData.branch}
                                                placeholder={t("Enter Branch")}
                                                validate={{
                                                    required: { value: true, errorMessage: t("EnterValidBranch") }
                                                }}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled={isFormDisable}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6}>
                                            <Label>{t("Branch Code")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="text"
                                                name="branchCode"
                                                value={formData.branchCode}
                                                placeholder={t("Enter Unique Branch Code")}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled={isFormDisable}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6}>
                                            <Label>{t("Branch City")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="text"
                                                name="branchCity"
                                                value={formData.branchCity}
                                                placeholder={t("Enter Branch City")}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled={isFormDisable}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6}>
                                            <Label>{t("Branch Address Line 1")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="text"
                                                name="branchAddressLine1"
                                                value={formData.branchAddressLine1}
                                                placeholder={t("Enter Address Line 1")}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled={isFormDisable}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6}>
                                            <Label>{t("Branch Address Line 2")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="text"
                                                name="branchAddressLine2"
                                                value={formData.branchAddressLine2}
                                                placeholder={t("Enter Address Line 2")}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled={isFormDisable}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6}>
                                            <Label>{t("Postal Code")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="text"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                placeholder={t("Enter Postal Code")}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled={isFormDisable}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6}>
                                            <Label>{t("State/ Province")}</Label>
                                        </Col>
                                        <Col xs={6}>
                                            <AvField
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                placeholder={t("Enter State/Province")}
                                                onBlur={() => { }}
                                                onChange={onChange}
                                                disabled={isFormDisable}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </FormGroup>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    );
}
