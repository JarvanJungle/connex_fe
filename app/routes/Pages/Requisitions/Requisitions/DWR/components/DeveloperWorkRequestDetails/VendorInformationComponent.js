import React, { useEffect, useState, useRef } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Row
} from "components";
import { HorizontalInput, SelectInput } from "routes/P2P/PurchaseRequest/components";
import ExtVendorService from "services/ExtVendorService";
import { getCurrentCompanyUUIDByStore } from "helper/utilities";
import { useDispatch, useSelector } from "react-redux";
import { getVendorDetail } from "actions/externalVendorActions";
import { v4 as uuidv4 } from "uuid";


const VendorInformationComponent = (props) => {
    const usePrevious = (value) => {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    }
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
    const prevValues = usePrevious(values);
    const permissionReducer = useSelector((state) => state.permissionReducer);

    useEffect(() => {
        setFieldValue("contactNumberShow", `+${values.countryCode} ${values.contactNumber}`);
    }, [values.contactNumber]);

    // useEffect(() => {
    //     setFieldValue("countryCodeShow", values.countryName);
    // }, [values.countryCode]);

    useEffect(() => {
        if (values.vendorUuid) {
            ExtVendorService.getExternalVendorDetails(
                getCurrentCompanyUUIDByStore(permissionReducer), values.vendorUuid
            ).then((result) => {
                if (result?.data?.data) {
                    const dataDetail = result?.data?.data;
                    setFieldValue("countryName", dataDetail.countryOfOrigin);
                }
            });
        }
    }, [values.vendorUuid, permissionReducer]);

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
                            {/* <HorizontalInput
                                name="contactNumber"
                                label={t("ContactNumber")}
                                type="text"
                                disabled
                            /> */}
                            <HorizontalInput
                                name="contactNumberShow"
                                label={t("ContactNumber")}
                                type="text"
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="countryName"
                                label={t("Country")}
                                type="text"
                                disabled
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
