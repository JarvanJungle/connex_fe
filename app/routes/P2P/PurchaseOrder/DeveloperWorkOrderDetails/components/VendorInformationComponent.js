import React, { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Row
} from "components";
import { SelectInput } from "routes/P2P/PurchaseRequest/components";
import { useDispatch, useSelector } from "react-redux";
import { getVendorDetail } from "actions/externalVendorActions";
import { v4 as uuidv4 } from "uuid";
import HorizontalInput from "routes/P2P/PurchaseOrder/DeveloperWorkOrderDetails/components/HorizontalInput";

const VendorInformationComponent = (props) => {
    const {
        t,
        values,
        touched,
        handleChange,
        dirty,
        setFieldValue,
        errors,
        vendors,
        vendorInformation
    } = props;

    return (
        <>
            <Card className="mb-4">
                <CardHeader tag="h6">{t("VendorInformation")}</CardHeader>
                <CardBody>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="vendorCode"
                                label={t("VendorCode")}
                                value={values.vendorCode}
                                type="text"
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="vendorName"
                                label={t("VendorName")}
                                value={values.vendorName}
                                type="text"
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="contactName"
                                label={t("ContactName")}
                                type="text"
                                disabled
                                value={values.contactName}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="contactEmail"
                                label={t("ContactEmail")}
                                type="text"
                                disabled
                                value={values.contactEmail}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="contactNumber"
                                label={t("ContactNumber")}
                                type="text"
                                disabled
                                value={`+${values.countryCode} ${values.contactNumber}`}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="countryCode"
                                label={t("Country")}
                                type="text"
                                disabled
                                value={values.countryName}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="companyRegistrationNo"
                                label={t("CompanyRegNo")}
                                type="text"
                                disabled
                                value={values.companyRegistrationNo}
                            />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </>
    );
};

export default VendorInformationComponent;
