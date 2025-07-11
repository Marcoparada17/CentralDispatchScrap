module.exports = {
  apps: [
    {
      name: "central-dispatch",
      script: "npm",
      args: "run start",
      watch: false,
      env: {
        NODE_ENV: "production"
      },
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      time: true,
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000
    },
    {
      name: "central-dispatch-checker",
      script: "npm",
      args: "run checker",
      watch: false,
      env: {
        NODE_ENV: "production"
      },
      error_file: "logs/checker-err.log",
      out_file: "logs/checker-out.log",
      time: true,
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000
    }
  ]
} 