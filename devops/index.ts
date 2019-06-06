import { Generator } from "./generator";
import { FileHelper } from "./utility/file-helper";
import * as sass from "node-sass";
const generator = new Generator();
const fHelper = new FileHelper();
try {
  fHelper.Copy("CNAME", ",", "wwwroot", "CNAME");
} catch(e) {
  console.log(e);
}

// Static Folders
[{
  folder: "images"
}].forEach(siteConfig => {
  fHelper.ReadDir(siteConfig.folder).forEach(file => {
    fHelper.Copy(siteConfig.folder, file, ",", "wwwroot", siteConfig.folder, file)
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
[{
  folder: "blogs",
  generator: generator,
  extensions: "md"
}, {
  folder: "tools",
  generator: generator,
  extensions: "md"
}].forEach(siteConfig => {
  const template = fHelper.ReadText("view/partials/_"+siteConfig.folder+".html");
  fHelper.ReadDir(siteConfig.folder).forEach(md => {
    if(siteConfig.extensions && 
      siteConfig.extensions.split(',').indexOf(md.replace(/.*?\./g, "")) === -1){
      return;
    }
    const meta = new Map();
    meta.set("md-location", siteConfig.folder+"/"+ md);
    const content = fHelper.ReadText(siteConfig.folder, md);
    const converted = siteConfig.generator.generateFromTemplate(template, content, meta);
    fHelper.WriteText(converted, "wwwroot", siteConfig.folder, md.replace(".md", ".html"));
  });
});

// Genrate Styles
fHelper.ReadDir('scss').forEach(file => {
  if(file.indexOf('_') > -1){
    return;
  }
  const result = sass.renderSync({
    file: 'scss/'+ file,
    includePaths: ['scss']
  }).css;
  const r = String.fromCharCode.apply(null, new Uint16Array(result));
  fHelper.WriteText(r, 'wwwroot', file.replace('.scss', '.css'));
});