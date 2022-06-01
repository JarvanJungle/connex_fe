import React, { useEffect, useState } from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput } from "routes/PreRequisitions/RaisePreRequisitions/components";

const InitialSettings = (props) => {
    const {
        t, values, errors,
        touched
    } = props;

    const [contactNumber, setContactNumber] = useState("");

    useEffect(() => {
        const { countryCode } = values;
        setContactNumber(`${countryCode ? (`+${countryCode}`) : ""} ${values.contactNumber || ""}`);
    }, [values]);

    return (
        <Card>
            <CardHeader tag="h6">
                {t("InitialSettings")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="deliveryOrderNumber"
                            label={t("DeliveryOrderNo")}
                            type="text"
                            value={values.deliveryOrderNumber}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="status"
                            label={t("Status")}
                            type="text"
                            value={values.status}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="deliveryDate"
                            label={t("DeliveryDate")}
                            type="date"
                            placeholder={t("DeliveryDate")}
                            errors={errors.deliveryDate}
                            touched={touched.deliveryDate}
                            value={values.deliveryDate}
                            disabled={!values.isEdit}
                        />
                    </Col>
                </Row>
            </CardBody>
            <CardHeader tag="h6">
                {t("BuyerInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="buyerCode"
                            label={t("BuyerCode")}
                            type="text"
                            placeholder="Enter Buyer Code"
                            errors={errors.buyerCode}
                            touched={touched.buyerCode}
                            value={values.buyerCode}
                            disabled={!values.isEdit}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="buyerName"
                            label={t("BuyerName")}
                            type="text"
                            placeholder="Enter Buyer Name"
                            errors={errors.buyerName}
                            touched={touched.buyerName}
                            value={values.buyerName}
                            disabled={!values.isEdit}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contactName"
                            label={t("ContactName")}
                            type="text"
                            placeholder="Enter Contact Name"
                            errors={errors.contactName}
                            touched={touched.contactName}
                            value={values.contactName}
                            disabled={!values.isEdit}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contactEmail"
                            label={t("ContactEmail")}
                            type="text"
                            placeholder="Enter Contact Email"
                            errors={errors.contactEmail}
                            touched={touched.contactEmail}
                            value={values.contactEmail}
                            disabled={!values.isEdit}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contactNumber"
                            label={t("ContactNumber")}
                            type="text"
                            placeholder="Enter Contact Number"
                            errors={errors.contactNumber}
                            touched={touched.contactNumber}
                            value={contactNumber}
                            disabled={!values.isEdit}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="country"
                            label={t("Country")}
                            type="text"
                            placeholder="Enter Country"
                            errors={errors.country}
                            touched={touched.country}
                            value={values.country}
                            disabled={!values.isEdit}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="companyRegNo"
                            label={t("CompanyRegNo")}
                            type="text"
                            placeholder="Enter Company Reg. No."
                            errors={errors.companyRegNo}
                            touched={touched.companyRegNo}
                            value={values.companyRegNo}
                            disabled={!values.isEdit}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default InitialSettings;
