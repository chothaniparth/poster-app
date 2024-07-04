const { checkKeysAndRequireValues, errorMessage, successMessage, getCommonKeys, safeUnlink, getAPIALLDataResponse, setSQLOrderId, getCommonAPIResponse, setSQLBooleanValue, setSQLStringValue } = require('../common/main');
const { pool, sql } = require('../sql/connectToDatabase');
const fs = require('fs');
const { LIVE_URL } = require('../common/variable');

const fetchUserProfileList = async (req, res) => {
    try {
        const getMainImage = {
            getQuery: `SELECT * FROM tbl_user_profile ORDER BY UserProfileId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_user_profile`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    } catch (error) {
        console.log('fetch User Profile List Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const fetchUserProfileById = async (req, res) => {
    try {
        const { UserProfileId } = req.query;
        const missingKeys = checkKeysAndRequireValues(['UserProfileId'], req.query);
        if (missingKeys.length > 0) {
            return res.status(400).send(errorMessage(`${missingKeys} is Required`));
        }
        const getMainImage = {
            getQuery: `SELECT * FROM tbl_user_profile WHERE UserProfileId = ${UserProfileId}`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_user_profile WHERE UserProfileId = ${UserProfileId}`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    } catch (error) {
        console.log('fetch User Profile List Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}
const addUserProfile = async (req, res) => {
    try {
      const { UserId, Name, DOB = null, Gender, Designation = '', Mobile, Email = '', State = '', City = '' } = req.body;
  
      let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : "";
      const missingKeys = checkKeysAndRequireValues(['UserId', 'Name', 'Gender', 'Mobile'], req.body);
  
      if (missingKeys.length > 0) {
        if (req.files && req.files.Image && req.files.Image.length > 0) {
          safeUnlink(req.files.Image[0].path);
        }
        return res.status(400).send(errorMessage(`${missingKeys.join(', ')} is required`));
      }
      
      const { IPAddress, ServerName, EntryTime } = getCommonKeys();
      const insertQuery = `
        INSERT INTO tbl_user_profile (UserId, Name, DOB, Gender, Designation, Mobile, Email, Image, State, City, IPAddress, ServerName, EntryTime) VALUES (${UserId}, '${Name}', ${setSQLStringValue(DOB)}, '${Gender}', '${Designation}', '${Mobile}', '${Email}', '${imageURL}', '${State}', '${City}', '${IPAddress}', '${ServerName}', '${EntryTime}')`;
      const response = await pool.query(insertQuery);
      if (response.rowsAffected[0] === 0) {
        if (req.files && req.files.Image && req.files.Image.length > 0) {
          safeUnlink(req.files.Image[0].path);
        }
        return res.status(400).send(errorMessage('Failed to Insert new User Profile'));
      }
      return res.status(200).send(successMessage('User Profile Created Successfully'));
    } catch (error) {
      if (req.files && req.files.Image && req.files.Image.length > 0) {
        safeUnlink(req.files.Image[0].path);
      }
      console.log('Add User Profile Error :', error);
      return res.status(500).send(errorMessage(error?.message));
    }
  }
  
const updateUserProfile = async (req, res)=>{
    try{
        const {UserProfileId ,Name ,DOB = null ,Gender ,Designation = '' ,Mobile ,Email = '' ,Image = '',State = '' ,City = ''} = req.body

        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : Image;

        const missingKeys = checkKeysAndRequireValues(['UserProfileId' ,'Name' ,'Gender' ,'Mobile'], req.body)

        if (missingKeys.length > 0) {
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                safeUnlink(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage(`${missingKeys.join(', ')} is required`));
        }

        const oldImg = await pool.request().query(`SELECT Image FROM tbl_user_profile WHERE UserProfileId = ${UserProfileId}`)
        const { IPAddress, ServerName, EntryTime } = getCommonKeys()
        const updateQuery = `UPDATE tbl_user_profile SET Name = '${Name}', DOB = ${setSQLStringValue(DOB)}, Gender = '${Gender}', Designation = '${Designation}', Mobile ='${Mobile}' , Email='${Email}' , Image ='${imageURL}' , State= '${State}', City = '${City}', IPAddress = '${IPAddress}',ServerName = '${ServerName}' ,EntryTime = '${EntryTime}' WHERE UserProfileId = ${UserProfileId}`

        const response = await pool.query(updateQuery);
        if (response.rowsAffected[0] === 0) {
            if (req.files && req.files.Image && req.files.Image.length > 0) {
                safeUnlink(req.files.Image[0].path);
            }
            return res.status(400).send(errorMessage('Failed to Update User Profile'));
        }

        if(oldImg.recordset.length > 0 && oldImg.recordset?.[0].Image != ''){
        //    await fs.unlinkSync(oldImg.recordset[0].Image.replace(LIVE_URL, `../TaxFilePosterMedia/UserProfile`));
        safeUnlink(oldImg.recordset[0].Image.replace(LIVE_URL, `../TaxFilePosterMedia/UserProfile`));
    }

        return res.status(200).send(successMessage('User Profile Updated Successfully'));
    }catch(error){
        if (req.files && req.files.Image && req.files.Image.length > 0) {
            safeUnlink(req.files.Image[0].path);
          }    
        console.log('Update User Profile Error',error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const removeUserProfile = async (req, res)=>{
    try{
        const {UserProfileId} = req.query
        const missingKeys = checkKeysAndRequireValues(['UserProfileId'], req.query);
        if(missingKeys.length > 0){
            return res.status(400).send(errorMessage(`${missingKeys} is Required`));
        }
        const Image = await pool.request().query(`SELECT Image from tbl_user_profile WHERE UserProfileId = ${UserProfileId}`)
        const deleteQuery = `DELETE FROM tbl_user_profile WHERE UserProfileId =${UserProfileId}`
        const result = await pool.request().query(deleteQuery)
        if (result.rowsAffected[0] === 0) {
            return res.status(400).send(errorMessage('No rows Deleted of User Profile!'));
        }
        if (Image.recordset.length > 0) {
        safeUnlink(Image.recordset[0].Image.replace(LIVE_URL, `../TaxFilePosterMedia/UserProfile`));
        }    
        return res.status(200).send({ ...successMessage("Data Deleted Successfully!")});
    }catch(error){
        console.log('Remove User Profile Error', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const fetchStateList = async (req, res) => {
    try {
        const getMainImage = {
            getQuery: `SELECT * FROM State ORDER BY StateID ASC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM State`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    } catch (error) {
        res.status(500).send(errorMessage(error?.message));
    }
}

const fetchCityList = async (req, res) => {
    try {
        const getMainImage = {
            getQuery: `SELECT * FROM City ORDER BY CityID ASC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM City`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    } catch (error) {
        res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = {
    fetchUserProfileList,
    addUserProfile,
    updateUserProfile,
    removeUserProfile,
    fetchStateList,
    fetchCityList,
    fetchUserProfileById
}