const { checkKeysAndRequireValues, errorMessage, successMessage, getCommonKeys, safeUnlink, getAPIALLDataResponse, setSQLOrderId, getCommonAPIResponse } = require('../common/main');
const { pool, sql } = require('../sql/connectToDatabase');
const { setSQLBooleanValue } = require('../common/main')
const fs = require('fs');
const { LIVE_URL } = require('../common/variable');
const { autoVerifyNotification } = require('./autoRunQuery');

const fetchUserNotificationView = async (req, res) => {
    const { UserId } = req.query;
    const missingKey = checkKeysAndRequireValues(['UserId'], req.query);
    if (missingKey.length > 0) {
        return res.status(400).send(errorMessage(`${missingKey} is required`));
    }
    const notification = await pool.request().query(`SELECT * FROM tbl_notification WHERE NotificationStatus = 'Active' AND Status = 1 ORDER BY NotificationId DESC`);
    const userNotification = await pool.request().query(`SELECT * FROM tbl_notification_user WHERE UserId = '${UserId}'`);
    const updateNotification = notification.recordset.map(notification => {
        const user = userNotification.recordset.find(user => user.NotificationId === notification.NotificationId);
        if (!user) return {
            ...notification,
            read: false
        };
        return { ...notification, read: true };
    })
    res.json({
        Success: true,
        data: updateNotification
    });
}

const fetchNotification = async (req, res) => {
    try {
        const { Status } = req.query;
        let status = '';
        if (Status === 'true') {
            status = 'WHERE Status = 1';
        }
        const getMainImage = {
            getQuery: `SELECT * FROM tbl_notification ${status} ORDER BY NotificationId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_notification ${status}`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    } catch (error) {
        console.log('fetch Notification Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const addNotification = async (req, res) => {
    try {
        const {
            Title,
            Description,
            StartDate,
            EndDate,
            Status,
            MainImageId,
            Link,
            LinkType
        } = req.body
        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : "";

        const missingKeys = checkKeysAndRequireValues(['Title', 'Description', 'StartDate', 'EndDate', 'Status', 'MainImageId', 'Link', 'LinkType'], req.body);

        if (missingKeys.length !== 0) {
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                safeUnlink(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }

        const { IPAddress, ServerName, EntryTime } = getCommonKeys();

        const insertQuery = `INSERT INTO tbl_notification (Title
            ,Description
            ,Image
            ,StartDate
            ,EndDate
            ,Status 
            ,MainImageId 
            ,Link 
            ,LinkType
            ,IPAddress
            ,ServerName
            ,EntryTime
        ) VALUES (
            '${Title}', 
            '${Description}', 
            '${imageURL}',
            '${StartDate}',
            '${EndDate}',
            ${setSQLBooleanValue(Status)},
            ${MainImageId},
            '${Link}',
            '${LinkType}',
            '${IPAddress}', 
            '${ServerName}', 
            '${EntryTime}'
        )`;
        const response = await pool.query(insertQuery);

        if (response.rowsAffected && response.rowsAffected[0] === 0) {
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                safeUnlink(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage('Failed to Add Notification'));
        }
        await autoVerifyNotification();
        return res.status(200).send(successMessage('Notification added successfully'));
    } catch (error) {
        if (req.files && req.files.Image && req.files.Image.length > 0) {
            safeUnlink(req.files.Image[0].path);
        }
        console.log('fetch Notification Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const updateNotification = async (req, res) => {
    try {
        const {
            NotificationId,
            Title,
            Description,
            StartDate,
            EndDate,
            Status,
            MainImageId,
            Link,
            LinkType,
            Image = ''
        } = req.body;

        // Check if required fields are present
        const missingKey = checkKeysAndRequireValues([
            'NotificationId',
            'Title',
            'Description',
            'StartDate',
            'EndDate',
            'Status',
            'MainImageId',
            'Link',
            'LinkType'
        ], req.body); // Pass req.body to the function

        if(missingKey.length !== 0){
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                safeUnlink(req.files.Image[0].path);
            }    
            return res.status(400).send(errorMessage(`${missingKey   } is required`));
        }
        const oldImage = await pool.request().query(`SELECT Image FROM tbl_notification WHERE NotificationId = ${NotificationId}`);

        if (oldImage.recordset.length === 0) {
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                safeUnlink(req?.files?.Image[0]?.path);
            }
            return res.status(400).send(errorMessage('Notification not found'));
        }

        let imageURL = Image;
        if (req.files && req.files.Image && req.files.Image.length > 0) {
            imageURL = `${LIVE_URL}/${req.files.Image[0].filename}`;
        }

        const { IPAddress, ServerName, EntryTime } = getCommonKeys();

        const updateQuery = `UPDATE tbl_notification SET 
            Title = '${Title}', 
            Description = '${Description}',
            Image = '${imageURL}',
            StartDate= '${StartDate}',
            EndDate= '${EndDate}',
            Status = ${setSQLBooleanValue(Status)},
            MainImageId = ${MainImageId}, 
            Link = '${Link}', 
            LinkType = '${LinkType}',
            IPAddress = '${IPAddress}', 
            ServerName = '${ServerName}', 
            EntryTime = '${EntryTime}'
            WHERE NotificationId = ${NotificationId}`;

        const response = await pool.query(updateQuery);

        if (response.rowsAffected && response.rowsAffected[0] > 0) {
            if (req.files && req.files.Image && req.files.Image.length > 0 && oldImage.recordset.length > 0 && oldImage.recordset[0].Image != '') {
                safeUnlink(oldImage.recordset[0].Image.replace(LIVE_URL, `../TaxFilePosterMedia/Notification`));
            }
            await autoVerifyNotification();
            return res.status(201).send(successMessage('Notification updated successfully'));
        }

        return res.status(400).send(errorMessage('No row Updated of Notification.'));
    } catch (error) {
        if (req.files && req.files.Image && req.files.Image.length > 0) {
            safeUnlink(req?.files?.Image[0]?.path);
        }
        console.log('fetch Notification Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const removeNotification = async (req, res) => {
    try {
        const { NotificationId } = req.query;
        const missingKey = checkKeysAndRequireValues(['NotificationId'], req.query);
        if (missingKey.length > 0) {
            return res.status(400).send(errorMessage(`${missingKey} is required`));
        }
        const oldImage = await pool.request().query(`SELECT Image FROM tbl_notification WHERE NotificationId = ${NotificationId}`);
        const deleteQuery = `DELETE FROM tbl_notification WHERE NotificationId = ${NotificationId}`;
        const response = await pool.query(deleteQuery);
        
        if(response.rowsAffected && response.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('Failed to remove notification'));
        }
        if (oldImage.recordset[0].Image) {
            safeUnlink(oldImage.recordset[0].Image.replace(LIVE_URL, `../TaxFilePosterMedia/Notification`));
        }
        return res.status(200).send(successMessage('Notification removed successfully'));
    } catch (error) {
        console.log('remove Notification Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = {
    fetchUserNotificationView,
    fetchNotification,
    addNotification,
    updateNotification,
    removeNotification,
}