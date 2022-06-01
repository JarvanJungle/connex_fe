import React, { useEffect, useState } from "react";
import {
    Table,
    CardBody,
    Card,
    CardHeader
} from "components";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Field, ErrorMessage } from "formik";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import InputRemarks from "./InputRemarks";

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
    const theme = useTheme();
    const classes = useStyles();
    const {
        t, values, errors, touched, users, isDetail, isEdit, setFieldValue
    } = props;

    const getNameUser = (uuid) => users.find((user) => user.userUuid === uuid)?.userName;
    const getNamesProjectMember = () => {
        const namesProjectMember = values.projectTeamMember.map((user) => user.userName);
        return namesProjectMember.join(", ");
    };
    const [personName, setPersonName] = useState([]);

    const handleChange = (event) => {
        setPersonName(event.target.value);
        const listUser = [];
        users.forEach((item) => {
            event.target.value.forEach((value) => {
                if (item.userName === value) {
                    listUser.push(item);
                }
            });
        });
        setFieldValue("projectTeamMember", listUser);
    };
    const getStyles = (name, person, themes) => ({
        fontWeight:
            person.indexOf(name) === -1
                ? themes.typography.fontWeightRegular
                : themes.typography.fontWeightMedium
    });
    useEffect(() => {
        setPersonName(values.projectTeamMember.map((item) => item.userName));
    }, [values.projectTeamMember]);
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
                                <Field name="projectInCharge">
                                    {({ field }) => (
                                        <select
                                            // eslint-disable-next-line max-len
                                            // eslint-disable-next-line react/jsx-props-no-spreading
                                            {...field}
                                            className={
                                                classNames("form-control", {
                                                    "is-invalid":
                                                        errors.projectInCharge
                                                        && touched.projectInCharge
                                                })
                                            }
                                            disabled={isDetail && !isEdit}
                                        >
                                            <option value="" hidden defaultValue>{t("SelectUser")}</option>
                                            {users
                                                .sort((a, b) => a?.userName?.localeCompare(b?.userName))
                                                .map((user) => (
                                                    <option key={uuidv4()} value={user.userUuid}>
                                                        {user.userName}
                                                    </option>
                                                ))}
                                        </select>
                                    )}
                                </Field>
                                <ErrorMessage name="projectInCharge" component="div" className="invalid-feedback" />
                            </td>
                            <td className="align-middle" style={{ color: "#5D636D" }}>
                                {getNameUser(values.projectInCharge)}
                            </td>
                            <td className="align-middle">
                                <InputRemarks
                                    name="projectInChargeRemarks"
                                    component="textarea"
                                    placeholder={t("EnterRemarks")}
                                    errors={errors.projectInChargeRemarks}
                                    touched={touched.projectInChargeRemarks}
                                    disabled={isDetail && !isEdit}
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
                                <Field name="projectAdmin">
                                    {({ field }) => (
                                        <select
                                            // eslint-disable-next-line max-len
                                            // eslint-disable-next-line react/jsx-props-no-spreading
                                            {...field}
                                            className={
                                                classNames("form-control", {
                                                    "is-invalid":
                                                        errors.projectAdmin
                                                        && touched.projectAdmin
                                                })
                                            }
                                            disabled={isDetail && !isEdit}
                                        >
                                            <option value="" hidden defaultValue>{t("SelectUser")}</option>
                                            {users
                                                .sort((a, b) => a?.userName?.localeCompare(b?.userName))
                                                .map((user) => (
                                                    <option key={uuidv4()} value={user.userUuid}>
                                                        {user.userName}
                                                    </option>
                                                ))}
                                        </select>
                                    )}
                                </Field>
                                <ErrorMessage name="projectAdmin" component="div" className="invalid-feedback" />
                            </td>
                            <td className="align-middle" style={{ color: "#5D636D" }}>
                                {getNameUser(values.projectAdmin)}
                            </td>
                            <td className="align-middle">
                                <InputRemarks
                                    name="projectAdminRemarks"
                                    component="textarea"
                                    placeholder={t("EnterRemarks")}
                                    errors={errors.projectAdminRemarks}
                                    touched={touched.projectAdminRemarks}
                                    disabled={isDetail && !isEdit}
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
                                    labelId="demo-mutiple-name-label"
                                    className={`${classes.form} form-control`}
                                    id="demo-mutiple-name"
                                    multiple
                                    input={<Input />}
                                    value={personName}
                                    onChange={handleChange}
                                    MenuProps={MenuProps}
                                    renderValue={(selected) => {
                                        if (!selected || selected.length === 0) {
                                            return <div>Select Users</div>;
                                        }
                                        if (selected.length > 1) {
                                            return `${selected.length} vendors selected`;
                                        }
                                        return selected.join(", ");
                                    }}
                                    disabled={isDetail && !isEdit}
                                >
                                    {users
                                        .sort((a, b) => a?.userName?.localeCompare(b?.userName))
                                        .map((user) => (
                                            <MenuItem
                                                key={user.userUuid}
                                                value={user.userName}
                                                style={getStyles(user, personName, theme)}
                                            >
                                                {user.userName}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </td>
                            <td className="align-middle" style={{ color: "#5D636D" }}>
                                {getNamesProjectMember()}
                            </td>
                            <td className="align-middle">
                                <InputRemarks
                                    name="projectTeamMemberRemarks"
                                    component="textarea"
                                    placeholder={t("EnterRemarks")}
                                    errors={errors.projectTeamMemberRemarks}
                                    touched={touched.projectTeamMemberRemarks}
                                    disabled={isDetail && !isEdit}
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
