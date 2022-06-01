import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput } from "routes/PreRequisitions/RaisePreRequisitions/components";
import ExtVendorService from "services/ExtVendorService";
import CreditNoteService from "services/CreditNoteService/CreditNoteService";
import { CREDIT_NOTE_CONSTANTS } from "../helper";
import SelectInputLabel from "routes/P2P/Invoice/components/SelectInput";

const SupplierInformation = (props) => {
    const {
        t,
        disabled,
        setFieldValue,
        values,
        touched,
        errors,
        suppliers,
        isBuyer,
        showToast,
        setDirty,
        companyUuid,
        setInvoices,
        taxRecords
    } = props;

    const onSelectSupplier = async (event) => {
        setDirty();
        try {
            const manualItems = values.itemList.filter((item) => item.manualItem === true);
            setFieldValue("itemList", manualItems);
            setFieldValue("invoiceUuid", "");
            const { target } = event;
            const { value } = target;
            const supplier = suppliers.find((item) => item.companyCode === value);
            const responseExtVendor = await ExtVendorService.getExternalVendorDetails(
                companyUuid, supplier.uuid
            );
            const { data } = responseExtVendor && responseExtVendor.data;
            let vendorCompanyUuid = "";
            if (data) {
                vendorCompanyUuid = data.vendorCompanyUuid;
                const { addressesDto, paymentTerm } = data;
                const address = addressesDto.find((item) => item.default === true);
                setFieldValue("supplierCode", value);
                setFieldValue("supplierUuid", supplier.uuid);
                setFieldValue("companyName", data.companyName);
                setFieldValue("addressLabel", address.addressLabel);
                setFieldValue("addressFirstLine", address.addressFirstLine);
                setFieldValue("addressSecondLine", address.addressSecondLine);
                setFieldValue("country", address.country);
                setFieldValue("city", address.city);
                setFieldValue("state", address.state);
                setFieldValue("postalCode", address.postalCode);
                setFieldValue("paymentTerms", paymentTerm?.ptName);
                setFieldValue("ptDays", paymentTerm?.ptDays);
                if (isBuyer) {
                    const defaultTax = {
                        taxCode: data?.tax?.taxCode,
                        taxRate: data?.tax?.taxRate,
                        uuid: data?.tax?.uuid
                    };
                    setFieldValue("defaultTax", defaultTax);
                } else {
                    const tax = taxRecords?.find((item) => item.default === true);
                    if (tax) {
                        const defaultTax = {
                            taxCode: tax?.taxCode,
                            taxRate: tax?.taxRate,
                            uuid: tax?.uuid
                        };
                        setFieldValue("defaultTax", defaultTax);
                    } else {
                        const defaultTax = {
                            taxCode: "",
                            taxRate: null,
                            uuid: ""
                        };
                        setFieldValue("defaultTax", defaultTax);
                    }
                }
                if (!isBuyer) setFieldValue("buyerCompanyUuid", vendorCompanyUuid);
            }

            const responseInvList = await CreditNoteService.getListInvForCreatingCN(
                companyUuid,
                isBuyer ? supplier.uuid : vendorCompanyUuid,
                isBuyer
            );

            setInvoices(responseInvList.data.data.sort((a, b) => {
                if (a.invoiceSubmissionDate < b.invoiceSubmissionDate) return 1;
                if (a.invoiceSubmissionDate > b.invoiceSubmissionDate) return -1;
                return 0;
            }).filter((item) => item.invoiceStatus !== CREDIT_NOTE_CONSTANTS.REJECTED
                && item.invoiceStatus !== CREDIT_NOTE_CONSTANTS.REJECTED_TWO_WAY
                && item.invoiceStatus !== CREDIT_NOTE_CONSTANTS.REJECTED_THREE_WAY));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {isBuyer ? t("SupplierInformation") : t("BuyerInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        {
                            !disabled
                            && (
                                <SelectInputLabel
                                    name="supplierCode"
                                    label={isBuyer ? t("SupplierCode") : t("BuyerCode")}
                                    placeholder={isBuyer ? t("PleaseSelectSupplier") : t("PleaseSelectBuyer")}
                                    options={suppliers}
                                    optionLabel="companyLabel"
                                    optionValue="companyCode"
                                    onChange={(e) => onSelectSupplier(e)}
                                    errors={errors.supplierCode}
                                    touched={touched.supplierCode}
                                    value={values.supplierCode}
                                    className="label-required"
                                    disabled={disabled}
                                />
                            )
                        }
                        {
                            disabled
                            && (
                                <HorizontalInput
                                    name="supplierCode"
                                    label={isBuyer ? t("SupplierCode") : t("BuyerCode")}
                                    type="text"
                                    value={values.supplierCode}
                                    placeholder=""
                                    errors={errors.supplierCode}
                                    touched={touched.supplierCode}
                                    disabled
                                />
                            )
                        }
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="companyName"
                            label={t("CompanyName")}
                            type="text"
                            value={values.companyName}
                            placeholder=""
                            errors={errors.companyName}
                            touched={touched.companyName}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="addressLabel"
                            label={t("AddressLabel")}
                            type="text"
                            value={values.addressLabel}
                            placeholder=""
                            errors={errors.addressLabel}
                            touched={touched.addressLabel}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="addressFirstLine"
                            label={t("AddressLine1")}
                            type="text"
                            value={values.addressFirstLine}
                            placeholder=""
                            errors={errors.addressFirstLine}
                            touched={touched.addressFirstLine}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="addressSecondLine"
                            label={t("AddressLine2")}
                            type="text"
                            placeholder=""
                            errors={errors.addressSecondLine}
                            touched={touched.addressSecondLine}
                            value={values.addressSecondLine}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="city"
                            label={t("City")}
                            type="text"
                            placeholder=""
                            errors={errors.city}
                            touched={touched.city}
                            value={values.city}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="state"
                            label={t("StateProvince")}
                            type="text"
                            placeholder=""
                            errors={errors.state}
                            touched={touched.state}
                            value={values.state}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="country"
                            label={t("Country")}
                            type="text"
                            placeholder=""
                            errors={errors.country}
                            touched={touched.country}
                            value={values.country}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="postalCode"
                            label={t("ZipCode")}
                            type="text"
                            placeholder=""
                            errors={errors.postalCode}
                            touched={touched.postalCode}
                            value={values.postalCode}
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default SupplierInformation;
