const jwt = require('jsonwebtoken');
const { successMessage, checkKeysAndRequireValues, errorMessage } = require('../common/main');
const { pool } = require('../sql/connectToDatabase');
const { SECRET_KEY } = require('../common/variable');

const regenerateTokenHandler = async (req, res) => {
    try {
        const { RegisterMobile, Category } = req.body;
        const missingKeys = checkKeysAndRequireValues(['RegisterMobile', 'Category'], { ...req.body })
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }
        const verifyUser = await pool.request().query(`SELECT * FROM tbl_users where RegisterMobile = '${RegisterMobile}' AND Category = '${Category}'`);
        if(verifyUser?.recordset?.length === 0) {
            return res.send({...successMessage('User not found')});
        }
        const options = { expiresIn: '7d' }; // Token expiration time
        const token = jwt.sign({ MobileNumber: RegisterMobile, Category }, SECRET_KEY, options);
        if(verifyUser.recordset[0].Role === "Admin"){
            Admin = true;
        }
        res.status(200).send({...successMessage('Re-generate token successfully!'), token, Mobile: RegisterMobile });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = {
    regenerateTokenHandler
}
