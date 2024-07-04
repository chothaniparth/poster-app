const router = require("express").Router();
const userListController = require('../controller/userlist');
const verifyController = require('../controller/verify');
const otpController = require('../controller/otp');
const tokenController = require('../controller/token');
const carouselController = require('../controller/carousel');
const frameController = require('../controller/frame');
const mainImageController = require('../controller/main_image');
const categoryController = require('../controller/imageCategory');
const subCategoryController = require('../controller/imageSubCategory');
const imageLanguageController = require('../controller/imageLanguage');
const userCategoryController = require('../controller/userCategory')
const feedbackController = require('../controller/feedback')
const planDetailsController = require('../controller/planDetails');
const planPricingController = require('../controller/planPricing');
// const loginController = require('../controller/login');
const profileRequestController = require('../controller/profileRequest');
const messageToAdminController = require('../controller/messageToAdmin');
const mailController = require('../controller/email');
const backupController = require('../controller/backup');
const subscriptionController = require('../controller/subscription');
const combine_API_Controller = require('../common/combine_API');
const paymentController = require('../controller/payment');
const offerController = require('../controller/offer');
const razorpayController = require('../controller/razorpay');
const dashbordCountController = require('../controller/dashbordDetails');
const whatsController = require('../controller/whatsNewFeature');
const companyBankDetailsController = require('../controller/companyBankDetails');
const businessCategoryController = require('../controller/businessCategory');
const businessSubCategoryController = require('../controller/businessSubCategory');
const businessMainImageController = require('../controller/businessMainImage');
const userProfileController = require('../controller/userProfile');
const mainImageTotalDownloadController = require('../controller/mainImageTotalDownload');
const businessImageTotalDownloadController = require('../controller/businessImageTotalDownload');
const notificationController = require('../controller/notification');
const notificationUserController = require('../controller/notificationUser')
const businessCategoryImageController = require('../controller/businessCategoryImage')
const FAQCategoryController = require('../controller/FAQCategory');
const FAQQuestionContriller = require('../controller/FAQQuestion');
const requestPerSegmentController = require('../controller/requestPerSegment');
const auth = require("../middleware/auth")

const { mediaUpload, carouselUpload, frameUpload, mainImageUpload, offerUpload, businessSubCategoryUpload, businessMainImageUpload, userProfileUpload, NotificationUpload, BusinessCategoryImageUpload, FAQCategoryImageUpload, RequestPerSegmentUpload} = require("../upload/index");

router.get("/user/list", auth, userListController.fetchUserList)
router.get("/user/details", auth, userListController.fetchUserListById)
router.get("/user/details/by_id", userListController.fetchUserListByUserId)
router.get("/user/details/search", auth, userListController.fetchUserSearchAPI)
router.get('/user/download_limit', auth, userListController.decreaseImageDownloadLimit)
router.get('/user/all/download_limit', auth, userListController.setAllDownloadLimit)
router.post("/register", mediaUpload, userListController.addUserList)
router.delete("/user/delete", auth, userListController.removeUserListById)
router.put("/user/update", auth, mediaUpload, userListController.updateUserListById)

router.get("/carousel/list", auth, carouselController.fetchCarouselList)
router.get("/carousel/list/app", auth, carouselController.fetchCarouselListInAPP)
router.post("/carousel/add", auth, carouselUpload, carouselController.addCarouselList)
router.delete("/carousel/delete", auth, carouselController.removeCarouselById)
router.put("/carousel/update", auth, carouselUpload, carouselController.updateCarouselById)

router.get("/frame/list", auth, frameController.fetchFrameList)
router.get("/frame/list/app", auth, frameController.fetchFrameListInApp)
router.post("/frame/add", auth, frameUpload, frameController.addFrameList)
router.delete("/frame/delete", auth, frameController.removeFrameById)
router.put("/frame/update", auth, frameUpload, frameController.updateFrameById)

router.get("/main_image/list", auth, mainImageController.fetchMainImageList)
router.get("/main_image/list/by_id", auth, mainImageController.fetchMainImageById)
router.get("/main_image/list/view", auth, mainImageController.fetchMAinImageJoinList)
router.get("/main_image/list/app", auth, mainImageController.fetchMainImageInAppList)
router.get("/main_image/list/calendar", auth, mainImageController.fetchFestivalCalendarListByDate)
router.get("/main_image/list/dashboard/view", auth, mainImageController.fetchDashboardAllImagesView)
router.get("/main_image/list/dashboard/tranding", auth, mainImageController.fetchTrandingImages)
router.get("/main_image/list/dashboard/due_date/view", auth, mainImageController.fetchDashboardAllDueDateImages)
router.get("/main_image/list/dashboard/search", auth, mainImageController.fetchImageSearchAPI)
// router.get("/main_image/list/dashboard/dates", auth, mainImageController.fetchStartToEndDateAllImages)
router.get("/main_image/list/dashboard/category", auth, mainImageController.fetchImagesByImageCategoryId)
router.post("/main_image/add", auth, mainImageUpload, mainImageController.addMainImageList)
router.delete("/main_image/delete", auth, mainImageController.removeMainImageById)
router.put("/main_image/update", mainImageUpload, mainImageController.updateMainImageById)

router.post("/verify", verifyController.verifyHandler)
router.post("/verify_admin", verifyController.verifyAdminHandler)
router.post("/verify_user", verifyController.verifyUserHandler)

router.post("/sentOTP", otpController.otpVerificationHandler)

router.post("/regeneratetoken", tokenController.regenerateTokenHandler)

router.get('/image_category/list', auth, categoryController.fetchImageCategoryList)
router.get('/image_category/list/app', auth, categoryController.fetchImageCategoryListInApp)
router.post('/image_category/add', auth, categoryController.addImageCategoryList)
router.delete('/image_category/delete', auth, categoryController.removeImageCategoryById)
router.put('/image_category/update', auth, categoryController.updateImageCategoryById)

router.get('/image_subCategory/list', auth, subCategoryController.fetchImageSubCategoryList)
router.get("/image_subCategory/list/view", auth, subCategoryController.fetchSubCategoryJoinList)
router.get('/image_subCategory/list/app', auth, subCategoryController.fetchImageSubCategoryListInApp)
router.post('/image_subCategory/add', auth, subCategoryController.addImageSubCategoryList)
router.delete('/image_subCategory/delete', auth, subCategoryController.removeImageSubCategory)
router.put('/image_subCategory/update', auth, subCategoryController.updateImageSubCategory)

router.get('/image_language/list', auth, imageLanguageController.fetchImageLanguage);
router.get('/image_language/list/app', auth, imageLanguageController.fetchImageLanguageInApp);
router.post('/image_language/add', auth, imageLanguageController.addImageLanguage);
router.delete('/image_language/delete', auth, imageLanguageController.removeImageLanguage);
router.put('/image_language/update', auth, imageLanguageController.updateImageLanguage);

router.get('/user_Category/list', auth, userCategoryController.fetchUserCategory);
router.get('/user_Category/list/app', userCategoryController.fetchUserCategoryInApp);
router.post('/user_Category/add', auth, userCategoryController.addUserCategory);
router.delete('/user_Category/delete', auth, userCategoryController.removeUserCategory);
router.put('/user_Category/update', auth, userCategoryController.updateUserCategory);

router.get('/feedback/list', auth, feedbackController.fetchFeedbackList);
router.post('/feedback/add', auth, feedbackController.addFeedback);
router.delete('/feedback/delete', auth, feedbackController.removeFeedback);

router.get('/plan_details/list', planDetailsController.fetchPlanListDetails);
router.get('/plan_details/list/app', auth, planDetailsController.fetchPlanDetailsListInApp);
router.post('/plan_details/add', auth, planDetailsController.addPlanDetails);
router.delete('/plan_details/delete', auth, planDetailsController.removePlanDetails);
router.put('/plan_details/update', auth, planDetailsController.updatePlanDetails);

router.get('/plan_pricing/list', planPricingController.fetchPlanPricingList);
router.put('/plan_pricing/update', auth, planPricingController.updatePlanPricing);

router.get('/plan_pricing_and_details/list', auth, combine_API_Controller.fetchPlanAndDetailsListInApp);

router.get('/profile_request/list', auth, profileRequestController.fetchProfileRequestList);
router.post('/profile_request/add', auth, mediaUpload, profileRequestController.addProfileRequest);
router.delete('/profile_request/delete', auth, profileRequestController.removeProfileRequest);
router.put('/profile_request/update', auth, profileRequestController.updatedProfileRequest);
router.get('/profile_request/reject', auth, profileRequestController.allRequestReject);

router.get('/message_to_admin/list', auth, messageToAdminController.fetchMessageToAdminList);
router.post('/message_to_admin/add', auth, messageToAdminController.addMessageToAdmin);
router.delete('/message_to_admin/delete', auth, messageToAdminController.removeMessageToAdmin);

router.get('/mail/profile_update', auth, mailController.profileUpdateMessageForUser);

// router.get('/backup', auth, backupController.createBackup);
router.get('/subscription/not_active_plan/userlist', auth, subscriptionController.fetchNotActivePlanUserList);

router.get('/subscription/list', auth, subscriptionController.fetchSubscriptionList);
router.get('/subscription/list/by_userid', subscriptionController.fetchSubscriptionByUserId)
// router.get('/subscription/list/by_id', subscriptionController.fetchSubscriptionListById);
router.post('/subscription/add', subscriptionController.addSubscription);
router.delete('/subscription/delete', auth, subscriptionController.removeSubscription);
router.put('/subscription/update', auth, subscriptionController.updateSubscription);

router.get('/payment', auth, paymentController.getPaymentDetails);
router.post('/payment/create', paymentController.createPayment);

router.get('/offer/list', auth, offerController.fetchOfferList);
router.get('/offer/list/app', auth, offerController.fetchOfferListInApp);
router.post('/offer/add', auth, offerUpload, offerController.addOffer);
router.delete('/offer/delete', auth, offerController.removeOffer);
router.put('/offer/update', auth, offerUpload, offerController.updateOffer);

router.get('/razorpay/credentials', razorpayController.fetchRazorpayCredentials);
router.put('/razorpay/credentials', auth, razorpayController.updateRazorpayCredentials);

router.get('/dashbord/view', auth, dashbordCountController.fetchDashbordDetails)

router.get('/whats_new_feature/list', auth, whatsController.fetchWhatskkList);
router.get('/whats_new_feature/list/app', auth, whatsController.fetchWhatskkListApp);
router.post('/whats_new_feature/add', auth, whatsController.addWhats);
router.delete('/whats_new_feature/delete', auth, whatsController.removeWhats);
router.put('/whats_new_feature/update', auth, whatsController.updateWhats);

router.get('/company_bank_details/list', auth, companyBankDetailsController.fetchCompanyBankDetails);
router.put('/company_bank_details/update', auth, companyBankDetailsController.updateCompanyBankDetails);

router.get('/business_category/list', businessCategoryController.fetchBusinessCategoryList);
router.post('/business_category/add', auth, businessCategoryController.addBusinessCategoryList);
router.delete('/business_category/delete', auth, businessCategoryController.removeBusinessCategory);
router.put('/business_category/update', auth, businessCategoryController.updateBusinessCategoryById);

router.get('/business_subcategory/list', auth, businessSubCategoryController.fetchBusinessSubCategoryList)
router.get('/business_subcategory/list/by_category_id', businessSubCategoryController.fetchBusinessSubCategoryListbyCategoryId)
router.post('/business_subcategory/add', businessSubCategoryUpload, auth, businessSubCategoryController.addBusinessSubCategory);
router.delete('/business_subcategory/delete', auth, businessSubCategoryController.removeBusinessSubCategory);
router.put('/business_subcategory/update', auth, businessSubCategoryUpload, businessSubCategoryController.updateBusinessSubCategory);

router.get('/business_main_image/list', auth, businessMainImageController.fetchBusinessMainImageList)
router.post('/business_main_image/add', auth, businessMainImageUpload, businessMainImageController.addBusinessMainImage);
router.delete('/business_main_image/delete', auth, businessMainImageController.removeBusinessMainImage);
router.put('/business_main_image/update', auth, businessMainImageUpload, businessMainImageController.updateBusinessMainImage);

router.get('/state/list', auth, userProfileController.fetchStateList)
router.get('/city/list', auth, userProfileController.fetchCityList)

router.get('/user_profile/list', auth, userProfileController.fetchUserProfileList);
router.get('/user_profile/list/by_id', auth, userProfileController.fetchUserProfileById);
router.post('/user_profile/add', auth, userProfileUpload, userProfileController.addUserProfile);
router.delete('/user_profile/delete', auth, userProfileController.removeUserProfile);
router.put('/user_profile/update', auth, userProfileUpload, userProfileController.updateUserProfile);

router.get('/main_image_total_download/list', auth, mainImageTotalDownloadController.fetchMainImageTotalDownloadList);
router.post('/main_image_total_download/add', auth, mainImageTotalDownloadController.addMainImageTotalDownload);
router.get('/most_popular_image/list', auth, mainImageTotalDownloadController.fetchTotalImageDownloadList);

router.get('/notification/user/list', auth, notificationController.fetchUserNotificationView);

router.get('/business_image_total_download/list', businessImageTotalDownloadController.fetchBusinessImageTotalDownloadList);
router.post('/business_image_total_download/add', businessImageTotalDownloadController.addBusinessImageTotalDownload);

router.get('/notification/list', notificationController.fetchNotification);
router.post('/notification/add', NotificationUpload, notificationController.addNotification);
router.delete('/notification/delete', notificationController.removeNotification);
router.put('/notification/update', NotificationUpload, notificationController.updateNotification);

router.get('/notification_user/list', auth, notificationUserController.fetchNotificationUser);
router.post('/notification_user/add', auth, notificationUserController.addNotificationUser);

router.get('/business_category_image/list', auth, businessCategoryImageController.fetchBusinessCategoryImageList);
router.get('/business_category_image/by_id', businessCategoryImageController.fetchBusinessCategoryImageListByBusinessCategoryId);
router.get('/business_category_image/with_business_category', businessCategoryImageController.fetchBusinessCategoryImageWithBusinessCategory);
router.post('/business_category_image/add', auth, BusinessCategoryImageUpload, businessCategoryImageController.addBusinessCategoryImage);
router.delete('/business_category_image/delete', auth, businessCategoryImageController.removeBusinessCategoryImage);

router.get('/faq_category/list', FAQCategoryController.fetchFAQCategoryList);
router.post('/faq_category/add', auth, FAQCategoryImageUpload, FAQCategoryController.addFAQCategory);
router.delete('/faq_category/delete', auth, FAQCategoryController.removeFAQCategory);
router.put('/faq_category/update', auth, FAQCategoryImageUpload, FAQCategoryController.updateFAQCategory);

router.get('/faq_question/list', FAQQuestionContriller.fetchFAQQuestionList);
router.post('/faq_question/add', auth, FAQQuestionContriller.addFAQQuestion);
router.delete('/faq_question/delete', auth, FAQQuestionContriller.removeFAQQuestion);
router.put('/faq_question/update', auth, FAQQuestionContriller.updateFAQQuestion);

router.get('/request_per_segment/list', auth, requestPerSegmentController.fetchRequestPerSegmentList)
router.post('/request_per_segment/add', auth, RequestPerSegmentUpload, requestPerSegmentController.addRequestPerSegment);
router.delete('/request_per_segment/delete', auth, requestPerSegmentController.removeRequestPerSegment);

module.exports = router;