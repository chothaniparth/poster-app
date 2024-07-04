const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse, setSQLBooleanValue, getCommonAPIResponse, setSQLOrderId, setSQLStringValue } = require('../common/main');
const { onlyStatusTrue } = require('../common/search_query');
const { LIVE_URL } = require('../common/variable');
const { pool, sql } = require('../sql/connectToDatabase');
const fs = require('fs');

const fetchCarouselList = async (req, res) => {
    const result = await getAPIALLDataResponse(req, res, 'tbl_carousel', 'CarouselId');
    res.json(result);
};

const fetchCarouselListInAPP = async (req, res) => {
    try {
        const query = {
            getQuery: `SELECT * FROM tbl_carousel WHERE Status = 1 ORDER BY 
            CASE 
                WHEN OrderId IS NULL THEN 1
                ELSE 0
            END,
            OrderId ASC,
            CarouselId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_carousel`,
        }
        const result = await getCommonAPIResponse(req, res, query);
        res.json(result);
    } catch (error) {
        res.status(500).send(errorMessage(error?.message));
    }
};

// Define a route to insert a new user
const addCarouselList = async (req, res) => {
    try {
        const { Status, OrderId = null, LinkId = null, Link = '', LinkType, MainImageId = null } = req.body;
        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : "";

        const missingKeys = checkKeysAndRequireValues(['Image', 'Status'], { ...req.body, Image: imageURL })
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }
        const {IPAddress, ServerName, EntryTime} = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_carousel (Image, Status, OrderId, LinkId, Link, LinkType, MainImageId, IPAddress, ServerName, EntryTime) VALUES ('${imageURL}', ${setSQLBooleanValue(Status)}, ${setSQLOrderId(OrderId)}, ${LinkId}, '${Link}', ${setSQLStringValue(LinkType)}, ${MainImageId},'${IPAddress}', '${ServerName}', '${EntryTime}')`;
        const result = await pool.query(insertQuery)

        if (result.rowsAffected[0] > 0) {
            return res.status(200).send({...successMessage("Data inserted successfully!")});
        } else {
            return res.status(400).send(errorMessage('No rows inserted of Carousel!'));
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

// delete user
const removeCarouselById = async (req, res) => {
    try {
        const query = req.query;
        const { CarouselId } = query;

        if (!CarouselId || isNaN(CarouselId)) {
            return res.status(400).send('Invalid value for parameter "CarouselId". Must be a valid number.');
        }
        const data = await pool.request().query(`SELECT * FROM tbl_carousel where CarouselId = ${CarouselId}`);

        // Execute the DELETE query
        const result = await pool.request()
            .input('CarouselId', sql.Int, CarouselId)
            .query('DELETE FROM tbl_carousel WHERE CarouselId = @CarouselId');

        // Check if any rows were affected (indicating successful deletion)
        if (result.rowsAffected[0] > 0) {
            fs.unlinkSync(data.recordset[0].Image.replace(LIVE_URL,`../TaxFilePosterMedia/Carousel`));
            return res.status(200).send(successMessage('Data deleted successfully!'));
        } else {
            return res.status(404).send(errorMessage('Carousel not found'));
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const updateCarouselById = async (req, res) => {

    try {
        const { Status, CarouselId, OrderId = null, LinkId = null, Link = '', LinkType, MainImageId = null } = req.body;
        if (checkKeysAndRequireValues(['CarouselId'], { ...req.body }).length > 0) {
            return res.status(400).send(`${checkKeysAndRequireValues(['CarouselId'], { ...req.body }).join(', ')} parameters are required and must not be null or undefined`);
        }
        const previousData = await pool.request().query(`SELECT * FROM tbl_carousel where CarouselId = ${CarouselId}`);
        if(previousData?.recordset?.length === 0) {
            return res.send(errorMessage('Carousel not found'));
        }
        const previousDataView = previousData?.recordset[0]
        let carouselURL = await updateUploadFiles(req?.files?.Image, previousDataView.Image, 'Carousel');
        const missingKeys = checkKeysAndRequireValues(['Image', 'Status'], { ...req.body, Image: carouselURL })
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }
        const {IPAddress, ServerName, EntryTime} = getCommonKeys();
        const updatedQuery = `UPDATE tbl_carousel SET Image = '${carouselURL}', Status = ${setSQLBooleanValue(Status)}, OrderId = ${setSQLOrderId(OrderId)}, LinkId = ${LinkId}, Link = '${Link}', LinkType = ${setSQLStringValue(LinkType)}, MainImageId = ${MainImageId}, IPAddress = '${IPAddress}', ServerName = '${ServerName}', EntryTime = '${EntryTime}'  WHERE CarouselId = '${CarouselId}'`;
        const result = await pool.query(updatedQuery)
        if (result.rowsAffected[0] > 0) {
            return res.status(200).send(successMessage("Data updated successfully!")); // or any other success message
        } else {
            if (req?.files?.Image?.length) {
                await fs.unlinkSync(req?.files?.Image[0]?.path);
            }
            return res.status(400).send(errorMessage('No rows updated of Carousel!'));
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
    fetchCarouselList,
    fetchCarouselListInAPP,
    addCarouselList,
    removeCarouselById,
    updateCarouselById
};