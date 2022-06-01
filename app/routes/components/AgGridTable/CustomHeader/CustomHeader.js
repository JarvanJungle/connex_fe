import React, { useEffect, useRef, useState } from "react";

const SORT_ORDER = {
    0: null,
    1: "asc",
    2: "desc"
};

export default (props) => {
    const {
        enableSorting,
        enableMenu,
        displayName,
        enableCustomButton,
        customButtonIcon,
        customButtonOnClick
    } = props;
    const [sortOrder, setSortOrder] = useState(0);
    const refMenuButton = useRef(null);

    const onSortChanged = () => {
        if (props.column.isSortAscending()) {
            setSortOrder(1);
        } else if (props.column.isSortDescending()) {
            setSortOrder(2);
        } else {
            setSortOrder(0);
        }
    };

    const onSortRequested = (event) => {
        props.setSort(SORT_ORDER[sortOrder + 1], event?.shiftKey);
    };

    useEffect(() => {
        props.column.addEventListener("sortChanged", onSortChanged);
    }, []);

    return (
        <div className="ag-cell-label-container">
            {enableMenu && (
                <span className="ag-header-icon ag-header-cell-menu-button" aria-hidden="true">
                    <span
                        className="d-inline ag-icon ag-icon-menu"
                        unselectable="on"
                        role="presentation"
                        ref={refMenuButton}
                        onClick={() => props.showColumnMenu(refMenuButton.current)}
                    />
                </span>
            )}
            <div>
                <div className="d-inline" onClick={enableSorting && onSortRequested}>
                    {displayName}
                    {sortOrder === 1 && (
                        <i className="d-inline ag-icon ag-icon-asc" />
                    )}
                    {sortOrder === 2 && (
                        <i className="d-inline ag-icon ag-icon-desc" />
                    )}
                </div>
                {enableCustomButton && (
                    <div className="d-inline ml-1">
                        <i
                            className={`pi pi-${customButtonIcon}`}
                            onClick={customButtonOnClick}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
