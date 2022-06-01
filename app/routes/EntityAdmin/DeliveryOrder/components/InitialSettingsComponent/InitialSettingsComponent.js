import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput } from "routes/PreRequisitions/RaisePreRequisitions/components";

const InitialSettingsComponent = (props) => {
    const {
        t, values, errors,
        touched, enablePrefix
    } = props;
    return (
        <>
            <Card className="mb-3">
                <CardHeader tag="h6">
                    {t("InitialSettings")}
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="deliveryOrderNumber"
                                label={t("DeliveryOrderNo")}
                                className={enablePrefix ? "label-required" : ""}
                                errors={errors.deliveryOrderNumber}
                                touched={touched.deliveryOrderNumber}
                                type="text"
                                value={values.deliveryOrderNumber}
                                disabled={!enablePrefix}
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
                                placeholder=""
                                errors={errors.deliveryDate}
                                touched={touched.deliveryDate}
                                className="label-required"
                                value={values.deliveryDate}
                                disabled={!values.isEdit}
                            />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
            <Card>
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
                                value={values.buyerCode}
                                disabled
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
                                value={values.buyerName}
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
                                placeholder="Enter Contact Name"
                                value={values.contactName}
                                disabled
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
                                value={values.contactEmail}
                                disabled
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
                                value={values.countryCode ? `+${values.countryCode} ${values.contactNumber}` : values.contactNumber}
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
                                placeholder="Enter Country"
                                value={values.country}
                                disabled
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
                                value={values.companyRegNo}
                                disabled
                            />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </>
    );
};

export default InitialSettingsComponent;
