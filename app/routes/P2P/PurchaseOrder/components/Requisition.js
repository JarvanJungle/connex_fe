import React from "react";
import {
    Row, Card, CardBody,
    CardHeader, Col
} from "components";
import HorizontalInput from "./HorizontalInput";

const Requisition = ({ t, values }) => (
    <Card className="mb-4">
        <CardHeader tag="h6">
            {t("Requisition")}
        </CardHeader>
        <CardBody>
            <Row>
                <Col xs={12}>
                    <HorizontalInput
                        name="typeOfRequisition"
                        label={t("TypeOfRequisition")}
                        type="text"
                        disabled
                    />
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <HorizontalInput
                        name="natureOfRequisition"
                        label={t("NatureOfRequisition")}
                        type="text"
                        disabled
                    />
                </Col>
            </Row>
            {String(values.project) === "true" && (
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="projectCode"
                            label={t("Project")}
                            type="text"
                            disabled
                        />
                    </Col>
                </Row>
            )}
        </CardBody>
    </Card>
);

export default Requisition;
