import React from "react";
import {
    Card,
    CardBody,
    CardHeader
} from "components";
import { HorizontalInput, SelectInput } from "routes/PreRequisitions/RaisePreRequisitions/components";
import ExtVendorService from "services/ExtVendorService";

const SupplierInfor = (props) => {
    const {
        t,
        disabled,
        values,
        touched,
        errors,
        suppliers,
        setFieldValue,
        companyUuid
    } = props;

    const onSelectSupplier = async (event) => {
        const { target } = event;
        const { value } = target;
        const supplier = suppliers.find((item) => item.companyCode === value);
        const { defaultSupplierUser } = supplier ?? { };
        const response = await ExtVendorService.getExternalVendorDetails(
            companyUuid, supplier.uuid
        );
        const { data } = response.data;

        setFieldValue("supplierCode", value);
        setFieldValue("supplierUuid", supplier.uuid);
        setFieldValue("supplierName", data.companyName);
        setFieldValue("contactName", defaultSupplierUser.fullName);
        setFieldValue("contactEmail", defaultSupplierUser.emailAddress);
        setFieldValue("contactNumber", defaultSupplierUser.workNumber);
        setFieldValue("country", data.countryOfOrigin);
        setFieldValue("companyRegNo", data.uen);
        setFieldValue("countryCode", defaultSupplierUser.countryCode);
        setFieldValue("supplierDetails", data);
        setFieldValue("paymentTermName", data?.paymentTerm?.ptName);
        setFieldValue("paymentTermUuid", data?.paymentTerm?.ptUuid);
    };

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("SupplierInformation")}
            </CardHeader>
            <CardBody>
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
                    disabled={disabled}
                />
                <HorizontalInput
                    name="supplierName"
                    label={t("SupplierName")}
                    type="text"
                    errors={errors.supplierName}
                    touched={touched.supplierName}
                    value={values.supplierName}
                    disabled
                />
            </CardBody>
        </Card>
    );
};

export default SupplierInfor;
