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
import { MultiSelectInput } from "../../components";

const SupplierInforComponent = (props) => {
    const {
        t,
        values,
        errors,
        touched,
        suppliers
    } = props;

    return (
        <Card>
            <CardHeader tag="h6">
                {t("SupplierInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <MultiSelectInput
                            name="supplierCode"
                            label={t("SupplierCode")}
                            className="label-required"
                            placeholder={t("PleaseSelectASupplier")}
                            errors={errors.supplierCode}
                            touched={touched.supplierCode}
                            options={suppliers}
                            optionLabel="companyCode"
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
                                        <div>{supplier?.companyName}</div>
                                    </Row>
                                ))
                            }
                        </div>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default SupplierInforComponent;
