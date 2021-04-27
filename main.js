let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
let PDFDocument = require("pdfkit");
const { createDecipher } = require("crypto");
const { write } = require("pdfkit/js/data");
let url = "https://github.com/topics";
request(url, cb)
function cb(error, response, html){
    if(error){
        console.log(error);
    }else{
        extractnameandlink(html);
    }
}

function extractnameandlink(html){
    let seltool = cheerio.load(html);
    let blocksoftopics = seltool(".col-12.col-sm-6.col-md-4.mb-4");
    for(let i = 0; i<blocksoftopics.length; i++)
    {
        let name = seltool(blocksoftopics[i]).find(".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1").text();
        let link = "https://github.com" + seltool(blocksoftopics[i]).find("a").attr("href");
        getLinks(link, name);
        
    }
}
function getLinks(link, name)
{
    request(link, cb);
    function cb(err, response, html)
    {
        if(err)
        {
            console.log(err);
        }else{
            getissuelink(html, name);
        }
    }
}
function getissuelink(html, name){
    let seltoools = cheerio.load(html);
    let topicnamele = seltoools(".h1-mktg");
    let repoLinks =seltoools("a.text-bold");
    let topicname = topicnamele.text().trim();
    console.log(topicname);
    createDir(topicname);
    
    for(let i = 0; i<8; i++)
    {
        
        let repopageLink = seltoools(repoLinks[i]).attr("href");
        //let oolink = olink + "/issues";
        let reponame = repopageLink.split("/").pop();
        reponame = reponame.trim();
        //console.log("->"+reponame);
        //createfilename(reponame, topicname);
        let oolink = "https://github.com" + repopageLink + "/issues";
        getissue(reponame, topicname, oolink);
        

    }

}
function createDir(topicname){
    let pathoftopic = path.join(__dirname, topicname);
    if(fs.existsSync(pathoftopic)==false){
        fs.mkdirSync(pathoftopic);
    }
}
function createfilename(reponame, topicname){
    let pathoffile = path.join(__dirname, topicname, reponame + ".json");
    if(fs.existsSync(pathoffile)==false){
        let createstream = fs.createWriteStream(pathoffile);
        createstream.end();
    }
}
function getissue(reponame, topicname, oolink){
    request(oolink, cb);
    function cb(error, reponse, html){
        if(error){
            if(response.statuscode == 404){
                console.log("No issue page found");
            }else{
            console.log(error);
            }
        }else{
            extractissue(html, topicname, reponame);
        }
    }
}
function extractissue(html, topicname, reponame){
    let seltool = cheerio.load(html);
    
    let IssueAnchorarr = seltool("a.Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title");
    let arr = [];
    for(let i = 0; i<IssueAnchorarr.length; i++)
    {
        let name = seltool(IssueAnchorarr[i]).text();
        let link = seltool(IssueAnchorarr[i]).attr("href");
        arr.push({
            "name" :name, 
            "link" :"https://github.com" + link
        })

    }
    let filepath = path.join(__dirname, topicname, reponame + ".pdf");
    let pdfDoc = new PDFDocument;
    pdfDoc.pipe(fs.createWriteStream(filepath));
    pdfDoc.text(JSON.stringify(arr));
    pdfDoc.end();
    /*fs.writeFileSync(filepath, JSON.stringify(arr));
    file write
    console.table(arr);
    */

}