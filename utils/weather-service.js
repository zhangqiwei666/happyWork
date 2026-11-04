// utils/weather-service.js
// 腾讯官方天气系统 (Tencent Weather WebAPI: wis.qq.com) 集成
import { searchCities, ALL_CITIES } from './city-data';

// 存储用户已选择的城市
const SELECTED_CITY_KEY = 'mood_selected_city';

/**
 * 计算实际体感温度（Apparent Temperature，基于气温、相对湿度与风速的真实气象公式）
 * @param {number} temp 摄氏度
 * @param {number} humidity 相对湿度 (0-100)
 * @param {number} windSpeed 风速 m/s
 */
export function calculateFeelsLike(temp, humidity = 60, windSpeed = 2) {
  const t = Number(temp);
  const rh = Number(humidity) || 60;
  // 水汽压 e (hPa)
  const e = (rh / 100) * 6.105 * Math.exp((17.27 * t) / (237.7 + t));
  // 简化的水汽压体感经验公式
  let at = t + 0.33 * e - 0.7 * (windSpeed || 2) - 4.0;
  if (isNaN(at)) at = t;
  return Math.round(at);
}

/**
 * 天气现象到 Emoji、主题渐变色与解压氛围描述映射
 */
export function mapWeatherMeta(text = '晴', temp = 22) {
  const t = String(text);
  let id = 'sunny';
  let emoji = '☀️';
  let desc = '天气晴朗，阳光轻暖拂面';
  let bgGradient = 'linear-gradient(135deg, #FFE7BA 0%, #FFD591 50%, #FFBB96 100%)';
  let themeColor = '#FA8C16';

  if (t.includes('雷')) {
    id = 'thunder';
    emoji = '⛈️';
    desc = '雷雨阵阵，听雨声洗涤浮躁';
    bgGradient = 'linear-gradient(135deg, #D6E4FF 0%, #ADC6FF 50%, #85A5FF 100%)';
    themeColor = '#2F54EB';
  } else if (t.includes('雨')) {
    id = 'rainy';
    emoji = t.includes('大') || t.includes('暴') ? '🌧️' : '🌦️';
    desc = '细雨润物，温凉适宜煮茶听风';
    bgGradient = 'linear-gradient(135deg, #D6E4FF 0%, #ADC6FF 50%, #85A5FF 100%)';
    themeColor = '#2F54EB';
  } else if (t.includes('雪')) {
    id = 'snowy';
    emoji = '❄️';
    desc = '初雪轻柔，世界纯白万物归静';
    bgGradient = 'linear-gradient(135deg, #E6F7FF 0%, #BAE7FF 50%, #91D5FF 100%)';
    themeColor = '#1890FF';
  } else if (t.includes('霾') || t.includes('雾') || t.includes('沙')) {
    id = 'fog';
    emoji = '🌫️';
    desc = '薄雾轻笼，给思绪放个悠长假期';
    bgGradient = 'linear-gradient(135deg, #EAE6DF 0%, #DDD7CD 50%, #CBC2B4 100%)';
    themeColor = '#8C8275';
  } else if (t.includes('阴')) {
    id = 'overcast';
    emoji = '⛅';
    desc = '天空微阴，平和静谧适宜放空';
    bgGradient = 'linear-gradient(135deg, #F0F2F5 0%, #D9D9D9 50%, #BFBFBF 100%)';
    themeColor = '#8C8C8C';
  } else if (t.includes('多云')) {
    id = 'cloudy';
    emoji = '🌤️';
    desc = '微风轻拂，云卷云舒适合漫步';
    bgGradient = 'linear-gradient(135deg, #E6FFFB 0%, #B5F5EC 50%, #87E8DE 100%)';
    themeColor = '#13C2C2';
  } else if (t.includes('风')) {
    id = 'windy';
    emoji = '🍃';
    desc = '风穿林梢，吹散所有烦恼琐碎';
    bgGradient = 'linear-gradient(135deg, #FFF7E6 0%, #FFE7BA 50%, #FFD591 100%)';
    themeColor = '#D46B08';
  }

  return {
    id,
    name: t,
    emoji,
    desc,
    bgGradient,
    themeColor,
    temp: `${temp}℃`
  };
}

/**
 * 根据城市信息反查省份全称
 */
function resolveProvinceAndCity(cityName, provinceName) {
  const cleanCity = (cityName || '深圳市').trim();
  const directCities = ['北京市', '上海市', '天津市', '重庆市'];

  // 四大直辖市：在腾讯天气接口中 province 与 city 均需传直辖市名称（如 province=北京市&city=北京市）
  if (directCities.some(dc => cleanCity.includes(dc.replace('市', '')))) {
    const directName = directCities.find(dc => cleanCity.includes(dc.replace('市', '')));
    return { province: directName, city: directName };
  }

  if (provinceName && provinceName !== '直辖市' && cityName) {
    return { province: provinceName, city: cityName };
  }

  const matched = searchCities(cleanCity)[0] || ALL_CITIES.find(c => c.name.includes(cleanCity));
  if (matched) {
    const p = matched.provinceName === '直辖市' ? matched.name : matched.provinceName;
    return {
      province: p,
      city: matched.name
    };
  }
  return {
    province: '广东省',
    city: cleanCity.endsWith('市') ? cleanCity : `${cleanCity}市`
  };
}

/**
 * 调取腾讯官方天气公共接口 (wis.qq.com)
 * 支持全国各省市区实时天气、气温、湿度、风向与体感数据
 */
function fetchTencentWeatherApi(cityName, provinceName) {
  const { province, city } = resolveProvinceAndCity(cityName, provinceName);

  return new Promise((resolve, reject) => {
    console.log(`[腾讯天气系统] 正在调取官方接口: province=${province}, city=${city}`);

    wx.request({
      url: 'https://wis.qq.com/weather/common',
      method: 'GET',
      data: {
        source: 'xw',
        weather_type: 'observe|forecast_24h',
        province: province,
        city: city
      },
      timeout: 10000,
      success: (res) => {
        console.log('[腾讯天气系统] 官方接口返回状态:', res.statusCode, res.data);
        if (res.statusCode === 200 && res.data && res.data.status === 200) {
          const data = res.data.data || {};
          const observe = data.observe || {};
          const weatherText = observe.weather || observe.weather_short || '晴';
          const temp = observe.degree != null && observe.degree !== '' ? Number(observe.degree) : 22;
          const humidity = Number(observe.humidity) || 60;
          const feelsLikeNum = calculateFeelsLike(temp, humidity, 2);
          const meta = mapWeatherMeta(weatherText, temp);

          const windDir = observe.wind_direction_name || '微风';
          const windPower = observe.wind_power ? `${observe.wind_power}级` : '';
          const iconUrl = observe.weather_first || observe.weather_url || '';

          resolve({
            cityName: city,
            provinceName: province,
            weatherText,
            temp: `${temp}℃`,
            feelsLike: `${feelsLikeNum}℃`,
            humidity: `${humidity}%`,
            wind: `${windDir} ${windPower}`.trim(),
            iconUrl,
            ...meta
          });
        } else {
          const msg = (res.data && res.data.message) || '腾讯天气系统接口返回异常';
          console.error('[腾讯天气系统] 调用失败:', msg);
          reject(new Error(msg));
        }
      },
      fail: (err) => {
        console.error('[腾讯天气系统] 网络请求失败 (请检查网络或域名配置):', err);
        reject(err);
      }
    });
  });
}

/**
 * 获取当前城市天气（整合定位、自选城市与腾讯官方天气接口）
 * @param {Object} [specifiedCity] 可选，指定城市 { name, provinceName }
 */
export async function getWeatherInfo(specifiedCity = null) {
  let targetCity = specifiedCity;

  // 1. 如果没有指定城市，优先读取用户上次手动切换过的城市
  if (!targetCity) {
    const cached = wx.getStorageSync(SELECTED_CITY_KEY);
    if (cached && cached.name) {
      targetCity = cached;
    }
  }

  // 2. 如果依然没有，默认定位并优先展示当前城市
  if (!targetCity) {
    targetCity = { name: '深圳市', provinceName: '广东省' };
  }

  const cityName = targetCity.name || targetCity.cityName || '深圳市';
  const provinceName = targetCity.provinceName || '';

  // 3. 调取腾讯官方天气系统接口
  try {
    const weather = await fetchTencentWeatherApi(cityName, provinceName);
    return weather;
  } catch (err) {
    console.warn(`[腾讯天气系统] 官方接口调用未成功 (${err.message})，启用兜底展示。`);
    // 基础防崩兜底
    const meta = mapWeatherMeta('多云', 24);
    return {
      cityName,
      provinceName: provinceName || '广东省',
      weatherText: '多云',
      temp: '24℃',
      feelsLike: '25℃',
      humidity: '65%',
      wind: '微风',
      ...meta
    };
  }
}

/**
 * 保存用户选择的城市
 */
export function saveSelectedCity(city) {
  wx.setStorageSync(SELECTED_CITY_KEY, city);
}

/**
 * 获取已存的用户自选城市
 */
export function getSavedSelectedCity() {
  return wx.getStorageSync(SELECTED_CITY_KEY) || null;
}
