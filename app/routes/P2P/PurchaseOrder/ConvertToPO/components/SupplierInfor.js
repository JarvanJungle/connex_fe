/* eslint-disable max-len */
import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label
} from "components";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";
import { HorizontalInput } from "components";

const SupplierInfor = ({ t, values }) => (
    <Card className="mb-4">
        <CardHeader
            tag="h6"
            style={{
                borderTop: "1px solid rgba(31, 45, 61, 0.125)"
            }}
        >
            {t("SupplierInformation")}
        </CardHeader>
        <CardBody>
            <Row>
                <Col xs={12}>
                    <HorizontalInput
                        value={
                            values.supplierCode?.length
                                ? `${values.supplierCode?.length ?? 0} vendor(s) selected`
                                : ""
                        }
                        name="supplierCode"
                        label={t("SupplierCode")}
                        className="label-required"
                        disabled
                    />
                </Col>
            </Row>
            <Row>
                <Col xs={4}>
                    <Label className="p-0">{t("SupplierName")}</Label>
                </Col>
                <Col xs={8}>
                    <div className="form-control" style={{ height: "auto", minHeight: "36px" }}>
                        {
                            values.supplierCode.map((supplier, index) => (
                                <Row
                                    key={uuidv4()}
                                    className={
                                        classNames(
                                            "mx-0 justify-content-start align-items-center",
                                            { "mb-1": index !== (values.supplierCode.length - 1) }
                                        )
                                    }
                                >
                                    <div>{supplier.supplierName}</div>
                                </Row>
                            ))
                        }
                    </div>
                </Col>
            </Row>
        </CardBody>
    </Card>
);

export default SupplierInfor;
