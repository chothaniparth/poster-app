const { checkKeysAndRequireValues, errorMessage, successMessage, getCommonKeys, safeUnlink, getAPIALLDataResponse, setSQLOrderId, getCommonAPIResponse } = require('../common/main');
const { pool, sql } = require('../sql/connectToDatabase');
const { setSQLBooleanValue } = require('../common/main')
const fs = require('fs');
const { onlyStatusTrue } = require('../common/search_query');
const { LIVE_URL } = require('../common/variable');
const path = require('path');
const sharp = require('sharp');

const fetchBusinessSubCategoryList = async(req, res)=>{
    try {
        const { Status } = req.query;
        let status = '';
        if (Status === 'true') {
            status = 'WHERE bsc.Status = 1';
        }
        const getMainImage = {
            getQuery: `SELECT bsc.*, bc.Title As BusinessCategoryTitle FROM tbl_business_sub_category As bsc LEFT JOIN tbl_business_category As bc ON bc.BusinessCategoryId = bsc.BusinessCategoryId ${status} ORDER BY CASE WHEN bsc.OrderId IS NULL THEN 1 ELSE 0 END, bsc.OrderId ASC, bsc.BusinessSubCategoryId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_business_sub_category ${status}`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    } catch (error) {
        res.status(500).send(errorMessage(error?.message));
    }  
}

const fetchBusinessSubCategoryListbyCategoryId = async (req, res)=>{
    try{
        const { Status, BusinessCategoryId } = req.query;
        let status = '';
        if (Status === 'true') {
            status = 'AND bsc.Status = 1';
        }
        const missingKeys = checkKeysAndRequireValues(['BusinessCategoryId'], req.query);
        if(missingKeys.length > 0){
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        const getMainImage = {
            getQuery: `SELECT bsc.*, bc.Title As BusinessCategoryTitle FROM tbl_business_sub_category As bsc LEFT JOIN tbl_business_category As bc ON bc.BusinessCategoryId = bsc.BusinessCategoryId ${status} ${Status ? 'AND': 'WHERE'} bsc.BusinessCategoryId = ${BusinessCategoryId} ORDER BY CASE WHEN bsc.OrderId IS NULL THEN 1 ELSE 0 END, bsc.OrderId ASC, bsc.BusinessSubCategoryId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_business_sub_category WHERE BusinessCategoryId = ${BusinessCategoryId} ${status}`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    }catch(error){
        res.status(500).send(errorMessage(error?.message));
    }
}

const addBusinessSubCategory = async (req, res) => {
    try {
        const { Title, Status, BusinessCategoryId, OrderId } = req.body;
        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : "";
        const requiredFields = {
            Title, 
            Status, 
            BusinessCategoryId,
            Image : imageURL
        }
        const missingKeys = checkKeysAndRequireValues(['Title', 'Status', 'BusinessCategoryId', 'Image'], requiredFields);
        if (missingKeys.length > 0) {
            if(req.files && req.files.Image && req.files.Image.length > 0){
                safeUnlink(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage(`${missingKeys.join(', ')} is required`));
        }
        const thumbnailDir = '../TaxFilePosterMedia/Business_SubCategory/Thumbnail';
        const thumbnailFilename = 'thumbnail_' + req?.files?.Image[0]?.filename;
        const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
        await sharp(req?.files?.Image[0]?.path)
            .resize(250, 250) // Adjust width and height as needed
            .toFile(thumbnailPath);

        let imageURLThumbnail = `${LIVE_URL}/Thumbnail/thumbnail_${req?.files?.Image[0]?.filename}`;
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_business_sub_category (Title, Image, Thumbnail, Status, BusinessCategoryId, OrderId, IPAddress, ServerName, EntryTime) VALUES ('${Title}', '${imageURL}', '${imageURLThumbnail}', ${setSQLBooleanValue(Status)}, ${BusinessCategoryId}, ${setSQLOrderId(OrderId)}, '${IPAddress}', '${ServerName}', '${EntryTime}')`;
        const result = await pool.query(insertQuery);
        if (result.rowsAffected[0] === 0) {
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                safeUnlink(req.files.Image[0].path);
            }    
            return res.status(400).send(errorMessage('No rows inserted of Business SubCategory!'));
        }
        return res.status(200).send(successMessage("Data inserted successfully!"));
    } catch (error) {
        if (req.files && req.files.Image && req.files.Image.length > 0) {
            safeUnlink(req.files.Image[0].path);
        }
        console.log('add Business SubCategory error :', error);
        return res.status(500).send(errorMessage(error.message));
    }
};


const updateBusinessSubCategory = async (req, res)=>{
    try{
        const { Title, Status, BusinessSubCategoryId, Image = '', OrderId, BusinessCategoryId } = req.body;
        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : Image;
        const requiredFields = {
            Title,
            Status,
            BusinessSubCategoryId,
            BusinessCategoryId,
            Image: imageURL
        };
        const missingKeys = checkKeysAndRequireValues(['Title', 'Status', 'BusinessSubCategoryId', 'BusinessCategoryId', 'Image'], requiredFields);
        if (missingKeys.length > 0) {
            if (req?.files?.Image?.length) {
                safeUnlink(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage(`${missingKeys.join(', ')} is required`));
        }
        let imageURLThumbnail = '';
        if(req?.files?.Image?.length){
            const thumbnailDir = '../TaxFilePosterMedia/Business_SubCategory/Thumbnail';
            const thumbnailFilename = 'thumbnail_' + req?.files?.Image[0]?.filename;
            const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
            await sharp(req?.files?.Image[0]?.path)
            .resize(250, 250) // Adjust width and height as needed
            .toFile(thumbnailPath);
            imageURLThumbnail = `Thumbnail = ` + `'${LIVE_URL}/Thumbnail/thumbnail_${req?.files?.Image[0]?.filename}',`;
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const updateQuery = `UPDATE tbl_business_sub_category SET Title = '${Title}', Image = '${imageURL}',${imageURLThumbnail} Status = ${setSQLBooleanValue(Status)}, BusinessCategoryId = ${BusinessCategoryId}, OrderId = ${setSQLOrderId(OrderId)}, IPAddress = '${IPAddress}', ServerName = '${ServerName}', EntryTime = '${EntryTime}' WHERE BusinessSubCategoryId = ${BusinessSubCategoryId}`;
        const result = await pool.query(updateQuery)
        if (result.rowsAffected[0] === 0) {
            if (req?.files?.logo?.length) {
                safeUnlink(req?.files?.Image[0]?.path);
            }
            return res.status(400).send(errorMessage('No rows updated of Business SubCategory!'));
        }
        return res.status(200).send(successMessage("Data updated successfully!"));
    }catch(error){
        if (req?.files?.Image?.[0]?.path) {
            safeUnlink(req?.files?.Image[0]?.path);
        }
        console.log("update Business Category error :", error);
        return res.status(500).send(errorMessage(error?.message));
    }
}

const removeBusinessSubCategory = async(req, res)=>{
    try{
        const {BusinessSubCategoryId} = req.query
        const missingKeys = checkKeysAndRequireValues(['BusinessSubCategoryId'], req.query);
        if(missingKeys.length > 0){
            return res.status(400).send(errorMessage(`${missingKeys} is Required`));
        }
        const Image = await pool.request().query(`SELECT Image from tbl_business_sub_category WHERE BusinessSubCategoryId = ${BusinessSubCategoryId}`)
        const deleteQuery = `DELETE FROM tbl_business_sub_category WHERE BusinessSubCategoryId =${BusinessSubCategoryId}`
        const result = await pool.request().query(deleteQuery)
        if (result.rowsAffected[0] === 0) {
            return res.status(400).send(errorMessage('No rows Deleted of business category!'));
        }
        if (Image.recordset.length > 0) {
        safeUnlink(Image.recordset[0].Image.replace(LIVE_URL, `../TaxFilePosterMedia/Business_SubCategory`));
        }    
        return res.status(200).send({ ...successMessage("Data Deleted Successfully!")});
    }catch(error){
        console.log('remove business subcategory error :',error);
        return res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = {
    addBusinessSubCategory,
    updateBusinessSubCategory,
    removeBusinessSubCategory,
    fetchBusinessSubCategoryList,
    fetchBusinessSubCategoryListbyCategoryId,
}