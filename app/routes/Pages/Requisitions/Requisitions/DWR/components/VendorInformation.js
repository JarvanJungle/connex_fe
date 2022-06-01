import React, { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Row
} from "components";
import { HorizontalInput, SelectInput } from "routes/P2P/PurchaseRequest/components";
import { useDispatch, useSelector } from "react-redux";
import { getVendorDetail } from "actions/externalVendorActions";
import { v4 as uuidv4 } from "uuid";
import ExtVendorService from "services/ExtVendorService";
import { getCurrentCompanyUUIDByStore } from "helper/utilities";

const VendorInformation = (props) => {
    const {
        t,
        values,
        touched,
        handleChange,
        dirty,
        setFieldValue,
        errors,
        vendors
    } = props;
    const dispatch = useDispatch();
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const externalVendorSelector = useSelector((state) => state.externalVendorReducer);
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);

    const onVendorChange = (e) => {
        const { value } = e.target;
        if (value && vendors.length > 0) {
            setFieldValue("vendorUuid", value);
        }
    };

    const onContactChange = (e) => {
        const { value } = e.target;
        if (value && contacts.length > 0) {
            setSelectedContact(contacts.find((item) => item.uuid === value));
        }
    };

    useEffect(() => {
        if (values.vendorUuid) {
            const selectedVendorByUuid = vendors.find((item) => item.uuid === values.vendorUuid);
            if (selectedVendorByUuid) {
                setSelectedVendor(selectedVendorByUuid);
            }
        }
    }, [values.vendorUuid]);

    useEffect(() => {
        if (selectedVendor) {
            setFieldValue("vendorName", selectedVendor.companyName);
            setFieldValue("vendorCode", selectedVendor.companyCode);
            setFieldValue("companyRegistrationNo", selectedVendor.uen);

            ExtVendorService.getExternalVendorDetails(
                getCurrentCompanyUUIDByStore(permissionReducer), selectedVendor.uuid
            ).then((result) => {
                if (result?.data?.data) {
                    const dataDetail = result?.data?.data;
                    setFieldValue("vendorCompanyUuid", dataDetail.vendorCompanyUuid || dataDetail.uuid);
                    setFieldValue("countryName", dataDetail.countryOfOrigin);
                }
            });

            const { companyUuid } = authReducer.userDetails.companies[0];
            dispatch(getVendorDetail(companyUuid, selectedVendor.uuid));
        }
    }, [selectedVendor]);

    useEffect(() => {
        if (externalVendorSelector.externalVendorDetail) {
            let { supplierUserList } = externalVendorSelector.externalVendorDetail;
            if (supplierUserList && supplierUserList.length > 0) {
                supplierUserList = supplierUserList.map((item) => {
                    item.uuid = uuidv4();
                    return item;
                });
                supplierUserList.sort(
                    (a, b) => {
                        if (a.fullName.toLowerCase() < b.fullName.toLowerCase()) return -1;
                        if (a.fullName.toLowerCase() > b.fullName.toLowerCase()) return 1;
                        return 0;
                    }
                );
                setContacts(supplierUserList);
                setSelectedContact(supplierUserList.find((item) => item.default));
            }
        }
    }, [externalVendorSelector]);

    useEffect(() => {
        if (selectedContact) {
            setFieldValue("contactUuid", selectedContact.uuid);
            setFieldValue("contactName", selectedContact.fullName);
            setFieldValue("contactEmail", selectedContact.emailAddress);
            setFieldValue("contactNumber", selectedContact.workNumber);
            setFieldValue("countryCode", selectedContact.countryCode);

            setFieldValue("contactNumberCustom", `+${selectedContact.countryCode} ${selectedContact.workNumber}`);
        }
    }, [selectedContact]);

    return (
        <>
            <Card className="mb-4">
                <CardHeader tag="h6">{t("VendorInformation")}</CardHeader>
                <CardBody>
                    <Row>
                        <Col xs={12}>
                            <SelectInput
                                name="vendorUuid"
                                label={t("VendorCode")}
                                className="label-required"
                                placeholder={t("PleaseSelectVendorCode")}
                                errors={errors.vendorUuid}
                                touched={touched.vendorUuid}
                                options={vendors}
                                optionLabel="companyCode"
                                optionValue="uuid"
                                onChange={onVendorChange}
                                value={values.vendorUuid}
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
                            <SelectInput
                                name="contactUuid"
                                label={t("ContactName")}
                                placeholder={t("PleaseSelectContactName")}
                                errors={errors.contactName}
                                touched={touched.contactName}
                                options={contacts}
                                optionLabel="fullName"
                                optionValue="uuid"
                                onChange={onContactChange}
                                value={values.contactUuid}
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
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="contactNumberCustom"
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
                                value={values.countryName}
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
                            />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </>
    );
};

export default VendorInformation;
