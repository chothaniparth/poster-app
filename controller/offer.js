const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse } = require('../common/main');
const {setSQLBooleanValue} = require('../common/main');
const { onlyStatusTrue } = require('../common/search_query');
const { pool, sql } = require('../sql/connectToDatabase');
const {LIVE_URL} = require('../common/variable')
const fs = require('fs')

const fetchOfferList = async(req, res)=>{
    try{
        const result = await getAPIALLDataResponse(req, res, 'tbl_offer', 'OfferId');
        res.json(result);    
    }catch(error){
        console.log('Fetch Offerce Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const fetchOfferListInApp = async(req, res)=>{
    try{
        const result = await getAPIALLDataResponse(req, res, 'tbl_offer', 'OfferId', onlyStatusTrue);
        res.json(result);    
    }catch(error){
        console.log('Fetch Offerce Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const addOffer = async (req, res)=>{
    try{
        const {Status, Remark = ''} = req.body
        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : "";
        const fields = {
            Status : Status,
            Image : imageURL
        }
        const missingKeys = checkKeysAndRequireValues(['Status', 'Image'], fields);
        if (missingKeys.length > 0) {
            return res.status(400).send(errorMessage(`${missingKeys} is Required`));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `
        INSERT INTO tbl_offer (Status, Remark, Image, IPAddress, ServerName, EntryTime)
        VALUES 
        (${setSQLBooleanValue(Status)}, '${Remark}', '${imageURL}', '${IPAddress}', '${ServerName}', '${EntryTime}')
        `
        const result = await pool.query(insertQuery)
        if(result.rowsAffected[0] === 0){
            if (req?.files?.Image?.length) {
                await fs.unlinkSync(req?.files?.Image[0]?.path);
            }    
            return res.status(400).send(errorMessage('No row Inserted in Offer'))
        }
        return res.status(200).send(successMessage('Data Inserted Successfully.'))
    }catch(error){
        if (req?.files?.Image?.length) {
            await fs.unlinkSync(req?.files?.Image[0]?.path);
        }
        console.log('Fetch Offerce Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const removeOffer = async (req, res)=>{
    try{
        const {OfferId} = req.query
        const missingKeys = checkKeysAndRequireValues(['OfferId'], req.query)
        if (missingKeys.length > 0) {
            return res.status(400).send(errorMessage(`${missingKeys} is Required`));
        }
        const getImage = await pool.query(`select Image from tbl_offer where OfferId = ${OfferId}`)
        const deleteResult = await pool.query(`delete from tbl_offer where OfferId = ${OfferId}`)
        if (deleteResult.rowsAffected[0] === 0) {
            return res.status(400).send(errorMessage('No row Deleted of Offers'));
        }
        if(getImage.recordset.length > 0){
            fs.unlinkSync(getImage.recordset[0].Image.replace(LIVE_URL,`../TaxFilePosterMedia/offer`));
        }
        return res.status(200).send(successMessage('Data deleted successfully!'));
    }catch(error){
        console.log('Fetch Offerce Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const updateOffer = async (req, res)=>{
    try{
        const {Status, Remark = '', OfferId, Image} = req.body
        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : Image;
        const fields = {
            Status : Status,
            Image : imageURL,
            OfferId : OfferId
        }
        const missingKeys = checkKeysAndRequireValues(['Status', 'Image', 'OfferId'], fields);
        if (missingKeys.length > 0) {
            if (req?.files?.Image?.length) {
                await fs.unlinkSync(req?.files?.Image[0]?.path);
            }    
            return res.status(400).send(errorMessage(`${missingKeys} is Required`));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const oldImage = await pool.query(`select Image from tbl_offer where offerId = ${OfferId}`)
        const updateQuery = `update tbl_offer set Status = '${Status}', Image = '${imageURL}', Remark = '${Remark}', IPAddress = '${IPAddress}', ServerName = '${ServerName}', EntryTime = '${EntryTime}' where OfferId = ${OfferId}`
        const result = await pool.query(updateQuery);
        if(result.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No row Updated of Offer'));
        }
        if(req?.files?.Image?.length && oldImage.recordset.length > 0){
            fs.unlinkSync(oldImage.recordset[0].Image.replace(LIVE_URL,`../TaxFilePosterMedia/offer`));
        }
        return res.status(200).send(successMessage('Data Updated Successfully.'))
    }catch(error){
        if (req?.files?.Image) {
            await fs.unlinkSync(req?.files?.Image[0]?.path);
        }    
        console.log('Fetch Offerce Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

module.exports = {
    fetchOfferList,
    addOffer,
    removeOffer,
    updateOffer,
    fetchOfferListInApp
}