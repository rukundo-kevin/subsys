import zlib from 'zlib';
import tar from 'tar';
import tmp from 'tmp-promise';
import fs from 'fs-extra';
import ApiError from './ApiError';
import httpStatus from 'http-status';
import archiver from 'archiver';
import submissionValidation from '../validations/submission.validation';
import Joi from 'joi';
import { studentService, userService } from '../services';

interface Item {
  name: string;
  type: 'folder' | 'file';
  path?: string;
  contents?: Item[];
}

interface Head {
  snapshot_key: string;
  snapshot_name: string;
}

/**
 *  Construct a tree of the contents of a folder in a snapshot
 * @param gzipFilePath
 * @returns
 */
export async function extractFolderContents(gzipFilePath: string): Promise<Item[]> {
  if (!(await fs.exists(gzipFilePath)))
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Contents for the snapshot not found');
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
    if (!(await fs.exists(gzipFilePath)))
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Contents for the snapshot not found');
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

/**
 * Function to create a zipped file
 * @param inputFilePaths
 * @param outputFilePath
 * @returns A promise that resolves to the Location of the zipped file
 */

export async function createZippedFile(
  inputFilePaths: string[],
  outputFilePath: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip');

    output.on('close', () => {
      resolve(outputFilePath);
    });

    output.on('error', (err) => {
      reject(err);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    for (const inputFilePath of inputFilePaths) {
      const fileStream = fs.createReadStream(inputFilePath);

      const filenames = inputFilePath.split('/');
      archive.append(fileStream, { name: filenames[filenames.length - 1] });
    }

    archive.finalize();
  });
}

export const validateHead = async (head: Head): Promise<{ error: string | null }> => {
  const { error } = Joi.compile(submissionValidation.headSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(head);
  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return { error: errorMessage };
  }
  return {
    error: null
  };
};
/**
 * A function to remove submission files that are not associated to any student
 */
export const deleteSubmissionFiles = async () => {
  const submissionEntries = await fs.readdir('submissions');
  const students = (await studentService.getStudents()).map((s) => s.studentId);
  const submissionsToDelete = submissionEntries.filter((s) => !students.includes(s));

  for (let submission of submissionsToDelete) {
    await fs.remove(`submissions/5`);
  }
};

