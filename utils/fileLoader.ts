import { glob } from "glob";
import path from "path";


export default async function fileLoader(dir: string): Promise<string[]> {
    const files: string[] = (await glob(`events/${dir}/**/*.ts`)).map(filePath => path.resolve(filePath));

    files.forEach((file) => delete require.cache[require.resolve(file)]);

    return files;
}
