const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse, setSQLBooleanValue, getCommonAPIResponse, setSQLOrderId } = require('../common/main');
const { onlyStatusTrue } = require('../common/search_query');
const { LIVE_URL } = require('../common/variable');
const { pool, sql } = require('../sql/connectToDatabase');
const fs = require('fs');

const fetchFrameList = async (req, res) => {
    const result = await getAPIALLDataResponse(req, res, 'tbl_frame', 'FrameId');
    res.json(result);
};

const fetchFrameListInApp = async (req, res) => {
    try {
        const query = {
            getQuery: `SELECT * FROM tbl_frame WHERE Status = 1 ORDER BY 
            CASE 
                WHEN OrderId IS NULL THEN 1
                ELSE 0
            END,
            OrderId ASC,
            FrameId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_frame`,
        }
        const result = await getCommonAPIResponse(req, res, query);
        res.json(result);
    } catch (error) {
        res.status(500).send(errorMessage(error?.message));
    }
};

// Define a route to insert a new user
const addFrameList = async (req, res) => {
    try {
        const { Status, OrderId = null } = req.body;
        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : "";

        const missingKeys = checkKeysAndRequireValues(['Image', 'Status'], { ...req.body, Image: imageURL })
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }
        const {IPAddress, ServerName, EntryTime} = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_frame (Image, Status, OrderId, IPAddress, ServerName, EntryTime) VALUES ('${imageURL}', ${setSQLBooleanValue(Status)}, ${setSQLOrderId(OrderId)}, '${IPAddress}', '${ServerName}', '${EntryTime}')`;
        const result = await pool.query(insertQuery)

        if (result.rowsAffected[0] > 0) {
            return res.status(200).send({...successMessage("Data inserted successfully!")});
        } else {
            return res.status(400).send(errorMessage('No rows inserted of Frame!'));
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

// delete user
const removeFrameById = async (req, res) => {
    try {
        const query = req.query;
        const { FrameId } = query;

        if (!FrameId || isNaN(FrameId)) {
            return res.status(400).send('Invalid value for parameter "FrameId". Must be a valid number.');
        }
        const data = await pool.request().query(`SELECT * FROM tbl_frame where FrameId = ${FrameId}`);

        // Execute the DELETE query
        const result = await pool.request()
            .input('FrameId', sql.Int, FrameId)
            .query('DELETE FROM tbl_frame WHERE FrameId = @FrameId');

        // Check if any rows were affected (indicating successful deletion)
        if (result.rowsAffected[0] > 0) {
            fs.unlinkSync(data.recordset[0].Image.replace(LIVE_URL,`../TaxFilePosterMedia/Frame`));
            return res.status(200).send(successMessage('Data deleted successfully!'));
        } else {
            return res.status(404).send(errorMessage('Frame not found'));
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const updateFrameById = async (req, res) => {

    try {
        const { Status, FrameId, OrderId = null } = req.body;
        if (checkKeysAndRequireValues(['FrameId'], { ...req.body }).length > 0) {
            return res.status(400).send(`${checkKeysAndRequireValues(['FrameId'], { ...req.body }).join(', ')} parameters are required and must not be null or undefined`);
        }
        const previousData = await pool.request().query(`SELECT * FROM tbl_frame where FrameId = ${FrameId}`);
        if(previousData?.recordset?.length === 0) {
            return res.send(errorMessage('Frame not found'));
        }
        const previousDataView = previousData?.recordset[0]
        let frameURL = updateUploadFiles(req?.files?.Image, previousDataView.Image, 'Frame');
        const missingKeys = checkKeysAndRequireValues(['Image', 'Status'], { ...req.body, Image: frameURL })
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }
        const {IPAddress, ServerName, EntryTime} = getCommonKeys();
        const updatedQuery = `UPDATE tbl_frame SET Image = '${frameURL}', Status = ${setSQLBooleanValue(Status)}, OrderId = ${setSQLOrderId(OrderId)}, IPAddress = '${IPAddress}', ServerName = '${ServerName}', EntryTime = '${EntryTime}'  WHERE FrameId = '${FrameId}'`;
        const result = await pool.query(updatedQuery)
        if (result.rowsAffected[0] > 0) {
            return res.status(200).send(successMessage("Data updated successfully!")); // or any other success message
        } else {
            if (req?.files?.logo?.length) {
                await fs.unlinkSync(req?.files?.Image[0]?.path);
            }
            return res.status(400).send(errorMessage('No rows updated of Frame!'));
        }
    } catch (error) {
        if (req?.files?.Image?.length) {
            await fs.unlinkSync(req?.files?.Image[0]?.path);
        }
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = {
    fetchFrameList,
    fetchFrameListInApp,
    addFrameList,
    removeFrameById,
    updateFrameById
};