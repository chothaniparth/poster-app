const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse, getCommonAPIResponse, setSQLStringValue } = require('../common/main');
const {setSQLBooleanValue} = require('../common/main');
const { onlyStatusTrue } = require('../common/search_query');
const { pool, sql } = require('../sql/connectToDatabase');
const { autoVerifySubscription } = require('./autoRunQuery');
const converter = require('number-to-words');

const calculateTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    console.log('start date :', start);
    console.log('end date :', end);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log('diffDays :', diffDays);
    return diffDays;
}

const calculateInvoice = (originalPrice, discountPrice) => {
    const gstRate = 9;
    const gstFactor = 1 + (gstRate / 100) * 2;

    // Calculate initial value excluding GST
    const initialValue = discountPrice / gstFactor;

    // Calculate CGST and SGST based on initial value
    let cgst = initialValue * (gstRate / 100);
    let sgst = initialValue * (gstRate / 100);

    // Round CGST and SGST to two decimal places
    cgst = parseFloat(cgst.toFixed(2));
    sgst = parseFloat(sgst.toFixed(2));

    // Calculate TotalPrice
    const totalPrice = discountPrice - cgst - sgst;

    // Ensure TotalPrice is rounded to two decimal places
    const roundedTotalPrice = parseFloat(totalPrice.toFixed(2));

    // Calculate the discount
    const discount = originalPrice - roundedTotalPrice;

    // Return the calculated values as numbers with two decimal places
    return {
        CGST: cgst,
        SGST: sgst,
        TotalPrice: roundedTotalPrice,
        Discount: parseFloat(discount.toFixed(2)),
        GrandTotalPrice: parseFloat(discountPrice.toFixed(2))
    };
};
// Function to pad a number with leading zeros
function padNumber(number, length) {
    return number.toString().padStart(length, '0');
}


// Function to generate an invoice number
function generateInvoiceNumber(lastInvoiceNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
    const month = padNumber(date.getMonth() + 1, 2); // Get month and pad with leading zero if necessary

    let nextSequence = 1; // Default starting sequence number
    if (lastInvoiceNumber) {
        const lastYearMonth = lastInvoiceNumber.slice(0, 4);
        const currentYearMonth = year + month;
        
        if (lastYearMonth === currentYearMonth) {
            // Extract the last sequence number and increment it
            const lastSequence = parseInt(lastInvoiceNumber.slice(4), 10);
            nextSequence = lastSequence + 1;
        }
    }

    // Pad the sequence number to 4 digits
    const sequenceNumber = padNumber(nextSequence, 4);

    // Generate the invoice number
    const invoiceNumber = year + month + sequenceNumber;

    return invoiceNumber;
}


const fetchSubscriptionList = async (req, res) => {
    const { Status } = req.query
    let status = ''
    if (Status) {
        status = `WHERE sub.PlanStatus = '${Status}'`
    }
    const getMainImage = {
        getQuery: `SELECT sub.*, users.BussinessName FROM tbl_subscription As sub
LEFT JOIN tbl_users As users ON users.UserId = sub.UserId ${status} ORDER BY SubscriptionId DESC`,
        countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_subscription As sub ${status}`,
    };
    const result = await getCommonAPIResponse(req, res, getMainImage);
    res.json(result);
}

const fetchSubscriptionListById = async (req, res)=>{
    try{
        const {SubscriptionId} = req.query
        const missingKey = checkKeysAndRequireValues(['SubscriptionId'], req.query)
        if(missingKey.length > 0){
            return res.status(400).send(errorMessage(`${missingKey} is required`))
        }
        const fetchQuery = `select * from tbl_subscription where SubscriptionId = ${SubscriptionId}`
        const result = await pool.query(fetchQuery)
        const data = result.recordset
        return res.status(200).json({Success : true, data : data})
    }catch(error){
        console.log('Fetch Subscription Ny Id Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const fetchSubscriptionByUserId = async(req, res)=>{
    try{
        const {UserId} = req.query
        const missingKey = checkKeysAndRequireValues(['UserId'], req.query)
        if(missingKey.length > 0){
            return res.status(400).send(errorMessage(`${missingKey} is Required`))
        }
        const fetchQuery = `SELECT * FROM tbl_subscription WHERE UserId = ${UserId}`;
        const result = await pool.query(fetchQuery);
        const data = result.recordset
        return res.status(200).json({Success : true, data : data, currentDate : new Date()});
    }catch(error){
        console.log('fetch Subscription By UserId Error :', error);
        return res.status(500).send(errorMessage(error?.message));
    }
}

const fetchNotActivePlanUserList = async(req, res)=>{
    try {
        const fetchQuery = `SELECT 
    users.BussinessName, 
    sub.PlanStatus,
    users.UserId
FROM 
    tbl_users AS users
LEFT JOIN 
    tbl_subscription AS sub ON sub.UserId = users.UserId
WHERE 
    sub.UserId IS NULL OR sub.PlanStatus <> 'Active';
`;

const result = await pool.query(fetchQuery);
const data = result.recordset
return res.status(200).json({Success : true, data : data})
    } catch (error) {
        console.log('Fetch Not Active Plan User List Error :', error);
        return res.status(500).send(errorMessage(error?.message));
        
    }
}

const addSubscription = async (req, res)=>{
    try{
        const {Type, OriginalPrice = 0, DiscountedPrice = 0, TotalDays = 0, StartDate, EndDate, UserId, PaymentId, OrderId, Signature, Remark, GSTName, GSTNumber, InvoiceDate, TrialPlan = false} = req.body;
        const missingKeys = checkKeysAndRequireValues(['Type', 'StartDate', 'EndDate', 'UserId', 'PaymentId', 'InvoiceDate'], req.body)
        if(missingKeys.length > 0){
            return res.status(400).send(`${missingKeys} is required`);
        }
        const checkTrialPlan = await pool.request().query(`SELECT * FROM tbl_subscription WHERE UserId = ${UserId} AND TrialPlan = 1`);
        if(checkTrialPlan.recordset.length > 0){
            return res.status(400).send(errorMessage('Trial Plan Already Used For This Registered User!'));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const { CGST, SGST, TotalPrice, GrandTotalPrice, Discount } = calculateInvoice(OriginalPrice, DiscountedPrice);
        let lastInvoiceNumber;
        const maxSubscriptionId = await pool.request().query(`SELECT SubscriptionId, InvoiceNo
            FROM tbl_subscription
            WHERE SubscriptionId = (SELECT MAX(SubscriptionId) FROM tbl_subscription)`);
            if(maxSubscriptionId.recordset.length > 0){
                lastInvoiceNumber = maxSubscriptionId.recordset[0].InvoiceNo
            } 
        // const 

        // Generate a new invoice number
        const newInvoiceNumber = generateInvoiceNumber(lastInvoiceNumber);
        const insertQuery = `INSERT INTO tbl_subscription (Type, OriginalPrice, DiscountedPrice, TotalDays, StartDate, EndDate, UserId, PaymentId, OrderId, Signature, Remark, GSTName, GSTNumber, CGST, SGST, TotalPrice, GrandTotalPrice, Discount, TrialPlan, IPAddress, ServerName, EntryTime, AmountInWord, InvoiceDate, InvoiceNo) VALUES ('${Type}', ${OriginalPrice}, ${DiscountedPrice}, ${TotalDays}, '${StartDate}', '${EndDate}', ${UserId}, '${PaymentId}', '${OrderId}', '${Signature}', '${Remark}', ${setSQLStringValue(GSTName)}, ${setSQLStringValue(GSTNumber)}, ${CGST}, ${SGST}, ${TotalPrice}, ${GrandTotalPrice}, ${Discount}, ${setSQLBooleanValue(TrialPlan)}, '${IPAddress}', '${ServerName}', '${EntryTime}', '${converter.toWords(GrandTotalPrice).toUpperCase()} ONLY', '${InvoiceDate}', '${newInvoiceNumber}')`;
        const result = await pool.query(insertQuery)
        if(result.rowsAffected[0] === 0){
            return res.status(400).send('No row Inserted in Subscription.');
        }
        await autoVerifySubscription();
        return res.status(200).send(successMessage('Data Inserted Successfully'));
    }catch(error){
        console.log('Fetch Subscription Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const removeSubscription = async (req, res)=>{
    try{
        const {SubscriptionId} = req.query
        const missingKey = checkKeysAndRequireValues(['SubscriptionId'], req.query)
        if(missingKey.length > 0){
            return res.status(400).send(errorMessage(`${missingKey} is required`))
        }
        const deleteQuery = `DELETE FROM tbl_subscription WHERE SubscriptionId = ${SubscriptionId}`
        const result = await pool.query(deleteQuery)
        if(result.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No row deleted in Subscription.'));
        }
        return res.status(200).send(successMessage('Data Deleted Successfully'))
    }catch(error){
        console.log('Delete Subscription Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const updateSubscription = async (req, res)=>{
    try{
        const { SubscriptionId, Type, OriginalPrice = 0, DiscountedPrice = 0, TotalDays = 0, StartDate, EndDate, Remark, GSTName, GSTNumber, UserId, InvoiceDate, TrialPlan = false} = req.body;
        const missingKeys = checkKeysAndRequireValues(['Type', 'StartDate', 'EndDate', 'SubscriptionId', 'UserId', 'InvoiceDate'], req.body)
        if(missingKeys.length > 0){
            return res.status(400).send(`${missingKeys} is required`);
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const { CGST, SGST, TotalPrice, GrandTotalPrice, Discount } = calculateInvoice(OriginalPrice, DiscountedPrice);
        const updateQuery = `UPDATE tbl_subscription SET Type = '${Type}', OriginalPrice = ${OriginalPrice}, DiscountedPrice = ${DiscountedPrice}, TotalDays = ${TotalDays}, StartDate = '${StartDate}', EndDate = '${EndDate}', Remark = '${Remark}', GSTName = ${setSQLStringValue(GSTName)}, GSTNumber = ${setSQLStringValue(GSTNumber)}, CGST = ${CGST}, SGST = ${SGST}, TotalPrice = ${TotalPrice}, GrandTotalPrice = ${GrandTotalPrice}, Discount = ${Discount}, IPAddress = '${IPAddress}', ServerName = '${ServerName}', EntryTime = '${EntryTime}', AmountInWord = '${converter.toWords(GrandTotalPrice).toUpperCase()} ONLY', InvoiceDate = '${InvoiceDate}', TrialPlan = ${setSQLBooleanValue(TrialPlan)} WHERE SubscriptionId = ${SubscriptionId} AND UserId = ${UserId}`
        const result = await pool.query(updateQuery)
        if(result.rowsAffected[0] === 0){
            return res.status(400).send('No row Update in Subscription.');
        }
        await autoVerifySubscription();
        return res.status(200).send(successMessage('Data Update Successfully'))
    }catch(error){
        console.log('Update Subscription Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

module.exports = {
    fetchNotActivePlanUserList,
    addSubscription,
    fetchSubscriptionList,
    removeSubscription,
    updateSubscription,
    fetchSubscriptionListById,
    fetchSubscriptionByUserId
}