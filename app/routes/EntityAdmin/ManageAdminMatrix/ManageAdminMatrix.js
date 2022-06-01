import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import EntitiesService from "services/EntitiesService";
import { Container, Row, Col } from "components";
import UserService from "services/UserService";
import { HeaderMain } from "routes/components/HeaderMain";
import useToast from "routes/hooks/useToast";
import classes from "./ManageAdminMatrix.module.scss";

const ManageAdminMatrix = () => {
    const { t } = useTranslation();
    const showToast = useToast();

    const [dataFeature, setDataFeature] = useState([]);
    const [dataAccess, setDataAccess] = useState([]);

    const filterCategory = (data, category) => data.administrativesDtoList
        .filter((value) => value.adminCategories.categoryCode === category)
        .map((value) => value.administrativeCode);

    const listAllTheUserPermissionWithinACompany = async () => {
        try {
            const companyRole = JSON.parse(localStorage.getItem("companyRole"));
            const response1 = await EntitiesService.listAllTheUserPermissionWithinACompany(companyRole.companyUuid);
            const response2 = await UserService.getCompanyUsers(companyRole.companyUuid);
            setDataFeature(["User Management", "Entity Setup", "Bank Connection"]);
            let access = response1.data.data.map((value) => {
                const userManagement = filterCategory(value, "USER_MANAGEMENT");
                const entitySetup = filterCategory(value, "ENTITY_SETUP");
                const bankConnection = filterCategory(value, "BANK_CONNECTION");
                return {
                    ...value,
                    administrativesDtoList: [
                        {
                            categoryCode: "USER_MANAGEMENT",
                            administrativeCode: {
                                manageUsers: userManagement.includes("MANAGE_USERS"),
                                manageAdminMatrix: userManagement.includes("MANAGE_ADMIN_MATRIX"),
                                manageUserMatrix: userManagement.includes("MANAGE_USER_MATRIX"),
                                manageApproverMatrix: userManagement.includes("MANAGE_APPROVER_MATRIX")
                            }
                        },
                        {
                            categoryCode: "ENTITY_SETUP",
                            administrativeCode: {
                                manageCurrency: entitySetup.includes("MANAGE_CURRENCY"),
                                manageSupplierBankAccount: entitySetup.includes("MANAGE_SUPPLIER_BANK_ACCOUNT"),
                                manageSuppliers: entitySetup.includes("MANAGE_SUPPLIERS")
                            }
                        },
                        {
                            categoryCode: "BANK_CONNECTION",
                            administrativeCode: {
                                manageBankConnection: bankConnection.includes("MANAGE_BANK_CONNECTION"),
                                manageBankAccount: bankConnection.includes("MANAGE_BANK_ACCOUNT")
                            }
                        }
                    ]
                };
            });
            access = access.map((valueEx) => {
                const user = response2.data.data.find((valueIn) => valueIn.uuid === valueEx.userUuid);
                return {
                    ...valueEx,
                    userName: user ? user.name : ""
                };
            });
            setDataAccess(access);
        } catch (error) {
            showToast("error", error.response.data.message);
        }
    };

    useEffect(() => {
        listAllTheUserPermissionWithinACompany();
    }, []);

    return (
        <>
            <Container>
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("AdminMatrix")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row className="mb-1">
                    <Col lg={12}>
                        <table className={`${classes.fixed} ${classes.addborder}`}>
                            <tbody>
                                <tr className={`text-center ${classes.addborder}`}>
                                    <th className={`${classes.addborder} ${classes.sep} ${classes.line}`} rowSpan={2}>
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td className={classes.right}>{t("Features")}</td>
                                                </tr>
                                                <tr>
                                                    <td className={classes.left}>{t("Users")}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </th>
                                    <th className={`${classes.addborder} ${classes.sep}`} colSpan={dataFeature.length}>
                                        {t("EntityAdminSetting")}
                                    </th>
                                </tr>
                                <tr className={`text-center ${classes.addborder}`}>
                                    {
                                        dataFeature && dataFeature.map((value, index) => (
                                            <th className={`${classes.addborder} ${classes.capitalize}`} key={index}>
                                                {value}
                                            </th>
                                        ))
                                    }
                                </tr>
                                {
                                    dataAccess && dataAccess.map((valueEx, indexEx) => (
                                        <tr key={indexEx}>
                                            <td className={`${classes.addborder} ${classes.padding}`}>{valueEx.userName}</td>
                                            {
                                                valueEx.administrativesDtoList.map((valueIn, indexIn) => (
                                                    <td className={`${classes.addborder} ${classes.top}`} key={indexIn}>
                                                        <table>
                                                            <tbody>
                                                                {
                                                                    Object.entries(valueIn.administrativeCode).map((value, index) => (
                                                                        <tr key={index}>
                                                                            <td className={`text-left ${classes.padding}`}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    id={value[0] + index}
                                                                                    checked={value[1]}
                                                                                    disabled
                                                                                />
                                                                                <label
                                                                                    className={classes.capitalize}
                                                                                    htmlFor={value[0] + index}
                                                                                >
                                                                                    {value[0].replace(/([A-Z])/g, " $1")}
                                                                                </label>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                }
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                ))
                                            }
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default ManageAdminMatrix;
