import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AvForm, AvField } from "availity-reactstrap-validation";
import ButtonSpinner from "components/ButtonSpinner";

import {
    Container,
    Row,
    Card,
    CardBody,
    CardHeader,
    FormGroup,
    Button,
    Col
} from "components";

import { HeaderMain } from "routes/components/HeaderMain";
import URL_CONFIG from "services/urlConfig";
import UOMService from "services/UOMService";
import { useLocation } from "react-router-dom";
import StickyFooter from "components/StickyFooter";
import useToast from "routes/hooks/useToast";
import { Checkbox } from "primereact/checkbox";
import { FEATURE } from "helper/constantsDefined";
import { usePermission } from "routes/hooks";
import { debounce } from "helper/utilities";
import classes from "./UOMDetails.scss";

const UOMDetails = () => {
    const location = useLocation();
    let message = "Opp! Something went wrong.";
    const toast = useToast();

    const showToast = (type) => toast(type, message);

    const { t } = useTranslation();
    const history = useHistory();

    const [detailsStates, setDetailsStates] = useState({
        isCreate: false,
        isEdit: false,
        colWidth: 8,
        isLoading: false,
        uom: {
            uomCode: "",
            uomName: "",
            description: "",
            active: false,
            companyUuid: ""
        }
    });
    const handleRolePermission = usePermission(FEATURE.UOM);

    const getDetails = async () => {
        const companyRole = JSON.parse(localStorage.getItem("companyRole"));

        const query = new URLSearchParams(location.search);
        const token = query.get("uuid");
        if (token !== null) {
            try {
                const response = await UOMService
                    .getUOMDetails({ companyUuid: companyRole.companyUuid, uomCode: token });
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                if (response.data.status === "OK") {
                    setDetailsStates((prevStates) => ({
                        ...prevStates,
                        uom: {
                            ...response.data.data,
                            companyUuid: companyRole.companyUuid
                        }
                    }));
                } else {
                    showToast("error", response.data.data);
                }
            } catch (error) {
                showToast("error", error.message);
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
            }
        }
        //  for create path
        if (location.pathname.includes("create")) {
            setDetailsStates((prevStates) => ({
                ...prevStates,
                isCreate: true,
                uom: {
                    ...prevStates.uom,
                    companyUuid: companyRole.companyUuid
                }
            }));
        }
    };

    useEffect(() => {
        getDetails();
    }, []);

    const handleInvalidSubmit = () => {
        message = "Validation error, please check your input";
        showToast("error");
    };

    const handleEdit = (isEdit) => {
        setDetailsStates((prevStates) => ({
            ...prevStates,
            colWidth: isEdit ? 6 : 8,
            isEdit
        }));
    };

    const handleValidSubmit = (event, values) => {
        const query = new URLSearchParams(location.search);
        const uomCode = query.get("uuid");
        setDetailsStates((prevStates) => ({
            ...prevStates,
            isLoading: true
        }));
        const uom = {
            uomCode: uomCode || values.uomCode,
            uomName: values.uomName,
            description: values.description,
            companyUuid: detailsStates.uom.companyUuid,
            active: detailsStates.uom.active
        };
        if (!detailsStates.isCreate) { // update
            UOMService.postUpdateUOM(uom).then(() => {
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                message = "UOM updated successfully";
                showToast("success");
                handleEdit(false);
                getDetails();
            }).catch((error) => {
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                message = error.response.data.message;
                showToast("error");
            });
        } else { // create
            UOMService.postCreateUOM(uom).then((response) => {
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                message = "UOM created successfully";
                showToast("success");
                if (response.data.status === "OK") {
                    history.goBack();
                } else {
                    message = response.data.message;
                    showToast("error");
                }
            }).catch((error) => {
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                message = error.response.data.message;
                showToast("error");
            });
        }
    };

    const toggleActive = () => {
        setDetailsStates((prevStates) => ({
            ...prevStates,
            uom: {
                ...prevStates.uom,
                active: !prevStates.uom.active
            }
        }));
    };

    const onChange = (e) => {
        const { name, value } = e.target;
        setDetailsStates((prevStates) => ({
            ...prevStates,
            uom: {
                ...prevStates.uom,
                [name]: value
            }
        }));
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
                                title={!detailsStates.isCreate ? (t("UOMDetails")) : (t("CreateUOM"))}
                                className="mb-3 mb-lg-3"
                            />
                        </Col>
                    </Row>
                    <Row className="mb-5">
                        <Col lg={12}>
                            <Card>
                                <CardHeader tag="h6">
                                    {t("UOMDetails")}
                                </CardHeader>
                                <CardBody>
                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="text"
                                                name="uomCode"
                                                label={t("UOMCode")}
                                                placeholder={t("UOMCode")}
                                                validate={{
                                                    required: { value: true, errorMessage: t("UOMCodeIsRequired") }
                                                }}
                                                onChange={onChange}
                                                value={detailsStates.uom.uomCode.toUpperCase()}
                                                disabled={!detailsStates.isCreate}
                                            />
                                        </FormGroup>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="text"
                                                name="uomName"
                                                label={t("UOMName")}
                                                placeholder={t("UOMName")}
                                                onChange={onChange}
                                                validate={{
                                                    required: { value: true, errorMessage: t("UOMNameIsRequired") }
                                                }}
                                                value={detailsStates.uom.uomName.toUpperCase()}
                                                disabled={!detailsStates.isEdit
                                                    && !detailsStates.isCreate}
                                            />
                                        </FormGroup>
                                        <AvField
                                            type="textarea"
                                            name="description"
                                            label={t("Description")}
                                            placeholder={t("Description")}
                                            value={detailsStates.uom.description}
                                            disabled={!detailsStates.isEdit
                                                    && !detailsStates.isCreate}
                                        />
                                        {
                                            !detailsStates.isCreate
                                                ? (
                                                    <div className="p-field-checkbox">
                                                        <Checkbox
                                                            checked={detailsStates.uom.active}
                                                            onChange={toggleActive}
                                                            disabled={!detailsStates.isEdit}
                                                            id="active"
                                                        />
                                                        <label className="mb-0 ml-2" htmlFor="active">
                                                            {t("Is Active")}
                                                        </label>
                                                    </div>
                                                )
                                                : null
                                        }
                                    </Col>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <br />
                    <br />
                    <br />
                    <br />
                </Container>
                <StickyFooter className={`${classes["custom-footer"]}`}>
                    {(!detailsStates.isEdit && !detailsStates.isCreate)
                        && (
                            <Row className="justify-content-between px-3 mx-0">
                                <Button color="secondary" className="mb-2" onClick={() => { history.goBack(); }}>
                                    {t("Back")}
                                </Button>
                                {handleRolePermission?.write && (
                                    <Button className="mb-2 btn-facebook" onClick={() => handleEdit(true)}>
                                        {`${t("Edit")} `}
                                        <i className="fa fa-pencil ml-2" />
                                    </Button>
                                )}
                            </Row>
                        )}
                    {detailsStates.isEdit
                        && (
                            <Row className="justify-content-between px-3 mx-0">
                                <Button color="secondary" className="mb-2" onClick={() => { handleEdit(false); }}>
                                    {t("Back")}
                                </Button>
                                <ButtonSpinner text={t("Save")} className="mb-2" isLoading={detailsStates.isLoading} />
                            </Row>
                        )}
                    {detailsStates.isCreate
                        && (
                            <Row className="justify-content-between px-3 mx-0">
                                <Button color="secondary" className="mb-2" onClick={() => { history.push(URL_CONFIG.LIST_UOM); }}>
                                    {t("Back")}
                                </Button>
                                <ButtonSpinner text={t("Create")} className="mb-2" isLoading={detailsStates.isLoading} />
                            </Row>
                        )}
                </StickyFooter>
            </AvForm>
        </>
    );
};

export default UOMDetails;
