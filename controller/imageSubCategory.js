const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse, getCommonAPIResponse } = require('../common/main');
const {setSQLBooleanValue} = require('../common/main');
const { onlyStatusTrue } = require('../common/search_query');
const { pool, sql } = require('../sql/connectToDatabase');


const fetchImageSubCategoryList = async (req, res) => {
    const result = await getAPIALLDataResponse(req, res, 'tbl_image_subcategory', 'ImageSubCategoryId');
    res.json(result);
}

const fetchImageSubCategoryListInApp = async (req, res) => {
    const result = await getAPIALLDataResponse(req, res, 'tbl_image_subcategory', 'ImageSubCategoryId', onlyStatusTrue);
    res.json(result);
}

const fetchSubCategoryJoinList = async (req, res) => {
    try {
        const getSubCategory = {
            getQuery: `SELECT imageSubCategory.*, imageCategory.Title As ImageCategoryTitle FROM tbl_image_subcategory As imageSubCategory
            LEFT JOIN tbl_image_category As imageCategory ON imageCategory.ImageCategoryId = imageSubCategory.ImageCategoryId ORDER BY imageSubCategory.ImageSubCategoryId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_image_subcategory`
        };
        const result = await getCommonAPIResponse(req, res, getSubCategory);
        res.json(result);
    } catch (error) {
        res.status(500).send(errorMessage(error?.message));
    }
};

const addImageSubCategoryList = async (req, res) => {
    try {
        const { Title, ImageCategoryId, Status } = req.body;
        const fieldCheck = checkKeysAndRequireValues(['Title', 'ImageCategoryId', 'Status'], req.body);
        if (fieldCheck.length !== 0) {
            return res.status(400).send(errorMessage(`${fieldCheck.join(', ')} is required`));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_image_subcategory ( ImageCategoryId, Title, IPAddress, ServerName, EntryTime, Status) VALUES ('${ImageCategoryId}' , '${Title}', '${IPAddress}', '${ServerName}', '${EntryTime}', ${setSQLBooleanValue(Status)})`;
        const result = await pool.query(insertQuery);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            return res.status(200).send(successMessage('Sub-category created successfully'));
        }
        return res.status(500).send(errorMessage('Failed to create sub-category'));
    } catch (error) {
        console.error('Add SubCategory error:', error);
        return res.status(500).send(errorMessage(error?.message));
    }
};
const updateImageSubCategory = async (req, res) => {
    try {
        const { Title, ImageSubCategoryId, ImageCategoryId, Status } = req.body
        const checkField = await checkKeysAndRequireValues(['Title', 'ImageSubCategoryId', 'Status'], req.body);
        if (checkField.length !== 0) {
            return res.status(400).send(errorMessage(`${checkField} is required`));
        }
        const oldData = await pool.query(`select * from tbl_image_subcategory where ImageSubCategoryId = ${ImageSubCategoryId}`)
        if(oldData.recordset.length === 0){
            return res.status(404).send(errorMessage('Invalid value for parameter "ImageSubCategoryId". Must be a valid number'))
        }
        const updateQueryArray = [];
        const convertedStatus = setSQLBooleanValue(Status);
        // Check if the title needs to be updated
        if (oldData.recordset[0].Title !== Title) {
            updateQueryArray.push(`Title = '${Title}'`);
        }
        if(oldData.recordset[0].ImageCategoryId !== ImageCategoryId){
            updateQueryArray.push(`ImageCategoryId = '${ImageCategoryId}'`);
        }
        // Check if the status needs to be updated
        if (oldData.recordset[0].Status !== convertedStatus) {
            updateQueryArray.push(`Status = '${convertedStatus}'`);
        }
        // If there are no updates required
        if (updateQueryArray.length === 0) {
            return res.status(200).send(successMessage('No changes detected.'));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const updateQuery = `UPDATE tbl_image_subcategory SET ${updateQueryArray.join(', ')},  IPAddress = '${IPAddress}', ServerName = '${ServerName}', EntryTime = '${EntryTime}'  where ImageSubCategoryId = ${ImageSubCategoryId}`
        const updateResult = await pool.query(updateQuery);
        if (updateResult?.rowsAffected[0] === 0) {
            return res.status(400).send(errorMessage('no row updated of sub-category'))
        }
        return res.status(200).send(successMessage('data updated successfully'))
    } catch (error) {
        console.log('update sub-category error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}
const removeImageSubCategory = async (req, res) => {
    try {
        const { ImageSubCategoryId } = req.query
        if (!ImageSubCategoryId) {
            return res.status(400).send(errorMessage('Invalid value for parameter "ImageSubCategoryId". Must be a valid number'));
        }
        const alreadyExist = [];
        const mainImageExist = await pool.query(`select Count(*) MainImageId from tbl_main_image where ImageSubCategoryId = ${ImageSubCategoryId}`);
        if(mainImageExist.recordset[0].MainImageId > 0){
            alreadyExist.push('Main Image');
        }
        if(alreadyExist.length > 0){
            return res.status(400).send(errorMessage(`Data already exist In ${alreadyExist.join(', ')}`));
        }
        const deleteQuery = `delete from tbl_image_subcategory where ImageSubCategoryId = ${ImageSubCategoryId}`
        const result = await pool.query(deleteQuery);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send(errorMessage('no row deleted in sub-category.'));
        }
        return res.status(200).send(successMessage('successfully deleted sub-category'));
    } catch (error) {
        console.log('delete image sub-category error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

module.exports = {
    fetchImageSubCategoryList,
    fetchImageSubCategoryListInApp,
    addImageSubCategoryList,
    updateImageSubCategory,
    removeImageSubCategory,
    fetchSubCategoryJoinList
}