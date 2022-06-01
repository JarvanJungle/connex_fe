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
import { makeStyles } from "@material-ui/core/styles";
import {
    Field, ErrorMessage
} from "formik";
import { RadioButton } from "primereact/radiobutton";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";
import HorizontalInput from "routes/P2P/PurchaseOrder/DeveloperWorkOrderDetails/components/HorizontalInput";
import { SelectInput } from "../../components";

const useStyles = makeStyles({
    "clear-all": {
        color: "#4472C4",
        textDecoration: "underline",
        cursor: "pointer",
        background: "unset",
        border: "unset"
    }
});

const InitialSettingComponentSupplier = (props) => {
    const classes = useStyles();
    const {
        t, values, errors,
        touched,
        suppliers,
        currencies,
        setFieldValue,
        handleChange
    } = props;
    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("InitialSettings")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="dwoNumber"
                            label={t("DeveloperWorkOrderNo")}
                            type="text"
                            disabled
                            value={values.dwoNumber || ""}
                        />
                    </Col>
                </Row>

                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="dwoStatus"
                            label={t("Status")}
                            type="text"
                            disabled
                            value={values?.dwoStatus?.replaceAll("_", " ")}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="currencyCode"
                            label={t("Currency")}
                            type="text"
                            value={values.currencyCode || ""}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="projectCode"
                            label={t("Project")}
                            type="text"
                            disabled
                            value={values.projectCode || ""}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default InitialSettingComponentSupplier;
