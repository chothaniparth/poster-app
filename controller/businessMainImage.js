const { checkKeysAndRequireValues, errorMessage, successMessage, getCommonKeys, safeUnlink, getAPIALLDataResponse, setSQLOrderId, getCommonAPIResponse } = require('../common/main');
const { pool, sql } = require('../sql/connectToDatabase');
const { setSQLBooleanValue } = require('../common/main')
const fs = require('fs');
const { onlyStatusTrue } = require('../common/search_query');
const { LIVE_URL } = require('../common/variable');
const path = require('path');
const sharp = require('sharp');

const fetchBusinessMainImageList = async (req, res) => {
    try {
        const { Status, BusinessCategoryId, BusinessSubCategoryId } = req.query;
        let status = '';
        if (Status === 'true') {
            status = 'WHERE bmi.Status = 1';
        }
        let categoryIDAndSubCategoryID = '';
        if (BusinessCategoryId) {
            categoryIDAndSubCategoryID += `${Status ? 'AND' : 'WHERE'} bmi.BusinessCategoryId = ${BusinessCategoryId}`;
        }
        if(BusinessSubCategoryId){
            categoryIDAndSubCategoryID += `${Status || BusinessCategoryId ? 'AND' : 'WHERE'} bmi.BusinessSubCategoryId = ${BusinessSubCategoryId}`;
        }
        const getMainImage = {
            getQuery: `SELECT bmi.*, bc.Title As BusinessCategoryTitle, bsc.Title As BusinessSubCategoryTitle, il.Title As ImageLanguageTitle 
                        FROM tbl_business_main_image AS bmi 
                        LEFT JOIN tbl_business_category As bc ON bc.BusinessCategoryId = bmi.BusinessCategoryId
                        LEFT JOIN tbl_business_sub_category As bsc ON bsc.BusinessSubCategoryId = bmi.BusinessSubCategoryId
                        LEFT JOIN tbl_image_language As il ON il.ImageLanguageId = bmi.ImageLanguageId 
                        ${status} ${categoryIDAndSubCategoryID}
                        ORDER BY CASE WHEN bmi.OrderId IS NULL THEN 1 ELSE 0 END, bmi.OrderId ASC, bmi.BusinessMainImageId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_business_main_image bmi ${status} ${categoryIDAndSubCategoryID}`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    } catch (error) {
        res.status(500).send(errorMessage(error?.message));
    }  
}

const addBusinessMainImage = async (req, res)=>{
    try{
        const {BusinessCategoryId, BusinessSubCategoryId, ImageLanguageId, OrderId, Premium, Status} = req.body
        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : "";
        const requiredFields = {
            BusinessCategoryId,
            BusinessSubCategoryId,
            Image : imageURL,
            ImageLanguageId,
            OrderId,
            Premium,
            Status
        }
        const missingKeys = checkKeysAndRequireValues(['BusinessCategoryId', 'BusinessSubCategoryId', 'Image', 'ImageLanguageId', 'Premium', 'Status'], requiredFields);
        if (missingKeys.length > 0) {
            if(req.files && req.files.Image && req.files.Image.length > 0){
                fs.unlinkSync(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        const thumbnailDir = '../TaxFilePosterMedia/BusinessMainImage/Thumbnail';
        const thumbnailFilename = 'thumbnail_' + req?.files?.Image[0]?.filename;
        const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
        await sharp(req?.files?.Image[0]?.path)
            .resize(250, 250) // Adjust width and height as needed
            .toFile(thumbnailPath);

        let imageURLThumbnail = `${LIVE_URL}/Thumbnail/thumbnail_${req?.files?.Image[0]?.filename}`;
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_business_main_image ( BusinessCategoryId, BusinessSubCategoryId, Image, Thumbnail, ImageLanguageId, OrderId, Premium, Status, IPAddress, ServerName, EntryTime) VALUES ( ${BusinessCategoryId}, ${BusinessSubCategoryId}, '${imageURL}', '${imageURLThumbnail}', ${ImageLanguageId}, ${setSQLOrderId(OrderId)}, ${setSQLBooleanValue(Premium)}, ${setSQLBooleanValue(Status)}, '${IPAddress}', '${ServerName}', '${EntryTime}' )`
        const result = await pool.query(insertQuery);
        if (result.rowsAffected[0] === 0) {
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                fs.unlinkSync(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage('No rows inserted of Business SubCategory!'));
        }
        return res.status(200).send(successMessage("Data inserted successfully!"));
    }catch(error){
        console.log('Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}
const updateBusinessMainImage = async (req, res)=>{
    try{
        const {BusinessMainImageId, BusinessCategoryId, BusinessSubCategoryId, ImageLanguageId, OrderId, Premium, Status, Image} = req.body
        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : Image;
        const requiredFields = {
            BusinessMainImageId,
            BusinessCategoryId,
            BusinessSubCategoryId,
            Image : imageURL,
            ImageLanguageId,
            OrderId,
            Premium,
            Status
        }
        const missingKeys = checkKeysAndRequireValues(['BusinessMainImageId','BusinessCategoryId', 'BusinessSubCategoryId', 'Image', 'ImageLanguageId', 'Premium', 'Status'], requiredFields);
        if (missingKeys.length > 0) {
            if(req.files && req.files.Image && req.files.Image.length > 0){
                fs.unlinkSync(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        let imageURLThumbnail = '';
        if(req?.files?.Image?.length){
            const thumbnailDir = '../TaxFilePosterMedia/BusinessMainImage/Thumbnail';
            const thumbnailFilename = 'thumbnail_' + req?.files?.Image[0]?.filename;
            const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
            await sharp(req?.files?.Image[0]?.path)
            .resize(250, 250) // Adjust width and height as needed
            .toFile(thumbnailPath);
            imageURLThumbnail = `Thumbnail = ` + `'${LIVE_URL}/Thumbnail/thumbnail_${req?.files?.Image[0]?.filename}',`;
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const updateQuery = `UPDATE tbl_business_main_image 
        SET BusinessCategoryId = ${BusinessCategoryId} , BusinessSubCategoryId = ${BusinessSubCategoryId} , Image = '${imageURL}', ${imageURLThumbnail}  ImageLanguageId = ${ImageLanguageId} , OrderId = ${setSQLOrderId(OrderId)} , Premium = ${setSQLBooleanValue(Premium)} , Status = ${setSQLBooleanValue(Status)} , IPAddress = '${IPAddress}' , ServerName = '${ServerName}' , EntryTime = '${EntryTime}' 
        WHERE BusinessMainImageId = ${BusinessMainImageId}`

        const result = await pool.query(updateQuery)
        if (result.rowsAffected[0] === 0) {
            if (req?.files?.logo?.length) {
                await safeUnlink(req?.files?.Image[0]?.path);
            }
            return res.status(400).send(errorMessage('No rows updated of Business Main Image!'));
        }
        return res.status(200).send(successMessage("Data updated successfully!"));
    }catch(error){
        console.log('Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}
const removeBusinessMainImage = async (req, res)=>{
    try{
        const {BusinessMainImageId} = req.query
        const missingKeys = checkKeysAndRequireValues(['BusinessMainImageId'], req.query);
        if(missingKeys.length > 0){
            return res.status(400).send(errorMessage(`${missingKeys} is Required`));
        }
        const Image = await pool.request().query(`SELECT Image FROM tbl_business_main_image WHERE BusinessMainImageId = ${BusinessMainImageId}`)
        const deleteQuery = `DELETE FROM tbl_business_main_image WHERE BusinessMainImageId =${BusinessMainImageId}`
        const result = await pool.request().query(deleteQuery)
        if (result.rowsAffected[0] === 0) {
            return res.status(400).send(errorMessage('No rows Deleted of Business Main Image!'));
        }
        if (Image.recordset.length > 0) {
           await fs.unlinkSync(Image.recordset[0].Image.replace(LIVE_URL, `../TaxFilePosterMedia/BusinessMainImage`));
        }
        return res.status(200).send({ ...successMessage("Data Deleted Successfully!")});
    }catch(error){
        console.log('Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

module.exports = {
    fetchBusinessMainImageList,
    addBusinessMainImage,
    updateBusinessMainImage,
    removeBusinessMainImage,
}