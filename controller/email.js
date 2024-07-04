const { sendMail } = require("../common/mail");
const { errorMessage, checkKeysAndRequireValues, successMessage } = require("../common/main");

const profileUpdateMessageForUser = async (req, res) => {
    try {

        let { to, name, status } = req.query;

        const missingKeys = checkKeysAndRequireValues(['to', 'name', 'status'], req.query);
        if (missingKeys.length > 0) {
            return res.status(400).send(`${missingKeys.join(', ')} parameters are required and must not be null or undefined`);
        }
        let message = '';

        if (status == 'Approved') {
            message = 'Our team has updated your profile. Please take a moment to review your profile on our taxfile poster app and make the most of it!'
        } else {
            message = 'We regret to inform you that your request to change profile has been rejected by our team. We apologize for any inconvenience this may cause.'
        }
        const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Email Template</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 5px; overflow: hidden;">
                        <tr>
                            <td align="center" style="padding: 20px 0; background-color: #cde0f1;">
                                <img src="https://taxposter.taxfile.co.in/tax_poster_logo.png" alt="Logo" style="display: block;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px;">
                                <h1 style="font-size: 24px; color: #333333; margin: 0 0 20px;">Hello ${name},</h1>
                                <p style="font-size: 16px; color: #555555; margin: 0 0 20px;">
                                    ${message}
                                </p>
                                <p style="font-size: 16px; color: #555555; margin: 0 0 20px;">
                                    Here is a link to our website: <a href="https://taxposter.taxfile.co.in" style="color: #0073e6; text-decoration: none;">Taxfile Poster</a>
                                </p>
                                <p style="font-size: 16px; color: #555555; margin: 0 0 20px;">
                                    Thank you for your attention!
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 20px; background-color: #f4f4f4;">
                                <p style="font-size: 14px; color: #777777; margin: 0;">&copy; 2024 Taxfile Poster. All rights reserved.</p>
                                <p style="font-size: 14px; color: #777777; margin: 0;">Powered by Taxfile Invosoft Pvt Ltd.</p>
                                <p style="font-size: 14px; color: #777777; margin: 0;">For any queries, please contact: +91 95100 56789</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;


        const sentMail = await sendMail(to, 'Taxfile Poster - Profile Status', htmlContent);
        if (sentMail) {
            res.json({ ...successMessage("Message sent successfully!") });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(errorMessage(error?.message));
    }


};

module.exports = {
    profileUpdateMessageForUser,
};