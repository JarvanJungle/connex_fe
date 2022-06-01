import React, { useEffect, useState } from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput } from "routes/PreRequisitions/RaisePreRequisitions/components";

const BuyerInfo = (props) => {
    const {
        t,
        // disabled,
        values,
        touched,
        errors,
        dataRes
        // suppliers,
        // setFieldValue,
        // companyUuid
    } = props;

    const [contactNumber, setContactNumber] = useState("");

    useEffect(() => {
        const { countryCode } = values;
        setContactNumber(`${countryCode ? (`+${countryCode}`) : ""} ${values.contactNumber || ""}`);
    }, [values]);

    // const onSelectSupplier = async (event) => {
    //     const { target } = event;
    //     const { value } = target;
    //     const supplier = suppliers.find((item) => item.companyCode === value);
    //     const { defaultSupplierUser } = supplier ?? { };
    //     const response = await ExtVendorService.getExternalVendorDetails(
    //         companyUuid, supplier.uuid
    //     );
    //     const { data } = response.data;
    //     setFieldValue("supplierCode", value);
    //     setFieldValue("supplierUuid", supplier.uuid);
    //     setFieldValue("supplierName", data.companyName);
    //     setFieldValue("contactName", defaultSupplierUser.fullName);
    //     setFieldValue("contactEmail", defaultSupplierUser.emailAddress);
    //     setFieldValue("contactNumber", defaultSupplierUser.workNumber);
    //     setFieldValue("country", data.countryOfOrigin);
    //     setFieldValue("companyRegNo", data.uen);
    //     setFieldValue("countryCode", defaultSupplierUser.countryCode);
    // };

    return dataRes ? (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("BuyerInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="companyName"
                            label={t("Company Name")}
                            type="text"
                            value={dataRes.companyName}
                            placeholder=""
                            disabled
                            className="label-required"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contactName"
                            label={t("Contact Name")}
                            type="text"
                            value={dataRes.contactInformation.contactName}
                            placeholder=""
                            disabled
                            className="label-required"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contactEmail"
                            label={t("Contact Email")}
                            type="text"
                            value={dataRes.contactInformation.contactEmail}
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
                            value={dataRes.contactInformation.contactNumber}
                            placeholder=""
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="taxRegNo"
                            label={t("Tax Reg No.")}
                            type="text"
                            placeholder=""
                            value={dataRes.taxRegNo}
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
                            value={dataRes.companyAddress.country}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="address"
                            label={t("Address")}
                            type="text"
                            placeholder=""
                            value={dataRes.companyAddress.addressLabel}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="addressDetails"
                            label={t("Address Details")}
                            type="textarea"
                            rows={2}
                            placeholder=""
                            value={`${dataRes.companyAddress.addressFirstLine} ${
                                dataRes.companyAddress.addressSecondLine}`}
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    ) : <></>;
};

export default BuyerInfo;
