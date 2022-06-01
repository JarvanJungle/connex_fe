import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col } from "components";
import useToast from "routes/hooks/useToast";
import classes from "./Subscription.scss";

const Subscription = () => {
    const { t } = useTranslation();
    const showToast = useToast();

    const [dataFeature, setDataFeature] = useState([]);
    const [dataAccess, setDataAccess] = useState([]);

    useEffect(() => {
        listAllTheUserPermissionWithinACompany();
    }, []);

    return (
        <>
            <Container>
                <Card className="mt-3">
                    <CardHeader tag="h6">
                        {t("ModuleSubscription")}
                    </CardHeader>
                    <CardBody>
                        {/* TODO: populate real data */}
                        {this.state.coreModules.map((module) => (
                            <Row>
                                <Col lg={12}>
                                    <Card>
                                        <CardHeader tag="h6">
                                            {module.moduleName}
                                        </CardHeader>
                                        <CardBody>
                                            <Row>
                                                {module.features.map((f) => (
                                                    <Col lg={2}>
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                id={f.featureCode}
                                                                onChange={() => this.handleSelectedFeature(f.featureCode)}
                                                            />
                                            &nbsp;
                                                            {" "}
                                                            {f.featureName}
                                                        </label>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        ))}
                    </CardBody>
                </Card>
            </Container>
        </>
    );
};

export default Subscription;
