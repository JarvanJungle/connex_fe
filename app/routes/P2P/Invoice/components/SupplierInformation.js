import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput } from "routes/PreRequisitions/RaisePreRequisitions/components";
import SelectInputLabel from "./SelectInput";
import { DVPC_INVOICE_TYPE } from "../helper/constant";

const SupplierInformation = (props) => {
    const {
        t,
        isOPC = false,
        disabled,
        values,
        touched,
        errors,
        suppliers,
        companyUuid,
        onSelectSupplier,
        isBuyer,
        opcDetail = {}
    } = props;
    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {isBuyer ? t("SupplierInformation") : t("BuyerInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    {
                        [DVPC_INVOICE_TYPE.DVPC_INVOICE_PROJECT.key, DVPC_INVOICE_TYPE.DVPC_INVOICE_NON_PROJECT.key].includes(opcDetail?.invoiceType)
                            ? (
                                <Col xs={12}>
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
                                </Col>
                            )
                            : (
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
                                        onChange={(e) => onSelectSupplier(e, companyUuid)}
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
                            )
                    }

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
