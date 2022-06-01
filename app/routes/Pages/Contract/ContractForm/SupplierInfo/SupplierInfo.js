import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput, SelectInput } from "routes/PreRequisitions/RaisePreRequisitions/components";
import { CONTRACT_REQUEST_LIST_STATUS } from "helper/constantsDefined";
import ExtVendorService from "services/ExtVendorService";
import { v4 as uuidv4 } from "uuid";

const SupplierInfo = (props) => {
    const {
        t,
        // disabled,
        values,
        touched,
        errors,
        suppliers,
        setFieldValue,
        companyUuid,
        contractStatus
    } = props;
    const editStatus = [
        CONTRACT_REQUEST_LIST_STATUS.SAVE_AS_DRAFT_CONTRACT,
        CONTRACT_REQUEST_LIST_STATUS.RECALLED,
        CONTRACT_REQUEST_LIST_STATUS.SEND_BACK,
        CONTRACT_REQUEST_LIST_STATUS.PENDING_SUBMISSION
    ];
    const conditionShowUpType = () => (editStatus.includes(contractStatus));

    // const conditionShowUpType = () => (contractStatus === CONTRACT_REQUEST_LIST_STATUS.PENDING_SUBMISSION);

    const onSelectSupplier = async (event) => {
        const { value } = event.target;
        if (value && suppliers.length > 0) {
            setFieldValue("vendorUuid", value);
            const selectedVendor = suppliers.find((item) => item.companyCode === value);
            if (selectedVendor) {
                setFieldValue("contactName", selectedVendor.defaultSupplierUser.fullName);
                setFieldValue("contactEmail", selectedVendor.defaultSupplierUser.emailAddress);
                setFieldValue("contactNumber", selectedVendor.defaultSupplierUser.workNumber);

                ExtVendorService.getExternalVendorDetails(
                    companyUuid, selectedVendor?.uuid
                ).then((dataRes) => {
                    const { data } = dataRes.data;
                    data.supplierUserList.map((i) => {
                        i.uuid = uuidv4();
                        return i;
                    });
                    setFieldValue("supplierCode", data.companyCode);
                    setFieldValue("supplierName", data.companyName);
                    setFieldValue("supplierAddress", data.addressesDto);
                    setFieldValue("supplierContact", data.supplierUserList);
                    const defaultAddress = data?.addressesDto?.find((o) => o.default);
                    setFieldValue("supplierAddressSelect", defaultAddress?.addressLabel);
                    setFieldValue("supplierAddressDetails", `${defaultAddress?.addressFirstLine} ${defaultAddress?.addressSecondLine}`);
                    setFieldValue("supplierDetails", data);
                    setFieldValue("companyRegNo", data.uen);
                    setFieldValue("country", defaultAddress?.country);
                    setFieldValue("paymentTermName", data?.paymentTerm?.ptName);
                    setFieldValue("paymentTermUuid", data?.paymentTerm?.ptUuid);
                });
            }
        }
    };

    const onsupplierContactChange = (e) => {
        const { value } = e.target;
        if (value && values.supplierContact.length) {
            const contactSelected = values.supplierContact.find((item) => item.fullName === value);
            setFieldValue("contactEmail", contactSelected.emailAddress);
            setFieldValue(
                "contactNumber",
                (contactSelected.countryCode ? `${contactSelected.countryCode.startsWith("+")
                    ? contactSelected.countryCode : `+${contactSelected.countryCode}`} ` : "")
                    + contactSelected.workNumber
            );
            setFieldValue("contactName", contactSelected.fullName);
        }
    };

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("SupplierInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        {conditionShowUpType()
                            ? (
                                <SelectInput
                                    name="supplierCode"
                                    label={t("SupplierCode")}
                                    placeholder={t("PleaseSelectCompany")}
                                    options={suppliers?.map(({ companyCode, companyName }) => ({
                                        companyCode,
                                        label: values.supplierCode === companyCode
                                            ? companyCode
                                            : `${companyCode} (${companyName})`
                                    }))}
                                    optionLabel="label"
                                    optionValue="companyCode"
                                    onChange={(e) => onSelectSupplier(e)}
                                    errors={errors.supplierCode}
                                    touched={touched.supplierCode}
                                    value={values.supplierCode}
                                    className="label-required"
                                />
                            )
                            : (
                                <HorizontalInput
                                    className="label-required"
                                    name="supplierCode"
                                    label={t("SupplierCode")}
                                    type="text"
                                    value={values.supplierCode}
                                    disabled
                                />
                            )}
                        <HorizontalInput
                            name="supplierName"
                            label={t("SupplierName")}
                            type="text"
                            value={values.supplierName}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        {conditionShowUpType() ? (
                            <SelectInput
                                name="contactName"
                                label={t("Contact Name")}
                                errors={errors.contactName}
                                touched={touched.contactName}
                                options={values.supplierContact}
                                optionLabel="fullName"
                                optionValue="fullName"
                                onChange={(e) => onsupplierContactChange(e)}
                                value={values.contactName}
                            />
                        ) : (
                            <HorizontalInput
                                name="contactName"
                                label={t("Contact Name")}
                                type="text"
                                value={values.contactName}
                                placeholder=""
                                disabled
                            />
                        )}
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contactEmail"
                            label={t("Contact Email")}
                            type="text"
                            value={values.contactEmail}
                            placeholder=""
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contactNumber"
                            label={t("Contact Number")}
                            type="text"
                            value={values.contactNumber}
                            placeholder=""
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
                            value={values.country}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="companyRegNo"
                            label={t("Company Reg No.")}
                            type="text"
                            placeholder=""
                            value={values.companyRegNo}
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default SupplierInfo;
