import * as fs from "fs";
import * as path from "path";

export class FileHelper {
    public WriteText = (content: string, ...paths: string[]) => {
        const filePath = path.join(...paths)
        if(!fs.existsSync(path.dirname(filePath))){
            fs.mkdirSync(path.dirname(filePath));
          }
        fs.writeFileSync(filePath, content);
    };
    public ReadText = (...paths: string[]) : string => {
        const filePath = path.join(...paths);
        if(!fs.existsSync(filePath)){
            throw new Error("File does not exists");
        }
        return fs.readFileSync(filePath, { encoding: "utf-8" });
    };
    public Copy = (...paths: string[]) => {
        const sepI = paths.indexOf(',');
        if(sepI === -1){
            throw new Error("`,` not present in path provided");
        }
        const source = paths.slice(0, sepI);
        const s = path.join(...source);
        const destination = paths.slice(sepI + 1, paths.length);
        const t = path.join(...destination);
        if(!fs.existsSync(path.dirname(s))){
            throw new Error("Source file not found");
        }
        if(!fs.existsSync(path.dirname(t))){
            fs.mkdirSync(path.dirname(t));
        }
        fs.createReadStream(s).pipe(fs.createWriteStream(t));
    };
    public ReadDir(...paths: string[]): string[] {
        return fs.readdirSync(path.join(...paths), {
            encoding: "utf8"
        });
    }
    
    public ReadDirTop(...paths: string[]): string[] {
        return fs.readdirSync(path.join(...paths), {
            encoding: "utf8"
        }).filter(p=> p.indexOf('.') !== -1 && p.indexOf('/') === -1 && p.indexOf('\\') === -1);
    }
}
