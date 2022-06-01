/* eslint-disable max-len */
import React, { useEffect, useState } from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label
} from "components";

const SupplierInfor = (props) => {
    const {
        t,
        values,
        isBuyer
    } = props;

    const [contactNumber, setContactNumber] = useState("");

    useEffect(() => {
        const { countryCode } = values.supplier;
        setContactNumber(`${countryCode ? (`+${countryCode}`) : ""} ${values.supplier.contactPersonWorkNumber || ""}`);
    }, [values]);

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {isBuyer ? t("SupplierInformation") : t("BuyerInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <Row className="form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{isBuyer ? t("SupplierCode") : t("BuyerCode")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <input
                                    className="form-control"
                                    defaultValue={values.supplier.companyCode}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className="form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{isBuyer ? t("SupplierName") : t("BuyerName")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <input
                                    className="form-control"
                                    defaultValue={values.supplier.companyName}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className="form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("ContactName")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <input
                                    className="form-control"
                                    defaultValue={values.supplier.contactPersonName}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className="form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("ContactEmail")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <input
                                    className="form-control"
                                    defaultValue={values.supplier.contactPersonEmail}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className="form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("ContactNumber")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <input
                                    className="form-control"
                                    defaultValue={contactNumber}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className="form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("Country")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <input
                                    className="form-control"
                                    defaultValue={values.supplier.countryOfOrigin}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className="form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("CompanyRegNo")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <input
                                    className="form-control"
                                    defaultValue={values.supplier.companyRegNo}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default SupplierInfor;
