import React, { useEffect, useState } from "react";
import {
    Row, Col, Container,
    Card, CardBody, Label,
    Button
} from "components";
import { useTranslation } from "react-i18next";
import { Checkbox } from "primereact/checkbox";
import ApprovalConfigService from "services/ApprovalConfigService";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import { HeaderMain } from "routes/components/HeaderMain";
import { usePermission } from "routes/hooks";

const ManageApprovalConfig = () => {
    const { t } = useTranslation();
    const showToast = useToast();
    const [companyUuid, setCompanyUuid] = useState("");
    const [approvalConfigs, setApprovalConfigs] = useState([]);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const permission = usePermission(FEATURE.APPROVAL_CONFIG);

    const initData = async (currentCompanyUUID) => {
        try {
            const response = await ApprovalConfigService.getApprovalConfigList(currentCompanyUUID);
            const { data, status, message } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                const newApprovalConfig = (data ?? []).filter(
                    (item) => item.featureCode !== FEATURE.PPO
                );
                setApprovalConfigs(newApprovalConfig);
            } else {
                showToast("error", message);
            }
            setCompanyUuid(currentCompanyUUID);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onChangeChecked = (event, index) => {
        const newApprovalConfigs = [...approvalConfigs];
        newApprovalConfigs[index].optional = event.target.checked;
        setApprovalConfigs(newApprovalConfigs);
    };

    const onSavePressHandler = async () => {
        const payload = approvalConfigs
            .filter((item) => item.optional === true)
            .map(({ optional, ...rest }) => ({ ...rest }));
        try {
            const response = await ApprovalConfigService
                .updateApprovalConfig(companyUuid, payload);
            const { message, status } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                showToast("success", message);
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    useEffect(() => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (currentCompanyUUID) {
            initData(currentCompanyUUID);
        }
    }, [permissionReducer]);

    return (
        <Container fluid>
            <Row className="mb-2">
                <Col md={6} lg={6}>
                    <HeaderMain
                        title={t("ApprovalConfiguration")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Card>
                <CardBody>
                    <h5 className="mb-3">To opt out approval routing for the following:</h5>
                    {approvalConfigs.map((feature, index) => (
                        <Row className="mx-0 mb-2 align-items-center" key={feature?.featureCode}>
                            <Checkbox
                                className="mr-2"
                                checked={feature.optional}
                                onChange={
                                    (event) => onChangeChecked(event, index)
                                }
                                id={feature.featureCode}
                                disabled={!(permission?.read && permission?.write)}
                            />
                            <Label htmlFor={feature.featureCode} className="mb-0">{feature.featureName}</Label>
                        </Row>
                    ))}
                    {permission?.read && permission?.write && (
                        <Row className="mx-0">
                            <Button
                                type="submit"
                                color="primary"
                                onClick={onSavePressHandler}
                            >
                                {t("Save")}
                            </Button>
                        </Row>
                    )}
                </CardBody>
            </Card>
        </Container>
    );
};

export default ManageApprovalConfig;
