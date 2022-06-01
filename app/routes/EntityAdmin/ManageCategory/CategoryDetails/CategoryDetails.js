import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AvForm, AvField } from "availity-reactstrap-validation";
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

import StickyFooter from "components/StickyFooter";
import { useSelector } from "react-redux";
import CategoryService from "services/CategoryService/CategoryService";
import useToast from "routes/hooks/useToast";
import { usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";
import { debounce } from "helper/utilities";
import classes from "./CategoryDetails.scss";
import CATEGORY_ROUTES from "../route";

const CategoryDetails = () => {
    const permissionReducer = useSelector((state) => state.permissionReducer);
    let message = "Opp! Something went wrong.";
    const toast = useToast();

    const showToast = (type) => toast(type, message);

    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const [isEdit, setIsEdit] = useState(false);
    const handleRolePermission = usePermission(FEATURE.CATEGORY);

    const [detailsStates, setDetailsStates] = useState({
        isCreate: false,
        colWidth: 8,
        countryList: [],
        isLoading: false,
        category: {
            categoryName: "",
            categoryDescription: "",
            active: false,
            companyUuid: ""
        }
    });

    const getDetails = async () => {
        // get the uuid
        const { companyUuid } = permissionReducer.currentCompany;
        const query = new URLSearchParams(location.search);
        const token = query.get("uuid");
        if (token !== null) {
            try {
                // API get Category Details
                const responseCategory = await CategoryService
                    .getCategoryDetail(companyUuid, token);
                const response = responseCategory.data.data;
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    category: {
                        ...response,
                        companyUuid
                    }
                }));
                setIsEdit(false);
            } catch (error) {
                showToast("error", error.message);
            }
        }

        // for create path
        if (location.pathname.includes("create")) {
            setDetailsStates((prevStates) => ({
                ...prevStates,
                isCreate: true,
                category: {
                    ...prevStates.category, companyUuid
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

    const handleValidSubmit = async (event, values) => {
        const { companyUuid } = permissionReducer.currentCompany;
        setDetailsStates((prevStates) => ({
            ...prevStates,
            isLoading: true
        }));

        const category = {
            categoryName: values.categoryName,
            categoryDescription: values.categoryDescription,
            active: values.active,
            companyUuid: detailsStates.category.companyUuid,
            uuid: detailsStates.category.uuid
        };
        setDetailsStates((prevStates) => ({
            ...prevStates,
            isLoading: false
        }));
        // API create, edit Category
        if (!detailsStates.isCreate) {
            // Api update
            try {
                await CategoryService.updateCategory(
                    companyUuid, category.uuid, category.categoryDescription
                );
                message = "Category updated successfully";
                showToast("success");
                getDetails();
            } catch (err) {
                message = err.response.data.message;
                showToast("error");
            }
        } else {
            try {
                const response = await CategoryService.createCategory(
                    companyUuid, category
                );
                message = "Category created successfully";
                if (response.data.status === "OK") {
                    history.push(CATEGORY_ROUTES.CATEGORY_LIST);
                    showToast("success");
                } else {
                    showToast("error");
                }
            } catch (err) {
                message = err.response.data.message;
                showToast("error");
            }
        }
    };

    return (
        <>
            <AvForm onValidSubmit={debounce(handleValidSubmit)} onInvalidSubmit={debounce(handleInvalidSubmit)}>
                <Container fluid>
                    <Row className="mb-1">
                        <Col lg={12}>
                            <HeaderMain
                                title={!detailsStates.isCreate ? (t("Category Details")) : (t("Create New Category"))}
                                className="mb-3 mb-lg-3"
                            />
                        </Col>
                    </Row>
                    <Row className="mb-5">
                        <Col lg={12}>
                            <Card>
                                <CardHeader tag="h6">
                                    {!detailsStates.isCreate ? t("Category Details") : t("New Category Details")}
                                </CardHeader>
                                <CardBody>
                                    <Col lg={4}>
                                        <FormGroup>
                                            <Row>
                                                <Col xs="12" className={`${classes["label-required"]}`}>
                                                    <AvField
                                                        type="text"
                                                        name="categoryName"
                                                        label={t("Category Name")}
                                                        placeholder={t("Enter Category Name")}
                                                        validate={{
                                                            required: { value: true, errorMessage: t("Please enter valid Category Name") }
                                                        }}
                                                        value={detailsStates.category.categoryName}
                                                        disabled={!detailsStates.isCreate}
                                                    />
                                                </Col>
                                                <Col xs="12">
                                                    <AvField
                                                        type="textarea"
                                                        name="categoryDescription"
                                                        label={`${t("Category Description")}`}
                                                        placeholder={t("Enter Category Description")}
                                                        disabled={!detailsStates.isCreate && !isEdit}
                                                        validate={{
                                                            maxLength: { value: 500 }
                                                        }}
                                                        value={detailsStates
                                                            .category.categoryDescription}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
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
                <StickyFooter>
                    {(!detailsStates.isCreate)
                        && (
                            <Row className="justify-content-between mx-0 px-3">
                                <Button color="secondary" className="mb-2" onClick={() => (isEdit ? getDetails() : history.goBack())}>
                                    {t("Back")}
                                </Button>
                                {isEdit
                                    ? <ButtonSpinner text={t("Save")} className="mb-2" isLoading={detailsStates.isLoading} />
                                    : (handleRolePermission?.write && (
                                        <Button onClick={() => setIsEdit(true)} className="mb-2 btn-facebook" color="secondary">
                                            {t("Edit")}
                                            <i className="fa fa-pencil ml-2" />
                                        </Button>
                                    )
                                    )}
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

export default CategoryDetails;
