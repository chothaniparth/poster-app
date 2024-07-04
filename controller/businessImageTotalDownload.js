const { checkKeysAndRequireValues, errorMessage, successMessage, getCommonKeys, getCommonAPIResponse} = require('../common/main');
const { pool } = require('../sql/connectToDatabase');

const fetchBusinessImageTotalDownloadList = async (req, res)=>{
    try{
        const getBusinessImage = {
            getQuery: `SELECT * FROM tbl_business_image_total_download ORDER BY BusinessImageTotalDownloadId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_business_image_total_download`,
        };
        const result = await getCommonAPIResponse(req, res, getBusinessImage);
        res.json(result);
    }catch(error){
        console.log('fetch Business Image Total Download List Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const addBusinessImageTotalDownload = async (req, res)=>{
    try{
        const {BusinessMainImageId,
            BusinessSubCategoryId,
            BusinessCategoryId,
            UserId} = req.body;
        const missingKeys = await checkKeysAndRequireValues(['BusinessMainImageId',
            'BusinessSubCategoryId',
            'BusinessCategoryId',
            'UserId'], req.body);
        if(missingKeys.length !== 0){
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        const {IPAddress, ServerName, EntryTime} = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_business_image_total_download (BusinessMainImageId,
            BusinessSubCategoryId,
            BusinessCategoryId,
            UserId,
            IPAddress,
            ServerName,
            EntryTime) VALUES (${BusinessMainImageId},
                ${BusinessSubCategoryId},
                ${BusinessCategoryId}, 
                ${UserId},
                '${IPAddress}', 
                '${ServerName}', 
                '${EntryTime}')`;
        const response = await pool.query(insertQuery);
        if(response.rowsAffected && response.rowsAffected[0] > 0){
            return res.status(201).send(successMessage('Business image total download added successfully'));
        }
        return res.status(500).send(errorMessage('Failed to add business image total download'));
    }catch(error){
        console.log('Add Business Image Total Download Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = {
    fetchBusinessImageTotalDownloadList,
    addBusinessImageTotalDownload
}