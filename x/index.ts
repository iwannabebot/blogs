import { Generator } from "./generator";
import { FileHelper } from "./utility/file-helper";
import * as sass from "node-sass";
const generator = new Generator();
const fHelper = new FileHelper();
try {
    fHelper.Copy("CNAME", ",", "wwwroot", "CNAME");
    fHelper.Copy("robo.txt", ",", "wwwroot", "robo.txt");
} catch (e) {
    console.log(e);
}

// Static Folders
[{
    folder: "images"
}].forEach(siteConfig => {
    fHelper.ReadDirPath(siteConfig.folder).forEach(file => {
        fHelper.Copy(file, ",", "wwwroot", file)
    })
});

// [{
//     folder: "view"
// }].forEach(siteConfig => {
//     fHelper.ReadDirTop(siteConfig.folder).forEach(file => {
//         fHelper.Copy(siteConfig.folder, file, ",", "wwwroot", file);
//     })
// });

const folders = new Map();
const folderNames = ["tech"];

// Markdown Folders
let body = "";
for(let i = 0; i< folderNames.length; i++) {
    try {
        const folder = folderNames[i];
        body += "<h1>" + folder + "<h1>";
        body += "<ul>";
        const map = new Map();
        const template = fHelper.ReadText("view/partials/_" + folder + ".html");
        fHelper.ReadDirName(folder).forEach(md => {
            if ("md".split(',').indexOf(md.replace(/.*?\./g, "")) === -1) {
                return;
            }
            const meta = new Map();
            meta.set("md_path", md);
            const content = fHelper.ReadText(folder, md);
            const converted = generator.generateFromTemplate(template, content, meta);
            fHelper.WriteText(converted, "wwwroot", folder, md.replace(".md", ".html"));
            const _meta = generator.getMeta(content);
            body += "<li><span>" 
            + "<a href='" + folder +'/' + md.replace(".md", ".html") + "'>" + _meta.get("title") + "</a>" 
            + "<span style='float:right'>" + _meta.get("published") + "</span>" 
            + "<span style='display:block'>" + _meta.get("description") + "</span>"
            + "</span></li>";
            map.set(folder +"/"+ md.replace(".md", ".html"), _meta)
        });
        body += "</ul>";
    } catch (e) {
        console.error(e);
    }
}
let index = fHelper.ReadText("view/index.html");
index = index.replace(/{{\s*?body\s*?}}/g, body);
fHelper.WriteText(index, 'wwwroot/index.html');
// Genrate Styles
fHelper.ReadDirName('x', 'scss').forEach(file => {
    try {
        if (file.indexOf('_') > -1) {
            return;
        }
        const result = sass.renderSync({
            file: 'x/scss/' + file,
            includePaths: ['scss']
        }).css;
        const r = String.fromCharCode.apply(null, new Uint16Array(result));
        fHelper.WriteText(r, 'wwwroot', file.replace('.scss', '.css'));
    } catch (e) {
        console.error(e);
    }
});
