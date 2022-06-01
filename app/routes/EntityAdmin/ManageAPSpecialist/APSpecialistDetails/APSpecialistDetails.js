import {
    Button, Col, Container, Row
} from "components";
import { Formik, Form } from "formik";
import React, { useEffect, useState, useRef } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import { getCurrentCompanyUUIDByStore } from "helper/utilities";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import { useHistory, useLocation } from "react-router";
import ExtVendorService from "services/ExtVendorService";
import { HeaderMain } from "routes/components/HeaderMain";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import { AddItemDialog } from "routes/components";
import UserService from "services/UserService";
import APSpecialistService from "services/APSpecialistService/APSpecialistService";
import { usePermission } from "routes/hooks";
import AP_SPECIALIST_ROUTES from "../routes";
import { APSpecialistGrouping, ExternalVendorTagging } from "../components";
import { AddVendorColDefs } from "../ColumnDefs";
import apSpecialistGroupingSchema from "../helper";

const APSpecialistDetails = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const showToast = useToast();
    const formRef = useRef(null);

    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

    const [apSpecialist, setAPSpecialist] = useState({
        apSpecialistUuid: "",
        companyUuid: "",
        users: []
    });
    const [showAddVendorDialog, setShowAddVendorDialog] = useState(false);
    const [selectedVendorItems, setSelectedVendorItems] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [apSpecialistDetails, setAPSpecialistDetails] = useState({});
    const [listVendorUuid, setListVendorUuid] = useState([]);
    const [prevVendorUuid, setPrevVendorUuid] = useState([]);
    const [isEdit, setIsEdit] = useState(true);
    const apSpecialistPermission = usePermission(FEATURE.AP_SPECIALIST);

    const initialValues = {
        groupCode: "",
        apSpecialistUsers: [],
        remarks: "",
        vendorUuid: []
    };

    const getDataResponse = (responseData, type = "array") => {
        if (responseData.status === RESPONSE_STATUS.FULFILLED) {
            const { value } = responseData;
            if (!value) return type === "array" ? [] : {};
            const { status, data, message } = value && value.data;
            if (status === RESPONSE_STATUS.OK) {
                return data;
            }
            showToast("error", message);
        } else {
            const { response } = responseData && responseData.reason;
            showToast("error", response.data.message || response.data.error);
        }
        return type === "array" ? [] : {};
    };

    const initData = async (companyUuid, isDetails, uuid = "") => {
        try {
            const responses = await Promise.allSettled([
                ExtVendorService.getExternalVendors(companyUuid),
                UserService.getCompanyUsers(companyUuid),
                isDetails
                    ? APSpecialistService.getAPSpecialistDetails(companyUuid, uuid)
                    : Promise.resolve(null)
            ]);
            const [
                responseExtVendors,
                responseUsers,
                responseAPSpecialist
            ] = responses;
            setVendors(getDataResponse(responseExtVendors).filter((item) => item.seller === true));
            setAPSpecialistDetails(getDataResponse(responseAPSpecialist));

            const users = getDataResponse(responseUsers).map((user) => ({
                userUuid: user.uuid,
                userName: user.name
            }));
            setAPSpecialist((prevStates) => ({
                ...prevStates,
                companyUuid,
                users,
                apSpecialistUuid: uuid
            }));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const apSpecialistUuid = query.get("uuid");
        if (!_.isEmpty(permissionReducer)
            && !_.isEmpty(userDetails)) {
            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            if (companyUuid) {
                initData(
                    companyUuid,
                    location.pathname.includes("/details"),
                    apSpecialistUuid
                );
            }
        }
    }, [permissionReducer, userDetails]);

    useEffect(() => {
        if (listVendorUuid.length > 0) {
            const newVendors = vendors.map((item) => {
                if (listVendorUuid.includes(item.uuid)) {
                    return {
                        ...item,
                        isSelected: true
                    };
                }
                return {
                    ...item,
                    isSelected: false
                };
            });
            setVendors(newVendors);
        } else {
            const newVendors = vendors.map((item) => ({
                ...item,
                isSelected: false
            }));
            setVendors(newVendors);
        }
    }, [listVendorUuid]);

    const onCreatePressHandler = async (values) => {
        setPristine();
        try {
            const { companyUuid } = apSpecialist;
            const body = {
                groupCode: values.groupCode,
                apSpecialistUsers: values.apSpecialistUsers.map((item) => ({
                    userName: item.name, userUuid: item.value
                })),
                remarks: values.remarks,
                vendorUuid: []
            };
            const vendorUuid = values.vendorUuid.map((item) => item.uuid);
            body.vendorUuid = vendorUuid;

            const response = await APSpecialistService.createAPSpecialist(companyUuid, body);
            if (response.data.status === RESPONSE_STATUS.OK) {
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(AP_SPECIALIST_ROUTES.AP_SPECIALIST_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onEditPressHandler = async (values) => {
        setPristine();
        try {
            const { companyUuid, apSpecialistUuid } = apSpecialist;
            const body = {
                uuid: apSpecialistUuid,
                groupCode: values.groupCode,
                apSpecialistUsers: values.apSpecialistUsers.map((item) => ({
                    userName: item.name, userUuid: item.value
                })),
                remarks: values.remarks,
                removedVendorUuid: [],
                addedVendorUuid: []
            };
            const newVendorUuid = values.vendorUuid.map((item) => item.uuid);
            const removedVendorUuid = prevVendorUuid.filter(
                (item) => !newVendorUuid.includes(item.uuid)
            );
            const addedVendorUuid = newVendorUuid.filter(
                (item) => !prevVendorUuid.includes(item.uuid)
            );
            body.removedVendorUuid = removedVendorUuid;
            body.addedVendorUuid = addedVendorUuid;
            const response = await APSpecialistService.editAPSpecialist(companyUuid, body);
            if (response.data.status === RESPONSE_STATUS.OK) {
                showToast("success", response.data.message);
                setIsEdit(false);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onDeleteItem = (uuid, rowData, params, setFieldValue) => {
        setDirty();
        const newVendorUuid = rowData.filter(
            (item) => item.uuid !== uuid
        );
        const listUuids = newVendorUuid.map((item) => item.uuid);
        setFieldValue("vendorUuid", newVendorUuid);
        params.api.setRowData(newVendorUuid);
        setListVendorUuid(listUuids);
    };

    const onAddNewVendorItems = (setFieldValue, values, listExtVendors, setExtVendors) => {
        setDirty();
        setShowAddVendorDialog(false);
        let newVendorUuid = [...values.vendorUuid];
        const listVendors = selectedVendorItems.map((item) => item.data);
        const listUuids = listVendors.map((item) => item.uuid);
        const newVendors = listExtVendors.map((item) => {
            if (listUuids.includes(item.uuid)) {
                return {
                    ...item,
                    isSelected: true
                };
            }
            return {
                ...item,
                isSelected: false
            };
        });
        newVendorUuid = newVendorUuid.concat(listVendors);
        setFieldValue("vendorUuid", newVendorUuid);
        setExtVendors(newVendors);
    };

    const renderButtonActionDetailsScreen = (values, dirty, errors, handleSubmit) => {
        if (isEdit) {
            return (
                <Row className="mx-0">
                    <Button
                        color="primary"
                        type="button"
                        onClick={
                            () => {
                                handleSubmit();
                                if (!dirty || (dirty && Object.keys(errors).length)) {
                                    showToast("error", errors.vendorUuid || "Validation error, please check your input.");
                                    return;
                                }
                                onEditPressHandler(values);
                            }
                        }
                    >
                        {t("Save")}
                    </Button>
                </Row>
            );
        }
        return (
            <Row className="mx-0">
                <Button className="mb-2 btn-facebook btn-secondary" onClick={() => setIsEdit(true)}>
                    {`${t("Edit")} `}
                    <i className="fa fa-pencil ml-1" />
                </Button>
            </Row>
        );
    };

    const backBtnHandler = () => {
        if (!location.pathname.includes("/create") && isEdit) {
            const query = new URLSearchParams(location.search);
            const apSpecialistUuid = query.get("uuid");
            setIsEdit(false);
            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            if (companyUuid) {
                initData(
                    companyUuid,
                    location.pathname.includes("/details"),
                    apSpecialistUuid
                );
            }
        } else {
            setPristine();
            history.goBack();
        }
    };

    return (
        <Container fluid>
            <Formik
                innerRef={formRef}
                initialValues={initialValues}
                validationSchema={apSpecialistGroupingSchema}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, setFieldValue, dirty, setTouched, handleSubmit
                }) => {
                    useEffect(() => {
                        if (!_.isEmpty(apSpecialistDetails)) {
                            setIsEdit(false);
                            setFieldValue("groupCode", apSpecialistDetails.groupCode);
                            setFieldValue("remarks", apSpecialistDetails.remarks);
                            setFieldValue("apSpecialistUsers", apSpecialistDetails.apSpecialistUsers.map(
                                (item) => ({
                                    name: item.userName,
                                    value: item.userUuid
                                })
                            ));
                            const vendorUuid = [];
                            apSpecialistDetails.apSpecialistSupplierList.forEach((item) => {
                                const vendor = vendors
                                    .find((element) => item.companyCode === element.companyCode
                                        && item.companyName === element.companyName
                                        && item.uen === element.uen);
                                if (vendor) vendorUuid.push(vendor);
                            });

                            const vendorUuidList = vendorUuid.map((item) => item.uuid);

                            setFieldValue("vendorUuid", vendorUuid);
                            setPrevVendorUuid(vendorUuidList);

                            const newVendors = vendors.map((item) => {
                                if (vendorUuidList.includes(item.uuid)) {
                                    return {
                                        ...item,
                                        isSelected: true
                                    };
                                }
                                return {
                                    ...item,
                                    isSelected: false
                                };
                            });
                            setVendors(newVendors);
                        }
                    }, [apSpecialistDetails]);

                    useEffect(() => {
                        if (values.groupCode && location.pathname.includes("/details")) {
                            setTouched({
                                ...touched,
                                groupCode: true,
                                apSpecialistUsers: true,
                                remarks: true,
                                vendorUuid: true
                            });
                        }
                        if ((values.groupCode || values.apSpecialistUsers.length || values.remarks)
                            && isEdit
                        ) {
                            setDirty();
                        }
                    }, [values]);

                    return (
                        <Form>
                            <Row className="mx-0 justify-content-between">
                                {
                                    location.pathname.includes("/create")
                                    && (
                                        <HeaderMain
                                            title={t("CreateNewAPSpecialistGrouping")}
                                            className="mb-3 mb-lg-3"
                                        />
                                    )
                                }
                                {
                                    location.pathname.includes("/details")
                                    && (
                                        <HeaderMain
                                            title={t("APSpecialistDetails")}
                                            className="mb-3 mb-lg-3"
                                        />
                                    )
                                }
                            </Row>
                            <Row className="mb-3">
                                <Col md={12} lg={12}>
                                    <Row>
                                        <Col md={8} lg={8}>
                                            <APSpecialistGrouping
                                                t={t}
                                                disabled={!isEdit}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                                users={apSpecialist.users}
                                                setFieldValue={setFieldValue}
                                                isDetails={location.pathname.includes("/details")}
                                            />
                                        </Col>
                                        <Col md={4} lg={4} />
                                    </Row>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={12} lg={12}>
                                    <ExternalVendorTagging
                                        values={values}
                                        gridHeight={350}
                                        addVendor={() => setShowAddVendorDialog(true)}
                                        onDeleteItem={(uuid, rowData, params) => {
                                            onDeleteItem(
                                                uuid, rowData, params, setFieldValue
                                            );
                                        }}
                                        disabled={!isEdit}
                                    />
                                </Col>
                            </Row>

                            <StickyFooter>
                                <Row className="mx-0 px-3 justify-content-between">
                                    <Button
                                        color="secondary"
                                        onClick={backBtnHandler}
                                        style={{
                                            height: 36
                                        }}
                                    >
                                        {t("Back")}
                                    </Button>
                                    {apSpecialistPermission.write && (
                                        <>
                                            {
                                                location.pathname.includes("/create")
                                            && (
                                                <Row className="mx-0">
                                                    <Button
                                                        color="primary"
                                                        type="button"
                                                        onClick={
                                                            () => {
                                                                handleSubmit();
                                                                if (!dirty || (dirty && Object.keys(errors).length)) {
                                                                    showToast("error", errors.vendorUuid || "Validation error, please check your input.");
                                                                    return;
                                                                }
                                                                onCreatePressHandler(values);
                                                            }
                                                        }
                                                    >
                                                        {t("Create")}
                                                    </Button>
                                                </Row>
                                            )
                                            }
                                            {
                                                location.pathname.includes("/details")
                                            && (
                                                renderButtonActionDetailsScreen(
                                                    values, dirty,
                                                    errors, setFieldValue, handleSubmit
                                                )
                                            )
                                            }
                                        </>
                                    )}
                                </Row>
                            </StickyFooter>

                            <AddItemDialog
                                isShow={showAddVendorDialog}
                                onHide={() => {
                                    setShowAddVendorDialog(false);
                                    setSelectedVendorItems([]);
                                }}
                                title={t("AddVendor")}
                                onPositiveAction={() => onAddNewVendorItems(
                                    setFieldValue, values, vendors, setVendors
                                )}
                                onNegativeAction={() => {
                                    setShowAddVendorDialog(false);
                                    setSelectedVendorItems([]);
                                }}
                                columnDefs={AddVendorColDefs}
                                rowDataItem={vendors}
                                onSelectionChanged={(params) => {
                                    setSelectedVendorItems(params.api.getSelectedNodes());
                                }}
                            />
                        </Form>
                    );
                }}
            </Formik>
            {Prompt}
        </Container>
    );
};
export default APSpecialistDetails;
