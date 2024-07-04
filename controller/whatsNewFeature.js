const {
  checkKeysAndRequireValues,
  errorMessage,
  successMessage,
  updateUploadFiles,
  getCommonKeys,
  getAPIALLDataResponse,
  getCommonAPIResponse,
} = require("../common/main");
const { setSQLBooleanValue } = require("../common/main");
const { onlyStatusTrue } = require("../common/search_query");
const { pool, sql } = require("../sql/connectToDatabase");

const fetchWhatskkList = async (req, res) => {
  try {
    const result = await getAPIALLDataResponse(
      req,
      res,
      "tbl_whats_new_feature",
      "WhatsNewFeatureId"
    );
    res.json(result);
  } catch (error) {
    console.log("Fetch Whats new feature Error :", error);
    return res.status(500).send(error?.message);
  }
};

const fetchWhatskkListApp = async (req, res) => {
  try {
    const result = await getAPIALLDataResponse(
      req,
      res,
      "tbl_whats_new_feature",
      "WhatsNewFeatureId",
      onlyStatusTrue
    );
    res.json(result);
  } catch (error) {
    console.log("Fetch Whats new feature Whats Error :", error);
    return res.status(500).send(error?.message);
  }
};

const addWhats = async (req, res) => {
  try {
    const { Release, Description, WType, Status, ReleaseDate } = req.body;
    const missingKeys = checkKeysAndRequireValues(
      ["Release", "Description", "WType", "Status", "ReleaseDate"],
      req.body
    );
    if (missingKeys.length > 0) {
      return res.status(404).send(errorMessage(`${missingKeys} is required`));
    }
    const { IPAddress, ServerName, EntryTime } = getCommonKeys();
    const query = `INSERT INTO tbl_whats_new_feature (Release, Description, WType, Status, ReleaseDate, IPAddress, ServerName, EntryTime) VALUES ('${Release}', '${Description}', '${WType}', ${setSQLBooleanValue(
      Status
    )}, '${ReleaseDate}', '${IPAddress}', '${ServerName}', '${EntryTime}')`;
    const result = await pool.request().query(query);
    if (result.rowsAffected[0] === 0) {
      return res
        .status(400)
        .send(errorMessage("No row Inserted in Whats New Feature."));
    }
    return res.status(200).send(successMessage("Data Inserted Successfully."));
  } catch (error) {
    console.log("Add Whats new feature Error :", error);
    return res.status(500).send(error?.message);
  }
};

const removeWhats = async (req, res) => {
  try {
    const { WhatsNewFeatureId } = req.query;
    const missingKeys = checkKeysAndRequireValues(
      ["WhatsNewFeatureId"],
      req.query
    );
    if (missingKeys.length > 0) {
      return res.status(404).send(errorMessage(`${missingKeys} is required`));
    }
    const query = `DELETE FROM tbl_whats_new_feature WHERE WhatsNewFeatureId = ${WhatsNewFeatureId}`;
    const result = await pool.request().query(query);
    if (result.rowsAffected[0] === 0) {
      return res
        .status(400)
        .send(errorMessage("No row Deleted in Whats New Feature."));
    }
    return res.status(200).send(successMessage("Data deleted Successfully."));
  } catch (error) {
    console.log("Remove Whats new feature Error :", error);
    return res.status(500).send(error?.message);
  }
};

const updateWhats = async (req, res) => {
  try {
    const {
      Release,
      Description,
      WType,
      Status,
      ReleaseDate,
      WhatsNewFeatureId,
    } = req.body;
    const missingKeys = checkKeysAndRequireValues(
      [
        "WhatsNewFeatureId",
        "Release",
        "Description",
        "WType",
        "Status",
        "ReleaseDate",
      ],
      req.body
    );
    if (missingKeys.length > 0) {
      return res.status(404).send(errorMessage(`${missingKeys} is required`));
    }
    const { IPAddress, ServerName, EntryTime } = getCommonKeys();
    const query = `UPDATE tbl_whats_new_feature SET 
            Release = '${Release}', 
            Description = '${Description}', 
            WType = '${WType}', 
            Status = ${setSQLBooleanValue(Status)}, 
            ReleaseDate = '${ReleaseDate}', 
            IPAddress = '${IPAddress}', 
            ServerName = '${ServerName}', 
            EntryTime = '${EntryTime}' 
        WHERE WhatsNewFeatureId = ${WhatsNewFeatureId}`;
    const result = await pool.request().query(query);
    if (result.rowsAffected[0] === 0) {
      return res
        .status(400)
        .send(errorMessage("No row Updated in Whats New Feature."));
    }
    return res.status(200).send(successMessage("Data Inserted Successfully."));
  } catch (error) {
    console.log("Update Whats new feature Error :", error);
    return res.status(500).send(error?.message);
  }
};

module.exports = {
  fetchWhatskkList,
  fetchWhatskkListApp,
  addWhats,
  removeWhats,
  updateWhats,
};
