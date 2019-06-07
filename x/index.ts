import { Generator } from "./generator";
import { FileHelper } from "./utility/file-helper";
import * as sass from "node-sass";
const generator = new Generator();
const fHelper = new FileHelper();
try {
  fHelper.Copy("CNAME", ",", "wwwroot", "CNAME");
  fHelper.Copy("robo.txt", ",", "wwwroot", "robo.txt");
} catch(e) {
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

[{
  folder: "view"
}].forEach(siteConfig => {
  fHelper.ReadDirTop(siteConfig.folder).forEach(file => {
    fHelper.Copy(siteConfig.folder, file, ",", "wwwroot", file);
  })
});

// Markdown Folders
["perspective", "tech", ].forEach(folder => {
  try {
    const template = fHelper.ReadText("view/partials/_"+folder+".html");
    fHelper.ReadDirName(folder).forEach(md => {
      if("md".split(',').indexOf(md.replace(/.*?\./g, "")) === -1){
        return;
      }
      const meta = new Map();
      meta.set("md_path", md);
      const content = fHelper.ReadText(folder, md);
      const converted = generator.generateFromTemplate(template, content, meta);
      fHelper.WriteText(converted, "wwwroot", folder, md.replace(".md", ".html"));
    });
  } catch(e) {
    console.error(e);
  }
});

// Genrate Styles
fHelper.ReadDirName('x','scss').forEach(file => {
  try {
    if(file.indexOf('_') > -1){
      return;
    }
    const result = sass.renderSync({
      file: 'x/scss/'+ file,
      includePaths: ['scss']
    }).css;
    const r = String.fromCharCode.apply(null, new Uint16Array(result));
    fHelper.WriteText(r, 'wwwroot', file.replace('.scss', '.css'));
  } catch (e) {
    console.error(e);
  }
});
