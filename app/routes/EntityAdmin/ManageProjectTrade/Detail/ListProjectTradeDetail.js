import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import ManageProjectTradeService from "services/ManageProjectTradeService";
import { useTranslation } from "react-i18next";
import { AvForm, AvField } from "availity-reactstrap-validation";
import ButtonSpinner from "components/ButtonSpinner";

// import Modal from "react-bootstrap/Modal";
import {
    Container,
    Row,
    Card,
    CardBody,
    CardHeader,
    Button,
    Col,
    FormGroup
} from "components";
import { StickyFooter } from "components/StickyFooter/StickyFooter";

import { HeaderMain } from "routes/components/HeaderMain";
import URL_CONFIG from "services/urlConfig";
import useToast from "routes/hooks/useToast";
import { Checkbox } from "primereact/checkbox";
import { usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";
import { debounce } from "helper/utilities";

const ListProjectTradeDetail = () => {
    let message = "Opp! Something went wrong.";
    const toast = useToast();
    const showToast = (type) => toast(type, message);

    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const [isCreate, setIsCreate] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [projectTrade, setProjectTrade] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const tradePermission = usePermission(FEATURE.TRADE);

    const getData = () => {
        const companyRole = JSON.parse(localStorage.getItem("companyRole"));
        const query = new URLSearchParams(location.search);
        const token = query.get("uuid");
        if (token !== null) {
            ManageProjectTradeService.getProjectTrade(companyRole.companyUuid, token)
                .then((response) => {
                    if (response.data.status === "OK") {
                        setProjectTrade(response.data.data);
                    }
                })
                .catch((error) => {
                    showToast("error", error.message);
                });
        }
    };

    useEffect(() => {
        const companyRole = JSON.parse(localStorage.getItem("companyRole"));

        getData();

        if (history.location.pathname.includes("create")) {
            setIsCreate(true);
            const projectTradeObj = {
                tradeCode: "",
                tradeTitle: "",
                description: "",
                active: true,
                companyUuid: companyRole.companyUuid
            };
            setProjectTrade(projectTradeObj);
        }
    }, []);

    const handleInvalidSubmit = () => {
        message = "Validation error, please check your input";
        showToast("error");
    };

    const handleValidSubmit = () => {
        setIsLoading(true);
        if (!isCreate) {
            ManageProjectTradeService.updateProjectTrade(projectTrade)
                .then((response) => {
                    setIsLoading(false);
                    if (response.data.status === "OK") {
                        message = "Trade code has been updated successfully";
                        showToast("success");
                        setIsEdit(false);
                        getData();
                    } else {
                        message = response.data.message;
                        showToast("error");
                    }
                })
                .catch((error) => {
                    message = error.response.data.data;
                    showToast("error");
                    setIsLoading(false);
                });
        } else {
            ManageProjectTradeService.createProjectTrade({ ...projectTrade })
                .then((response) => {
                    if (response.data.status === "OK") {
                        message = "Trade code has been created successfully";
                        showToast("success");
                        setIsLoading(false);
                        history.push(URL_CONFIG.LIST_MANAGE_PROJECT_TRADE);
                    } else {
                        message = response.data.message;
                        showToast("error");
                        setIsLoading(false);
                    }
                })
                .catch((error) => {
                    message = error.response.data.data;
                    showToast("error");
                    setIsLoading(false);
                });
        }
    };

    return (
        <>
            <AvForm
                onValidSubmit={debounce(handleValidSubmit)}
                onInvalidSubmit={debounce(handleInvalidSubmit)}
            >
                <Container fluid>
                    <Row className="mb-1">
                        <Col lg={12}>
                            <HeaderMain
                                title={isCreate ? t("Create New Trade Code") : t("Trade Code Details")}
                                className="mb-3 mb-lg-3"
                            />
                        </Col>
                    </Row>
                    <Row className="mb-5">
                        <Col lg={12}>
                            <Card className="mb-4">
                                <CardHeader tag="h6">{isCreate ? t("New Trade Code") : t("Trade Code Details")}</CardHeader>
                                <CardBody className="p-4">
                                    <FormGroup>
                                        <Row xs="1" className="d-flex justify-content-between">
                                            <Col md={6}>
                                                <div className="label-required">
                                                    <AvField
                                                        type="text"
                                                        name="tradeCode"
                                                        label={t("Trade Code")}
                                                        placeholder={t("Enter Trade Code")}
                                                        value={projectTrade.tradeCode}
                                                        onChange={(e) => setProjectTrade({
                                                            ...projectTrade,
                                                            tradeCode: e.target.value.toUpperCase()
                                                        })}
                                                        validate={{
                                                            required: {
                                                                value: true,
                                                                errorMessage: t("Trade Code is required")
                                                            }
                                                        }}
                                                        disabled={!isCreate}
                                                    />
                                                    <AvField
                                                        type="text"
                                                        name="tradeTitle"
                                                        label={t("TradeTitle")}
                                                        placeholder={t("Enter Trade Title")}
                                                        value={projectTrade.tradeTitle}
                                                        onChange={(e) => setProjectTrade({
                                                            ...projectTrade,
                                                            tradeTitle: e.target.value
                                                        })}
                                                        validate={{
                                                            required: {
                                                                value: true,
                                                                errorMessage: t("Trade Title is required")
                                                            }
                                                        }}
                                                        disabled={!isCreate && !isEdit}
                                                    />
                                                </div>
                                                <AvField
                                                    type="textarea"
                                                    maxLength={500}
                                                    name="tradeDescription"
                                                    label={t("Description")}
                                                    placeholder={t("Enter Description")}
                                                    value={projectTrade.description}
                                                    onChange={(e) => setProjectTrade({
                                                        ...projectTrade,
                                                        description: e.target.value
                                                    })}
                                                    disabled={!isCreate && !isEdit}
                                                />
                                                {
                                                    !isCreate && (
                                                        <div className="p-field-checkbox">
                                                            <Checkbox
                                                                checked={projectTrade.active}
                                                                onChange={(e) => setProjectTrade({
                                                                    ...projectTrade,
                                                                    active: e.target.checked
                                                                })}
                                                                disabled={(!isEdit)}
                                                                id="default"
                                                            />
                                                            <label className="mb-0 ml-2" htmlFor="default">
                                                                {t("Is Active")}
                                                            </label>
                                                        </div>
                                                    )
                                                }
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
                <StickyFooter>
                    <Row className="justify-content-between mx-0 px-3">
                        <Button
                            color="secondary"
                            className="mb-2"
                            onClick={() => {
                                if (isEdit) {
                                    setIsEdit(false);
                                    getData();
                                } else {
                                    history.push(URL_CONFIG.LIST_MANAGE_PROJECT_TRADE);
                                }
                            }}
                        >
                            {t("Back")}
                        </Button>
                        {tradePermission.write && (
                            <>
                                {!isCreate && !isEdit ? (
                                    <Button
                                        color="secondary"
                                        type="button"
                                        className="mb-2 btn-facebook"
                                        onClick={() => setIsEdit(true)}
                                        disabled={isLoading}
                                    >
                                        {t("Edit")}
                                        <i className="fa fa-pencil ml-1" />
                                    </Button>
                                ) : (
                                    <ButtonSpinner
                                        className="mb-2"
                                        type="submit"
                                        text={!isCreate ? t("Save") : t("Create")}
                                        isLoading={isLoading}
                                    />
                                )}
                            </>
                        )}
                    </Row>
                </StickyFooter>
            </AvForm>
        </>
    );
};

export default ListProjectTradeDetail;
