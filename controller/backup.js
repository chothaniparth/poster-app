const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys } = require('../common/main');
const { DATABASE_NAME } = require('../common/variable');
const { pool, sql } = require('../sql/connectToDatabase');
const fs = require('fs');
const path = require('path');
const backupDirectory = 'C:\\Program Files\\Microsoft SQL Server\\MSSQL12.MSSQLSERVER\\MSSQL\\Backup';
// const backupDirectory = 'C:\\Program Files\\Microsoft SQL Server\\MSSQL16.SQLEXPRESS\\MSSQL\\Backup';
const createBackup = async (req, res) => {
    try {
        const backupFileName = 'backup.bak'; // Change as needed
        const backupQuery = `BACKUP DATABASE ${DATABASE_NAME} TO DISK = '${backupFileName}'`;
        await pool.request().query(backupQuery);
        const backupFilePath = path.join(backupDirectory, backupFileName);
        if (!fs.existsSync(backupDirectory)) {
            fs.mkdirSync(backupDirectory, { recursive: true });
        }
        // Read the content of the backup file
        const backupFileContent = fs.readFileSync(backupFilePath);
        // Set headers and send backup file in response
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'attachment; filename=' + backupFileName);
        res.send(backupFileContent);
        // Delete the backup file after sending it
        fs.unlinkSync(backupFilePath);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};
module.exports = {
    createBackup
}