import * as fs from "fs";
import * as path from "path";
import * as glob from 'glob';
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
            this.CreateDirectoryRecursive(path.dirname(t));
        }
        fs.createReadStream(s).pipe(fs.createWriteStream(t));
    };
    public ReadDirName(...paths: string[]): string[] {
        const allPaths= fs.readdirSync(path.join(...paths));
        return allPaths;
    }
    public ReadDirPath(...paths: string[]): string[] {
        const anotherpath = this.ReadDirRec(path.join(...paths), null)
        return anotherpath;
    }

    private CreateDirectoryRecursive(dir: string) {
        if(!fs.existsSync(path.dirname(dir))) {
            this.CreateDirectoryRecursive(path.dirname(dir));
        } 
        fs.mkdirSync(dir);
    }

    private ReadDirRec(dir: string, files_: string[]){
        files_ = files_ || [];
        var files = fs.readdirSync(dir);
        for (var i in files){
            var name = dir + '/' + files[i];
            if (fs.statSync(name).isDirectory()){
                this.ReadDirRec(name, files_);
            } else {
                files_.push(name);
            }
        }
        return files_;
    }
    
    public ReadDirTop(...paths: string[]): string[] {
        return fs.readdirSync(path.join(...paths), {
            encoding: "utf8"
        }).filter(p=> p.indexOf('.') !== -1 && p.indexOf('/') === -1 && p.indexOf('\\') === -1);
    }
}
