import { Request, Response, NextFunction } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';

const EXCLUDED_DIRS = [
  'node_modules',
  'build',
  'dist',
  '.git',
  'coverage',
  'tmp',
];

interface PackageJsonFile {
  name: string;
  parentPath: string;
  absPath: string;
}

const getPackageJsonFiles = async (dirPath: string) => {
  const packageJsonFiles: PackageJsonFile[] = [];

  const files = await fs.readdir(dirPath, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile()) {
      if (file.name === 'package.json')
        packageJsonFiles.push({
          name: file.name,
          absPath: path.resolve(file.parentPath, file.name),
          parentPath: file.parentPath,
        });
      continue;
    }

    if (file.isDirectory() && !EXCLUDED_DIRS.includes(file.name)) {
      const pkgFiles = await getPackageJsonFiles(
        path.resolve(file.parentPath, file.name),
      );
      for (const pkgFile of pkgFiles) {
        packageJsonFiles.push(pkgFile);
      }
    }
  }

  return packageJsonFiles;
};

const listScripts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folderpath =
      typeof req.query?.folderpath === 'string'
        ? req.query.folderpath.trim()
        : null;

    if (!folderpath) {
      res.status(400).send('Invalid folder path!');
      return;
    }

    const folderName = path.basename(folderpath);

    if (EXCLUDED_DIRS.includes(folderName)) {
      res
        .status(400)
        .send(`We do not expect valid scripts to exist inside ${folderName}!`);
      return;
    }

    const packageJsonFiles = await getPackageJsonFiles(folderpath);

    const scripts: string[] = [];

    for (const pkgFile of packageJsonFiles) {
      const pkgFileContent = await fs.readFile(pkgFile.absPath, {
        encoding: 'utf8',
      });

      const pkgObject = JSON.parse(pkgFileContent);

      for (const key of Object.keys(pkgObject.scripts)) {
        const relativePath = pkgFile.parentPath.substring(folderpath.length);
        scripts.push(`${relativePath}/${key}`);
      }
    }

    const refinedScripts = scripts.map((script) => {
      if (script[0] === '/') {
        return script.substring(1);
      }
      return script;
    });

    res.status(200).json(refinedScripts);
  } catch (err) {
    next(err);
  }
};

export default listScripts;
