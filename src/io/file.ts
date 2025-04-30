import { promises as fs } from 'fs';

/**
 * A utility class for file operations.
 */
export class IOFile {

    /**
     * Reads the content of a file as a string with the specified encoding.
     * Removes any BOM (Byte Order Mark) if present.
     * @param {string} filePath - The path of the file to read.
     * @param {BufferEncoding} [encoding='utf-8'] - The encoding to use for reading the file.
     * @returns {Promise<string>} The content of the file as a string.
     */
    static async read(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
        let result = await fs.readFile(filePath, { encoding });
        return result.replace(/^\uFEFF/, '');
    }

    /**
     * Writes the provided content to a file with the specified encoding.
     * If the file already exists, it will be overwritten.
     * @param {string} filePath - The path of the file to write to.
     * @param {string} content - The content to write to the file.
     * @param {BufferEncoding} [encoding='utf-8'] - The encoding to use for writing the file.
     * @returns {Promise<void>} A promise that resolves when the write operation is complete.
     */
    static async write(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
        await fs.writeFile(filePath, content, { encoding });
    }

    /**
     * Reads the content of a file as a buffer (raw bytes).
     *
     * @param {string} filePath - The path of the file to read.
     * @returns {Promise<Buffer>} A promise that resolves to the file's raw bytes.
     */
    static async readBytes(filePath: string): Promise<Buffer> {
        return fs.readFile(filePath);
    }

    /**
     * Writes raw byte data to a file.
     * If the file already exists, it will be overwritten.
     *
     * @param {string} filePath - The path of the file to write to.
     * @param {Buffer} data - The byte data to write to the file.
     * @returns {Promise<void>} A promise that resolves when the write operation is complete.
     */
    static async writeBytes(filePath: string, data: Buffer): Promise<void> {
        await fs.writeFile(filePath, data);
    }

    /**
     * Appends the provided text content to a file. If the file doesn't exist, it will be created.
     * @param {string} filePath - The path of the file to append content to.
     * @param {string} content - The text content to append to the file.
     * @param {BufferEncoding} [encoding='utf-8'] - The encoding to use for writing the file.
     * @returns {Promise<void>} A promise that resolves when the append operation is complete.
     */
    static async appendText(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
        await fs.appendFile(filePath, content, { encoding });
    }

    /**
     * Checks if a file exists at the specified path.
     * @param {string} filePath - The path of the file to check.
     * @returns {Promise<boolean>} A promise that resolves to true if the file exists, otherwise false.
     */
    static async exists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Deletes the file at the specified path.
     * @param {string} filePath - The path of the file to delete.
     * @returns {Promise<void>} A promise that resolves when the delete operation is complete.
     */
    static async delete(filePath: string): Promise<void> {
        await fs.unlink(filePath);
    }

    /**
     * Copies a file from the source path to the destination path.
     * @param {string} source - The path of the file to copy.
     * @param {string} destination - The path where the file will be copied to.
     * @returns {Promise<void>} A promise that resolves when the copy operation is complete.
     */
    static async copy(source: string, destination: string): Promise<void> {
        await fs.copyFile(source, destination);
    }
}
