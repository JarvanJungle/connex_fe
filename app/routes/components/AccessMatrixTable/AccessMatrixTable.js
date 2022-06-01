import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classes from './AccessMatrixTable.module.scss'

const AccessMatrixTable = props => {
    const {
        isEdit,
        companyId,
        userId,
        onCheckbox,
        dataCompany,
        dataUser,
    } = props;

    const [dataCategory, setDataCategory] = useState([]);
    const [dataFeature, setDataFeature] = useState([]);
    const [dataAccess, setDataAccess] = useState([]);

    const checkAccess = (company, user, type) => {
        if (company && company.includes(type)) {
            if (user.includes(type)) {
                return true;
            } else {
                return false;
            }
        } else {
            return null;
        }
    }

    const handleCheckbox = (index, type) => {
        let copyDataAccess = [...dataAccess];
        copyDataAccess[index][type] = !dataAccess[index][type];
        setDataAccess(copyDataAccess);
        const data = dataAccess.map(value => {
            const actionsAllowed = [];
            if (value.create) {
                actionsAllowed.push('CREATE');
            }
            if (value.delete) {
                actionsAllowed.push('DELETE');
            }
            if (value.view) {
                actionsAllowed.push('VIEW');
            }
            if (value.approve) {
                actionsAllowed.push('APPROVE');
            }
            return {
                companyId,
                userId,
                featureCode: value.featureCode,
                actionsAllowed
            }
        })
        onCheckbox(data);
    }

    useEffect(() => {
        const category = [];
        dataCompany.forEach(valueEx => {
            const index = category.findIndex(valueIn => valueIn.text === valueEx.categoryName);
            if (index >= 0) {
                category[index].colSpan += 1;
            } else {
                category.push({
                    text: valueEx.categoryName,
                    colSpan: 1
                })
            }
        })
        setDataCategory(category);
        setDataFeature(dataCompany.map(value => value.featureName));
        const data = dataCompany.map(valueEx => {
            const item = dataUser.find(valueIn => valueIn.featureCode === valueEx.featureCode);
            if (item) {
                return {
                    featureCode: valueEx.featureCode,
                    create: checkAccess(valueEx.action, item.actionsAllowed, 'CREATE'),
                    delete: checkAccess(valueEx.action, item.actionsAllowed, 'DELETE'),
                    view: checkAccess(valueEx.action, item.actionsAllowed, 'VIEW'),
                    approve: checkAccess(valueEx.action, item.actionsAllowed, 'APPROVE')
                }
            } else {
                return {
                    featureCode: valueEx.featureCode,
                    create: valueEx.action && valueEx.action.includes('CREATE') ? false : null,
                    delete: valueEx.action && valueEx.action.includes('DELETE') ? false : null,
                    view: valueEx.action && valueEx.action.includes('VIEW') ? false : null,
                    approve: valueEx.action && valueEx.action.includes('APPROVE') ? false : null
                }
            }
        })
        setDataAccess(data);
    }, [dataCompany, dataUser])

    return (
        <table className={classes.fixed + ' ' + classes.addborder}>
            <tbody>
                <tr className={'text-center ' + classes.addborder}>
                    {
                        dataCategory && dataCategory.map((value, index) => (
                            <th className={classes.addborder + ' ' + classes.sep} key={index} colSpan={value.colSpan}>
                                {value.text}
                            </th>
                        ))
                    }
                </tr>
                <tr className={'text-center ' + classes.addborder}>
                    {
                        dataFeature && dataFeature.map((value, index) => (
                            <th className={classes.addborder} key={index}>
                                {value}
                            </th>
                        ))
                    }
                </tr>
                <tr>
                    {
                        dataAccess && dataAccess.map((value, index) => (
                            <td className={classes.addborder} key={index}>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td className='text-center'>
                                                <label htmlFor={'create' + index}> Create </label>
                                            </td>
                                            <td className='text-left'>
                                                <input
                                                    type='checkbox'
                                                    id={'create' + index}
                                                    checked={value.create}
                                                    onChange={() => handleCheckbox(index, 'create')}
                                                    disabled={!isEdit || value.create === null}
                                                />
                                            </td>
                                            <td className='text-center'>
                                                <label htmlFor={'delete' + index}> Delete </label>
                                            </td>
                                            <td className='text-left'>
                                                <input
                                                    type='checkbox'
                                                    id={'delete' + index}
                                                    checked={value.delete}
                                                    onChange={() => handleCheckbox(index, 'delete')}
                                                    disabled={!isEdit || value.delete === null}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='text-center'>
                                                <label htmlFor={'view' + index}> View </label>
                                            </td>
                                            <td className='text-left'>
                                                <input
                                                    type='checkbox'
                                                    id={'view' + index}
                                                    checked={value.view}
                                                    onChange={() => handleCheckbox(index, 'view')}
                                                    disabled={!isEdit || value.view === null}
                                                />
                                            </td>
                                            <td className='text-center'>
                                                <label htmlFor={'approve' + index}> Approve </label>
                                            </td>
                                            <td className='text-left'>
                                                <input
                                                    type='checkbox'
                                                    id={'approve' + index}
                                                    checked={value.approve}
                                                    onChange={() => handleCheckbox(index, 'approve')}
                                                    disabled={!isEdit || value.approve === null}
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        ))
                    }
                </tr>
            </tbody>
        </table>
    )
}

AccessMatrixTable.propTypes = {
    isEdit: PropTypes.bool,
    companyId: PropTypes.string,
    userId: PropTypes.string,
    onCheckbox: PropTypes.func,
    dataCompany: PropTypes.array,
    dataUser: PropTypes.array
};

export default AccessMatrixTable;