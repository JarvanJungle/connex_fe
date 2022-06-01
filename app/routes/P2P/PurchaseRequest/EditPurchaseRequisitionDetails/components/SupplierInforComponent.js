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
import { makeStyles } from "@material-ui/core";
import { MultiSelectInput } from "../../components";

const useStyles = makeStyles({
    "clear-all": {
        color: "#4472C4",
        textDecoration: "underline",
        cursor: "pointer",
        background: "unset",
        border: "unset"
    }
});

const SupplierInforComponent = (props) => {
    const classes = useStyles();
    const {
        t,
        values,
        errors,
        touched,
        setFieldValue,
        suppliers,
        disabled
    } = props;

    const onDeleteSupplier = (companyCode) => {
        const newSupplier = values.supplierCode.filter(
            (supplier) => supplier.companyCode !== companyCode
        );
        setFieldValue("supplierCode", newSupplier);
    };

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
                            disabled={disabled}
                        />
                    </Col>
                </Row>
                {
                    !disabled
                    && (
                        <Row className="justify-content-end mx-0">
                            <button
                                type="button"
                                className={`${classes["clear-all"]}`}
                                onClick={() => setFieldValue("supplierCode", [])}
                            >
                                {t("ClearAll")}
                            </button>
                        </Row>
                    )
                }
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
                                                "mx-0 justify-content-between align-items-center",
                                                { "mb-1": index !== (values.supplierCode.length - 1) }
                                            )
                                        }
                                    >
                                        <div>{supplier.companyName}</div>
                                        {
                                            !disabled
                                            && (
                                                <button
                                                    type="button"
                                                    style={{
                                                        color: "red",
                                                        cursor: "pointer",
                                                        background: "unset",
                                                        border: "none"
                                                    }}
                                                    onClick={
                                                        () => onDeleteSupplier(supplier.companyCode)
                                                    }
                                                >
                                                    <i className="fa fa-times" />
                                                </button>
                                            )
                                        }
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
