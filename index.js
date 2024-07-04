const express = require('express');
// const sql = require('mssql');
const bodyParser = require('body-parser');
const routes = require('./Routes/routes.js');
const cors = require("cors");
const { connectToDatabase } = require('./sql/connectToDatabase.js');
const { PORT } = require('./common/variable.js');
const { createAllTableInDB } = require('./common/version.js');
const cron = require('node-cron');
const { setAutoDownloadLimit, autoVerifySubscription, autoVerifyNotification } = require('./controller/autoRunQuery.js');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json())
app.use(cors());

app.use('/', express.static(`../TaxFilePosterMedia/Logo`));
app.use('/', express.static(`../TaxFilePosterMedia/Carousel`));
app.use('/', express.static(`../TaxFilePosterMedia/Frame`));
app.use('/', express.static(`../TaxFilePosterMedia/MainImage`));
app.use('/', express.static(`../TaxFilePosterMedia/UpdatedLogo`));
app.use('/', express.static(`../TaxFilePosterMedia/Offer`));
app.use('/', express.static(`../TaxFilePosterMedia/Business_SubCategory`));
app.use('/', express.static(`../TaxFilePosterMedia/BusinessMainImage`));
app.use('/', express.static(`../TaxFilePosterMedia/UserProfile`));
app.use('/', express.static(`../TaxFilePosterMedia/Notification`));
app.use('/', express.static(`../TaxFilePosterMedia/BusinessCategory`));
app.use('/', express.static(`../TaxFilePosterMedia/FAQCategory`));
app.use('/', express.static(`../TaxFilePosterMedia/RequestPerSegment`));

// Connect to the database
connectToDatabase()
  .then(() => {

    console.log('Connected to the database successfully');
  })
  .catch(error => {
    console.error('Error connecting to the database:', error);
  });

app.use("/", routes);


app.get('/', async (req, res) => {
  res.send('Last Updated 28/06/2024 - 11:30 AM Server is running of TaxFilePoster!');
});

cron.schedule('15 0 * * *', () => {
  console.log('Running Auto Task' + new Date());
  setAutoDownloadLimit();
  autoVerifySubscription();
  autoVerifyNotification();
});

// call for new DB Entry
// setTimeout(() => {
//   createAllTableInDB();
// }, 2000);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
