const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse, setSQLBooleanValue, getCommonAPIResponse, setSQLOrderId } = require('../common/main');
const { pool, sql } = require('../sql/connectToDatabase');

const fetchCompanyBankDetails = async(req, res)=>{
    try{
        const query = `select * from tbl_company_bank_details`;
        const result = await pool.request().query(query);
        const data = result.recordset[0];
        return res.status(200).json({Success : true, data : data});
    }catch(error){
        console.log('fetch company bank details error :', error);
        return res.status(500).send(errorMessage(error?.message));
    }
}

const updateCompanyBankDetails = async (req, res)=>{
    try{
        const {BankName ,AccountHolderName ,AccountNumber ,IFSCCode ,HSNCode} = req.body
        const missingKeys = checkKeysAndRequireValues(['BankName' ,'AccountHolderName' ,'AccountNumber' ,'IFSCCode' ,'HSNCode'], req.body);
        if(missingKeys.length > 0){
            return res.status(400).send(errorMessage(`${missingKeys} is required`))
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const query = `update tbl_company_bank_details SET BankName = '${BankName}' ,AccountHolderName = '${AccountHolderName}' ,AccountNumber = '${AccountNumber}' ,IFSCCode = '${IFSCCode}' ,HSNCode = '${HSNCode}' ,IPAddress = '${IPAddress}', ServerName = '${ServerName}', EntryTime = '${EntryTime}'`
        const result = await pool.request().query(query);
        if(result.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No row Updated of Company Bank Details.'))
        }
        return res.status(200).send(successMessage('Data Updated Successfully.'))
    }catch(error){
        console.log('Update Company Bank Details error :', error);
        return res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = {
    fetchCompanyBankDetails,
    updateCompanyBankDetails
}