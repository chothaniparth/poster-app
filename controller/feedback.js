const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse, setSQLBooleanValue } = require('../common/main');
const { onlyStatusTrue } = require('../common/search_query');

const { pool, sql } = require('../sql/connectToDatabase');

const fetchFeedbackList = async (req, res) => {
    try {
        const result = await getAPIALLDataResponse(req, res, 'tbl_feedback', 'FeedbackId');
        res.json(result);
    } catch (error) {
        console.log('error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const addFeedback = async (req, res) => {
    try {
        const { Name, Email, Message } = req.body
        const missingKeys = checkKeysAndRequireValues(['Name', 'Email', 'Message'], req.body);
        if (missingKeys.length !== 0) {
            return res.status(404).send(`${missingKeys} is required`)
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_feedback (Name, Email, Message, IPAddress, ServerName, EntryTime) values ('${Name}', '${Email}', '${Message}', '${IPAddress}', '${ServerName}', '${EntryTime}')`
        const response = await pool.query(insertQuery);
        if (response.rowsAffected[0] > 0) {
            return res.status(200).send(successMessage("Data inserted successfully!"));
        } else {
            return res.status(400).send(errorMessage('No rows inserted of Feedback!'));
        }
    } catch (error) {
        console.log('error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const removeFeedback = async (req, res) => {
    try {
        const { FeedbackId } = req.query
        const missingKeys = checkKeysAndRequireValues(['FeedbackId'], req.query);
        if (missingKeys.length !== 0) {
            return res.status(404).send(errorMessage(`${missingKeys} is required`))
        }
        const deleteQuery = `delete from tbl_feedback where FeedbackId = ${FeedbackId}`;
        const result = await pool.query(deleteQuery)
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send(errorMessage('No row deleted of Feedback!'))
        }
        return res.status(200).send(successMessage('Data deleted successfully!'))
    } catch (error) {
        console.log('error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

module.exports = {
    fetchFeedbackList,
    addFeedback,
    removeFeedback
}