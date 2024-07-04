const {errorMessage, fetchDashbordData } = require('../common/main');

const fetchDashbordDetails = async (req, res)=>{
    try{
        const commanQueryPart = `COUNT(CASE WHEN Status = 1 THEN 1 END) AS activeData, COUNT(CASE WHEN Status = 0 THEN 1 END) AS inactiveData,`;
        const allCountQuery = ` COUNT(*) AS totalData `;

        const userQuery = `SELECT 
            ${commanQueryPart}
            COUNT(CASE WHEN Role = 'Admin' THEN 1 END) AS admins,
            COUNT(CASE WHEN Role = 'User' THEN 1 END) AS users,
            ${allCountQuery} 
        FROM tbl_users`;

        const mainImageQuery = `SELECT
            ${commanQueryPart}
            COUNT(CASE WHEN Premium = 1 THEN 1 END) AS premium,
            COUNT(CASE WHEN Premium = 0 THEN 1 END) AS free,
            COUNT(CASE WHEN Tranding = 1 THEN 1 END) AS trending,
            ${allCountQuery}
        FROM tbl_main_image`;

        const pricingDetailsQuery = `SELECT
            ${commanQueryPart}
            COUNT(CASE WHEN Premium = 1 THEN 1 END) AS premium,
            COUNT(CASE WHEN Premium = 0 THEN 1 END) AS free,
            ${allCountQuery}
        FROM tbl_plan_details`;

        const profileRequestQuery = `SELECT
            COUNT(CASE WHEN RequestType = 'Pending' THEN 1 END) AS pending,
            COUNT(CASE WHEN RequestType = 'Approved' THEN 1 END) AS approved,
            COUNT(CASE WHEN RequestType = 'Rejected' THEN 1 END) AS rejected,
            ${allCountQuery}
        FROM tbl_profile_request`;
    
        const offerQuery = ` SELECT 
        ${commanQueryPart}
        ${allCountQuery} FROM tbl_offer`;

        const userCategoryQuery = ` SELECT 
        ${commanQueryPart}
        ${allCountQuery} FROM tbl_user_category`;

        const carouselQuery = ` SELECT 
        ${commanQueryPart}
        ${allCountQuery} FROM tbl_carousel`;

        const imageCategoryQuery = ` SELECT 
        ${commanQueryPart}
        ${allCountQuery} FROM tbl_image_category`;

        const imageSubCategoryQuery = ` SELECT 
        ${commanQueryPart}
        ${allCountQuery} FROM tbl_image_subcategory`;

        const imageLanguageQuery = ` SELECT 
        ${commanQueryPart}
        ${allCountQuery} FROM tbl_image_language`;

        const subscriptionQuery = ` SELECT 
        ${commanQueryPart}
        ${allCountQuery} FROM tbl_subscription`;

        const feedbackQuery = ` SELECT 
        ${allCountQuery} FROM tbl_feedback`;

        const userData = await fetchDashbordData(userQuery);
        const mainImageData = await fetchDashbordData(mainImageQuery);
        const pricingData = await fetchDashbordData(pricingDetailsQuery);
        const profileRequestData = await fetchDashbordData(profileRequestQuery);
        const offerData = await fetchDashbordData(offerQuery);
        const userCategoryData = await fetchDashbordData(userCategoryQuery);
        const carouselData = await fetchDashbordData(carouselQuery);
        const imageCategoryData = await fetchDashbordData(imageCategoryQuery);
        const imageSubCategoryData = await fetchDashbordData(imageSubCategoryQuery);
        const imageLanguageData = await fetchDashbordData(imageLanguageQuery);
        const subscriptionData = await fetchDashbordData(subscriptionQuery);
        const feedbackData = await fetchDashbordData(feedbackQuery);
        
        const data = {
            userDetails : {
                active : userData.activeData,
                inactive : userData.inactiveData,
                admin : userData.admins,
                user : userData.users,
                total : userData.totalData
            },
            mainImageDetails : {
                active : mainImageData?.activeData,
                inactive : mainImageData?.inactiveData,
                trending : mainImageData.trending,
                Premium : mainImageData.premium,
                Free : mainImageData.free,
                total : mainImageData.totalData
            },
            pricingDetails : {
                active : pricingData.activeData,
                inactive : pricingData.inactiveData,
                Premium : pricingData.premium,
                Free : pricingData.free,
                total : pricingData.totalData
            },
            profileRequestDetails : {
                Pending : profileRequestData.pending,
                Approved : profileRequestData.approved,
                Rejected : profileRequestData.rejected,
                total : profileRequestData.totalData
            },
            offerDetails : {
                active : offerData.activeData,
                inactive : offerData.inactiveData,
                total : offerData.totalData
            },
            userCategoryDetails : {
                active : userCategoryData.activeData,
                inactive : userCategoryData.inactiveData,
                total : userCategoryData.totalData
            },
            carouselDetails : {
                active : carouselData.activeData,
                inactive : carouselData.inactiveData,
                total : carouselData.totalData
            },
            imageCategoryDetails : {
                active : imageCategoryData.activeData,
                inactive : imageCategoryData.inactiveData,
                total : imageCategoryData.totalData
            },
            imageSubCategoryDetails : {
                active : imageSubCategoryData.activeData,
                inactive : imageSubCategoryData.inactiveData,
                total : imageSubCategoryData.totalData
            },
            imageLanguageDetails : {
                active : imageLanguageData.activeData,
                inactive : imageLanguageData.inactiveData,
                total : imageLanguageData.totalData
            },
            subscriptionDetails : {
                active : subscriptionData.activeData,
                inactive : subscriptionData.inactiveData,
                total : subscriptionData.totalData
            },
            feedbackDetails : {
                total : feedbackData.totalData
            },
        }
        return res.status(200).json({Success : true, data : data})
    }catch(error){
        console.log('fetch deshbord details error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

module.exports = {
    fetchDashbordDetails
}