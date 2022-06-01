import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    HorizontalInput
} from "components";

const VendorInformation = (props) => {
    const {
        t,
        values,
        errors,
        touched,
        loading
    } = props;

    return (
        <Card>
            <CardHeader tag="h6" loading={loading}>
                {t("VendorInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="vendorCode"
                            errors={errors.vendorCode}
                            touched={touched.vendorCode}
                            value={values.vendorCode}
                            label={t("VendorCode")}
                            type="text"
                            disabled
                            loading={loading}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="vendorName"
                            errors={errors.vendorName}
                            touched={touched.vendorName}
                            value={values.vendorName}
                            label={t("VendorName")}
                            type="text"
                            disabled
                            loading={loading}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contactName"
                            errors={errors.contactName}
                            touched={touched.contactName}
                            value={values.contactName}
                            label={t("ContactName")}
                            type="text"
                            disabled
                            loading={loading}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contactEmail"
                            errors={errors.contactEmail}
                            touched={touched.contactEmail}
                            value={values.contactEmail}
                            label={t("ContactEmail")}
                            type="text"
                            disabled
                            loading={loading}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="contactNumber"
                            errors={errors.contactNumber}
                            touched={touched.contactNumber}
                            value={values.contactNumber}
                            label={t("ContactNumber")}
                            type="text"
                            disabled
                            loading={loading}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="country"
                            errors={errors.country}
                            touched={touched.country}
                            value={values.country}
                            label={t("Country")}
                            type="text"
                            disabled
                            loading={loading}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="companyRegNo"
                            errors={errors.companyRegNo}
                            touched={touched.companyRegNo}
                            value={values.companyRegNo}
                            label={t("CompanyRegNo")}
                            type="text"
                            disabled
                            loading={loading}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default VendorInformation;
