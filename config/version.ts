// Konfigurasi Versi Aplikasi - Ubah di sini untuk update global
export const APP_VERSION = '1.0.1'; // Format: Major.Minor.Patch (sesuaikan dengan kebutuhan)
export const APP_NAME = 'Student Planning Digital';
export const APP_SHORT_NAME = 'SPD System';
export const EDITION = 'Basic Edition';

export const getVersionInfo = () => ({
  version: APP_VERSION,
  name: APP_NAME,
  shortName: APP_SHORT_NAME,
  edition: EDITION,
  fullVersion: `${APP_SHORT_NAME} v${APP_VERSION} (${EDITION})`,
});
