const { checkKeysAndRequireValues, errorMessage, successMessage, getCommonKeys, safeUnlink, getCommonAPIResponse } = require('../common/main');
const { pool, sql } = require('../sql/connectToDatabase');
const { setSQLBooleanValue } = require('../common/main')
const fs = require('fs').promises;
const { LIVE_URL } = require('../common/variable');

const formatResponse = (response) => {
    return response?.map(category => {
        return {
            ...category,
            Images: category.Images ? category.Images.split(',') : []
        };
    });
};

const fetchBusinessCategoryImageList = async (req, res) => {
    try {
        const { Status } = req.query;
        let status = '';
        if (Status === 'true') {
            status = 'WHERE bci.Status = 1';
        }
        const getMainImage = {
            getQuery: `SELECT bci.*, bc.Title As BusinessCategoryTitle 
                       FROM tbl_business_category_image AS bci 
                       LEFT JOIN tbl_business_category AS bc ON bci.BusinessCategoryId = bc.BusinessCategoryId 
                       ${status} 
                       ORDER BY BusinessCategoryImageId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_business_category_image AS bci ${status}`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    } catch (error) {
        console.log('fetch Business Category Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}
const fetchBusinessCategoryImageListByBusinessCategoryId = async (req, res) => {
    try{
        const { BusinessCategoryId } = req.query;
        const fieldCheck = checkKeysAndRequireValues(['BusinessCategoryId'], req.query);
        if (fieldCheck.length !== 0) {
            return res.status(400).send(errorMessage(`${fieldCheck} is required`));
        }

        let businessCategory = '';
        if(BusinessCategoryId){
            businessCategory = `WHERE BusinessCategoryId = ${BusinessCategoryId}`
        }

        const getMainImage = {
            getQuery: `SELECT * FROM tbl_business_category_image ${businessCategory} ORDER BY  BusinessCategoryImageId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_business_category_image`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);

    }catch(error){
        console.log('fetch Business Category Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

 const fetchBusinessCategoryImageWithBusinessCategory = async (req, res) => {
     try{
         const { Status } = req.query;
         let status = '';
         if (Status === 'true') {
             status = 'WHERE Status = 1';
         }
         const getMainImage = {
            getQuery: `SELECT
    tbl_business_category.BusinessCategoryId,
    tbl_business_category.Title,
    tbl_business_category.Status,
    tbl_business_category.OrderId,
    (
        SELECT
            STUFF((
                SELECT ',' + tbl_business_category_image.Image
                FROM tbl_business_category_image
                WHERE tbl_business_category.BusinessCategoryId = tbl_business_category_image.BusinessCategoryId
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 1, '') AS Images
    ) AS Images
FROM
    tbl_business_category ${status} ORDER BY  BusinessCategoryId DESC`,
            countQuery: `SELECT COUNT(BusinessCategoryId) AS totalCount FROM tbl_business_category ${status}`,
         };
         const result = await getCommonAPIResponse(req, res, getMainImage);
         result.data = formatResponse(result.data);
         res.json(result);
     }catch(error){
         console.log('fetch Business Category With Business Category Image Error:', error);
         res.status(500).send(errorMessage(error?.message));
     }
 }

const addBusinessCategoryImage = async (req, res) => {
    try{
        const {Status, BusinessCategoryId} = req.body;
        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : "";
        const requiredFields = {
            Image : imageURL,
            Status,
            BusinessCategoryId
        }
        const missingKeys = checkKeysAndRequireValues(['Image', 'Status', 'BusinessCategoryId'], requiredFields);
        if(missingKeys.length !== 0){
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                fs.unlink(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_business_category_image (BusinessCategoryId, Image, Status, IPAddress, ServerName, EntryTime) VALUES (${BusinessCategoryId}, '${imageURL}', ${setSQLBooleanValue(Status)}, '${IPAddress}', '${ServerName}', '${EntryTime}')`;
        const result = await pool.query(insertQuery);
        if (result.rowsAffected[0] === 0) {
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                fs.unlink(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage('No rows inserted of Business Category Image!'));
        }
        return res.status(200).send(successMessage("Data inserted successfully!"));
    }catch(error){
        if (req.files && req.files.Image && req.files.Image.length > 0) {
            fs.unlink(req.files.Image[0].path);
        }
        console.log('Add Business Category Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const removeBusinessCategoryImage = async (req, res) => {
    try{
        const {BusinessCategoryImageId} = req.query;
        const missingKeys = checkKeysAndRequireValues(['BusinessCategoryImageId'], req.query);
        if(missingKeys.length !== 0){
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        const oldImage = await pool.query(`SELECT Image FROM tbl_business_category_image WHERE BusinessCategoryImageId = ${BusinessCategoryImageId}`);
        const deleteQuery = `DELETE FROM tbl_business_category_image WHERE BusinessCategoryImageId = ${BusinessCategoryImageId}`;
        const result = await pool.query(deleteQuery);
        if(result.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No rows deleted of Business Category Image!'));
        }
        if(oldImage?.recordset?.length > 0){
            await fs.unlink(oldImage.recordset[0].Image.replace(LIVE_URL, `../TaxFilePosterMedia/BusinessCategory`));
        }
        return res.status(200).send(successMessage('Deleted Data Successfully!'));
    }catch(error){
        console.log('Remove Business Category Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = { 
    fetchBusinessCategoryImageList,
    addBusinessCategoryImage,
    removeBusinessCategoryImage,
    fetchBusinessCategoryImageListByBusinessCategoryId,
    fetchBusinessCategoryImageWithBusinessCategory,
}