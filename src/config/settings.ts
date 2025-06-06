export interface Settings {
  autoPlayAudio: boolean;
}

export const defaultSettings: Settings = {
  autoPlayAudio: true,
};

export const saveSettings = (settings: Settings) => {
  localStorage.setItem('listening-practice-settings', JSON.stringify(settings));
};

export const loadSettings = (): Settings => {
  const saved = localStorage.getItem('listening-practice-settings');
  if (saved) {
    return JSON.parse(saved);
  }
  return defaultSettings;
}; 