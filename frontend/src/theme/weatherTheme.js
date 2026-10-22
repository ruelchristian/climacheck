// Maps an OpenWeather "condition_main" value to a visual theme:
// a hero-panel gradient and which icon to render. This is what makes
// the dashboard's weather panel actually reflect the live condition
// instead of using one static color for every search.

export const weatherThemes = {
  Clear: {
    gradient: 'linear-gradient(135deg, #FDECC8 0%, #F6C971 35%, #7FB2E5 100%)',
    ink: '#3B2F14',
    icon: 'sun',
  },
  Clouds: {
    gradient: 'linear-gradient(135deg, #E7ECEF 0%, #C9D3DC 45%, #8B98A5 100%)',
    ink: '#2B333C',
    icon: 'cloud',
  },
  Rain: {
    gradient: 'linear-gradient(135deg, #8FAFCB 0%, #5A7A9C 50%, #33465C 100%)',
    ink: '#F3F6F9',
    icon: 'rain',
  },
  Drizzle: {
    gradient: 'linear-gradient(135deg, #A9C3DA 0%, #6E90B0 50%, #435871 100%)',
    ink: '#F3F6F9',
    icon: 'rain',
  },
  Thunderstorm: {
    gradient: 'linear-gradient(135deg, #565C70 0%, #33374A 55%, #1B1D28 100%)',
    ink: '#F3F6F9',
    icon: 'storm',
  },
  Snow: {
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #E8F0F7 45%, #B8CBDA 100%)',
    ink: '#2B333C',
    icon: 'snow',
  },
  Mist: {
    gradient: 'linear-gradient(135deg, #E7EAEC 0%, #D2D8DC 55%, #AAB4BB 100%)',
    ink: '#2B333C',
    icon: 'mist',
  },
};

export const defaultWeatherTheme = {
  gradient: 'linear-gradient(135deg, #DCE8F0 0%, #B9D0DE 50%, #7E9BB1 100%)',
  ink: '#22303D',
  icon: 'cloud',
};

export function getWeatherTheme(conditionMain) {
  return weatherThemes[conditionMain] || defaultWeatherTheme;
}
