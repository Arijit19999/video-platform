import fs from 'fs';
import path from 'path';
import config from '../config/index.js';

export const getFilePath = (filename) => {
  return path.join(config.uploadDir, filename);
};

export const fileExists = (filename) => {
  return fs.existsSync(getFilePath(filename));
};

export const getFileStats = (filename) => {
  return fs.statSync(getFilePath(filename));
};

export const createReadStream = (filename, options) => {
  return fs.createReadStream(getFilePath(filename), options);
};

export const deleteFile = (filename) => {
  const filePath = getFilePath(filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
