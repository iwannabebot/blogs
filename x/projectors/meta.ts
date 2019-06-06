export class MetaProjector {
    public metaSelectorRegex = /---((.|\n|\r\n)*?)---(\r\n|\n)/gm;
    public metaRegex = /(---|(.*?): (.*?)$)/gm;
    public metaKeyRegex = /(\s*?:\s*?(.*?)$|")/gm;
    public metaValueRegex = /(^(.*?)\s*?:\s*?|")/gm;

    public Project(content: string, map: Map<string, any>): string {
        let html = content; 
        map.forEach((v, k) => {
            html = html.replace(new RegExp("{{\\s*?" + k + "\\s*?}}", "g"), v);
        })
        return html;
    }
    public Get(content: string): Map<string, any> {
        const map = new Map<string, any>();
        let metaC = content.match(this.metaSelectorRegex)[0];
        metaC = metaC.replace(/---/gm, "");
        const meta = metaC.match(this.metaRegex);
        for(let i = 0; i < meta.length; i++) {
          const k = meta[i].replace(this.metaKeyRegex, "").trim();
          const v = meta[i].replace(this.metaValueRegex, "").trim();
          map.set(k,v);
        }
        return map;
    }
    public Clear(content: string): string {
        return content.replace(this.metaSelectorRegex, "");
    }
}