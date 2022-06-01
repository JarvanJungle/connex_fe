import React from "react";
import { CSVReader } from "react-papaparse";
import PropTypes from "prop-types";
import ButtonSpinner from "../../components/ButtonSpinner";

const UploadButton = ({
    buttonRef, handleOnDrop, handleOnError, translation, isLoading, handleOpenDialog
}) => (
    <CSVReader
        ref={buttonRef}
        onFileLoad={handleOnDrop}
        onError={handleOnError}
        noClick
        noDrag
    >
        {() => (
            <>
                <ButtonSpinner
                    icon="fa fa-upload"
                    text={translation("Upload")}
                    className="mb-2 mr-2 px-3"
                    isLoading={isLoading}
                    onclick={handleOpenDialog}
                />
            </>
        )}
    </CSVReader>
);

UploadButton.propTypes = {
    buttonRef: PropTypes.instanceOf(Object).isRequired,
    handleOnDrop: PropTypes.func.isRequired,
    handleOnError: PropTypes.func.isRequired,
    translation: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    handleOpenDialog: PropTypes.func.isRequired
};

UploadButton.defaultProps = {
    isLoading: false
};

export default UploadButton;
