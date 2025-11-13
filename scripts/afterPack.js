const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

exports.default = async function(context) {
  console.log('Running afterPack script...');
  
  const resourcesPath = path.join(context.appOutDir, 'resources');
  const backendPath = path.join(resourcesPath, 'backend');
  const packageElectronPath = path.join(backendPath, 'package-electron.json');
  const packageJsonPath = path.join(backendPath, 'package.json');
  
  // Copy package-electron.json to package.json
  if (fs.existsSync(packageElectronPath)) {
    console.log('Copying package-electron.json to package.json...');
    fs.copyFileSync(packageElectronPath, packageJsonPath);
    fs.unlinkSync(packageElectronPath); // Remove the -electron version
  }
  
  // Install production dependencies
  console.log('Installing backend dependencies...');
  try {
    const { stdout, stderr } = await execPromise('npm install --production --no-optional', {
      cwd: backendPath
    });
    console.log('Dependencies installed successfully');
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error('Failed to install dependencies:', error);
    throw error;
  }
};
