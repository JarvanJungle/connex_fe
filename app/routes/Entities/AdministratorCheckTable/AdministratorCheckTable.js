import React from "react";
import PropTypes from "prop-types";
import { Card, CardBody, CardHeader } from "components";
import { v4 as uuidv4 } from "uuid";
import classes from "./AdministratorCheckTable.module.scss";

const AdministratorCheckTable = (props) => {
    const { info, handleAdministratorCheckbox, isEdit } = props;

    return (
        <Card className="mb-3">
            <CardHeader tag="h6" className="text-center">
                {info.name}
            </CardHeader>
            <CardBody>
                <table className={classes.fixed}>
                    <tbody>
                        {
                            info.info.map((item, index) => (
                                <tr key={uuidv4()}>
                                    <td className={`text-center ${classes.trsize}`}>
                                        <input
                                            type="checkbox"
                                            id={item.key}
                                            checked={item.value}
                                            onChange={
                                                () => handleAdministratorCheckbox(info.name, index)
                                            }
                                            disabled={!isEdit}
                                        />
                                    </td>
                                    <td className="text-left">
                                        <label htmlFor={item.key}>
                                            {" "}
                                            {item.text}
                                            {" "}
                                        </label>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </CardBody>
        </Card>
    );
};

AdministratorCheckTable.propTypes = {
    info: PropTypes.PropTypes.instanceOf(Object),
    handleAdministratorCheckbox: PropTypes.func,
    isEdit: PropTypes.bool
};

AdministratorCheckTable.defaultProps = {
    isEdit: false,
    handleAdministratorCheckbox: () => { },
    info: {}
};

export default AdministratorCheckTable;
