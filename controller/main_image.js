const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse, getCommonAPIResponse, safeUnlink, setSQLOrderId } = require('../common/main');
const { LIVE_URL } = require('../common/variable');
const { pool, sql } = require('../sql/connectToDatabase');
const { setSQLBooleanValue } = require('../common/main')
const fs = require('fs');
const { onlyStatusTrue } = require('../common/search_query');
const path = require('path');
const sharp = require('sharp');

const fetchMainImageList = async (req, res) => {
    const result = await getAPIALLDataResponse(req, res, 'tbl_main_image', 'MainImageId');
    res.json(result);
};

const fetchMainImageInAppList = async (req, res) => {
    const result = await getAPIALLDataResponse(req, res, 'tbl_main_image', 'MainImageId', onlyStatusTrue);
    res.json(result);
};

const fetchMainImageById = async (req, res) => {
    try {
        const { MainImageId } = req.query;
        const missingKeys = checkKeysAndRequireValues(['MainImageId'], req.query);
        if (missingKeys.length > 0) {
            return res.status(400).send(errorMessage(`${missingKeys} is Required`));
        }
        const getMainImage = {
            getQuery: `SELECT mainImage.*, imageCategory.Title As ImageCategoryTitle, imageSubCategory.Title As ImageSubCategoryTitle, imageLanguage.Title As ImageLanguageTitle FROM tbl_main_image As mainImage LEFT JOIN tbl_image_category As imageCategory ON mainImage.ImageCategoryId = imageCategory.ImageCategoryId
            LEFT JOIN tbl_image_subcategory As imageSubCategory ON mainImage.ImageSubCategoryId = imageSubCategory.ImageSubCategoryId
            LEFT JOIN tbl_image_language As imageLanguage ON mainImage.ImageLanguageId = imageLanguage.ImageLanguageId WHERE MainImageId = ${MainImageId}`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_main_image WHERE MainImageId = ${MainImageId}`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    } catch (error) {
        console.log('fetch Main Image List Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}
const fetchMAinImageJoinList = async (req, res) => {
    try {
        const getMainImage = {
            getQuery: `SELECT mainImage.*, imageCategory.Title As ImageCategoryTitle, imageSubCategory.Title As ImageSubCategoryTitle, imageLanguage.Title As ImageLanguageTitle FROM tbl_main_image As mainImage 
            LEFT JOIN tbl_image_category As imageCategory ON mainImage.ImageCategoryId = imageCategory.ImageCategoryId
            LEFT JOIN tbl_image_subcategory As imageSubCategory ON mainImage.ImageSubCategoryId = imageSubCategory.ImageSubCategoryId
            LEFT JOIN tbl_image_language As imageLanguage ON mainImage.ImageLanguageId = imageLanguage.ImageLanguageId ORDER BY mainImage.MainImageId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_main_image`
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    } catch (error) {
        res.status(500).send(errorMessage(error?.message));
    }
};

const fetchFestivalCalendarListByDate = async (req, res) => {
    try {
        const { Date, ImageLanguageId } = req.query;
        const missingKeys = checkKeysAndRequireValues(['Date'], { ...req.query });
        if (missingKeys.length > 0) {
            return res.status(400).send(errorMessage(`Missing required keys: ${missingKeys.join(', ')}`));
        }
        let selectImageLanguageId = '';
        if (ImageLanguageId) {
            selectImageLanguageId = `AND CHARINDEX(CONVERT(VARCHAR(50), mainImage.ImageLanguageId), ',' + CONVERT(VARCHAR(50), '${ImageLanguageId}') + ',') > 0`;
        }
        const DateFormat = String(Date);
        const festivalDaysByDate = {
            getQuery: `SELECT 
    mainImage.*, 
    imageCategory.Title AS ImageCategoryTitle,
    imageSubCategory.Title AS ImageSubCategoryTitle,
    imageLanguage.Title AS ImageLanguageTitle,
	DAY(mainImage.StartEventDate) AS ViewStartEventDate,
	DAY(mainImage.EndEventDate) AS ViewEndEventDate
FROM 
    tbl_main_image AS mainImage
LEFT JOIN 
    tbl_image_category AS imageCategory ON mainImage.ImageCategoryId = imageCategory.ImageCategoryId
LEFT JOIN 
    tbl_image_subcategory AS imageSubCategory ON mainImage.ImageSubCategoryId = imageSubCategory.ImageSubCategoryId
LEFT JOIN 
    tbl_image_language AS imageLanguage ON mainImage.ImageLanguageId = imageLanguage.ImageLanguageId
WHERE
    (
        -- Check if today's month and day is between StartEventDate and EndEventDate
        (
            MONTH(CAST('${DateFormat}' AS DATE)) = MONTH(mainImage.StartEventDate) AND 
            DAY(CAST('${DateFormat}' AS DATE)) >= DAY(mainImage.StartEventDate) AND 
            DAY(CAST('${DateFormat}' AS DATE)) <= DAY(mainImage.EndEventDate)
        )
        OR
        (
            -- Check if today's month and day matches exactly with StartEventDate
            MONTH(CAST('${DateFormat}' AS DATE)) = MONTH(mainImage.StartEventDate) AND 
            DAY(CAST('${DateFormat}' AS DATE)) = DAY(mainImage.StartEventDate)
        )
        OR
        (
            -- Check if today's month and day matches exactly with EndEventDate
            MONTH(CAST('${DateFormat}' AS DATE)) = MONTH(mainImage.EndEventDate) AND 
            DAY(CAST('${DateFormat}' AS DATE)) = DAY(mainImage.EndEventDate)
        )
    ) 
    AND mainImage.Status = 1 
    AND mainImage.ViewCalendar = 1 
    ${selectImageLanguageId}
	ORDER BY
    CASE
        WHEN mainImage.OrderId IS NULL THEN 1
        ELSE 0
    END,
    mainImage.OrderId ASC,
    mainImage.MainImageId DESC
`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_main_image AS mainImage WHERE (
        -- Check if today's month and day is between StartEventDate and EndEventDate
        (
            MONTH(CAST('${DateFormat}' AS DATE)) = MONTH(mainImage.StartEventDate) AND 
            DAY(CAST('${DateFormat}' AS DATE)) >= DAY(mainImage.StartEventDate) AND 
            DAY(CAST('${DateFormat}' AS DATE)) <= DAY(mainImage.EndEventDate)
        )
        OR
        (
            -- Check if today's month and day matches exactly with StartEventDate
            MONTH(CAST('${DateFormat}' AS DATE)) = MONTH(mainImage.StartEventDate) AND 
            DAY(CAST('${DateFormat}' AS DATE)) = DAY(mainImage.StartEventDate)
        )
        OR
        (
            -- Check if today's month and day matches exactly with EndEventDate
            MONTH(CAST('${DateFormat}' AS DATE)) = MONTH(mainImage.EndEventDate) AND 
            DAY(CAST('${DateFormat}' AS DATE)) = DAY(mainImage.EndEventDate)
        )
		AND (mainImage.EveryYearShow = 1 AND mainImage.Status = 1 AND mainImage.ViewCalendar = 1 ${selectImageLanguageId})
    )`
        };

        const result = await getCommonAPIResponse(req, res, festivalDaysByDate);
        res.json(result);
    } catch (error) {
        res.status(500).send(errorMessage(error?.message));
    }
};

const fetchImageSearchAPI = async (req, res) => {
    try {
      const { ImageCategoryId, ImageSubCategoryId, StartDate, EndDate, Trending, Search } = req.query;
      const queryArray = [];
      
      if (ImageCategoryId) {
        queryArray.push(`mainImage.ImageCategoryId = ${ImageCategoryId}`);
      }
      if (ImageSubCategoryId) {
        queryArray.push(`mainImage.ImageSubCategoryId = ${ImageSubCategoryId}`);
      }
      if (Trending && Trending === 'true') {
        queryArray.push(`mainImage.Tranding = 1`);
      }
      if (StartDate && EndDate) {
        queryArray.push(`(mainImage.StartEventDate <= '${EndDate}' AND mainImage.EndEventDate >= '${StartDate}')`);
      }

      if (Search) {
        queryArray.push(`(imageCategory.Title LIKE '%${Search}%' OR imageSubCategory.Title LIKE '%${Search}%')`);
      }
  
      const getMainImage = {
        getQuery: `
          SELECT 
            mainImage.*, 
            imageCategory.Title AS ImageCategoryTitle, 
            imageSubCategory.Title AS ImageSubCategoryTitle 
          FROM 
            tbl_main_image AS mainImage 
            LEFT JOIN tbl_image_category AS imageCategory 
              ON imageCategory.ImageCategoryId = mainImage.ImageCategoryId 
            LEFT JOIN tbl_image_subcategory AS imageSubCategory 
              ON imageSubCategory.ImageSubCategoryId = mainImage.ImageSubCategoryId 
          ${queryArray.length > 0 ? 'WHERE ' + queryArray.join(' AND ') : ''} ORDER BY mainImage.MainImageId DESC`,
        countQuery: `
          SELECT 
            COUNT(*) AS totalCount 
          FROM 
            tbl_main_image AS mainImage 
            LEFT JOIN tbl_image_category AS imageCategory 
              ON imageCategory.ImageCategoryId = mainImage.ImageCategoryId 
            LEFT JOIN tbl_image_subcategory AS imageSubCategory 
              ON imageSubCategory.ImageSubCategoryId = mainImage.ImageSubCategoryId 
          ${queryArray.length > 0 ? 'WHERE ' + queryArray.join(' AND ') : ''}`
      };
      const result = await getCommonAPIResponse(req, res, getMainImage);
      res.json(result);
    } catch (error) {
      console.log('error :>> ', error);
      return res.status(500).send(errorMessage(error?.message));
    }
  };
  
const fetchImagesByImageCategoryId = async (req, res) => {
    try {
        const { ImageCategoryId, ImageLanguageId } = req.query;
        const missingKeys = checkKeysAndRequireValues(['ImageCategoryId'], { ...req.query });
        if (missingKeys.length > 0) {
            return res.status(400).send(errorMessage(`Missing required keys: ${missingKeys.join(', ')}`));
        }
        let selectImageLanguageId = '';
        let ImageSubCategoryId = req.query.ImageSubCategoryId ? `AND mainImage.ImageSubCategoryId = ${req.query.ImageSubCategoryId}` : '';
        if (ImageLanguageId) {
            selectImageLanguageId = `AND CHARINDEX(CONVERT(VARCHAR(50), ImageLanguageId), ',' + CONVERT(VARCHAR(50), ${ImageLanguageId}) + ',') > 0`;
        }
        const result = await pool.request().query(`SELECT mainImage.MainImageId, mainImage.Image, mainImage.OrderId, mainImage.ImageCategoryId, mainImage.ImageSubCategoryId, mainImage.Status, mainImage.Premium, mainImage.Thumbnail, imageSubCategory.Title As ImageSubCategoryTitle FROM tbl_main_image As mainImage JOIN tbl_image_subcategory As imageSubCategory ON mainImage.ImageSubCategoryId = imageSubCategory.ImageSubCategoryId WHERE mainImage.ImageCategoryId = ${ImageCategoryId} ${ImageSubCategoryId} AND mainImage.Status = 1 ${selectImageLanguageId} ORDER BY CASE WHEN OrderId IS NULL THEN 1 ELSE 0 END, OrderId ASC, mainImage.MainImageId DESC`);
        res.json({
            data: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).send(errorMessage(error?.message));
    }
}

const fetchDashboardAllImagesView = async (req, res) => {
    try {
        const { ImageLanguageId } = req.query;
        let selectImageLanguageId = '';

        if (ImageLanguageId) {
            selectImageLanguageId = `AND CHARINDEX(CONVERT(VARCHAR(50), ImageLanguageId), ',' + CONVERT(VARCHAR(50), ${ImageLanguageId}) + ',') > 0`;
        }
        // Fetch categories
        const getCategoryList = await pool.request().query(`
            SELECT imageCategory.ImageCategoryId, imageCategory.Title 
            FROM tbl_image_category As imageCategory 
            WHERE imageCategory.Status = 1 AND NOT CHARINDEX(',' + CAST(imageCategory.ImageCategoryId AS VARCHAR(10)) + ',', ',6,7,') > 0
        `);
        if (getCategoryList.rowsAffected < 1) {
            return res.status(500).send({ message: 'No category found' });
        }
        const productList = [];
        let categoryList = getCategoryList.recordset;
        for (const category of categoryList) {
            const imageListResult = await pool.request().query(`
                SELECT mainImage.*, 
                imageSubCategory.Title As ImageSubCategoryTitle 
                FROM tbl_main_image As mainImage
                JOIN tbl_image_subcategory As imageSubCategory ON mainImage.ImageSubCategoryId = imageSubCategory.ImageSubCategoryId 
                WHERE mainImage.ImageCategoryId = ${category.ImageCategoryId} 
                  AND mainImage.Status = 1 ${selectImageLanguageId} ORDER BY 
                  CASE 
                      WHEN OrderId IS NULL THEN 1
                      ELSE 0
                  END,
                  OrderId ASC, MainImageId DESC OFFSET 0 ROWS FETCH NEXT 15 ROWS ONLY
            `);
            if (imageListResult.rowsAffected < 1) {
                // category.imageList = [];
            } else {
                category.imageList = imageListResult.recordset.map(item => ({
                    Image: item.Image,
                    Thumbnail: item.Thumbnail,
                    ImageCategoryId: item.ImageCategoryId,
                    ImageSubCategoryId: item.ImageSubCategoryId,
                    ImageSubCategoryTitle: item.ImageSubCategoryTitle,
                    MainImageId: item.MainImageId,
                    Premium: item.Premium,
                }));
                productList.push({
                    Title: category.Title,
                    ImageList: category.imageList,
                    ImageCategoryId: category.ImageCategoryId
                });
            }
        }
        res.json({
            data: productList,
            count: productList.length
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
};

const fetchDashboardAllDueDateImages = async (req, res) => {
    try {
        const { ImageCategoryId } = req.query;
        const missingKeys = checkKeysAndRequireValues(['ImageCategoryId'], { ...req.query });
        if (missingKeys.length > 0) {
            return res.status(400).send(errorMessage(`Missing required keys: ${missingKeys.join(', ')}`));
        }
        const productList = [];
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const imageListResult = await pool.request().query(`
                SELECT mainImage.*, imageSubCategory.Title As ImageSubCategoryTitle
                FROM tbl_main_image As mainImage 
                JOIN tbl_image_subcategory As imageSubCategory ON mainImage.ImageSubCategoryId = imageSubCategory.ImageSubCategoryId
                WHERE mainImage.ImageCategoryId = ${ImageCategoryId} 
                  AND mainImage.Status = 1 
                ORDER BY 
                  CASE 
                      WHEN OrderId IS NULL THEN 1
                      ELSE 0
                  END,
                  OrderId ASC
            `);

        if (imageListResult.recordset.length > 0) {
            const dateMap = new Map();
            imageListResult.recordset.forEach(item => {
                // Old Feature
                // const startEventDate = new Date(item.StartEventDate);
                // const endEventDate = new Date(item.EndEventDate);
                // endEventDate.setHours(0, 0, 0, 0); // Clear the time part for accurate comparison
                // if (endEventDate >= currentDate) {
                //     const formattedDate = startEventDate.toLocaleDateString('en-GB', {

                // New Feature
                const startEventDate = new Date(item.StartEventDate);
                const endEventDate = new Date(item.EndEventDate);
                endEventDate.setHours(0, 0, 0, 0); // Clear the time part for accurate comparison
                if (endEventDate >= currentDate) {
                    const formattedDate = startEventDate.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    });

                    if (!dateMap.has(formattedDate)) {
                        dateMap.set(formattedDate, []);
                    }
                    dateMap.get(formattedDate).push({
                        Image: item.Image,
                        Thumbnail: item.Thumbnail,
                        ImageCategoryId: item.ImageCategoryId,
                        ImageSubCategoryId: item.ImageSubCategoryId,
                        ImageSubCategoryTitle: item.ImageSubCategoryTitle,
                        Premium: item.Premium,
                        MainImageId: item.MainImageId
                    });
                }
            });

            const imageList = [...dateMap.entries()].map(([date, images]) => ({
                Date: date,
                ImageList: images
            }));

            if (imageList.length > 0) {
                productList.push({
                    ImageList: imageList,
                    ImageCategoryId: ImageCategoryId
                });
            }
        }

        res.json({
            data: productList,
            count: productList.length
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
};

// const fetchStartToEndDateAllImages = async (req, res) => {
//     try {
//         const { StartDate, EndDate } = req.query;
//         const missingKeys = checkKeysAndRequireValues(['StartDate', 'EndDate'], { ...req.query });
//         if (missingKeys.length > 0) {
//             return res.status(400).send(errorMessage(`Missing required keys: ${missingKeys.join(', ')}`));
//         }
//         const result = await pool.request().query(`SELECT mainImage.*, imageCategory.Title As ImageCategoryTitle, imageSubCategory.Title As ImageSubCategoryTitle, imageLanguage.Title As ImageLanguageTitle FROM tbl_main_image As mainImage
//         LEFT JOIN tbl_image_category As imageCategory ON mainImage.ImageCategoryId = imageCategory.ImageCategoryId
//         LEFT JOIN tbl_image_subcategory As imageSubCategory ON mainImage.ImageSubCategoryId = imageSubCategory.ImageSubCategoryId
//         LEFT JOIN tbl_image_language As imageLanguage ON mainImage.ImageLanguageId = imageLanguage.ImageLanguageId
//         WHERE mainImage.EventDate BETWEEN '${StartDate}' AND '${EndDate}' AND mainImage.Status = 1`);
//         res.json({
//             data: result.recordset,
//             count: result.recordset.length
//         });
//     } catch (error) {
//         return res.status(500).send(errorMessage(error?.message));
//     }
// }

const fetchTrandingImages = async (req, res) => {
    try {
        const { Status } = req.query;
        let status = '';
        if (Status === 'true') {
            status = 'AND tbl_main_image.Status = 1';
        }
        const getMainImage = {
            getQuery: `SELECT tbl_main_image.MainImageId, tbl_main_image.ImageCategoryId, tbl_main_image.ImageSubCategoryId, tbl_main_image.Image, tbl_main_image.Status, tbl_main_image.Tranding, tbl_main_image.Thumbnail, tbl_main_image.Premium,  tbl_image_subcategory.Title AS SubCategoryTitle FROM tbl_main_image JOIN tbl_image_subcategory ON tbl_main_image.ImageSubCategoryId = tbl_image_subcategory.ImageSubCategoryId WHERE Tranding = 1 ${status} ORDER BY MainImageId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_main_image JOIN tbl_image_subcategory ON tbl_main_image.ImageSubCategoryId = tbl_image_subcategory.ImageSubCategoryId WHERE Tranding = 1 ${status}`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    } catch (error) {
        res.status(500).send(errorMessage(error?.message));
    }
}

const addMainImageList = async (req, res) => {
    try {
        const { ImageCategoryId, ImageSubCategoryId, Status, ImageLanguageId, OrderId = null, Premium, EveryYearShow, ViewCalendar, Tranding, StartEventDate, EndEventDate } = req.body;
        let imageURL = req?.files?.Image?.length ? `${LIVE_URL}/${req?.files?.Image[0]?.filename}` : "";

        const missingKeys = checkKeysAndRequireValues(['ImageCategoryId', 'ImageSubCategoryId', 'Status', 'ImageLanguageId', 'Premium', 'EveryYearShow', 'ViewCalendar', 'Tranding', 'StartEventDate', 'EndEventDate'], { ...req.body, Image: imageURL })
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }

        const thumbnailDir = '../TaxFilePosterMedia/MainImage/Thumbnail';
        const thumbnailFilename = 'thumbnail_' + req?.files?.Image[0]?.filename;
        const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

        await sharp(req?.files?.Image[0]?.path)
            .resize(250, 250) // Adjust width and height as needed
            .toFile(thumbnailPath);

        let imageURLThumbnail = `${LIVE_URL}/Thumbnail/thumbnail_${req?.files?.Image[0]?.filename}`;
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_main_image (Image, Thumbnail, ImageCategoryId, ImageSubCategoryId, Status, ImageLanguageId, OrderId, Premium, EveryYearShow, ViewCalendar, Tranding, StartEventDate, EndEventDate, IPAddress, ServerName, EntryTime) VALUES ('${imageURL}', '${imageURLThumbnail}', '${ImageCategoryId}', '${ImageSubCategoryId}', ${setSQLBooleanValue(Status)}, '${ImageLanguageId}', ${setSQLOrderId(OrderId)}, ${setSQLBooleanValue(Premium)}, ${setSQLBooleanValue(EveryYearShow)}, ${setSQLBooleanValue(ViewCalendar)}, ${setSQLBooleanValue(Tranding)}, '${StartEventDate}', '${EndEventDate}', '${IPAddress}', '${ServerName}', '${EntryTime}')`;
        const result = await pool.query(insertQuery)

        if (result.rowsAffected[0] > 0) {
            return res.status(200).send({ ...successMessage("Data inserted successfully!") });
        } else {
            return res.status(400).send(errorMessage('No rows inserted of Main Image!'));
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const removeMainImageById = async (req, res) => {
    try {
        const query = req.query;
        const { MainImageId } = query;

        if (!MainImageId || isNaN(MainImageId)) {
            return res.status(400).send('Invalid value for parameter "MainImageId". Must be a valid number.');
        }
        const data = await pool.request().query(`SELECT * FROM tbl_main_image where MainImageId = ${MainImageId}`);

        const result = await pool.request()
            .input('MainImageId', sql.Int, MainImageId)
            .query('DELETE FROM tbl_main_image WHERE MainImageId = @MainImageId');

        if (result.rowsAffected[0] > 0) {
            // fs.unlinkSync(data.recordset[0].Image.replace(LIVE_URL, `../TaxFilePosterMedia/MainImage`));
            safeUnlink(data.recordset[0].Image.replace(LIVE_URL, `../TaxFilePosterMedia/MainImage`));
            return res.status(200).send(successMessage('Data deleted successfully!'));
        } else {
            return res.status(404).send(errorMessage('Image not found'));
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

const updateMainImageById = async (req, res) => {

    try {
        const { MainImageId, ImageCategoryId, ImageSubCategoryId, Status, ImageLanguageId, OrderId = null, Premium, EveryYearShow, ViewCalendar, Tranding, StartEventDate, EndEventDate } = req.body;
        if (checkKeysAndRequireValues(['MainImageId'], { ...req.body }).length > 0) {
            return res.status(400).send(`${checkKeysAndRequireValues(['MainImageId'], { ...req.body }).join(', ')} parameters are required and must not be null or undefined`);
        }
        const previousData = await pool.request().query(`SELECT * FROM tbl_main_image where MainImageId = ${MainImageId}`);
        if (previousData?.recordset?.length === 0) {
            return res.send(errorMessage('Image not found'));
        }
        const previousDataView = previousData?.recordset[0]
        let mainImageURL = updateUploadFiles(req?.files?.Image, previousDataView.Image, 'MainImage');
        const missingKeys = checkKeysAndRequireValues(['ImageCategoryId', 'ImageSubCategoryId', 'Status', 'ImageLanguageId', 'Premium', 'EveryYearShow', 'ViewCalendar', 'Tranding', 'StartEventDate', 'EndEventDate'], { ...req.body, Image: mainImageURL })
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();

        let imageURLThumbnail = '';
        if (req?.files?.Image?.length) {
            const thumbnailDir = '../TaxFilePosterMedia/MainImage/Thumbnail';
            const thumbnailFilename = 'thumbnail_' + req?.files?.Image[0]?.filename;
            const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
            await sharp(req?.files?.Image[0]?.path)
                .resize(250, 250) // Adjust width and height as needed
                .toFile(thumbnailPath);
            imageURLThumbnail = `Thumbnail = ` + `'${LIVE_URL}/Thumbnail/thumbnail_${req?.files?.Image[0]?.filename}',`;
        }
        const updatedQuery = `UPDATE tbl_main_image SET Image = '${mainImageURL}', ${imageURLThumbnail} ImageCategoryId = ${ImageCategoryId}, ImageSubCategoryId = ${ImageSubCategoryId}, Status = ${setSQLBooleanValue(Status)}, ImageLanguageId = ${ImageLanguageId}, OrderId = ${setSQLOrderId(OrderId)}, Premium = ${setSQLBooleanValue(Premium)}, EveryYearShow = ${setSQLBooleanValue(EveryYearShow)}, ViewCalendar = ${setSQLBooleanValue(ViewCalendar)}, Tranding = ${setSQLBooleanValue(Tranding)}, StartEventDate = '${StartEventDate}', EndEventDate = '${EndEventDate}', IPAddress = '${IPAddress}', ServerName = '${ServerName}', EntryTime = '${EntryTime}'  WHERE MainImageId = '${MainImageId}'`;
        const result = await pool.query(updatedQuery)
        if (result.rowsAffected[0] > 0) {
            return res.status(200).send(successMessage("Data updated successfully!")); // or any other success message
        } else {
            if (req?.files?.logo?.length) {
                // await fs.unlinkSync(req?.files?.Image[0]?.path);
                safeUnlink(req?.files?.Image[0]?.path);
            }
            return res.status(400).send(errorMessage('No rows updated of Carousel!'));
        }
    } catch (error) {
        if (req?.files?.Image?.length) {
            // await fs.unlinkSync(req?.files?.Image[0]?.path);
            safeUnlink(req?.files?.Image[0]?.path);
        }
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = {
    fetchMainImageList,
    fetchMainImageInAppList,
    addMainImageList,
    removeMainImageById,
    updateMainImageById,
    fetchMAinImageJoinList,
    fetchFestivalCalendarListByDate,
    fetchDashboardAllImagesView,
    fetchImageSearchAPI,
    // fetchStartToEndDateAllImages,
    fetchDashboardAllDueDateImages,
    fetchImagesByImageCategoryId,
    fetchTrandingImages,
    fetchMainImageById
};