const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse } = require('../common/main');
const {setSQLBooleanValue} = require('../common/main');
const { pool, sql } = require('../sql/connectToDatabase');

const fetchPlanPricingList = async (req, res)=>{
    try{
        const result = await getAPIALLDataResponse(req, res, 'tbl_plan_pricing', 'PlanPricingId');
        res.json(result);    
    }catch(error){
        console.log('Fetch plan Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const updatePlanPricing = async(req, res)=>{
    try{
        const {PlanPricingId, Title, OriginalPrice, DiscountedPrice, TotalDays, Percentage} = req.body
        const fieldCheck = checkKeysAndRequireValues(['PlanPricingId', 'Title', 'OriginalPrice', 'DiscountedPrice', 'TotalDays', 'Percentage'], req.body)
        if(fieldCheck.length !== 0){
            return res.status(400).send(`${fieldCheck} is Required.`);
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const updateQuery = `UPDATE tbl_plan_pricing SET Title = '${Title}', OriginalPrice = ${OriginalPrice}, DiscountedPrice = ${DiscountedPrice}, TotalDays = '${TotalDays}', Percentage = ${Percentage}, IPAddress = '${IPAddress}', ServerName = '${ServerName}', EntryTime = '${EntryTime}'  WHERE PlanPricingId = ${PlanPricingId}`
        const result = await pool.query(updateQuery);
        if(result.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No row Updated of Plan Pricing'))
        }
        return res.status(200).send(successMessage('data updated successfully'))
    }catch(error){
        console.log('update Plan Pricing Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

module.exports = {
    fetchPlanPricingList,
    updatePlanPricing
}