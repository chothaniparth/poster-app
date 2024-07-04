const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse, setSQLBooleanValue, setSQLStringValue, safeUnlink } = require('../common/main');
const { SECRET_KEY, LIVE_URL } = require('../common/variable');
const jwt = require('jsonwebtoken');
const { pool, sql } = require('../sql/connectToDatabase');
const fs = require('fs');
const { setAutoDownloadLimit } = require('./autoRunQuery');

const checkFrameId = (arr, obj) => {
    let status = true;
    for (let i = 0; i < arr.length; i++) {
        if (!obj[arr[i]]) {
            status = false;
            break;
        }
    }
    return status;
}

const setFrameIdHandler = (obj) => {
    if(checkFrameId(['Mobile1', 'Mobile2', 'Email', 'Address', 'SocialLink'], obj)) {
        return 5;
    } else if(checkFrameId(['Mobile1', 'Mobile2', 'Email', 'SocialLink'], obj)) {
        return 4;
    } else if(checkFrameId(['Mobile1', 'Mobile2', 'Email', 'Address'], obj)) {
        return 4;
    } else if(checkFrameId(['Mobile1', 'Address', 'Email', 'SocialLink'], obj)) {
        return 4;
    } else if(checkFrameId(['Mobile1', 'Mobile2', 'Email'], obj)) {
        return 3;
    } else if(checkFrameId(['Mobile1', 'Email', 'SocialLink'], obj)) {
        return 3;
    } else if(checkFrameId(['Mobile1', 'Email', 'Address'], obj)) {
        return 3;
    } else  if(checkFrameId(['Mobile1', 'Email'], obj)) {
        return 2;
    } else {
        return 1;
    }
}

const fetchUserList = async (req, res) => {
    const result = await getAPIALLDataResponse(req, res, 'tbl_users', 'UserId');
    res.json(result);
};

const fetchUserListById = async (req, res) => {
    try {
        const { RegisterMobile } = req.query;
        const missingKeys = checkKeysAndRequireValues(['RegisterMobile'], req.query);
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }

        const result = await pool.request().query(`SELECT * FROM tbl_users where RegisterMobile = '${RegisterMobile}' AND Status = 1`);
        if(result?.recordset?.length === 0) {
            return res.status(400).send(errorMessage('User Information not found'));
        }

        res.status(200).send({
            data: { ...result?.recordset[0], FrameId: setFrameIdHandler(result?.recordset[0]) }, Success: true,
            status: 200,
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
   
}

const fetchUserListByUserId = async (req, res) => {
    try {
        const { UserId } = req.query;
        const missingKeys = checkKeysAndRequireValues(['UserId'], req.query);
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }

        const result = await pool.request().query(`SELECT * FROM tbl_users where UserId = '${UserId}'`);
        if(result?.recordset?.length === 0) {
            return res.status(400).send(errorMessage('User Information not found'));
        }

        res.status(200).send({
            data: { ...result?.recordset[0], FrameId: setFrameIdHandler(result?.recordset[0]) }, Success: true,
            status: 200,
        });
    } catch (error) {
        return res.status(500).send(errorMessage(error?.message));
    }
}

// Define a route to insert a new user
const addUserList = async (req, res) => {
    try {
        const { Category, BussinessName, Address = '', Mobile1, Mobile2 = '', Email, WebSite = '', RegisterMobile, Role = 'User', Status = true, SocialLink = '', WebsiteURL = '', InstagramURL = '', FacebookURL = '', YoutubeURL = '' } = req.body;

        let logoURL = req?.files?.logo?.length ? `${LIVE_URL}/${req?.files?.logo[0]?.filename}` : req?.body?.logo || "";

        const missingKeys = checkKeysAndRequireValues(['Category', 'Mobile1', 'Email', 'RegisterMobile', 'BussinessName'], req.body)
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }
        const {IPAddress, ServerName, EntryTime} = getCommonKeys();
        const checkUsers = await pool.request().query(`SELECT * FROM tbl_users where RegisterMobile = '${RegisterMobile}' AND Status = 1`);
        if(checkUsers?.recordset?.length > 0) {
            return res.status(400).send(errorMessage('User already exists with this register number!'));
        }
        const insertQuery = `INSERT INTO tbl_users (RegisterMobile, Category, BussinessName, Address, Mobile1, Mobile2, Email, WebSite, SocialLink, Logo, Role, Status, DownloadLimit, WebsiteURL, InstagramURL, FacebookURL, YoutubeURL, IPAddress, ServerName, EntryTime) VALUES ('${RegisterMobile}', '${Category}', '${BussinessName}', '${Address}', '${Mobile1}', '${Mobile2}', '${Email}', '${WebSite}', '${SocialLink}', '${logoURL}', '${Role}', ${setSQLBooleanValue(Status)}, 1, '${WebsiteURL}', '${InstagramURL}', '${FacebookURL}', '${YoutubeURL}', '${IPAddress}', '${ServerName}', '${EntryTime}')`;
        const result = await pool.query(insertQuery)

        if (result.rowsAffected[0] > 0) {
            const options = { expiresIn: '7d' }; // Token expiration time

            const token = jwt.sign({ RegisterMobile, Category }, SECRET_KEY, options);
    
            return res.status(200).send({...successMessage("Data inserted successfully!"), token}); // or any other success message
        } else {
            // await fs.unlinkSync(req?.files?.logo[0]?.path);
            safeUnlink(req?.files?.logo[0]?.path);
            return res.status(400).send(errorMessage('No rows inserted of registration!'));
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

// delete user
const removeUserListById = async (req, res) => {
    try {
        const query = req.query;
        const { UserId } = query;

        if (!UserId || isNaN(UserId)) {
            return res.status(400).send('Invalid value for parameter "UserId". Must be a valid number.');
        }
        const data = await pool.request().query(`SELECT * FROM tbl_users where UserId = ${UserId}`);

        // Execute the DELETE query
        const result = await pool.request()
            .input('UserId', sql.Int, UserId)
            .query('DELETE FROM tbl_users WHERE userID = @UserId');

        // Check if any rows were affected (indicating successful deletion)
        if (result.rowsAffected[0] > 0) {
            if(data.recordset[0].Logo) {
                // fs.unlinkSync(data.recordset[0].Logo.replace(LIVE_URL,`../TaxFilePosterMedia/Logo`));
                safeUnlink(data.recordset[0].Logo.replace(LIVE_URL,`../TaxFilePosterMedia/Logo`));
            }
            return res.status(200).send(successMessage('Data deleted successfully!'));
        } else {
            return res.status(404).send(errorMessage('User not found'));
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

//update user

const updateUserListById = async (req, res) => {

    try {
        const { UserId, Category, BussinessName, Address = '', Mobile1, Mobile2 = '', Email, WebSite = '', Role = 'User', Status = true, logo = null , RegisterMobile, SocialLink = '', WebsiteURL = '', InstagramURL = '', FacebookURL = '', YoutubeURL = '' } = req.body;
        const previousData = await pool.request().query(`SELECT * FROM tbl_users where UserId = ${UserId}`);
        if(previousData?.recordset?.length === 0) {
            return res.send(errorMessage('User not found'));
        }
        const checkUsers = await pool.request().query(`SELECT * FROM tbl_users where RegisterMobile = '${RegisterMobile}'`);
        if(checkUsers?.recordset?.some(user => user.Status) && checkUsers?.recordset?.length > 1 && Status == true) {
            return res.status(400).send(errorMessage('Already exists with this register number!'));
        }
        const previousDataView = previousData?.recordset[0]
        let logoURL = logo === "blank" ? null : logo || updateUploadFiles(req?.files?.logo, previousDataView.Logo, 'Logo');
        const missingKeys = checkKeysAndRequireValues(['RegisterMobile', 'Category', 'Mobile1', 'Email', 'BussinessName'], req.body)
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }
        const updatedQuery = `UPDATE tbl_users SET RegisterMobile = '${RegisterMobile}', Category = '${Category}', BussinessName = '${BussinessName}',Address = '${Address}',Mobile1 = '${Mobile1}',Mobile2 = '${Mobile2}',Email = '${Email}',WebSite = '${WebSite}', SocialLink = '${SocialLink}', Logo = ${setSQLStringValue(logoURL)}, Role = '${Role}', WebsiteURL = '${WebsiteURL}', InstagramURL = '${InstagramURL}', FacebookURL = '${FacebookURL}', YoutubeURL = '${YoutubeURL}',  Status = ${setSQLBooleanValue(Status)} WHERE UserId = '${UserId}'`;
        const result = await pool.query(updatedQuery)
        if (result.rowsAffected[0] > 0) {
            return res.status(200).send(successMessage("Data updated successfully!")); // or any other success message
        } else {
            if (req?.files?.logo?.length) {
                // await fs.unlinkSync(req?.files?.logo[0]?.path);
            }
            return res.status(400).send(errorMessage('No rows updated of registration!'));
        }
    } catch (error) {
        if (req?.files?.logo?.length) {
            // await fs.unlinkSync(req?.files?.logo[0]?.path);
            safeUnlink(req?.files?.logo[0]?.path);
        }
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const fetchUserSearchAPI = async(req, res)=>{
    try{
        const {search} = req.query
        if(!search){            
            return res.status(400).send(errorMessage('"search" value is required'))
        }
        const result = await pool.query(`select * from tbl_users where Role LIKE '%${search}%' OR UserId LIKE '%${search}%' OR Category LIKE '%${search}%' OR BussinessName LIKE '%${search}%' OR Address LIKE '%${search}%' OR RegisterMobile LIKE '%${search}%' OR Mobile1 LIKE '%${search}%' OR Mobile2 LIKE '%${search}%' OR Email LIKE '%${search}%' OR WebSite LIKE '%${search}%'`);
        return res.status(200).send({success : true, data : result.recordset})
    }catch(error){
        console.log('User search Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const decreaseImageDownloadLimit = async (req, res)=>{
    try{
        const {UserId} = req.query
        const missingKeys = checkKeysAndRequireValues(['UserId'], req.query)
        if(missingKeys.length > 0){
            return res.status(400).send(errorMessage(`${missingKeys} is Required`));
        }
        const userDetails = await pool.query(`Select * from tbl_users WHERE UserId = ${UserId}`);
        if(userDetails.recordset.length === 0){
            return res.status(400).send(errorMessage('invalid UserId'))
        }
        if(userDetails.recordset[0].DownloadLimit === 0){
            return res.status(200).send({
                Success : true,
                data : userDetails.recordset[0]
            })
        }
        const updateQuery = `UPDATE tbl_users  SET DownloadLimit = DownloadLimit - 1 WHERE UserId = ${UserId}`
        const result = await pool.query(updateQuery);
        if(result.rowsAffected[0] > 0){
            return res.status(200).send({
                Success : true,
                data : userDetails.recordset[0]
            })
        }
        return res.status(400).send(errorMessage());
    }catch(error){
        console.log('Decrease Image Download Limit Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const setAllDownloadLimit = async (req, res)=>{
    try{
        await setAutoDownloadLimit();
        return res.status(200).send({Success : true})
    }catch(error){
        console.log('Set All Download Limit Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

module.exports = {
    fetchUserList,
    addUserList,
    removeUserListById,
    updateUserListById,
    fetchUserListById,
    fetchUserSearchAPI,
    decreaseImageDownloadLimit,
    setAllDownloadLimit,
    fetchUserListByUserId
};