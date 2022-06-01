import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Row, Card, CardBody, CardHeader, Col
} from "components";
import ExtVendorService from "services/ExtVendorService";
import { getCurrentCompanyUUIDByStore } from "helper/utilities";
import { useSelector } from "react-redux";
import { HorizontalInput } from "../../../components";

export default function VendorInformation(props) {
    const { t } = useTranslation();
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const {
        values, errors,
        touched,
        setFieldValue
    } = props;

    useEffect(() => {
        // if (getCurrentCompanyUUIDByStore(permissionReducer) && values.vendorUuid) {
        //     ExtVendorService.getExternalVendorDetails(
        //         getCurrentCompanyUUIDByStore(permissionReducer), values.vendorUuid || values.uuid
        //     ).then((result) => {
        //         if (result?.data?.data) {
        //             setFieldValue("countryName", result.data.data.countryOfOrigin);
        //         }
        //     });
        // }
    }, [values.vendorUuid]);

    useEffect(() => {
        setFieldValue("contactNumberCustom", `+${values.countryCode || ""} ${values.contactNumber || ""}`);
    }, [values.countryCode]);

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("Vendor Information")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="vendorCode"
                            label={t("Vendor Code")}
                            type="text"
                            disabled
                        />
                        <HorizontalInput
                            name="vendorName"
                            label={t("Vendor Name")}
                            type="text"
                            disabled
                        />
                        <HorizontalInput
                            name="contactName"
                            label={t("Contact Name")}
                            type="text"
                            disabled
                        />
                        <HorizontalInput
                            name="contactEmail"
                            label={t("Contact Email")}
                            type="text"
                            disabled
                        />
                        <HorizontalInput
                            name="contactNumberCustom"
                            label={t("Contact Number")}
                            type="text"
                            // onChange={handleChange}
                            disabled
                        />
                        <HorizontalInput
                            name="countryName"
                            label={t("Country")}
                            type="text"
                            disabled
                        />
                        <HorizontalInput
                            name="companyRegistrationNo"
                            label={t("Company Reg. No.")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
}
