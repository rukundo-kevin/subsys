import zlib from 'zlib';
import tar from 'tar';
import tmp from 'tmp-promise';
import fs from 'fs-extra';
import ApiError from './ApiError';
import httpStatus from 'http-status';

interface Item {
  name: string;
  type: 'folder' | 'file';
  path?: string;
  contents?: Item[];
}

export async function extractFolderContents(gzipFilePath: string): Promise<Item[]> {
  const rootItem: Item = {
    name: 'contents',
    type: 'folder'
  };

  try {
    const tmpDir = await tmp.dir({ unsafeCleanup: true }); // Create a temporary directory
    const tmpPath = tmpDir.path;

    await tar.x({
      file: gzipFilePath,
      cwd: tmpPath, // Extract to the temporary directory
      onentry: (header) => {
        const entryPath = header.path;
        let parts = entryPath.split('/');
        parts = parts.filter((part) => part !== '');
        if (parts.length >= 2 && parts[1] === 'content') {
          // Contents directory

          let currentFolder = rootItem;
          const folders = parts.slice(2, -1);
          for (const folderName of folders) {
            let subFolder = currentFolder.contents?.find((item) => item.name === folderName);
            if (!subFolder) {
              subFolder = {
                name: folderName,
                path: entryPath,
                type: 'folder'
              };
              if (!currentFolder.contents) {
                currentFolder.contents = [];
              }
              currentFolder.contents.push(subFolder);
            }
            currentFolder = subFolder;
          }

          if (!currentFolder.contents) {
            currentFolder.contents = [];
          }

          currentFolder.contents.push({
            name: parts[parts.length - 1],
            type: header.type === 'Directory' ? 'folder' : 'file'
          });
        }
      }
    });

    // Delete the temporary directory after constructing the response
    await fs.remove(tmpPath);
    return rootItem.contents || [];
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error as unknown as string);
  }
}

/**
 *  Extract the contents of a specific file with a snapshot
 * @param gzipFilePath
 * @param snapshotName
 * @param fileName
 * @returns
 */
export async function extractFileContents(
  gzipFilePath: string,
  snapshotName: string,
  fileName: string
): Promise<string | { error: string }> {
  try {
    const zipStream = await zlib.createGunzip();
    const tarStream = tar.extract({ cwd: '/' });

    let fileContent: string | undefined;
    let foundFile = false; // Flag to indicate if the desired file is found
    tarStream.on('entry', (entry) => {
      if (!foundFile) {
        const entryPath = entry.path;
        let parts = entryPath.split('/');
        parts = parts.filter((part: string) => part !== '');
        if (
          parts.length >= 3 &&
          parts[0] === snapshotName &&
          parts[1] === 'content' &&
          entryPath === `${snapshotName}/content/${fileName}`
        ) {
          let data = '';
          entry.on('data', (chunk: Buffer) => {
            data += chunk.toString(); // Convert the chunk buffer to a string
          });
          entry.on('end', () => {
            fileContent = data;
            foundFile = true; // Set the flag to true to stop processing more entries
          });
        } else {
          entry.resume(); // Move to the next entry in the tar stream
        }
      }
    });

    tarStream.on('error', (error) => {
      throw error;
    });

    const extractionPromise = new Promise<void>((resolve) => {
      tarStream.on('end', () => {
        resolve();
      });
    });

    fs.createReadStream(gzipFilePath).pipe(zipStream).pipe(tarStream);

    await extractionPromise;

    if (fileContent === undefined) {
      return { error: 'File not found in the specified snapshot' };
    }

    return fileContent;
  } catch (error) {
    return { error: error as unknown as string };
  }
}
