const { checkKeysAndRequireValues, errorMessage, successMessage, getCommonKeys, getAPIALLDataResponse, setSQLOrderId, getCommonAPIResponse } = require('../common/main');
const {setSQLBooleanValue} = require('../common/main');
const { onlyStatusTrue } = require('../common/search_query');
const { pool, sql } = require('../sql/connectToDatabase');

const fetchFAQQuestionList = async (req, res) => {
    try {
        const { Status } = req.query;
        let status = '';
        if (Status === 'true') {
            status = 'WHERE faqQuestion.Status = 1';
        }
        const getMainImage = {
            getQuery: `SELECT faqQuestion.*, faqCategory.Title AS faqCategoryTitle FROM tbl_faq_question AS faqQuestion
            LEFT JOIN tbl_faq_category AS faqCategory ON faqQuestion.FAQCategoryId = faqCategory.FAQCategoryId ${status} 
            ORDER BY FAQQuestionId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_faq_question AS faqQuestion ${status}`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    } catch (error) {
        console.log('fetch FAQ Question error :', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const addFAQQuestion = async (req, res) => {
    try{
        const { Question, FAQCategoryId, Answer, Links = '', Status} = req.body
        const missingKeys = checkKeysAndRequireValues([ 'FAQCategoryId','Question', 'Answer', 'Status'], req.body) 
        if(missingKeys.length !== 0){
            return res.status(400).send(errorMessage(`${missingKeys} is required`))
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_faq_question ( FAQCategoryId, Question, Answer, Links, Status , IPAddress , ServerName , EntryTime) VALUES (${FAQCategoryId}, '${Question}', '${Answer}' ,'${Links}', ${setSQLBooleanValue(Status)}, '${IPAddress}' ,'${ServerName}','${EntryTime}')`;
        const result = await pool.query(insertQuery);
        if (result.rowsAffected[0] === 0) {
            return res.status(400).send(errorMessage('No rows inserted of FAQ Question!'));
        } 
        return res.status(200).send(successMessage("Data inserted successfully!"));
    }catch(error){
        console.log('Add FAQ Question Error:', error);
        return res.status(500).send(errorMessage(error?.message));
    }
}

const removeFAQQuestion = async (req, res) => {
    try{
        const {FAQQuestionId} = req.query
        const missingKeys = checkKeysAndRequireValues(['FAQQuestionId'], req.query) 
        if(missingKeys.length !== 0){
            return res.status(400).send(errorMessage(`${missingKeys} is required`))
        }
        const deleteQuery = `DELETE FROM tbl_faq_question WHERE FAQQuestionId = ${FAQQuestionId}`;
        const result = await pool.query(deleteQuery);
        if (result.rowsAffected[0] === 0) {
            return res.status(400).send(errorMessage('No rows deleted of FAQ Question!'));
        } 
        return res.status(200).send(successMessage("Data deleted successfully!"));
    }catch(error){
        console.log('Remove FAQ Question Error:', error);
        return res.status(500).send(errorMessage(error?.message));
    }
}

const updateFAQQuestion = async (req, res) => {
    try{
        const {FAQQuestionId, FAQCategoryId, Question, Answer, Links = '', Status} = req.body
        const missingKeys = checkKeysAndRequireValues(['FAQQuestionId', 'FAQCategoryId', 'Question', 'Answer', 'Status'], req.body) 
        if(missingKeys.length !== 0){
            return res.status(400).send(errorMessage(`${missingKeys} is required`))
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys(); 
        const updateQuery = `UPDATE tbl_faq_question SET FAQCategoryId = ${FAQCategoryId}, Question = '${Question}', Answer = '${Answer}', Links ='${Links}' , Status=${setSQLBooleanValue(Status)}, IPAddress='${IPAddress}' , ServerName='${ServerName}' , EntryTime='${EntryTime}' WHERE FAQQuestionId = ${FAQQuestionId}`;
        const result = await pool.query(updateQuery);
        if (result.rowsAffected[0] === 0) {
            return res.status(400).send(errorMessage('No rows updated of FAQ Question!'));
        } 
        return res.status(200).send(successMessage("Data updated successfully!"));
    }catch(error){
        console.log('Update FAQ Question Error:', error);
        return res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = {
    fetchFAQQuestionList,
    addFAQQuestion,
    removeFAQQuestion,
    updateFAQQuestion,
}