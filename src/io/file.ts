import { promises as fs } from 'fs';

export class IOFile {
    static async read(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
        let result = await fs.readFile(filePath, { encoding });
        return result.replace(/^\uFEFF/, '');
    }

    static async write(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
        await fs.writeFile(filePath, content, { encoding });
    }

    static async readBytes(filePath: string): Promise<Buffer> {
        return fs.readFile(filePath);
    }

    static async writeBytes(filePath: string, data: Buffer): Promise<void> {
        await fs.writeFile(filePath, data);
    }

    static async appendText(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
        await fs.appendFile(filePath, content, { encoding });
    }

    static async exists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    static async delete(filePath: string): Promise<void> {
        await fs.unlink(filePath);
    }

    static async copy(source: string, destination: string): Promise<void> {
        await fs.copyFile(source, destination);
    }
}
