/* eslint-disable max-len */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import UserDataService from "services/UserService";
import { useTranslation } from "react-i18next";
import { AvForm, AvField } from "availity-reactstrap-validation";
import ButtonSpinner from "components/ButtonSpinner";
import StickyFooter from "components/StickyFooter";

import { AgGridReact } from "components/agGrid";

import {
    Container,
    Row,
    Card,
    CardBody,
    CardHeader,
    UncontrolledModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Nav,
    NavItem,
    NavLink,
    Col,
    Button,
    FormGroup, CustomInput
} from "components";

import { HeaderMain } from "routes/components/HeaderMain";

import useToast from "routes/hooks/useToast";
import { v4 as uuidv4 } from "uuid";
import DialCodes from "/public/assets/DialCodes.js";
import _ from "lodash";
import FeaturesMatrixService from "services/FeaturesMatrixService/FeaturesMatrixService";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import { debounce, getCurrentCompanyUUIDByStore } from "helper/utilities";
import { useSelector } from "react-redux";
import {
    ReadRender, WriteRender, ApproveRender, CheckboxRenderer
} from "routes/Entities/CreateUser/components";
import { RolesListColDefs, PermissionColDefs } from "routes/Entities/CreateUser/ColumnDefs";
import EntitiesService from "services/EntitiesService";
import PrivilegesService from "services/PrivilegesService";
import ManageRolesService from "services/ManageRolesService/ManageRolesService";
import { MANAGE_ROLES_ROUTES } from "routes/EntityAdmin/ManageRoles";
import { usePermission } from "routes/hooks";
import TaskManagement from "./components/TaskManagement";
import classes from "./UserDetails.module.scss";
import AdministratorCheckTable from "../AdministratorCheckTable";

const UserDetails = (props) => {
    const { t } = useTranslation();
    const { location } = props;
    const history = useHistory();
    const showToast = useToast();

    const permissionReducer = useSelector((state) => state.permissionReducer);

    const [user, setUser] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [activeTab, setActiveTab] = useState(1);
    const [remarks, setRemarks] = useState("");
    const [pathRoute, setPathRoute] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDeactivated, setIsDeactivated] = useState(false);
    const [canEdit, setCanEdit] = useState(true);
    const [listModules, setListModules] = useState([]);
    const [dataChange, setDataChange] = useState(null);
    const [currentCompanyUuid, setCurrentCompanyUuid] = useState("");
    const [userAuthorities, setUserAuthorities] = useState([]);

    // showing all companies available for adding
    const [allCompanies, setAllCompanies] = useState([]);
    const [gridCompanies, setGridCompanies] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [taskManagementGridApi, setTaskManagementGridApi] = useState(null);

    const [dataCompany, setDataCompany] = useState([]);
    const [dataUser, setDataUser] = useState([]);
    const [companyRole, setCompanyRole] = useState();
    const [userManagement, setUserManagement] = useState({
        name: "User Management",
        info: []
    });
    const [entitySetup, setEntitySetup] = useState({
        name: "Entity Setup",
        info: []
    });
    const [bankConnection, setBankConnection] = useState({
        name: "Bank Connection",
        info: []
    });
    const [roles, setRoles] = useState([]);
    const [gridDesignationAPI, setGridDesignationAPI] = useState(null);
    const [roleOfUser, setRoleOfUser] = useState([]);
    const [firstCalled, setFirstCalled] = useState(false);
    let handleRolePermission;

    if (history.location.pathname.includes("company")) {
        handleRolePermission = usePermission(FEATURE.COMPANY_USER);
    } else {
        handleRolePermission = usePermission(FEATURE.ORGANIZATION_USER);
    }

    const tabList = [
        { id: 1, name: "Task Management" },
        // { id: 2, name: "Admin Administrator" },
        { id: 4, name: "Security & Login", icon: "fa fa-unlock-alt" },
        { id: 3, name: "Remarks" }
    ];

    const defaultColDef = {
        editable: false,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        resizable: true
    };

    const columnDefs = [
        {
            headerName: t("Company Name"),
            field: "entityName"
        }
    ];

    const getUserDetails = () => {
        // get the uuid
        const query = new URLSearchParams(props.location.search);
        const token = query.get("uuid");
        UserDataService.getUserDetails(token).then((response) => {
            if (response.data.status === "OK") {
                const returnData = response.data.data;
                setUser({
                    ...returnData,
                    workNumber: returnData.workNumber
                });
                setRemarks(returnData.remarks || "");
                if (returnData.isActive === false) {
                    setIsDeactivated(true);
                }
            } else {
                showToast("error", response.data.message);
            }
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };

    const getUserAccessMatrixData = async () => {
        try {
            const role = JSON.parse(localStorage.getItem("companyRole"));
            setCompanyRole(companyRole);
            const response1 = await PrivilegesService.getResourcesUnderCompany(
                role.companyUuid
            );
            setDataCompany(response1.data.data);
            if (history.location.pathname.includes("company")) {
                const query = new URLSearchParams(props.location.search);
                const userUuid = query.get("uuid");
                const response2 = await PrivilegesService.getPermissionsOfAnUser(
                    role.companyUuid, userUuid
                );
                setDataUser(response2.data.data);
            }
        } catch (error) {
            showToast("error", error.response.data.message);
        }
    };

    const filterCategory = (data, category) => data.administrativesDtoList
        .filter((value) => value.adminCategories.categoryCode === category)
        .map((value) => value.administrativeCode);

    const getListRole = async () => {
        try {
            const role = JSON.parse(localStorage.getItem("companyRole"));
            const rolesResponse = await ManageRolesService.getRolesList(role.companyUuid);
            if (rolesResponse.data.status === RESPONSE_STATUS.OK) {
                setRoles(rolesResponse.data.data.map(
                    (item) => ({ ...item, disabled: true, selected: false })
                ));
            } else {
                throw new Error(rolesResponse.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const getRolesOfUser = async () => {
        try {
            const query = new URLSearchParams(props.location.search);
            const uuid = query.get("uuid");
            const company = JSON.parse(localStorage.getItem("companyRole"));
            const rolesResponse = await ManageRolesService.getRoleOfUser(company.companyUuid, uuid);
            if (rolesResponse.data.status === RESPONSE_STATUS.OK) {
                const roleUuids = rolesResponse?.data?.data?.map((item) => item.uuid);
                setRoleOfUser(roleUuids);
                setRoles(roles.map((role) => {
                    if (roleUuids.includes(role.uuid)) {
                        return {
                            ...role,
                            selected: true
                        };
                    }
                    return role;
                }));
                setFirstCalled(true);
            } else {
                throw new Error(rolesResponse.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const getAdminAccessMatrixData = async () => {
        try {
            const role = JSON.parse(localStorage.getItem("companyRole"));
            const query = new URLSearchParams(props.location.search);
            const uuid = query.get("uuid");
            const response = await EntitiesService.listAllTheUserPermissionWithinACompany(
                role.companyUuid
            );
            const data = response.data.data.find((value) => value.userUuid === uuid);
            if (data) {
                const dataUserManagement = filterCategory(data, "USER_MANAGEMENT");
                const dataEntitySetup = filterCategory(data, "ENTITY_SETUP");
                const dataBankConnection = filterCategory(data, "BANK_CONNECTION");
                setUserManagement({
                    ...userManagement,
                    info: [
                        {
                            text: "Manage Users",
                            key: "manageUsers",
                            value: dataUserManagement.includes("MANAGE_USERS")
                        },
                        {
                            text: "Manage Admin Matrix",
                            key: "manageAdminMatrix",
                            value: dataUserManagement.includes("MANAGE_ADMIN_MATRIX")
                        },
                        {
                            text: "Manage User Matrix",
                            key: "manageUserMatrix",
                            value: dataUserManagement.includes("MANAGE_USER_MATRIX")
                        },
                        {
                            text: "Manage Approver Matrix",
                            key: "manageApproverMatrix",
                            value: dataUserManagement.includes("MANAGE_APPROVER_MATRIX")
                        }
                    ]
                });
                setEntitySetup({
                    ...entitySetup,
                    info: [
                        {
                            text: "Manage Currencies",
                            key: "manageCurrencies",
                            value: dataEntitySetup.includes("MANAGE_CURRENCY")
                        },
                        {
                            text: "Manage Supplier Bank Account",
                            key: "manageSupplierBankAccount",
                            value: dataEntitySetup.includes("MANAGE_SUPPLIER_BANK_ACCOUNT")
                        },
                        {
                            text: "Manage Suppliers",
                            key: "manageSuppliers",
                            value: dataEntitySetup.includes("MANAGE_SUPPLIERS")
                        }
                    ]
                });
                setBankConnection({
                    ...bankConnection,
                    info: [
                        {
                            text: "Manage Bank Connection",
                            key: "manageBankConnection",
                            value: dataBankConnection.includes("MANAGE_BANK_CONNECTION")
                        },
                        {
                            text: "Manage Bank Account",
                            key: "manageBankAccount",
                            value: dataBankConnection.includes("MANAGE_BANK_ACCOUNT")
                        }
                    ]
                });
            }
        } catch (error) {
            showToast("error", error.response.data.message);
        }
    };

    const extractCompanyAuthData = (companyAuth) => {
        const grouped = _.groupBy(companyAuth, "moduleCode");
        const listModulesTemp = [];

        Object.keys(grouped).forEach((key) => {
            let features = grouped[key];
            features = features.map((feature) => ({
                featureName: feature.featureName,
                featureCode: feature.featureCode,
                read: false,
                write: false,
                approve: false,
                moduleCode: key,
                disabled: true
            }));
            listModulesTemp.push(...features);
        });
        return listModulesTemp;
    };

    const groupByFeatureCode = (features) => {
        const grouped = _.groupBy(features, "featureCode");
        const listModulesTemp = [];
        Object.keys(grouped).forEach((key) => {
            if (grouped[key].length > 0) {
                const feature = grouped[key][0];
                feature.actions.read = grouped[key].some((item) => item.actions.read === true);
                feature.actions.write = grouped[key].some((item) => item.actions.write === true);
                feature.actions.approve = grouped[key].some(
                    (item) => item.actions.approve === true
                );
                listModulesTemp.push(feature);
            }
        });
        return listModulesTemp;
    };

    const getEntityCompanies = () => {
        UserDataService.getCompanies().then((response) => {
            if (response.data.status === "OK") {
                setAllCompanies(response.data.data);
            } else {
                showToast("error", response.data.message);
            }
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };

    const getListModule = async (companyUuid, userUuid) => {
        try {
            let companyModules = [];

            const companyAuthResponse = await FeaturesMatrixService
                .getCompanyAuthorities(companyUuid);
            if (companyAuthResponse.data.status === RESPONSE_STATUS.OK) {
                const companyData = companyAuthResponse.data.data;
                companyModules = extractCompanyAuthData(companyData);
            } else {
                throw new Error(companyAuthResponse.data.message);
            }
            if (pathRoute !== "organization") {
                const userAuthResponse = await FeaturesMatrixService
                    .getUserAuthorities(companyUuid, userUuid);
                const userData = userAuthResponse.data.data;
                setUserAuthorities(_.cloneDeep(userData));
                const userModules = groupByFeatureCode(userData);
                const newListModules = [...companyModules];
                companyModules.forEach((item, index) => {
                    const permission = userModules.find(
                        (element) => element?.featureCode === item?.featureCode
                    );
                    if (permission) {
                        newListModules[index].read = permission.actions.read;
                        newListModules[index].write = permission.actions.write;
                        newListModules[index].approve = permission.actions.approve;
                    }
                });
                setListModules(newListModules);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const userHasRBACRole = useMemo(() => permissionReducer?.userPermission?.ADMIN?.features?.find((e) => e.featureCode === "rbacRole")?.actions?.read, [permissionReducer]);

    useEffect(() => {
        const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
        if (companyUuid && user.uuid) {
            setCurrentCompanyUuid(companyUuid);
            getListModule(companyUuid, user.uuid);
        }
    }, [permissionReducer, user.uuid]);

    useEffect(() => {
        if (history.location.pathname.includes("company")) {
            setPathRoute("company");
        } else if (history.location.pathname.includes("organization")) {
            setPathRoute("organization");
        }
        getUserDetails();
        getEntityCompanies();
        getUserAccessMatrixData();
        getAdminAccessMatrixData();
        getListRole();
    }, []);

    const removeCompany = (companiesRole) => {
        // remove the company from the user
        const { companyUuid } = companiesRole;
        const filteredCompanies = user.companies.filter(
            (role) => role.companyUuid !== companyUuid
        );
        setUser({ ...user, companies: filteredCompanies });
    };

    const onGridReady = (params) => {
        setGridApi(params.api);
        params.api.sizeColumnsToFit();
        const array = [];
        allCompanies.forEach((company) => {
            let selected = false;
            user.companies.forEach((selectedCom) => {
                if (company.uuid === selectedCom.companyUuid) {
                    selected = true;
                }
            });
            if (selected === false) {
                array.push(company);
            }
        });
        setGridCompanies(array);
    };

    const handleAddCompanies = () => {
        const selectedNodes = gridApi.getSelectedNodes();
        if (selectedNodes.length <= 0) {
            return;
        }
        const selectedCompanies = selectedNodes.map((e) => e.data);
        const companies = [...user.companies];
        // handle add need to be receiving for both companies and user roles
        for (let i = 0; i < selectedCompanies.length; i++) {
            const newCompany = { companyName: selectedCompanies[i].entityName, companyUuid: selectedCompanies[i].uuid, role: ["ENTITY_USER"] };
            companies.push(newCompany);
        }
        setUser({ ...user, companies });
    };

    const handleTwoFAReset = () => {
        UserDataService.resetTwoFA({ uuid: user.uuid }).then((response) => {
            if (response.data.status === "OK") {
                showToast("success", "Two FA Reset Successful");
            } else {
                showToast("error", response.data.message);
            }
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };

    const handleInvalidSubmit = () => {
        showToast("error", "Validation error, please check your input");
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    const handleEdit = () => {
        setIsEdit(true);
    };

    const cancelEdit = () => {
        setIsEdit(false);
    };

    // const mapAdminAccessMatrixDto = (data, category) => data.filter(
    //     (value) => value.value
    // ).map((value) => ({
    //     administrativeCode: value.key.replace(/([A-Z])/g, "_$1").toUpperCase(),
    //     adminCategories: {
    //         categoryCode: category
    //     }
    // }));

    const mapBodyGrantUserAuthorities = () => {
        const body = [];
        const assignedRoleAuthorities = userAuthorities?.filter((ft) => ft.fromRole);
        const featureMatrixAuthorities = userAuthorities?.filter((ft) => !ft.fromRole);
        taskManagementGridApi.forEachNode((node) => {
            const { data } = node;
            if (data) {
                const featureRole = assignedRoleAuthorities?.find((ft) => ft.featureCode === data.featureCode);
                const featureFeatureMatrix = featureMatrixAuthorities?.find((ft) => ft.featureCode === data.featureCode);
                const permission = {
                    featureCode: data.featureCode,
                    actions: []
                };
                // If feature has been assigned from a role, not update role, else update role
                if (featureRole?.actions?.read ? featureFeatureMatrix?.actions?.read : data.read) permission.actions.push("READ");
                if (featureRole?.actions?.write ? featureFeatureMatrix?.actions?.write : data.write) permission.actions.push("WRITE");
                if (featureRole?.actions?.approve ? featureFeatureMatrix?.actions?.approve : data.approve) permission.actions.push("APPROVE");
                body.push(permission);
            }
        });
        return body;
    };

    const updateNewListModule = (permissions) => {
        const newListModules = [...listModules];
        listModules.forEach((item, index) => {
            const permission = permissions.find(
                (element) => element?.featureCode === item?.featureCode
            );
            if (permission) {
                newListModules[index].read = permission.actions.includes("READ");
                newListModules[index].write = permission.actions.includes("WRITE");
                newListModules[index].approve = permission.actions.includes("APPROVE");
                newListModules[index].disabled = true;
            }
        });
        taskManagementGridApi.setRowData(newListModules);
        cancelEdit();
    };

    const handleValidSubmit = async () => {
        setIsLoading(true);
        UserDataService.updateUser({ ...user, remarks }).then((response) => {
            if (response.data.status === "OK") {
                showToast("success", "Update Successfully");
                setIsLoading(false);
            } else {
                showToast("error", "Non unique email address");
                setIsLoading(false);
            }
        }).then(
            //     () => PrivilegesService.postUserAccessMatrix(dataSave)).then(() => {
            //     const data = {
            //         userUuid: user ? user.uuid : "",
            //         companyUuid: companyRole ? companyRole.companyUuid : "",
            //         administrativesDtoList: [
            //             ...mapAdminAccessMatrixDto(userManagement.info, "USER_MANAGEMENT"),
            //             ...mapAdminAccessMatrixDto(entitySetup.info, "ENTITY_SETUP"),
            //             ...mapAdminAccessMatrixDto(bankConnection.info, "BANK_CONNECTION")
            //         ]
            //     };
            //     return EntitiesService.createAndUpdatePermissionForOneUser(data);
            // }
        )
            .catch((error) => {
                showToast("error", error.response.data.message);
                setIsLoading(false);
            });

        const bodyGrantUserAuthorities = mapBodyGrantUserAuthorities();

        await FeaturesMatrixService.grantUserAuthorities(
            currentCompanyUuid, user.uuid, bodyGrantUserAuthorities
        );
        updateNewListModule(bodyGrantUserAuthorities);

        const roleUuids = [];
        gridDesignationAPI.forEachNode((node) => {
            if (node.data.selected === true) {
                roleUuids.push(node.data.uuid);
            }
        });
        await ManageRolesService.assignRoleToUser(
            currentCompanyUuid, user.uuid, roleUuids
        );
        getListModule(currentCompanyUuid, user?.uuid);
    };

    const doNothing = () => { };

    const handleUserDeactivation = () => {
        UserDataService.deactivateUser(user.uuid).then((response) => {
            if (response.data.status === "OK") {
                showToast("success", "User Deactivated");
                getUserDetails();
            } else {
                showToast("error", response.data.message);
            }
        }).catch((error) => {
            showToast("error", error.response.data.message);
        });
    };

    const handleCompanyAdminCheckbox = (event) => {
        const listCompanies = [...user.companies];
        for (let i = 0; i < listCompanies.length; i++) {
            if (listCompanies[i].companyUuid === event.target.id) {
                const newRoles = [...listCompanies[i].role];
                let exist = false;
                for (let j = 0; j < listCompanies[i].role.length; j++) {
                    if (listCompanies[i].role[j] === "ENTITY_USER") {
                        newRoles[j] = "COMPANY_ADMIN";
                        const newCompany = { ...listCompanies[i], role: newRoles };
                        listCompanies.splice(i, 1, newCompany);
                        exist = true;
                        break;
                    } else if (listCompanies[i].role[j] === "COMPANY_ADMIN") {
                        newRoles[j] = "ENTITY_USER";
                        const newCompany = { ...listCompanies[i], role: newRoles };
                        listCompanies.splice(i, 1, newCompany);
                        exist = true;
                        break;
                    }
                }
                if (exist === false) {
                    newRoles.push("COMPANY_ADMIN");
                    const newCompany = { ...listCompanies[i], role: newRoles };
                    listCompanies.splice(i, 1, newCompany);
                }
            }
        }
        setUser({ ...user, companies: listCompanies });
    };

    const handleAdministratorCheckbox = (name, index) => {
        const copyUserManagement = [...userManagement.info];
        const copyEntitySetup = [...entitySetup.info];
        const copyBankConnection = [...bankConnection.info];
        switch (name) {
        case "User Management":
            copyUserManagement[index].value = !userManagement.info[index].value;
            setUserManagement({
                ...userManagement,
                copyUserManagement
            });
            break;

        case "Entity Setup":
            copyEntitySetup[index].value = !entitySetup.info[index].value;
            setEntitySetup({
                ...entitySetup,
                copyEntitySetup
            });
            break;

        case "Bank Connection":
            copyBankConnection[index].value = !bankConnection.info[index].value;
            setBankConnection({
                ...bankConnection,
                copyBankConnection
            });
            break;

        default:
            break;
        }
    };

    const handleUserActivation = () => {
        UserDataService.activateUser(user.uuid).then((response) => {
            if (response.data.status === "OK") {
                showToast("success", "User Activated");
                setIsDeactivated(false);
                getUserDetails();
            } else {
                showToast("error", response.data.message);
            }
        }).catch((error) => {
            showToast("error", error.response.data.message);
        });
    };

    const checkCompanyAdmin = (companiesRole) => {
        for (let i = 0; i < companiesRole.role.length; i++) {
            if (companiesRole.role[i] === "COMPANY_ADMIN") {
                return true;
            }
        }
        return false;
    };

    const onChangeAction = (action, event, data) => {
        setDataChange({ action, event, data });
    };

    useEffect(() => {
        if (!_.isEmpty(dataChange)) {
            const { action, event, data } = dataChange;
            const { checked } = event.target;
            const { feature: { featureCode }, moduleCode } = data;
            const modules = [];
            listModules.forEach((module) => {
                if (module.moduleCode === moduleCode) {
                    const listFeature = module.features.map((item) => {
                        if (item.feature.featureCode === featureCode) {
                            return {
                                ...item,
                                actions: {
                                    ...item.actions,
                                    [action]: checked
                                }
                            };
                        }
                        return item;
                    });
                    modules.push({
                        features: listFeature,
                        moduleCode
                    });
                } else {
                    modules.push(module);
                }
            });
            setListModules(modules);
        }
    }, [dataChange]);

    useEffect(() => {
        setRoles(roles.map((role) => ({ ...role, disabled: !isEdit })));
    }, [isEdit]);

    useEffect(() => {
        if (roles.length > 0 && roleOfUser.length === 0 && !firstCalled) {
            getRolesOfUser();
        }
    }, [roles]);

    return (
        <>
            <AvForm onValidSubmit={debounce(handleValidSubmit)} onInvalidSubmit={debounce(handleInvalidSubmit)}>
                {/* <AvForm> */}
                <Container fluid>
                    <Row className="mb-1">
                        <Col lg={12}>
                            {
                                location.pathname.includes("/company-users/details")
                                    ? (
                                        <HeaderMain
                                            title={t("CompanyUserDetails")}
                                            className="mb-3 mb-lg-3"
                                        />
                                    ) : (
                                        <HeaderMain
                                            title={t("Organization User Details")}
                                            className="mb-3 mb-lg-3"
                                        />
                                    )
                            }
                        </Col>
                    </Row>
                    <Row className="mb-5">
                        <Col lg={12}>
                            <Card>
                                <CardHeader tag="h6">
                                    {t("User Profile")}
                                </CardHeader>
                                <CardBody>
                                    <Row className="mb-2">
                                        <Col md={2}>
                                            <label
                                                htmlFor="userName"
                                                className={classes.inputText1}
                                            >
                                                {t("User Name")}
                                                <span> *</span>
                                            </label>
                                        </Col>
                                        <Col md={4}>
                                            {!isEdit ? (
                                                <div className={`${classes.inputText2} mw-100`}>
                                                    {user.name}
                                                </div>
                                            ) : (
                                                <FormGroup>
                                                    <AvField
                                                        type="text"
                                                        name="userName"
                                                        placeholder={t("EnterUserName")}
                                                        className={classes.inputClass}
                                                        value={user.name}
                                                        onChange={
                                                            (e) => setUser(
                                                                { ...user, name: e.target.value }
                                                            )
                                                        }
                                                        validate={{
                                                            required: { value: true, errorMessage: t("EnterValidUserName") },
                                                            minLength: { value: 2, errorMessage: t("UserNameValidation") },
                                                            maxLength: { value: 100, errorMessage: t("UserNameValidation") }
                                                        }}
                                                        required
                                                    />
                                                </FormGroup>
                                            )}
                                        </Col>
                                        <Col md={2}>
                                            <label
                                                htmlFor="email"
                                                className={classes.inputText1}
                                            >
                                                {t("Info Email")}
                                                <span> *</span>
                                            </label>
                                        </Col>
                                        <Col md={4}>
                                            {!isEdit ? (
                                                <span className={classes.inputText2}>
                                                    {user.email}
                                                </span>
                                            ) : (
                                                <FormGroup>
                                                    <AvField
                                                        type="email"
                                                        name="email"
                                                        placeholder={t("EnterEmail")}
                                                        className={classes.inputClass}
                                                        value={user.email}
                                                        onChange={
                                                            (e) => setUser(
                                                                { ...user, email: e.target.value }
                                                            )
                                                        }
                                                        validate={{
                                                            email: { value: true, errorMessage: t("EnterValidEmail") },
                                                            required: { value: true, errorMessage: t("EnterValidEmail") },
                                                            minLength: { value: 2, errorMessage: t("EmailLengthValidation") },
                                                            maxLength: { value: 250, errorMessage: t("EmailLengthValidation") }
                                                        }}
                                                        required
                                                        disabled
                                                    />
                                                </FormGroup>
                                            )}
                                        </Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md={2}>
                                            <label
                                                htmlFor="workNumber"
                                                className={classes.inputText1}
                                            >
                                                {t("Work Phone")}
                                                <span> *</span>
                                            </label>
                                        </Col>
                                        <Col md={4}>
                                            {!isEdit ? (
                                                <span className={classes.inputText2}>
                                                    {`(+${user.countryCode}) ${user.workNumber}`}
                                                </span>
                                            ) : (
                                                <FormGroup>
                                                    <Row>
                                                        <Col lg={4} className="pr-0">
                                                            <AvField
                                                                type="select"
                                                                name="dialCode"
                                                                validate={{
                                                                    required: { value: true, errorMessage: t("DialCodeRequired") }
                                                                }}
                                                                onChange={
                                                                    (e) => setUser({
                                                                        ...user,
                                                                        countryCode: e.target.value
                                                                    })
                                                                }
                                                                value={user.countryCode}
                                                            >
                                                                {DialCodes.dialCodes
                                                                    .map((code) => (
                                                                        <option
                                                                            key={uuidv4()}
                                                                            value={code.value}
                                                                            data-subtext={
                                                                                code.label
                                                                            }
                                                                        >
                                                                            {(user.countryCode && user.countryCode === code.value) ? `+${code.value}` : `${code.label} (+${code.value})`}
                                                                        </option>
                                                                    ))}
                                                            </AvField>
                                                        </Col>
                                                        <Col lg={8} className="pl-1">
                                                            <AvField
                                                                type="text"
                                                                name="workNumber"
                                                                placeholder={t("EnterWorkNumber")}
                                                                className={classes.inputClass}
                                                                value={user.workNumber}
                                                                onChange={
                                                                    (e) => setUser({
                                                                        ...user,
                                                                        workNumber: e.target.value
                                                                    })
                                                                }
                                                                validate={{
                                                                    required: { value: true, errorMessage: t("EnterValidWorkNumber") },
                                                                    minLength: { value: 5, errorMessage: t("WorkNumberLengthValidation") },
                                                                    maxLength: { value: 20, errorMessage: t("WorkNumberHasExceededMaxLength") },
                                                                    pattern: { value: "^[^!@#$%^&*()][0-9-() ]+$", errorMessage: t("EnterValidWorkNumber") }
                                                                }}
                                                                required
                                                            />
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                            )}
                                        </Col>
                                        <Col md={2}>
                                            <label
                                                htmlFor="designation"
                                                className={classes.inputText1}
                                            >
                                                {" "}
                                                {t("Designation")}
                                                {" "}
                                            </label>
                                        </Col>
                                        <Col md={4}>
                                            {!isEdit ? (
                                                <span className={classes.inputText2}>
                                                    {" "}
                                                    {user.designation}
                                                    {" "}
                                                </span>
                                            ) : (
                                                <FormGroup>
                                                    <AvField
                                                        type="text"
                                                        name="designation"
                                                        placeholder={t("Enter Designation")}
                                                        className={classes.inputClass}
                                                        value={user.designation}
                                                        onChange={
                                                            (e) => setUser({
                                                                ...user,
                                                                designation: e.target.value
                                                            })
                                                        }
                                                        validate={{
                                                            pattern: {
                                                                value: "^[^!@#$%^&*()]+$",
                                                                errorMessage:
                                                                    t("PleaseEnterValidDesignation")
                                                            }
                                                        }}
                                                    />
                                                </FormGroup>
                                            )}
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="mb-5">
                        <Col lg={12}>
                            <Card>
                                <CardHeader tag="h6">
                                    {t("AssignedRoles")}
                                </CardHeader>
                                <CardBody>
                                    {userHasRBACRole && (
                                        <div className="d-flex justify-content-end mb-2">
                                            <Link
                                                to={MANAGE_ROLES_ROUTES.ROLES_LIST}
                                                style={{
                                                    color: "#4472C4",
                                                    border: "unset",
                                                    cursor: "pointer",
                                                    background: "unset",
                                                    textDecoration: "underline",
                                                    padding: 0,
                                                    textAlign: "left"
                                                }}
                                            >
                                                Customize role
                                            </Link>
                                        </div>
                                    )}
                                    <div
                                        className="ag-theme-custom-react"
                                        style={{ height: `${roles.length === 0 ? 145 : 330}px` }}
                                    >
                                        <AgGridReact
                                            rowData={roles}
                                            columnDefs={RolesListColDefs}
                                            defaultColDef={defaultColDef}
                                            masterDetail
                                            rowSelection="multiple"
                                            frameworkComponents={{
                                                checkboxRenderer: CheckboxRenderer
                                            }}
                                            suppressRowClickSelection
                                            onGridReady={(params) => {
                                                setGridDesignationAPI(params.api);
                                                params.api.sizeColumnsToFit();
                                            }}
                                            isRowMaster={(dataItem) => (dataItem
                                                ? dataItem?.permissions?.length > 0 : false)}
                                            gridOptions={{
                                                getRowNodeId: (data) => data.uuid,
                                                suppressScrollOnNewData: true,
                                                detailCellRendererParams: {
                                                    detailGridOptions: {
                                                        columnDefs: PermissionColDefs,
                                                        defaultColDef,
                                                        suppressScrollOnNewData: true,
                                                        immutableData: true,
                                                        frameworkComponents: {
                                                            readRender: ReadRender,
                                                            writeRender: WriteRender,
                                                            approveRender: ApproveRender
                                                        },
                                                        getRowNodeId: (data) => data.feature.uuid,
                                                        onFirstDataRendered: (params) => {
                                                            params.api.sizeColumnsToFit();
                                                        }
                                                    },
                                                    getDetailRowData: (params) => {
                                                        params.successCallback(
                                                            params.data.permissions
                                                        );
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="mb-5">
                        {pathRoute === "organization"
                            && (
                                <>
                                    <Col lg={6}>
                                        <Card>
                                            <CardHeader tag="h6" className={classes.cardHeaderHeight}>
                                                <Row>
                                                    <Col xs={6}>
                                                        {t("Companies List")}
                                                    </Col>
                                                    <Col xs={4} className="text-right">
                                                        {t("Company Admin")}
                                                    </Col>
                                                </Row>
                                            </CardHeader>
                                            <CardBody>
                                                <div name="companyList">
                                                    {user.companies
                                                        && user.companies.map((companiesRole) => (
                                                            <Row key={companiesRole.companyUuid}>
                                                                <Col md={6}>
                                                                    <label className="my-1 py-1" htmlFor={companiesRole.companyUuid}>
                                                                        {" "}
                                                                        {companiesRole.companyName}
                                                                        {" "}
                                                                    </label>
                                                                </Col>
                                                                <Col md={4}>
                                                                    <div className={`float-right my-1 py-1 ${classes.marginRight}`}>
                                                                        <CustomInput type="checkbox" defaultChecked={checkCompanyAdmin(companiesRole)} id={companiesRole.companyUuid} name="companyAdmin" value={companiesRole.companyUuid} onChange={handleCompanyAdminCheckbox} disabled={!isEdit} />
                                                                    </div>
                                                                </Col>
                                                                {isEdit
                                                                    && (
                                                                        <Col md={2}>
                                                                            <button
                                                                                type="button"
                                                                                className={`btn btn-link float-right my-1 py-1 ${classes.buttonHeight}`}
                                                                                onClick={
                                                                                    () => removeCompany(
                                                                                        companiesRole
                                                                                    )
                                                                                }
                                                                            >
                                                                                <i className="fa fa-trash text-danger" />
                                                                            </button>
                                                                        </Col>
                                                                    )}
                                                            </Row>
                                                        ))}
                                                </div>
                                            </CardBody>
                                        </Card>
                                        {isEdit
                                            && (
                                                <div className="my-2">
                                                    <Button id="modalDefault101" color="primary" className={`float-right ${classes.addButton}`} onClick={doNothing}>
                                                        +
                                                        {t("Add")}
                                                    </Button>
                                                    <UncontrolledModal target="modalDefault101">
                                                        <ModalHeader tag="h6">
                                                            {t("Companies List")}
                                                        </ModalHeader>
                                                        <ModalBody>
                                                            <div className="ag-theme-custom-react" style={{ height: "400px" }}>
                                                                <AgGridReact
                                                                    columnDefs={columnDefs}
                                                                    defaultColDef={defaultColDef}
                                                                    rowData={gridCompanies}
                                                                    pagination
                                                                    paginationPageSize={10}
                                                                    rowSelection="multiple"
                                                                    rowMultiSelectWithClick
                                                                    onGridReady={onGridReady}
                                                                />
                                                            </div>
                                                        </ModalBody>
                                                        <ModalFooter>
                                                            <UncontrolledModal.Close color="link">
                                                                {t("Close")}
                                                            </UncontrolledModal.Close>
                                                            <span onClick={handleAddCompanies}>
                                                                <UncontrolledModal.Close color="primary">
                                                                    {t("Add")}
                                                                </UncontrolledModal.Close>
                                                            </span>
                                                        </ModalFooter>
                                                    </UncontrolledModal>
                                                </div>
                                            )}
                                    </Col>
                                    <Col lg={6}>
                                        <Card>
                                            <CardHeader tag="h6" className={classes.cardHeaderHeight}>
                                                {t("Security and Login")}
                                            </CardHeader>
                                            <CardBody>
                                                <Row>
                                                    <Col md={10}>
                                                        <div className="mb-2">
                                                            <p className={classes.inputText1} name="resetPassword">{t("Reset user's password")}</p>
                                                        </div>
                                                    </Col>
                                                    <Col md={2}>
                                                        {(!isDeactivated && canEdit)
                                                            && (
                                                                <Link to={`/users/password/reset/${user.uuid}`}>
                                                                    <button disabled={!isEdit} type="button" className={`btn btn-primary float-right my-2 py-1 ${classes.buttonHeight}`}>{t("Reset")}</button>
                                                                </Link>
                                                            )}
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md={10}>
                                                        <div className="my-2">
                                                            <p className={classes.inputText1} name="twoFactor">{t("Reset user's two FA Authentication")}</p>
                                                        </div>
                                                    </Col>
                                                    <Col md={2}>
                                                        {(!isDeactivated && canEdit)
                                                            && <button disabled={!isEdit} type="button" id="modal" className={`btn btn-primary float-right my-2 py-1 ${classes.buttonHeight}`}>{t("Reset")}</button>}
                                                        <UncontrolledModal target="modal" className="modal-outline-success">
                                                            <ModalHeader tag="h6">
                                                                <span className="text-primary">
                                                                    {t("Reset Two FA")}
                                                                </span>
                                                            </ModalHeader>
                                                            <ModalBody>
                                                                {t("Are you sure you want to reset user's two FA")}
                                                                ?
                                                            </ModalBody>
                                                            <ModalFooter>
                                                                <UncontrolledModal.Close color="link">
                                                                    <span>Close</span>
                                                                </UncontrolledModal.Close>
                                                                <span onClick={handleTwoFAReset}>
                                                                    <UncontrolledModal.Close color="primary">
                                                                        {t("Reset")}
                                                                    </UncontrolledModal.Close>
                                                                </span>
                                                            </ModalFooter>
                                                        </UncontrolledModal>
                                                        {/* </Link> */}
                                                    </Col>
                                                </Row>
                                            </CardBody>
                                        </Card>
                                    </Col>

                                </>
                            )}
                    </Row>
                    {
                        pathRoute === "company"
                        && (
                            <Row className="mb-5">
                                <Col>
                                    <Nav tabs className={classes.navTabs}>
                                        {tabList.map((tab) => (
                                            <NavItem key={tab.id}>
                                                <NavLink href="#" className={activeTab === tab.id ? "active" : null} onClick={() => handleTabClick(tab.id)}>
                                                    <i className={`${tab.icon || "fa fa-fw fa-file-text"} mr-2`} />
                                                    <span className={classes.navTabs}>
                                                        {tab.name}
                                                    </span>
                                                </NavLink>
                                            </NavItem>
                                        ))}
                                    </Nav>
                                    {
                                        activeTab === 1
                                        && (
                                            <Card className={classes.navCard}>
                                                <CardBody className={classes.cardBody}>
                                                    <Row>
                                                        <Col lg={12}>
                                                            <TaskManagement
                                                                t={t}
                                                                listModules={listModules}
                                                                setGridApi={setTaskManagementGridApi}
                                                                gridApi={taskManagementGridApi}
                                                                disabled={!isEdit}
                                                            />
                                                        </Col>
                                                    </Row>
                                                    <br />
                                                </CardBody>
                                            </Card>
                                        )
                                    }
                                    {
                                        activeTab === 2
                                        && (
                                            <>
                                                <Card className={classes.navCard}>
                                                    <CardBody className={classes.cardBody}>
                                                        <Row>
                                                            <Col lg={4}>
                                                                <AdministratorCheckTable
                                                                    info={userManagement}
                                                                    handleAdministratorCheckbox={
                                                                        handleAdministratorCheckbox
                                                                    }
                                                                    isEdit={isEdit}
                                                                />
                                                            </Col>
                                                            <Col lg={4}>
                                                                <AdministratorCheckTable
                                                                    info={entitySetup}
                                                                    handleAdministratorCheckbox={
                                                                        handleAdministratorCheckbox
                                                                    }
                                                                    isEdit={isEdit}
                                                                />
                                                            </Col>
                                                            <Col lg={4}>
                                                                <AdministratorCheckTable
                                                                    info={bankConnection}
                                                                    handleAdministratorCheckbox={
                                                                        handleAdministratorCheckbox
                                                                    }
                                                                    isEdit={isEdit}
                                                                />
                                                            </Col>
                                                        </Row>
                                                        <br />
                                                    </CardBody>
                                                </Card>
                                            </>
                                        )
                                    }
                                    {
                                        activeTab === 4
                                        && (
                                            <Col lg={12} className="px-0">
                                                <Card>
                                                    <CardHeader tag="h6" className={classes.cardHeaderHeight}>
                                                        {t("Security and Login")}
                                                    </CardHeader>
                                                    <CardBody>
                                                        <Row>
                                                            <Col md={10}>
                                                                <div className="mb-2">
                                                                    <p className={classes.inputText1} name="resetPassword">{t("Reset user's password")}</p>
                                                                </div>
                                                            </Col>
                                                            <Col md={2}>
                                                                {(!isDeactivated && canEdit)
                                                                    && (
                                                                        <Link to={`/users/password/reset/${user.uuid}`}>
                                                                            <button disabled={!isEdit} type="button" className={`btn btn-primary float-right my-2 py-1 ${classes.buttonHeight}`}>{t("Reset")}</button>
                                                                        </Link>
                                                                    )}
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col md={10}>
                                                                <div className="my-2">
                                                                    <p className={classes.inputText1} name="twoFactor">{t("Reset user's two FA Authentication")}</p>
                                                                </div>
                                                            </Col>
                                                            <Col md={2}>
                                                                {(!isDeactivated && canEdit)
                                                                    && <button disabled={!isEdit} type="button" id="modal" className={`btn btn-primary float-right my-2 py-1 ${classes.buttonHeight}`}>{t("Reset")}</button>}
                                                                <UncontrolledModal target="modal" className="modal-outline-success">
                                                                    <ModalHeader tag="h6">
                                                                        <span className="text-primary">
                                                                            {t("Reset Two FA")}
                                                                        </span>
                                                                    </ModalHeader>
                                                                    <ModalBody>
                                                                        {t("Are you sure you want to reset user's two FA")}
                                                                        ?
                                                                    </ModalBody>
                                                                    <ModalFooter>
                                                                        <UncontrolledModal.Close color="link">
                                                                            <span>Close</span>
                                                                        </UncontrolledModal.Close>
                                                                        <span onClick={handleTwoFAReset}>
                                                                            <UncontrolledModal.Close color="primary">
                                                                                {t("Reset")}
                                                                            </UncontrolledModal.Close>
                                                                        </span>
                                                                    </ModalFooter>
                                                                </UncontrolledModal>
                                                                {/* </Link> */}
                                                            </Col>
                                                        </Row>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        )
                                    }
                                    {
                                        activeTab === 3
                                        && (
                                            <Card className={classes.navCard}>
                                                <CardBody className={classes.cardBody}>
                                                    <Row>
                                                        <Col lg>
                                                            {isEdit
                                                                && (
                                                                    <textarea
                                                                        className={
                                                                            `${classes.textArea1} form-control`
                                                                        }
                                                                        value={remarks}
                                                                        onChange={
                                                                            (e) => setRemarks(
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    />
                                                                )}
                                                            {!isEdit
                                                                && (
                                                                    <textarea
                                                                        disabled
                                                                        className={
                                                                            `${classes.textArea1} form-control`
                                                                        }
                                                                        value={remarks}
                                                                    />
                                                                )}
                                                        </Col>
                                                    </Row>
                                                    <br />
                                                </CardBody>
                                            </Card>
                                        )
                                    }
                                </Col>
                            </Row>
                        )
                    }
                </Container>
                <StickyFooter className={`${classes["custom-footer"]}`}>
                    {!isEdit
                        && (
                            <Row className="d-flex justify-content-between mx-0 px-2">
                                <Button color="secondary" className="mb-2 px-3" onClick={() => history.goBack()}>
                                    {t("Back")}
                                </Button>

                                <div>
                                    {(pathRoute === "organization" && canEdit && handleRolePermission?.write)
                                        && (
                                            <>
                                                {user?.active ? (
                                                    <>
                                                        <Button color="secondary" className="mb-2 mr-2 px-3" id="modalDefault302" onClick={doNothing}>
                                                            Deactivate Account
                                                        </Button>
                                                        <UncontrolledModal target="modalDefault302" className="modal-outline-danger">
                                                            <ModalHeader tag="h6">
                                                                <span className="text-danger">
                                                                    User Deactivation
                                                                </span>
                                                            </ModalHeader>
                                                            <ModalBody>
                                                                {t("Are you sure you want to deactivate the user?")}
                                                            </ModalBody>
                                                            <ModalFooter>
                                                                <UncontrolledModal.Close color="link">
                                                                    Close
                                                                </UncontrolledModal.Close>
                                                                <span onClick={handleUserDeactivation}>
                                                                    <UncontrolledModal.Close color="danger">
                                                                        {t("Deactivate")}
                                                                    </UncontrolledModal.Close>
                                                                </span>
                                                            </ModalFooter>
                                                        </UncontrolledModal>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button color="primary" className="mb-2 mr-2 px-3" id="activateUser" onClick={doNothing}>
                                                            Activate Account
                                                        </Button>
                                                        <UncontrolledModal target="activateUser" className="modal-outline-success">
                                                            <ModalHeader tag="h6">
                                                                <span className="text-primary">
                                                                    User Activation
                                                                </span>
                                                            </ModalHeader>
                                                            <ModalBody>
                                                                {t("Are you sure you want to activate the user?")}
                                                            </ModalBody>
                                                            <ModalFooter>
                                                                <UncontrolledModal.Close color="link">
                                                                    Close
                                                                </UncontrolledModal.Close>
                                                                <span onClick={handleUserActivation}>
                                                                    <UncontrolledModal.Close color="primary">
                                                                        {t("Activate")}
                                                                    </UncontrolledModal.Close>
                                                                </span>
                                                            </ModalFooter>
                                                        </UncontrolledModal>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    {(!isDeactivated && canEdit && handleRolePermission?.write)
                                        && (
                                            <Button color="facebook" className="mb-2 px-3 mr-2" onClick={() => handleEdit()}>
                                                {t("Edit")}
                                                <i className="ml-1 fa fa-pencil" />
                                            </Button>
                                        )}
                                </div>
                            </Row>
                        )}
                    {
                        (isEdit === true && handleRolePermission?.write)
                        && (
                            <div className={`${classes["custom-footer-flex"]}`}>
                                <Button
                                    color="secondary"
                                    className="mb-2 mr-2 px-3"
                                    onClick={() => history.goBack()}
                                >
                                    {t("Back")}
                                </Button>
                                <ButtonSpinner text={t("Save")} className="mb-2 mr-2 px-3" isLoading={isLoading} />
                            </div>
                        )
                    }
                </StickyFooter>
            </AvForm>
        </>
    );
};

export default UserDetails;
