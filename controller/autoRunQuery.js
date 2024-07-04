const { pool } = require("../sql/connectToDatabase");

async function setAutoDownloadLimit() {
    try {
        await pool
            .request()
            .query(
                `UPDATE tbl_users
                SET DownloadLimit = 1`,
            );
        console.log("Subscription statuses updated successfully");
    } catch (err) {
        console.log("Auto Download Limit", err);
    } 
}

async function autoVerifySubscription() {
    try {
        await pool.request().query(
            ` UPDATE tbl_subscription
            SET 
                PlanStatus = CASE
                    WHEN CAST(EndDate AS DATE) < CAST(GETDATE() AS DATE) THEN 'Expired'
                    WHEN CAST(StartDate AS DATE) > CAST(GETDATE() AS DATE) THEN 'Pending'
                    ELSE 'Active'
                END,
                Status = CASE
                    WHEN CAST(EndDate AS DATE) < CAST(GETDATE() AS DATE) THEN 0 -- Assuming 0 represents false
                    WHEN CAST(StartDate AS DATE) > CAST(GETDATE() AS DATE) THEN 0 -- Assuming 0 represents false
                    ELSE 1 -- Assuming 1 represents true (active)
                END`,
        );
        console.log("Subscription statuses updated successfully");
    } catch (error) {
        console.log("Auto Verify Subscription", error);
    }
}
async function autoVerifyNotification() {
    try {
        await pool.request().query(
            ` UPDATE tbl_notification
SET NotificationStatus = 
    CASE
        WHEN CAST(EndDate AS DATE) < CAST(GETDATE() AS DATE) THEN 'Expired'
        WHEN CAST(StartDate AS DATE) > CAST(GETDATE() AS DATE) THEN 'Pending'
        ELSE 'Active'
    END`,
        );
        console.log("Notification statuses updated successfully");
    } catch (error) {
        console.log("Auto Verify Notification", error);
    }
}

module.exports = { setAutoDownloadLimit, autoVerifySubscription, autoVerifyNotification };
  