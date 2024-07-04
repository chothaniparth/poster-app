const Razorpay = require("razorpay");
const { errorMessage, checkKeysAndRequireValues } = require("../common/main");
const { pool } = require("../sql/connectToDatabase");

const getPaymentDetails = async (req, res) => {
    try {
        const { PaymentID } = req.query
        const missingKey = checkKeysAndRequireValues(['PaymentID'], req.query)
        if (missingKey.length > 0) {
            return res.status(400).send(errorMessage(`${missingKey} is required`))
        }
        const razorpayQuery = await pool.query('SELECT * FROM tbl_razorpay_credentials')
        if(!razorpayQuery?.recordset?.length){
            return res.status(404).send(errorMessage('Razorpay credentials not found'))
        }

        const { KeyId, SecretKey } = razorpayQuery?.recordset[0]
        const razorpay = new Razorpay({
            key_id: KeyId,
            key_secret: SecretKey
        })

        const response = await razorpay.payments.fetch(PaymentID);
        if(!response){
            return res.status(404).send(errorMessage('Payment not found'))
        }

        return res.status(200).json({ Success: true, data: response });
    } catch (error) {
        console.log('error :', error);
        return res.status(500).send(errorMessage(error?.message || error?.error?.description));
    }
};

const createPayment = async (req, res) => {
    try {
        const { Amount } = req.body
        const missingKey = checkKeysAndRequireValues(['Amount'], req.body)
        if (missingKey.length > 0) {
            return res.status(400).send(errorMessage(`${missingKey} is required`))
        }
        const razorpayQuery = await pool.query('SELECT * FROM tbl_razorpay_credentials')
        if(!razorpayQuery?.recordset?.length){
            return res.status(404).send(errorMessage('Razorpay credentials not found'))
        }

        const { KeyId, SecretKey } = razorpayQuery?.recordset[0]
        const razorpay = new Razorpay({
            key_id: KeyId,
            key_secret: SecretKey
        })
        const response = await razorpay.orders.create({
            amount: Amount * 100,
            currency: 'INR',
        })
        return res.status(200).json({ Success: true, data: response });
    } catch (error) {   
        console.log('error :', error);
        return res.status(500).send(errorMessage(error?.message || error?.error?.description));
    }
}   

module.exports = { getPaymentDetails, createPayment }