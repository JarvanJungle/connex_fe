import React from "react";
import {
    Button,
    ButtonToolbar
} from "components";
import CSVTemplates from "helper/commonConfig/CSVTemplates";
import { CSVLink } from "react-csv";
import UploadButton from "routes/components/UploadButton";

const VendorGridButtonToolbar = (props) => {
    const {
        t,
        buttonRef,
        handleOnDrop,
        isLoading,
        handleOnError,
        handleOpenDialog,
        onAddPressHandler,
        onDownloadPressHandler,
        hasWritePermission,
    } = props;
    return (
        <ButtonToolbar className="ml-auto justify-content-end">
            <div>
                <Button color="secondary" className="mb-2 mr-2 px-3" onClick={onDownloadPressHandler}>
                    <i className="fa fa-download" />
                    {` ${t("Download")}`}
                </Button>
            </div>
            {hasWritePermission && (
                <>
                    <UploadButton
                        buttonRef={buttonRef}
                        handleOnDrop={handleOnDrop}
                        isLoading={isLoading}
                        handleOnError={handleOnError}
                        translation={t}
                        handleOpenDialog={handleOpenDialog}
                    />
                    <div>
                        <Button color="primary" className="mb-2 mr-2 px-3">
                            <CSVLink
                                data={CSVTemplates.ManageExtVendor_List_Data}
                                headers={CSVTemplates.ManageExtVendor_List_Header}
                                filename={CSVTemplates.ManageExtVendor_TemplateFileName}
                                style={{
                                    color: "white"
                                }}
                            >
                                <i className="fa fa-download" />
                                {` ${t("Template")}`}
                            </CSVLink>
                        </Button>
                    </div>
                    <div>
                        <Button color="primary" className="mb-2 px-3" onClick={onAddPressHandler}>
                            <i className="fa fa-plus mr-1" />
                            <span>{t("CreateNew")}</span>
                        </Button>
                    </div>
                </>
            )}
        </ButtonToolbar>
    );
};

export default VendorGridButtonToolbar;
