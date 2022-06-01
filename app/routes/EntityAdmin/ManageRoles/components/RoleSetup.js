import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { HorizontalInput } from "components";

export default function RoleSetup(props) {
    const {
        t,
        disabled,
        values,
        touched,
        errors,
        isDetails
    } = props;
    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("RoleSetup")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={6}>
                        <HorizontalInput
                            name="role"
                            label={t("Role")}
                            type="text"
                            value={values.role}
                            placeholder={t("PleaseEnterRole")}
                            errors={errors.role}
                            touched={touched.role}
                            disabled={disabled || isDetails}
                            className="label-required"
                            maxLength={100}
                        />
                    </Col>
                    <Col xs={6} />
                </Row>
            </CardBody>
        </Card>
    );
}
