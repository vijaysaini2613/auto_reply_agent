module.exports = {
  apps: [
    {
      name: "whatsapp-agent",
      script: "agent.js",
      watch: true,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
