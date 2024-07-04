const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse } = require('../common/main');
const {setSQLBooleanValue} = require('../common/main');
const { onlyStatusTrue } = require('../common/search_query');
const { pool, sql } = require('../sql/connectToDatabase');

const addImageCategoryList = async (req, res) => {
    try {
        const { Title, Status } = req.body;
        const fieldCheck = await checkKeysAndRequireValues(['Title', 'Status'], req.body)
        if (fieldCheck.length !== 0) {
            return res.status(400).send(errorMessage(`${fieldCheck} is required`));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_image_category (Title, IPAddress, ServerName, EntryTime, Status) VALUES ('${Title}', '${IPAddress}', '${ServerName}', '${EntryTime}', ${setSQLBooleanValue(Status)})`;
        const response = await pool.query(insertQuery);
        if (response.rowsAffected && response.rowsAffected[0] > 0) {
            return res.status(201).send(successMessage('New category created successfully'));
        }
        return res.status(500).send(errorMessage('Failed to insert the new category'));
    } catch (error) {
        console.log("error:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send(errorMessage('Category with the same title already exists'));
        }
        return res.status(500).send(errorMessage('Internal Server Error'));
    }
};
const updateImageCategoryById = async (req, res) => {
    try {
        const { ImageCategoryId, Title, Status } = req.body;
        // Check for required fields
        const fieldCheck = await checkKeysAndRequireValues(['ImageCategoryId', 'Title', 'Status'], req.body);
        if (fieldCheck.length !== 0) {
            return res.status(400).send(errorMessage(`${fieldCheck.join(', ')} is required`));
        }
        // Get the old data for comparison
        const oldData = await pool.query(`SELECT * FROM tbl_image_category WHERE ImageCategoryId = ${ImageCategoryId}`);
        if (oldData.recordset.length === 0) {
            return res.status(404).send(errorMessage('Image category not found'));
        }
        const updateQueryArray = [];
        const convertedStatus = setSQLBooleanValue(Status);
        // Check if the title needs to be updated
        if (oldData.recordset[0].Title !== Title) {
            updateQueryArray.push(`Title = '${Title}'`);
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
        // Update the category
        const updateQuery = `UPDATE tbl_image_category SET ${updateQueryArray.join(', ')}, IPaddress ='${IPAddress}', ServerName = '${ServerName}', EntryTime = '${EntryTime}' WHERE ImageCategoryId = ${ImageCategoryId}`;
        const result = await pool.query(updateQuery);
        // Check if any rows were affected
        if (result.rowsAffected[0] === 0) {
            return res.status(400).send(errorMessage('no row updated'));
        }
        // Successfully updated
        return res.status(200).send(successMessage('data updated successfully'));
    } catch (error) {
        console.error("Update category error:", error);
        return res.status(500).send(errorMessage('Internal Server Error'));
    }
};
const removeImageCategoryById = async (req, res) => {
    try {
        const { ImageCategoryId } = req.query
        if (!ImageCategoryId) {
            return res.status(400).send(errorMessage('Invalid value for parameter "ImageCategoryId". Must be a valid number'))
        }
        const alreadyExist = [];
        const imageCategoryExist = await pool.query(`select Count(*) ImageSubCategoryId from tbl_image_subcategory where ImageCategoryId = ${ImageCategoryId}`);
        const mainImageExist = await pool.query(`select Count(*) MainImageId from tbl_main_image where ImageCategoryId = ${ImageCategoryId}`);
        if(imageCategoryExist.recordset[0].ImageSubCategoryId === 1){
            alreadyExist.push('Image Category');
        }
        if(mainImageExist.recordset[0].MainImageId > 0){
            alreadyExist.push('Main Image');
        }
        if(alreadyExist.length > 0){
            return res.status(400).send(errorMessage(`Data already exist In ${alreadyExist.join(', ')}`));
        }
        const deleteQuery = `delete from tbl_image_category where [ImageCategoryId] = ${ImageCategoryId}`
        const response = await pool.query(deleteQuery);
        if (response.rowsAffected[0] === 0) {
            return res.status(404).send(errorMessage('enter velit catigoryId'));
        }
        return res.status(200).send(successMessage('successfully deleted categoryId'));
    } catch (error) {
        console.log("error :", error);
        return res.status(400).send(errorMessage(error?.message));
    }
}
const fetchImageCategoryList = async (req, res) => {
    const result = await getAPIALLDataResponse(req, res, 'tbl_image_category', 'ImageCategoryId');
    res.json(result);
}

const fetchImageCategoryListInApp = async (req, res) => {
    const result = await getAPIALLDataResponse(req, res, 'tbl_image_category', 'ImageCategoryId', onlyStatusTrue);
    res.json(result);
}

module.exports = { addImageCategoryList, updateImageCategoryById, removeImageCategoryById, fetchImageCategoryList, fetchImageCategoryListInApp }