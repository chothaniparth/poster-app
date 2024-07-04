const { checkKeysAndRequireValues, errorMessage, successMessage, getCommonKeys, safeUnlink, getCommonAPIResponse } = require('../common/main');
const { pool, sql } = require('../sql/connectToDatabase');
const { setSQLBooleanValue } = require('../common/main')
const fs = require('fs').promises;
const { LIVE_URL } = require('../common/variable');

const fetchFAQCategoryList = async (req, res) => {
    try{
        const { Status } = req.query;
        let status = '';
        if (Status === 'true') {
            status = 'WHERE Status = 1';
        }
        const getMainImage = {
            getQuery: `SELECT * FROM tbl_faq_category ${status} ORDER BY CASE WHEN OrderId IS NULL THEN 1 ELSE 0 END, OrderId ASC, FAQCategoryId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_faq_category ${status}`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    }catch(error){
        console.log('fetch FAQ Category Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const addFAQCategory = async (req, res)=>{
    try{
        const {Title ,Status, OrderId = null} = req.body
        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : "";
        const requiredFields = {
            Title ,Status, Image : imageURL
        }
        const missingKeys = await checkKeysAndRequireValues(['Title', 'Image', 'Status'], requiredFields);
        if(missingKeys.length !== 0){
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                safeUnlink(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_faq_category (Title, Image, Status, OrderId, IPAddress , ServerName , EntryTime) VALUES ('${Title}', '${imageURL}', ${setSQLBooleanValue(Status)}, ${OrderId}, '${IPAddress}' ,'${ServerName}','${EntryTime}')`;
        const result = await pool.query(insertQuery);
        if (result.rowsAffected[0] === 0) {
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                safeUnlink(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage('No rows inserted of FAQ Category!'));
        } 
        return res.status(200).send(successMessage("Data inserted successfully!"));
    }catch(error){
        if (req.files && req.files.Image && req.files.Image.length > 0) {
            safeUnlink(req.files.Image[0].path);
        }
        console.log('Add FAQ Category Error:', error);
        return res.status(500).send(errorMessage(error?.message));
    }
} 

const removeFAQCategory = async (req, res) => {
    try{
        const {FAQCategoryId} = req.query;
        const missingKeys = checkKeysAndRequireValues(['FAQCategoryId'], req.query);
        if(missingKeys.length !== 0){
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        const oldImage = await pool.query(`SELECT Image FROM tbl_faq_category WHERE FAQCategoryId = ${FAQCategoryId}`);
        const deleteQuery = `DELETE FROM tbl_faq_category WHERE FAQCategoryId = ${FAQCategoryId}`;
        const result = await pool.query(deleteQuery);
        if(result.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No rows deleted of FAQ Category!'));
        }
        if(oldImage.recordset[0].Image){
            safeUnlink(oldImage.recordset[0].Image.replace(LIVE_URL, `../TaxFilePosterMedia/FAQCategory`));
        }
        return res.status(200).send(successMessage('FAQ Category removed successfully!'));
    }catch(error){
        console.log('Remove FAQ Category Error:', error);
        return res.status(500).send(errorMessage(error?.message));
    }
}

const updateFAQCategory = async (req, res) => {
    try{
        const {Title ,Status, Image, FAQCategoryId, OrderId = null} = req.body
        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : Image;
        const requiredFields = {
            Title ,Status, Image : imageURL,FAQCategoryId
        }
        const missingKeys = await checkKeysAndRequireValues(['FAQCategoryId','Title', 'Image', 'Status'], requiredFields);
        if(missingKeys.length !== 0){
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                safeUnlink(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        const oldImage = await pool.query(`SELECT Image FROM tbl_faq_category WHERE FAQCategoryId = ${FAQCategoryId}`);
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const updateQuery = `UPDATE tbl_faq_category SET Title = '${Title}', Image = '${imageURL}', Status = ${setSQLBooleanValue(Status)}, OrderId = ${OrderId}, IPAddress = '${IPAddress}', ServerName = '${ServerName}' , EntryTime = '${EntryTime}' WHERE FAQCategoryId = ${FAQCategoryId}`;
        const result = await pool.query(updateQuery);
        if(result.rowsAffected[0] === 0){
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                safeUnlink(req.files.Image[0].path);
            } 
            return res.status(400).send(errorMessage('No rows updated of FAQ Category!'));
        }
        if(oldImage.recordset[0].Image){
            safeUnlink(oldImage.recordset[0].Image.replace(LIVE_URL, `../TaxFilePosterMedia/FAQCategory`));
        }
        return res.status(200).send(successMessage('FAQ Category updated successfully!'));
    }catch(error){
        if (req.files && req.files.Image && req.files.Image.length > 0) {
            safeUnlink(req.files.Image[0].path);
        }
        console.log('Update FAQ Category Error:', error);
        return res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = {
    addFAQCategory,
    fetchFAQCategoryList, 
    removeFAQCategory,
    updateFAQCategory,
}