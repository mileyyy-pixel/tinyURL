const bootedAt = Date.now();

export const getUptimeSeconds = () =>
  Math.floor((Date.now() - bootedAt) / 1000);

export const getAppVersion = () =>
  process.env.NEXT_PUBLIC_APP_VERSION ?? process.env.npm_package_version ?? "0.1.0";

export const buildHealthPayload = () => ({
  ok: true,
  version: getAppVersion(),
  uptimeSeconds: getUptimeSeconds(),
  timestamp: new Date().toISOString(),
});


