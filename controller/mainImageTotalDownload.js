const { checkKeysAndRequireValues, errorMessage, successMessage, getCommonKeys, getCommonAPIResponse } = require('../common/main');
const { pool } = require('../sql/connectToDatabase');

const fetchMainImageTotalDownloadList = async (req, res) => {
    try {
        const getMainImage = {
            getQuery: `SELECT * FROM tbl_main_image_total_download ORDER BY MainImageTotalDownloadId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_main_image_total_download`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    } catch (error) {
        console.log('fetch Main Image Total Download List Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const fetchTotalImageDownloadList = async (req, res) => {
    const { count = 10 } = req.query;
    try {
        const mainImageList = await pool.query(`SELECT main.MainImageId, main.Image, sub.Title AS ImageSubCategoryTitle, cat.Title AS ImageCategoryTitle FROM tbl_main_image As main LEFT JOIN tbl_image_subcategory As sub ON main.ImageSubCategoryId = sub.ImageSubCategoryId LEFT JOIN tbl_image_category As cat ON main.ImageCategoryId = cat.ImageCategoryId`);
        const mainImageTotalDownloadList = await pool.query(`SELECT MainImageId FROM tbl_main_image_total_download`);
        const mainImageTotalDownloadListCount = mainImageList.recordset.map(item => {
            const totalDownload = mainImageTotalDownloadList.recordset.filter(item2 => item2.MainImageId === item.MainImageId).length;
            return {
                ...item,
                totalDownload: totalDownload
            }
        }).sort((a, b) => b.totalDownload - a.totalDownload).slice(0, count);
        res.json({
            Success: true,
            data: mainImageTotalDownloadListCount,
            count: mainImageTotalDownloadListCount.length
        });
    } catch (error) {
        res.status(500).send(errorMessage(error?.message));
    }
} 

const addMainImageTotalDownload = async (req, res) => {
    try {
        const { MainImageId,
            UserId,
            ImageCategoryId,
            ImageSubCategoryId } = req.body;
        const missingKeys = await checkKeysAndRequireValues(['MainImageId',
            'UserId',
            'ImageCategoryId',
            'ImageSubCategoryId'], req.body);
        if (missingKeys.length !== 0) {
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_main_image_total_download (MainImageId,
            UserId,
            ImageCategoryId,
            ImageSubCategoryId,
            IPAddress, ServerName, EntryTime) VALUES ('${MainImageId}',
                '${UserId}',
                '${ImageCategoryId}',
                '${ImageSubCategoryId}', 
                '${IPAddress}', 
                '${ServerName}', 
                '${EntryTime}')`;
        const response = await pool.query(insertQuery);
        if (response.rowsAffected && response.rowsAffected[0] > 0) {
            return res.status(201).send(successMessage('Main image total download added successfully'));
        }
        return res.status(500).send(errorMessage('Failed to add main image total download'));
    } catch (error) {
        console.log('Add Main Image Total Download Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = {
    fetchMainImageTotalDownloadList,
    addMainImageTotalDownload,
    fetchTotalImageDownloadList
}