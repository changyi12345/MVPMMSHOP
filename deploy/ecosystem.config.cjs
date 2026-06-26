module.exports = {
  apps: [
    {
      name: 'rankage-api',
      cwd: './backend',
      script: 'dist/src/main.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'rankage-web',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
