//SegmentId ,UserId ,Title ,Description ,Image
const { checkKeysAndRequireValues, errorMessage, successMessage, getCommonKeys, safeUnlink, getCommonAPIResponse } = require('../common/main');
const { pool, sql } = require('../sql/connectToDatabase');
const { setSQLBooleanValue } = require('../common/main')
const fs = require('fs').promises;
const { LIVE_URL } = require('../common/variable');

const fetchRequestPerSegmentList = async (req, res)=>{
    try{
        const { Status } = req.query;
        let status = '';
        if (Status === 'true') {
            status = 'WHERE Status = 1';
        }
        const getMainImage = {
            getQuery: `SELECT * FROM tbl_request_per_segment ${status} ORDER BY  SegmentId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_request_per_segment ${status}`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    }catch(error){
        console.log('fetch Request Per Segment Error:', error);
        return res.status(500).sned(errorMessage(error?.message));
    }
}

const addRequestPerSegment = async (req, res)=>{
    try{
        const {UserId ,Title ,Description} = req.body
        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : "";
        const requiredFields = {
            UserId ,Title ,Description, Image : imageURL
        }
        const missingKeys = await checkKeysAndRequireValues(['UserId', 'Title', 'Description', 'Image'], requiredFields);
        if(missingKeys.length !== 0){
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                safeUnlink(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_request_per_segment (UserId ,Title ,Description , Image, IPAddress, ServerName, EntryTime) VALUES (${UserId} ,'${Title}' ,'${Description}' ,'${imageURL}' ,'${IPAddress}' ,'${ServerName}' ,'${EntryTime}')`
        const result = await pool.query(insertQuery);
        if (result.rowsAffected[0] === 0) {
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                safeUnlink(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage('No rows inserted of Request Per Segment!'));
        }
        return res.status(200).send(successMessage("Data inserted successfully!"));
    }catch(error){
        if (req.files && req.files.Image && req.files.Image.length > 0) {
            safeUnlink(req.files.Image[0].path);
        }
        console.log('Add Request Per Segment Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const removeRequestPerSegment = async (req, res) => {
    try{
        const { SegmentId } = req.query
        const missingKeys = await checkKeysAndRequireValues(['SegmentId'], req.query);
        if(missingKeys.length !== 0){
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        const oldImage = await pool.query(`SELECT Image FROM tbl_request_per_segment WHERE SegmentId = ${SegmentId}`);
        if(oldImage.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No rows found of Request Per Segment!'));
        }
        const deleteQuery = `DELETE FROM tbl_request_per_segment WHERE SegmentId = ${SegmentId}`;
        const result = await pool.query(deleteQuery);
        if(result.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No rows deleted of Request Per Segment!'));
        }
        if(oldImage.recordset[0].Image && oldImage.recordset[0].Image !== ''){
            safeUnlink(oldImage.recordset[0].Image.replace(LIVE_URL, `../TaxFilePosterMedia/RequestPerSegment`));
        }
        return res.status(200).send(successMessage('Request Per Segment removed Successfully!'));
    }catch(error){
        console.log('Delete Request Per Segment Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = {
    fetchRequestPerSegmentList, 
    addRequestPerSegment,
    removeRequestPerSegment,
}