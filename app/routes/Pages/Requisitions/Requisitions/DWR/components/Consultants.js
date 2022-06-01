import { MultiSelect } from "components";
import React from "react";
import { useTranslation } from "react-i18next";

const UserValueRenderer = (props) => {
    const { 
        userList,
        setFieldValue,
        values,
        isEdit
    } = props;
    return (
        <MultiSelect
            disabled={!isEdit}
            name="quantitySurveyors"
            className="form-control"
            options={userList.map((user) => ({
                name: user.name,
                value: user.uuid
            }))}
            objectName="Surveyor"
            setFieldValue={setFieldValue}
            defaultValue={values.quantitySurveyors}
        />
    );
};

const Consultants = (props) => {
    const { t } = useTranslation();

    const columnDefs = [
        headerName
    ];

    return (
        <>

        </>
    );
};

export default Consultants;