const moment = require('moment');
const os = require('os');
const fs = require('fs');
const { LIVE_URL } = require('./variable');
const { pool } = require('../sql/connectToDatabase');

const getServerIpAddress = () => {
    const ifaces = os.networkInterfaces();
    let IPAddress = '';

    Object.keys(ifaces).forEach(ifname => {
        ifaces[ifname].forEach(iface => {
            if (iface.family === 'IPv4' && !iface.internal) {
                IPAddress = iface.address;
            }
        });
    });

    return IPAddress;
};

const getServerName = () => {
    const hostname = os.hostname();
    return hostname;
};

const getEntryTime = () => {
    return moment().toISOString();
}

const errorMessage = (message = "Something went wrong!",status = 400) => {
    return {
        Success: false,
        status,
        message
    }
}

const successMessage = (message = "successfully!") => {
    return {
        Success: true,
        status: 200,
        message
    }
}

const getCommonKeys = () => {
    const IPAddress = getServerIpAddress();
    const ServerName = getServerName();
    const EntryTime = getEntryTime();
    return {
        IPAddress,
        ServerName,
        EntryTime
    }
}

const setSQLBooleanValue = (condition) => {
    if(condition === true || condition === 'true') {
        return 1
    }
    return 0
}

const setSQLOrderId = (value) => {
    if(Number(value) < 0 || Number(value) > 10000 || !value) {
        return null
    }
    return value
}

const setSQLStringValue = (value) => {
    if (!value) {
        return null
    }
    return `'${value}'`
}
const checkKeysAndRequireValues = (allKeys,matchKeys) => {
    const errorKeys = [];
    allKeys.map((item) => {
        if(!Object.keys(matchKeys).includes(item) || (!matchKeys[item] && typeof matchKeys[item] !== 'boolean')) {
            errorKeys.push(item);
        }
    })
    return errorKeys
}

// Function to safely delete a file
const safeUnlink = (filePath) => {
    if(filePath.match('static')?.length > 0) {
        return null
    }
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.W_OK, (err) => {
            if (err) {
                return reject(`No write access to file: ${filePath}, error: ${err.message}`);
            }
            fs.unlinkSync(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    return reject(`Error deleting file: ${filePath}, error: ${unlinkErr.message}`);
                }
                resolve();
            });
        });
    });
};
const updateUploadFiles = (updateFile, previousFile, folderName) => {
    if (updateFile && updateFile[0] && updateFile[0]?.filename) {
        if(previousFile){
            fs.unlinkSync(previousFile.replace(LIVE_URL,`../TaxFilePosterMedia/${folderName}`));
        //   safeUnlink(previousFile.replace(LIVE_URL,`../TaxFilePosterMedia/${folderName}`));
        }
        return `${LIVE_URL}/${updateFile[0]?.filename}`;
    } else {
        return previousFile
    }
}

const getCommonAPIResponse = async (req, res, query) => {
    if(req.query.page && req.query.pageSize){
        return await getCommonAPIResponseWithPagination(req, res, query);
    }
    try {
        const result = await pool.request().query(query.getQuery);
        const countResult = await pool.request().query(query.countQuery);
        const totalCount = countResult.recordset[0].totalCount;
        return {
            data: result.recordset,
            totalLength: totalCount
        }
    } catch (error) {
        console.error('Error:', error);
        return errorMessage(error?.message);
    }
}

const getCommonAPIResponseWithPagination = async (req, res, query) => {
    try {
        const page = req.query.page || 1; // Default page number is 1
        const pageSize = req.query.pageSize || 10; // Default page size is 10
        // Calculate the offset based on the page number and page size
        const offset = (page - 1) * pageSize;
        const paginationQuery = `${query.getQuery} OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
        const result = await pool.request().query(paginationQuery);
        // Fetch total length of tbl_carousel table
        const countResult = await pool.request().query(query.countQuery);
        const totalCount = countResult.recordset[0].totalCount;
        // Return data along with total length
        return {
            data: result.recordset,
            totalLength: totalCount
        }
    } catch (error) {
        console.error('Error:', error);
        return errorMessage(error?.message);
    }
}

const getAPIALLDataResponse = async (req, res, TableName, Id, WHERE = ``) => {
    if(req.query.page && req.query.pageSize){
        return await getAPIALLDataResponseWithPagination(req, res, TableName, Id, WHERE);
    }
    try {
        const query = `SELECT * FROM ${TableName} ${WHERE} ORDER BY ${Id} DESC`;
        const result = await pool.request().query(query);
        const countQuery = `SELECT COUNT(*) AS totalCount FROM ${TableName} ${WHERE}`;
        const countResult = await pool.request().query(countQuery);
        const totalCount = countResult.recordset[0].totalCount;
        return {
            data: result.recordset,
            totalLength: totalCount
        }
    } catch (error) {
        console.error('Error:', error);
        return errorMessage(error?.message);
    }
}

const getAPIALLDataResponseWithPagination = async (req, res, TableName, Id, WHERE) => {
    try {
        const page = req.query.page || 1; // Default page number is 1
        const pageSize = req.query.pageSize || 10; // Default page size is 10
        // Calculate the offset based on the page number and page size
        const offset = (page - 1) * pageSize;
        const query = `SELECT * FROM ${TableName} ${WHERE} ORDER BY ${Id} DESC OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
        const result = await pool.request().query(query);
        // Fetch total length of tbl_carousel table
        const countQuery = `SELECT COUNT(*) AS totalCount FROM ${TableName} ${WHERE}`;
        const countResult = await pool.request().query(countQuery);
        const totalCount = countResult.recordset[0].totalCount;
        // Return data along with total length
        return {
            data: result.recordset,
            totalLength: totalCount
        }
    } catch (error) {
        console.error('Error:', error);
        return errorMessage(error?.message);
    }
}
const fetchDashbordData = async (query)=>{
    try{
        const result = await pool.request().query(query)
        return result.recordset[0]
    }catch(error){
        console.log(`fetch count data Error`,error);
    }
}

module.exports = {
    getServerIpAddress,
    getServerName,
    getEntryTime,
    errorMessage,
    successMessage,
    getCommonKeys,
    setSQLBooleanValue,
    checkKeysAndRequireValues,
    updateUploadFiles,
    getAPIALLDataResponse,
    getAPIALLDataResponseWithPagination,
    getCommonAPIResponse,
    safeUnlink,
    setSQLOrderId,
    setSQLStringValue,
    fetchDashbordData
}