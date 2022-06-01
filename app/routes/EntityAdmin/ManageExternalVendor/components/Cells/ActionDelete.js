import React from "react";
import IconButton from "@material-ui/core/IconButton";
import { useDispatch, useSelector } from "react-redux";
import { updateState } from "actions/externalVendorActions";

const ActionDelete = (props) => {
    const { data } = props;
    const dispatch = useDispatch();
    const externalVendorSelector = useSelector((state) => state.externalVendorReducer);
    const { listOfContactPerson, isEdit, isCreate } = externalVendorSelector;
    return (
        <IconButton
            size="small"
            onClick={() => {
                const newListOfContactPerson = listOfContactPerson.filter(
                    (user) => user.uuid !== data.uuid
                );
                dispatch(updateState("listOfContactPerson", newListOfContactPerson));
            }}
            style={{ color: "red" }}
            disabled={!isCreate && !isEdit}
        >
            <i className="fa fa-trash" />
        </IconButton>
    );
};

export default ActionDelete;
