import React, { useState } from "react";
import {
    Table,
    CardBody,
    Card,
    CardHeader
} from "components";
import { v4 as uuidv4 } from "uuid";
import { PROJECT_FORECAST_ROLES } from "helper/constantsDefined";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
    form: {
        maxWidth: 300,
        minWidth: "100%"
    }
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250
        }
    }
};

const ProjectDetailsMemberTable = (props) => {
    const classes = useStyles();
    const { t, projectUserDtoList, users } = props;

    const getUserByRole = (role) => {
        switch (role) {
        case PROJECT_FORECAST_ROLES.PROJECT_ADMIN:
            return projectUserDtoList
                .find((user) => user.projectUserRole === PROJECT_FORECAST_ROLES.PROJECT_ADMIN);
        case PROJECT_FORECAST_ROLES.PROJECT_IN_CHARGE:
            return projectUserDtoList
                .find((user) => user.projectUserRole === PROJECT_FORECAST_ROLES.PROJECT_IN_CHARGE);
        case PROJECT_FORECAST_ROLES.PROJECT_TEAM_MEMBER:
            return projectUserDtoList
                .filter(
                    (user) => user.projectUserRole === PROJECT_FORECAST_ROLES.PROJECT_TEAM_MEMBER
                );
        default:
            return {};
        }
    };

    const [tableStates] = useState(() => {
        const projectInCharge = getUserByRole(PROJECT_FORECAST_ROLES.PROJECT_IN_CHARGE);
        const projectAdmin = getUserByRole(PROJECT_FORECAST_ROLES.PROJECT_ADMIN);
        const projectMembers = getUserByRole(PROJECT_FORECAST_ROLES.PROJECT_TEAM_MEMBER);

        return {
            projectInCharge,
            projectAdmin,
            projectMembers
        };
    });

    const getNamesProjectMember = () => {
        const namesProjectMember = tableStates.projectMembers.map(
            (user) => user.userName
        );
        return namesProjectMember.join(", ");
    };

    return (
        <Card>
            <CardHeader tag="h6">
                {t("ProjectMembers")}
            </CardHeader>
            <CardBody>
                <Table className="mb-0" bordered responsive>
                    <thead>
                        <tr>
                            <td style={{ width: "25%" }} className="align-middle">{t("ProjectForecastRole")}</td>
                            <td style={{ width: "25%" }} className="align-middle">{t("ProjectForecastSelectUser")}</td>
                            <td style={{ width: "25%" }} className="align-middle">{t("ProjectForecastSelectedUsers")}</td>
                            <td style={{ width: "25%" }} className="align-middle">{t("ProjectForecastRemarks")}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="align-middle label-required">
                                <span className="text-inverse">
                                    {t("ProjectForecastOverallInCharge")}
                                </span>
                            </td>
                            <td className="align-middle">
                                <select
                                    className="form-control"
                                    disabled
                                    value={tableStates.projectInCharge.userUuid}
                                >
                                    <option value="" hidden defaultValue>{t("SelectUser")}</option>
                                    {users
                                        .map((user) => (
                                            <option key={uuidv4()} value={user.userUuid}>
                                                {user.userName}
                                            </option>
                                        ))}
                                </select>
                            </td>
                            <td className="align-middle" style={{ color: "#5D636D" }}>
                                {tableStates.projectInCharge.userName}
                            </td>
                            <td className="align-middle">
                                <input
                                    className="form-control"
                                    name="projectInChargeRemarks"
                                    type="text"
                                    value={tableStates.projectInCharge.remarks}
                                    placeholder={t("EnterRemarks")}
                                    disabled
                                />
                            </td>
                        </tr>

                        <tr>
                            <td className="align-middle label-required">
                                <span className="text-inverse">
                                    {t("ProjectForecastProjectAdmin")}
                                </span>
                            </td>
                            <td className="align-middle">
                                <select
                                    className="form-control"
                                    disabled
                                    value={tableStates.projectAdmin.userUuid}
                                >
                                    <option value="" hidden defaultValue>{t("SelectUser")}</option>
                                    {users
                                        .map((user) => (
                                            <option key={uuidv4()} value={user.userUuid}>
                                                {user.userName}
                                            </option>
                                        ))}
                                </select>

                            </td>
                            <td className="align-middle" style={{ color: "#5D636D" }}>
                                {tableStates.projectAdmin.userName}
                            </td>
                            <td className="align-middle">
                                <input
                                    className="form-control"
                                    name="projectAdminRemarks"
                                    type="text"
                                    value={tableStates.projectAdmin.remarks}
                                    placeholder={t("EnterRemarks")}
                                    disabled
                                />
                            </td>
                        </tr>

                        <tr>
                            <td className="align-middle">
                                <span className="text-inverse">
                                    {t("ProjectForecastTeamMembers")}
                                </span>
                            </td>
                            <td className="align-middle">
                                <Select
                                    className={`${classes.form} form-control`}
                                    multiple
                                    value={tableStates.projectMembers}
                                    displayEmpty
                                    input={<Input />}
                                    MenuProps={MenuProps}
                                    renderValue={(selected) => {
                                        if (selected.length === 0) {
                                            return <span>Select Users</span>;
                                        }

                                        const list = selected.map((item) => item.userName);

                                        return list.join(", ");
                                    }}
                                    disabled
                                >
                                    {users.map((user) => (
                                        <MenuItem key={uuidv4()} value={user}>
                                            {user.userName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </td>
                            <td className="align-middle" style={{ color: "#5D636D" }}>
                                {getNamesProjectMember()}
                            </td>
                            <td className="align-middle">
                                <input
                                    className="form-control"
                                    name="projectAdminRemarks"
                                    type="text"
                                    value={tableStates.projectMembers[0]?.remarks}
                                    placeholder={t("EnterRemarks")}
                                    disabled
                                />
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </CardBody>
        </Card>
    );
};

export default ProjectDetailsMemberTable;
