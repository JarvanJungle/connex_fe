import React from "react";
import {
    Card, CardBody, CardHeader, Col, Row
} from "components";
import HorizontalInput from "../../../PurchaseOrder/components/HorizontalInput";
import { DVPC_INVOICE_TYPE } from "../../helper/constant";

const InitialSetting = (props) => {
    const {
        t,
        readOnly = false,
        values
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("InitialSettings")}
            </CardHeader>
            <CardBody>
                <Row>
                    {
                        [DVPC_INVOICE_TYPE.DVPC_INVOICE_PROJECT.key, DVPC_INVOICE_TYPE.DVPC_INVOICE_NON_PROJECT.key].includes(values?.invoiceType) ? (
                            <Col xs={12}>
                                <HorizontalInput
                                    name="supplierDto.vendorCode"
                                    label={t("Vendor Code")}
                                    type="text"
                                    disabled={readOnly}
                                />
                            </Col>
                        ) : (
                            <Col xs={12}>
                                <HorizontalInput
                                    name="supplierDto.supplierCode"
                                    label={t("SupplierCode")}
                                    type="text"
                                    disabled={readOnly}
                                />
                            </Col>
                        )
                    }
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="supplierDto.companyName"
                            label={t("CompanyName")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="supplierDto.address.addressLabel"
                            label={t("AddressLabel")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="supplierDto.address.addressFirstLine"
                            label={t("AddressLine1")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="supplierDto.address.addressSecondLine"
                            label={t("AddressLine2")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="supplierDto.address.city"
                            label={t("City")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="supplierDto.address.state"
                            label={t("State/Province")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="supplierDto.address.country"
                            label={t("Country")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="supplierDto.address.postalCode"
                            label={t("ZipCode")}
                            type="text"
                            disabled={readOnly}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default InitialSetting;
