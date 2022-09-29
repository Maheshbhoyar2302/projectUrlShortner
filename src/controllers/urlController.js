const urlModel = require("../models/urlModel");
const validUrl = require("valid-url");
const shortId = require("shortid");
const validator = require("validator")
const { findOne } = require("../models/urlModel");
const baseUrl = "http://localhost:3000"



const shortenUrl = async function (req, res) {
    if (Object.keys(req.body).length > 1) return res.status(400).send({ status: false, message: "Request Body Cant Be Empty" });
    const { longUrl } = req.body;
    if (!longUrl) return res.status(400).send({ status: false, message: "Please Enter longUrl,Its A Mandatory Field" });
    if (typeof longUrl !== "string") return res.status(400).send({ status: false, message: "longUrl Should Be A String Only" });
    if (!validator.isURL(longUrl)) return res.status(400).send({ status: false, message: "Please Check The longUrl,its A InValid URL" });
    const url = await urlModel.findOne({ longUrl: longUrl });
    if (url) {
        let obj = {
            longUrl: url.longUrl,
            shortUrl: url.shortUrl,
            urlCode: url.urlCode
        }
        return res.status(200).send({ status: true, data: obj });
    } else {

        req.body.urlCode = shortId.generate();
        const code = req.body.urlCode;
        const shortenUrl = baseUrl + "/" + code;
        req.body.shortUrl = shortenUrl;

        const data = await urlModel.create(req.body);
        const obj = {
            longUrl: data.longUrl,
            shortUrl: data.shortUrl,
            urlCode: data.urlCode
        }
        return res.status(200).send({ data: obj })

    }
}



const redirect = async function (req, res) {

    const urlcode = req.params.urlCode;
    if (!urlcode) return res.status(400).send({ status: false, message: "Please Enter A UrlCode" })
    if (!shortId.isValid(urlcode)) return res.status(400).send({ status: false, message: "Please Check The UrlCode" });
    let data = await urlModel.findOne({ urlCode: urlcode }).select({ longUrl: 1 });
    if (!data) return res.status(404).send({ status: false, message: "No Url Found" })
    let url = data.longUrl
    return res.status(308).send("Redirecting To  " + url)

}





module.exports = { shortenUrl, redirect }