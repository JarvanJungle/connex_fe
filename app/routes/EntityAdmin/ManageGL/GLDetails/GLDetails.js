import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { toast } from "react-toastify";
import { HeaderMain } from "routes/components/HeaderMain";
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

import GLService from "services/GLService";
import { contentError, contentInfo, debounce } from "helper/utilities";
import StickyFooter from "components/StickyFooter";
import URL_CONFIG from "services/urlConfig";
import { Checkbox } from "primereact/checkbox";
import { useSelector } from "react-redux";
import { usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";
import CostDepartmentCode from "routes/components/CostDepartmentCode/CostDepartmentCode";
import classes from "./GLDetails.scss";

const GLDetails = () => {
    let message = "Opp! Something went wrong.";

    const showToast = (type) => {
        switch (type) {
        case "success":
            toast.success(contentInfo({ message }));
            break;
        case "error":
            toast.info(contentError({ message }));
            break;
        }
    };

    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();

    const [isActive, setIsActive] = useState(false);

    const [detailsStates, setDetailsStates] = useState({
        isCreate: false,
        isEdit: false,
        colWidth: 8,
        countryList: [],
        isLoading: false,
        gl: {
            accountNumber: "",
            description: "",
            active: false,
            companyUuid: "",
            accountCode: ""
        },
        activeCodeTab: 1,
        rowDataCost: [],
        rowDataDepartment: []
    });
    const handleRolePermission = usePermission(FEATURE.GL);

    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userPermission } = permissionReducer;

    const getDetails = async () => {
        // get the uuid
        const companyRole = JSON.parse(localStorage.getItem("companyRole"));
        const query = new URLSearchParams(location.search);
        const token = query.get("uuid");
        if (token !== null) {
            try {
                const response = await GLService
                    .getGLDetails({ companyUuid: companyRole.companyUuid, accountNumber: token });
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                if (response.data.status === "OK") {
                    setDetailsStates((prevStates) => ({
                        ...prevStates,
                        gl: {
                            ...response.data.data,
                            companyUuid: companyRole.companyUuid
                        },
                        rowDataCost: response.data.data.costCodeDtoList?.map((item) => ({
                            code: item.code, remarks: item.remark
                        })),
                        rowDataDepartment: response.data.data.departmentCodeDtoList?.map(
                            (item) => ({
                                code: item.code, remarks: item.remark
                            })
                        )
                    }));
                    setIsActive(response.data.data.active);
                } else {
                    showToast("error", response.data);
                }
            } catch (error) {
                showToast("error", error.message);
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
            }
        }

        // for create path
        if (location.pathname.includes("create")) {
            setDetailsStates((prevStates) => ({
                ...prevStates,
                isCreate: true,
                gl: {
                    ...prevStates.gl, companyUuid: companyRole.companyUuid
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

    const handleValidSubmit = (event, values) => {
        setDetailsStates((prevStates) => ({
            ...prevStates,
            isLoading: true
        }));

        const costList = detailsStates.rowDataCost;
        const departmentList = detailsStates.rowDataDepartment;

        const gl = {
            accountNumber: values.accountNumber,
            description: values.description,
            active: isActive,
            companyUuid: detailsStates.gl.companyUuid,
            costCodeDtoList: costList?.map((item) => ({
                code: item.code,
                remark: item.remarks
            })),
            departmentCodeDtoList: departmentList?.map((item) => ({
                code: item.code,
                remark: item.remarks
            }))
        };
        if (!detailsStates.isCreate) { // update
            GLService.postUpdateGL(gl).then((response) => {
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isEdit: false,
                    isLoading: false
                }));
                if (response.data.status === "OK") {
                    message = "G/L updated successfully.";
                    showToast("success");
                    getDetails();
                } else {
                    message = response.data.message;
                    showToast("error");
                }
            }).catch((error) => {
                message = error.response.data.message;
                showToast("error");
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
            });
        } else { // create
            GLService.postCreateGL(gl).then((response) => {
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                if (response.data.status === "OK") {
                    history.push(URL_CONFIG.LIST_GL);
                    message = "G/L created successfully.";
                    showToast("success");
                } else {
                    message = response.data.message;
                    showToast("error");
                }
            }).catch((error) => {
                message = error.response.data.message;
                showToast("error");
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
            });
        }
    };

    const handleEdit = (isEdit) => {
        setDetailsStates((prevStates) => ({
            ...prevStates,
            colWidth: isEdit ? 6 : 8,
            isEdit
        }));
    };

    const addCostCode = (value) => {
        const rowData = [...detailsStates.rowDataCost];
        rowData.push({ code: value.code, remarks: value.remarks, isNew: true });
        setDetailsStates((prevState) => ({
            ...prevState,
            rowDataCost: rowData
        }));
    };

    const addDepartmentCode = (value) => {
        const rowData = [...detailsStates.rowDataDepartment];
        rowData.push({ code: value.code, remarks: value.remarks, isNew: true });
        setDetailsStates((prevState) => ({
            ...prevState,
            rowDataDepartment: rowData
        }));
    };

    return (
        <>
            <AvForm onValidSubmit={debounce(handleValidSubmit)} onInvalidSubmit={debounce(handleInvalidSubmit)}>
                <Container fluid>
                    <Row className="mb-1">
                        <Col lg={12}>
                            <HeaderMain
                                title={!detailsStates.isCreate ? (t("GLDetails")) : (t("CreateGL"))}
                                className="mb-3 mb-lg-3"
                            />
                        </Col>
                    </Row>
                    <Row className="mb-5">
                        <Col lg={12}>
                            <Card>
                                <CardHeader tag="h6">
                                    {!detailsStates.isCreate ? (t("GLDetails")) : (t("CreateGL"))}
                                </CardHeader>
                                <CardBody>
                                    <Col lg={4}>
                                        <FormGroup>
                                            <div className={`${classes["label-required"]}`}>
                                                <AvField
                                                    type="text"
                                                    name="accountNumber"
                                                    label={`${t("GLAccount")}`}
                                                    placeholder={t("GLAccountPlaceHolder")}
                                                    validate={{
                                                        required: { value: true, errorMessage: t("GLAccountRequired") },
                                                        maxLength: { value: 20 }
                                                    }}
                                                    value={detailsStates.gl.accountNumber}
                                                    disabled={!detailsStates.isCreate}
                                                />
                                            </div>
                                            <AvField
                                                type="textarea"
                                                name="description"
                                                label={t("Description")}
                                                placeholder={t("DescriptionPlaceHolder")}
                                                validate={{
                                                    maxLength: { value: 200 }
                                                }}
                                                value={detailsStates.gl.description}
                                                disabled={!detailsStates.isEdit
                                                    && !detailsStates.isCreate}
                                            />
                                            {
                                                !detailsStates.isCreate ? (
                                                    <div className="p-field-checkbox">
                                                        <Checkbox
                                                            checked={isActive}
                                                            onChange={() => setIsActive(!isActive)}
                                                            disabled={!detailsStates.isEdit}
                                                            id="active"
                                                        />
                                                        <label className="mb-0 ml-2" htmlFor="active">{t("Is Active")}</label>
                                                    </div>
                                                ) : null
                                            }
                                        </FormGroup>
                                    </Col>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg={12} className="mt-3">
                            <CostDepartmentCode
                                rowDataCost={detailsStates.rowDataCost}
                                rowDataDepartment={detailsStates.rowDataDepartment}
                                onGridReady={(params) => {
                                    params.api.sizeColumnsToFit();
                                }}
                                groupDefaultExpanded={-1}
                                gridHeight={350}
                                defaultExpanded
                                borderTopColor="#AEC57D"
                                paginationPageSize={10}
                                activeTab={detailsStates.activeCodeTab}
                                setActiveTab={(idx) => {
                                    setDetailsStates((prevStates) => ({
                                        ...prevStates,
                                        activeCodeTab: idx
                                    }));
                                }}
                                addCostCode={(value) => addCostCode(value)}
                                addDepartmentCode={(value) => addDepartmentCode(value)}
                                disabled={!detailsStates.isEdit
                                    && !detailsStates.isCreate}
                            />
                        </Col>
                    </Row>
                    <br />
                    <br />
                    <br />
                    <br />
                </Container>
                <StickyFooter>
                    {(!detailsStates.isEdit && !detailsStates.isCreate)
                        && (
                            <Row className="justify-content-between mx-0 px-3">
                                <Button color="secondary" className="mb-2" onClick={() => { history.goBack(); }}>
                                    {t("Back")}
                                </Button>
                                {handleRolePermission?.write && (
                                    <Button className="mb-2 btn-facebook" onClick={() => handleEdit(true)}>
                                        {t("Edit")}
                                        <i className="fa fa-pencil ml-1" />
                                    </Button>
                                )}
                            </Row>
                        )}
                    {detailsStates.isEdit
                        && (
                            <Row className="justify-content-between mx-0 px-3">
                                <Button color="secondary" className="mb-2" onClick={() => { handleEdit(false); }}>
                                    {t("Back")}
                                </Button>
                                <ButtonSpinner text={t("Save")} className="mb-2" isLoading={detailsStates.isLoading} />
                            </Row>
                        )}
                    {detailsStates.isCreate
                        && (
                            <Row className="justify-content-between mx-0 px-3">
                                <Button color="secondary" className="mb-2" onClick={() => { history.goBack(); }}>
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

export default GLDetails;
