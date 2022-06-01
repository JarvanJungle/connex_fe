import React from "react";
import {
    Button,
    ButtonToolbar
} from "components";
import CSVTemplates from "helper/commonConfig/CSVTemplates";
import { CSVLink } from "react-csv";
import UploadButton from "routes/components/UploadButton";

const SummaryButtonToolbar = (props) => {
    const {
        t,
        buttonRef,
        handleOnDrop,
        isLoading,
        handleOnError,
        handleOpenDialog,
        onDownloadPressHandler
    } = props;
    return (
        <ButtonToolbar className="ml-auto justify-content-end">
            <div>
                <Button color="secondary" className="mb-2 mr-2 px-3" onClick={onDownloadPressHandler}>
                    <i className="fa fa-download" />
                    {` ${t("Download")}`}
                </Button>
            </div>
            <UploadButton
                buttonRef={buttonRef}
                handleOnDrop={handleOnDrop}
                isLoading={isLoading}
                handleOnError={handleOnError}
                translation={t}
                handleOpenDialog={handleOpenDialog}
            />
            <div>
                <Button color="primary" className="mb-2 px-3">
                    <CSVLink
                        data={CSVTemplates.ManageProjectForecast_List_Data}
                        headers={CSVTemplates.ManageProjectForecast_Headers}
                        filename={CSVTemplates.ManageProjectForecast_TemplatesFilename}
                        style={{
                            color: "white"
                        }}
                    >
                        <i className="fa fa-download" />
                        {` ${t("Template")}`}
                    </CSVLink>
                </Button>
            </div>
        </ButtonToolbar>
    );
};

export default SummaryButtonToolbar;
