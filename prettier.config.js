import defineConfig, { presets } from '@jackjakarta/prettier-config';

export default defineConfig(presets.nodejs({ packageJson: true }));
