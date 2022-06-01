import _ from "lodash";

function stringSimplify(input) {
    return input.toLowerCase().replace(/ +(?= )/g, "");
}

class CSVHelper {
    validateCSV(csvData, requiredColumns) {
        let validate = true;
        let missingField = "";
        const data = [];
        const required = [];
        if (!csvData || csvData.length <= 0) {
            validate = false;
            return { data, validate };
        }
        const columnCount = csvData[0].data.length;
        if (requiredColumns) {
            for (let i = 0; i < requiredColumns.length; i++) {
                const columnIndex = _.findIndex(csvData[0].data, (item) => stringSimplify(item) === stringSimplify(requiredColumns[i]));
                if (columnIndex > 0) {
                    required.push(columnIndex);
                }
            }
        }
        console.log(required);
        for (let i = 0; i < csvData.length; i++) {
            if (csvData[i].data.length === 1 && _.isEmpty(csvData[i].data[0].replace(/ +(?= )/g, ""))) continue;
            if (csvData[i].data.length !== columnCount) {
                validate = false;
                break;
            }
            if (required.length > 0) {
                for (let j = 0; j < required.length; j++) {
                    console.log(csvData[i].data[required[j]], j);
                    if (_.isEmpty(csvData[i].data[required[j]]) || csvData[i].data[required[j]] === "") {
                        missingField = csvData[0].data[required[j]];
                        validate = false;
                        break;
                    }
                }
            }
            data.push(csvData[i]);
        }
        return { data, validate, missingField };
    }

    validateCSVListCatalogue(csvData, rowData, requiredColumns) {
        let validate = true;
        let missingField = "";
        const data = [];
        const required = [];
        if (!csvData || csvData.length <= 0) {
            validate = false;
            return { data, validate };
        }
        const columnCount = csvData[0].data.length;
        if (requiredColumns) {
            for (let i = 0; i < requiredColumns.length; i++) {
                const columnIndex = _.findIndex(csvData[0].data, (item) => stringSimplify(item) === stringSimplify(requiredColumns[i]));
                if (columnIndex > 0) {
                    required.push(columnIndex);
                }
            }
        }
        console.log(rowData);
        if (required.length > 0) {
            for (let j = 0; j < required.length; j++) {
                console.log(rowData[required[j]], required[j]);
                if (_.isEmpty(rowData[required[j]]) || rowData[required[j]] === "") {
                    missingField = csvData[0].data[required[j]];
                    validate = false;
                    break;
                }
            }
        }
        if (rowData.length < columnCount) validate = false;
        return { data, validate, missingField };
    }
}

export default new CSVHelper();
