import { FileHelper } from "./utility/file-helper";
import { MetaProjector } from "./projectors/meta";
import * as showdown from "showdown";

export class Generator {
  fHelper: FileHelper;
  metaProjector: MetaProjector;
  converter: showdown.Converter;

  constructor() {
    this.fHelper = new FileHelper();
    this.metaProjector = new MetaProjector();
    this.converter = new showdown.Converter({
      extensions: [require("./extensions/highlightjs"),
      require("./extensions/attribution"),
      require("./extensions/alerts")],
      simplifiedAutoLink: true,
      emoji: true
    });
  }

  public getMeta(content: string): Map<string, any> {
      const _this = this;
      return _this.metaProjector.Get(content);
  }

  public generateFromTemplate(template: string, content: string, options: Map<string, any>) {
    const _this = this;
    const meta = _this.metaProjector.Get(content);
    const md = _this.metaProjector.Clear(content);
    const body = _this.converter.makeHtml(md);
    meta.set("body", body);
    options.forEach((v,k) => {
      meta.set(k,v);
    });
    return _this.metaProjector.Project(template, meta);
  }
}
