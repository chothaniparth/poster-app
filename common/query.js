const createUserTable = `(
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Role NVARCHAR(50),
    Permission NVARCHAR(500),
    Logo NVARCHAR(500),
    Category NVARCHAR(100),
    BussinessName NVARCHAR(100),
    Address NVARCHAR(500),
    RegisterMobile NVARCHAR(10),
    Mobile1 NVARCHAR(10),
    Mobile2 NVARCHAR(10),
    Email NVARCHAR(100),
    Status BIT,
    WebSite NVARCHAR(100),
    DownloadLimit INT,
    SocialLink NVARCHAR(150),
    WebsiteURL NVARCHAR(150),
    InstagramURL NVARCHAR(150),
    FacebookURL NVARCHAR(150),
    YoutubeURL NVARCHAR(150),
    Deleted BIT DEFAULT(0),
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createCarouselTable = `(
    CarouselId INT IDENTITY(1,1) PRIMARY KEY,
    Image NVARCHAR(500),
	Status BIT,
    OrderId INT,
    LinkId INT,
    Link NVARCHAR(100),
    LinkType NVARCHAR(25),
    MainImageId INT FOREIGN KEY REFERENCES tbl_main_image(MainImageId),
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createFrameTable = `(
    FrameId INT IDENTITY(1,1) PRIMARY KEY,
    Image NVARCHAR(500),
	Status BIT,
    OrderId INT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createImageCategoryTable = `(
    ImageCategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(100),
    Status BIT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createImageSubCategoryTable = `(
    ImageSubCategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(100),
    Status BIT,
    ImageCategoryId INT FOREIGN KEY REFERENCES tbl_image_category(ImageCategoryId),
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createImageLanguageTable = `(
    ImageLanguageId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(100),
    Status BIT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createUserCategoryTable = `(
    UserCategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(100),
    Status BIT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createMainImageTable = `(
    MainImageId INT IDENTITY(1,1) PRIMARY KEY,
    Image NVARCHAR(500),
    Thumbnail NVARCHAR(500),
    ImageCategoryId INT FOREIGN KEY REFERENCES tbl_image_category(ImageCategoryId),
    ImageSubCategoryId INT FOREIGN KEY REFERENCES tbl_image_subcategory(ImageSubCategoryId),
    StartEventDate DATETIME,
    EndEventDate DATETIME,
    Status BIT,
    ImageLanguageId INT FOREIGN KEY REFERENCES tbl_image_language(ImageLanguageId),
    OrderId INT,
    Premium BIT,
    EveryYearShow BIT,
    Tranding BIT,
    ViewCalendar BIT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createFeedbackTable = `(
    FeedbackId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100),
    Email NVARCHAR(100),
    Message NVARCHAR(500),
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createPlanDetailsTable = `(
    PlanDetailsId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(100),
    Status BIT,
    Free BIT,
    Premium BIT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createPlanPricingTable = `(
    PlanPricingId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(100),
    OriginalPrice INT,
    DiscountedPrice INT,
    Percentage INT,
    TotalDays INT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createProfileRequestTable = `(
    ProfileRequestId INT IDENTITY(1,1) PRIMARY KEY,
    RequestType NVARCHAR(100) CHECK(RequestType IN('Pending', 'Approved', 'Rejected')),
    UserId INT,
    Logo NVARCHAR(500),
    Category NVARCHAR(100),
    BusinessName NVARCHAR(100),
    Address NVARCHAR(500),
    RegisterMobile NVARCHAR(10),
    Mobile1 NVARCHAR(10),
    Mobile2 NVARCHAR(10),
    Email NVARCHAR(100),
    WebSite NVARCHAR(100),
    SocialLink NVARCHAR(150),
    WebsiteURL NVARCHAR(150),
    InstagramURL NVARCHAR(150),
    FacebookURL NVARCHAR(150),
    YoutubeURL NVARCHAR(150),
    CGUID NVARCHAR(100),
    Role NVARCHAR(50),
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createSentMessageToAdminTable = `(
    MessageId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT,
    Image NVARCHAR(500),
    Name NVARCHAR(100),
    Message NVARCHAR(500),
    CGUID NVARCHAR(100),
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createSubcriptionTable = `(
    SubscriptionId INT IDENTITY(1,1) PRIMARY KEY,
    Status BIT,
    PlanStatus NVARCHAR(100) CHECK(PlanStatus IN('Pending', 'Active', 'Expired')),
    Type NVARCHAR(100),
    OriginalPrice DECIMAL(10,2),
    DiscountedPrice DECIMAL(10,2),
    TotalDays INT,
    StartDate DATETIME,
    EndDate DATETIME,
    CGST DECIMAL(10,2),
    SGST DECIMAL(10,2),
    UserId INT,
    TotalPrice DECIMAL(10,2),
    GrandTotalPrice DECIMAL(10,2),
    Discount DECIMAL(10,2),
    GSTName NVARCHAR(150),
    GSTNumber NVARCHAR(150),
    PaymentId NVARCHAR(150),
    OrderId NVARCHAR(150),
    Signature NVARCHAR(150),
    Remark NVARCHAR(150),
    AmountInWord NVARCHAR(500),
    InvoiceNo NVARCHAR(100),
    InvoiceDate DATETIME,
    TrialPlan BIT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createTestingTable = `(
    TestingId INT IDENTITY(1,1) PRIMARY KEY,
    EventDate DATETIME,
)`

const createOfferTable = `(
    OfferId INT IDENTITY(1,1) PRIMARY KEY,
    Status BIT,
    Image NVARCHAR(500),
    Remark NVARCHAR(250),
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createRazorpayCredentialsTable = `(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    KeyId NVARCHAR(100),
    SecretKey NVARCHAR(100),
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createWhatsNewFeatureTable = `(
    WhatsNewFeatureId INT IDENTITY(1,1) PRIMARY KEY,
    Release NVARCHAR(50),
    Description NVARCHAR(500),
    WType NVARCHAR(50),
    ReleaseDate DATETIME,
    Status BIT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createCompanyBankDetailsTable = `(
    BankName NVARCHAR(50),
    AccountHolderName NVARCHAR(50),
    AccountNumber NVARCHAR(50),
    IFSCCode NVARCHAR(50),
    HSNCode NVARCHAR(50),
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createBusinessCategoryTable = `(
    BusinessCategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(100),
    Status BIT,
    OrderId INT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createBusinessSubCategoryTable = `(
    BusinessSubCategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(100),
    Image NVARCHAR(500),
    Thumbnail NVARCHAR(500),
    OrderId INT,
    Status BIT,
    BusinessCategoryId INT FOREIGN KEY REFERENCES tbl_business_category(BusinessCategoryId),
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createBusinessMainImageTable = `(
    BusinessMainImageId INT IDENTITY(1,1) PRIMARY KEY,
    BusinessCategoryId INT FOREIGN KEY REFERENCES tbl_business_category(BusinessCategoryId),
    BusinessSubCategoryId INT FOREIGN KEY REFERENCES tbl_business_sub_category(BusinessSubCategoryId),
    Image NVARCHAR(500),
    Thumbnail NVARCHAR(500),
    ImageLanguageId INT FOREIGN KEY REFERENCES tbl_image_language(ImageLanguageId),
    OrderId INT,
    Premium BIT,
    Status BIT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createUserProfileTable = `(
    UserProfileId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    DOB DATE,
    Gender NVARCHAR(100) CHECK(Gender IN('Male', 'Female', 'Others')),
    Designation NVARCHAR(100),
    Mobile NVARCHAR(10),
    Email NVARCHAR(100),
    Image NVARCHAR(500),
    State NVARCHAR(100),
    City NVARCHAR(100),
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME DEFAULT GETDATE()
)`

const createMainImageTotalDownloadTable = `(
    MainImageTotalDownloadId INT IDENTITY(1,1) PRIMARY KEY,
    MainImageId INT,
    UserId INT,
    ImageCategoryId INT,
    ImageSubCategoryId INT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createBusinessImageTotalDownloadTable = `(
    BusinessImageTotalDownloadId INT IDENTITY(1,1) PRIMARY KEY,
    BusinessMainImageId INT,
    BusinessSubCategoryId INT,
    BusinessCategoryId INT,
    UserId INT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createNotificationTable = `(
    NotificationId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200),
    Description NVARCHAR(500),
    Image NVARCHAR(500),
    StartDate DATETIME,
    EndDate DATETIME,
    NotificationStatus NVARCHAR(100) CHECK(NotificationStatus IN('Active', 'Pending', 'Expired')),
    Status BIT,
    MainImageId INT,
    Link NVARCHAR(100),
    LinkType NVARCHAR(25),
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME DEFAULT GETDATE()
)`

const createNotificationUserTable = `(
    NotificationUserId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT,
    NotificationId INT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME DEFAULT GETDATE()
)`

const createBusinessCategoryImageTable = `(
    BusinessCategoryImageId INT IDENTITY(1,1) PRIMARY KEY,
    Image NVARCHAR(500),
    Status BIT DEFAULT 1,
    BusinessCategoryId INT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME
)`

const createFAQCategoryTable = `(
    FAQCategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(150) NOT NULL,
    Image NVARCHAR(500) NOT NULL,
    Status BIT NOT NULL DEFAULT 1,
    OrderId INT,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME DEFAULT GETDATE()
)`

const creareFAQQuestionTable = `(
    FAQQuestionId INT IDENTITY(1,1) PRIMARY KEY,
    FAQCategoryId INT FOREIGN KEY REFERENCES tbl_faq_category(FAQCategoryId) NOT NULL,
    Question NVARCHAR(1000) NOT NULL,
    Answer NVARCHAR(1000) NOT NULL,
    Links NVARCHAR(1000),
    Status BIT NOT NULL DEFAULT 1,
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME DEFAULT GETDATE()
)`

const createRequestPerSegmentTable = `(
    SegmentId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT,
    Title NVARCHAR(100),
    Description NVARCHAR(500),
    Image NVARCHAR(500),
    IPAddress NVARCHAR(50),
    ServerName NVARCHAR(50),
    EntryTime DATETIME DEFAULT GETDATE()
    )`

module.exports = {
    createUserTable,
    createCarouselTable,
    createFrameTable,
    createUserCategoryTable,
    createImageCategoryTable,
    createImageSubCategoryTable,
    createImageLanguageTable,
    createMainImageTable,
    createFeedbackTable,
    createPlanDetailsTable,
    createPlanPricingTable,
    createProfileRequestTable,
    createSentMessageToAdminTable,
    createSubcriptionTable,
    createTestingTable,
    createOfferTable,
    createRazorpayCredentialsTable,
    createWhatsNewFeatureTable,
    createCompanyBankDetailsTable,
    createBusinessCategoryTable,
    createBusinessSubCategoryTable,
    createBusinessMainImageTable,
    createUserProfileTable,
    createMainImageTotalDownloadTable,
    createBusinessImageTotalDownloadTable,
    createNotificationTable,
    createNotificationUserTable,
    createBusinessCategoryImageTable,
    createFAQCategoryTable,
    creareFAQQuestionTable,
    createRequestPerSegmentTable
}