const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const router = express.Router();

const PROJECT_DIR = '/workspace/nhaxinh';
const BUILD_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// POST /api/rebuild
router.post('/', (req, res) => {
  console.log('Starting Next.js build...');
  res.write('Build started...\n');

  const build = spawn('npx', ['next', 'build'], {
    cwd: PROJECT_DIR,
    shell: false,
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });

  let output = '';
  let hasError = false;

  build.stdout.on('data', (data) => {
    const chunk = data.toString();
    output += chunk;
    console.log(chunk);
  });

  build.stderr.on('data', (data) => {
    const chunk = data.toString();
    output += chunk;
    hasError = true;
    console.error(chunk);
  });

  // Timeout handler
  const timeout = setTimeout(() => {
    build.kill('SIGTERM');
    hasError = true;
    output += '\nBuild timed out after 5 minutes.';
    console.error('Build timed out after 5 minutes.');
  }, BUILD_TIMEOUT);

  build.on('close', (code) => {
    clearTimeout(timeout);

    if (code === 0 && !hasError) {
      res.json({
        success: true,
        message: 'Build completed successfully',
        exitCode: code,
        output: output.slice(-2000), // Last 2000 chars of output
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Build failed',
        exitCode: code,
        output: output.slice(-2000),
      });
    }
  });

  build.on('error', (err) => {
    clearTimeout(timeout);
    console.error('Build process error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to start build process',
      error: err.message,
    });
  });
});

module.exports = router;
