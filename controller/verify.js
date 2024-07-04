const jwt = require('jsonwebtoken');
const { successMessage, checkKeysAndRequireValues, errorMessage } = require('../common/main');
const { pool } = require('../sql/connectToDatabase');
const { SECRET_KEY } = require('../common/variable');

const verifyHandler = async (req, res) => {
    try {
        const { RegisterMobile } = req.body;
        const missingKeys = checkKeysAndRequireValues(['RegisterMobile'], { ...req.body })
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }

        const verifyUser = await pool.request().query(`SELECT * FROM tbl_users where RegisterMobile = '${RegisterMobile}' AND Status = 1`);
        if(verifyUser?.recordset?.length === 0) {
            return res.send({...successMessage('User not found'), verify: false });
        }

        const { MobileNumber = RegisterMobile, Category } = verifyUser?.recordset[0];

        const options = { expiresIn: '7d' }; // Token expiration time

        const token = jwt.sign({ MobileNumber, Category }, SECRET_KEY, options);

        res.status(200).send({...successMessage('User verified'), verify: true, token });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const verifyAdminHandler = async (req, res) => {
    try {
        const { RegisterMobile } = req.body;
        const missingKeys = checkKeysAndRequireValues(['RegisterMobile'], { ...req.body })
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }

        const verifyUser = await pool.request().query(`SELECT * FROM tbl_users where RegisterMobile = '${RegisterMobile}' AND Role = 'Admin' AND Status = 1`);

        if (verifyUser?.recordset?.length === 0) {
            return res.send({ ...errorMessage('Admin not found'), verify: false });
        }

        res.status(200).send({ ...successMessage('Admin verified'), verify: true });
    } catch (error) {

    }
}

const verifyUserHandler = async (req, res) => {
    try {
        const { RegisterMobile } = req.body;
        const missingKeys = checkKeysAndRequireValues(['RegisterMobile'], { ...req.body })
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }

        const verifyUser = await pool.request().query(`SELECT * FROM tbl_users where RegisterMobile = '${RegisterMobile}' AND Status = 1`);

        if (verifyUser?.recordset?.length === 0) {
            return res.send({ ...errorMessage('User not found'), verify: false });
        }

        res.status(200).send({ ...successMessage('User verified'), verify: true });
    } catch (error) {

    }
}
        

module.exports = {
    verifyHandler,
    verifyAdminHandler,
    verifyUserHandler
}
