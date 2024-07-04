const { pool } = require("../sql/connectToDatabase");
const { createUserTable, createCarouselTable, createFrameTable, createImageCategoryTable, createImageSubCategoryTable, createImageLanguageTable, createUserCategoryTable, createMainImageTable, createFeedbackTable, createPlanDetailsTable, createPlanPricingTable, createProfileRequestTable, createSentMessageToAdminTable, createSubcriptionTable, createTestingTable, createOfferTable, createRazorpayCredentialsTable, createWhatsNewFeatureTable, createCompanyBankDetailsTable, createBusinessCategoryTable, createBusinessSubCategoryTable, createBusinessMainImageTable, createUserProfileTable, createMainImageTotalDownloadTable, createBusinessImageTotalDownloadTable, createNotificationTable, createNotificationUserTable, createBusinessCategoryImageTable, createFAQCategoryTable, creareFAQQuestionTable, createRequestPerSegmentTable } = require("./query");

const addColumnInTable = async (tableName, columnName, columnType) => {
    try {
        await pool.request()
            .query(`ALTER TABLE ${tableName} ADD ${columnName} ${columnType}`);
        console.log(`Table ${tableName} Into Column ${columnName} added successfully!`);
    } catch (error) {
        console.error('Error:', error);
        throw error; // Rethrow the error to handle it in the calling code
    }
}

const dropColumnInTable = async (tableName, columnName) => {
    try {
        await pool.request()
            .query(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`);
        console.log(`Table ${tableName} Into Column ${columnName} dropped successfully!`);
    } catch (error) {
        console.error('Error:', error);
        throw error; // Rethrow the error to handle it in the calling code
    }
}

const createTableInDatabase = async (tableName, addColumn) => {
    try {
        await pool.request()
            .query(`CREATE TABLE ${tableName} ${addColumn}`);
        console.log(`Table ${tableName} created successfully!`);
    } catch (error) {
        if (error?.message?.includes('already an object named')) {
            console.log(`Table ${tableName} already created`);
            return
        }
        throw error; // Rethrow the error to handle it in the calling code
    }
}

const createAllTableInDB = async () => {
    await createTableInDatabase('tbl_users', createUserTable);
    await createTableInDatabase('tbl_carousel', createCarouselTable);
    await createTableInDatabase('tbl_frame', createFrameTable);
    await createTableInDatabase('tbl_user_category', createUserCategoryTable);
    await createTableInDatabase('tbl_image_category', createImageCategoryTable);
    await createTableInDatabase('tbl_image_subcategory', createImageSubCategoryTable);
    await createTableInDatabase('tbl_image_language', createImageLanguageTable);
    await createTableInDatabase('tbl_main_image', createMainImageTable);
    await createTableInDatabase('tbl_feedback', createFeedbackTable);
    await createTableInDatabase('tbl_plan_details', createPlanDetailsTable);
    await createTableInDatabase('tbl_plan_pricing', createPlanPricingTable);
    await createTableInDatabase('tbl_profile_request', createProfileRequestTable);
    await createTableInDatabase('tbl_sent_message', createSentMessageToAdminTable);
    await createTableInDatabase('tbl_subscription', createSubcriptionTable);
    await createTableInDatabase('tbl_testing', createTestingTable);
    await createTableInDatabase('tbl_offer', createOfferTable);
    await createTableInDatabase('tbl_razorpay_credentials', createRazorpayCredentialsTable);
    await createTableInDatabase('tbl_whats_new_feature', createWhatsNewFeatureTable);
    await createTableInDatabase('tbl_company_bank_details', createCompanyBankDetailsTable);
    await createTableInDatabase('tbl_business_category', createBusinessCategoryTable);
    await createTableInDatabase('tbl_business_sub_category', createBusinessSubCategoryTable);
    await createTableInDatabase('tbl_business_main_image', createBusinessMainImageTable);
    await createTableInDatabase('tbl_user_profile', createUserProfileTable);
    await createTableInDatabase('tbl_main_image_total_download', createMainImageTotalDownloadTable);
    await createTableInDatabase('tbl_business_image_total_download', createBusinessImageTotalDownloadTable);
    await createTableInDatabase('tbl_notification', createNotificationTable);
    await createTableInDatabase('tbl_notification_user', createNotificationUserTable);
    await createTableInDatabase('tbl_business_category_image', createBusinessCategoryImageTable);
    await createTableInDatabase('tbl_faq_category', createFAQCategoryTable);
    await createTableInDatabase('tbl_faq_question', creareFAQQuestionTable);
    await createTableInDatabase('tbl_request_per_segment', createRequestPerSegmentTable);
}

module.exports = {
    createAllTableInDB
}