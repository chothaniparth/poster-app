const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `../TaxFilePosterMedia/Logo`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const uploadFields = [
    { name: 'logo', maxCount: 1 },
];
const mediaUpload = multer({ storage: storage }).fields(uploadFields);

const carouselStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `../TaxFilePosterMedia/Carousel`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const ImageUploadFields = [
    { name: 'Image', maxCount: 1 },
];
const carouselUpload = multer({ storage: carouselStorage }).fields(ImageUploadFields);

const frameStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `../TaxFilePosterMedia/Frame`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const frameUpload = multer({ storage: frameStorage }).fields(ImageUploadFields);

const mainImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `../TaxFilePosterMedia/MainImage`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const mainImageUpload = multer({ storage: mainImageStorage }).fields(ImageUploadFields);

const offerStorage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, '../TaxFilePosterMedia/Offer');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + '_' + file.originalname);
    }
})
const offerUpload = multer({storage : offerStorage}).fields(ImageUploadFields);

const businessCategoryStorage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, '../TaxFilePosterMedia/Business_SubCategory')
    },
    filename : function(req, file, cb){
        cb(null, Date.now() + '_' + file.originalname);
    }
})
const businessSubCategoryUpload = multer({storage : businessCategoryStorage}).fields(ImageUploadFields)

const businessMainImageStorage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, '../TaxFilePosterMedia/BusinessMainImage')
    },
    filename : function(req, file, cb){
        cb(null, Date.now() + '_' + file.originalname);
    }
})
const businessMainImageUpload = multer({storage : businessMainImageStorage}).fields(ImageUploadFields)

const UserPrileStorage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, '../TaxFilePosterMedia/UserProfile')
    },
    filename : function(req, file, cb){
        cb(null, Date.now() + '_' + file.originalname);
    }
})
const userProfileUpload = multer({storage : UserPrileStorage}).fields(ImageUploadFields)

const NotificationStorage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, '../TaxFilePosterMedia/Notification')
    },
    filename : function(req, file, cb){
        cb(null, Date.now() + '_' + file.originalname);
    }
})
const NotificationUpload = multer({storage : NotificationStorage}).fields(ImageUploadFields)

const BusinessCategoryImageStorage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, '../TaxFilePosterMedia/BusinessCategory')
    },
    filename : function(req, file, cb){
        cb(null, Date.now() + '_static_' + file.originalname);
    }
})
const BusinessCategoryImageUpload = multer({storage : BusinessCategoryImageStorage}).fields(ImageUploadFields)

const FAQCategoryImageeStorage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, '../TaxFilePosterMedia/FAQCategory')
    },
    filename : function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
})
const FAQCategoryImageUpload = multer({storage : FAQCategoryImageeStorage}).fields(ImageUploadFields)

const RequestPerSegmentStorage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, '../TaxFilePosterMedia/RequestPerSegment')
    },
    filename : function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
})
const RequestPerSegmentUpload = multer({storage : RequestPerSegmentStorage}).fields(ImageUploadFields)

module.exports = {
    mediaUpload,
    carouselUpload,
    frameUpload,
    mainImageUpload,
    offerUpload,
    businessSubCategoryUpload,
    businessMainImageUpload,
    userProfileUpload,
    NotificationUpload,
    BusinessCategoryImageUpload,
    FAQCategoryImageUpload,
    RequestPerSegmentUpload,
}