// utils/city-data.js
// 全国省市基础字典（用于级联选择与拼音/汉字模糊搜索）

export const PROVINCES_DATA = [
  {
    name: '直辖市',
    cities: [
      { name: '北京市', districtCode: '110100', pinyin: 'beijingshi' },
      { name: '上海市', districtCode: '310100', pinyin: 'shanghaishi' },
      { name: '天津市', districtCode: '120100', pinyin: 'tianjinshi' },
      { name: '重庆市', districtCode: '500100', pinyin: 'chongqingshi' }
    ]
  },
  {
    name: '广东省',
    cities: [
      { name: '广州市', districtCode: '440100', pinyin: 'guangzhoushi' },
      { name: '深圳市', districtCode: '440300', pinyin: 'shenzhenshi' },
      { name: '珠海市', districtCode: '440400', pinyin: 'zhuhaishi' },
      { name: '佛山市', districtCode: '440600', pinyin: 'foshanshi' },
      { name: '东莞市', districtCode: '441900', pinyin: 'dongguanshi' },
      { name: '中山市', districtCode: '442000', pinyin: 'zhongshanshi' },
      { name: '惠州市', districtCode: '441300', pinyin: 'huizhoushi' },
      { name: '汕头市', districtCode: '440500', pinyin: 'shantoushi' },
      { name: '江门市', districtCode: '440700', pinyin: 'jiangmenshi' },
      { name: '湛江市', districtCode: '440800', pinyin: 'zhanjiangshi' },
      { name: '肇庆市', districtCode: '441200', pinyin: 'zhaoqingshi' }
    ]
  },
  {
    name: '浙江省',
    cities: [
      { name: '杭州市', districtCode: '330100', pinyin: 'hangzhoushi' },
      { name: '宁波市', districtCode: '330200', pinyin: 'ningboshi' },
      { name: '温州市', districtCode: '330300', pinyin: 'wenzhoushi' },
      { name: '嘉兴市', districtCode: '330400', pinyin: 'jiaxingshi' },
      { name: '湖州市', districtCode: '330500', pinyin: 'huzhoushi' },
      { name: '绍兴市', districtCode: '330600', pinyin: 'shaoxingshi' },
      { name: '金华市', districtCode: '330700', pinyin: 'jinhuashi' },
      { name: '台州市', districtCode: '331000', pinyin: 'taizhoushi' }
    ]
  },
  {
    name: '江苏省',
    cities: [
      { name: '南京市', districtCode: '320100', pinyin: 'nanjingshi' },
      { name: '苏州市', districtCode: '320500', pinyin: 'suzhoushi' },
      { name: '无锡市', districtCode: '320200', pinyin: 'wuxishi' },
      { name: '常州市', districtCode: '320400', pinyin: 'changzhoushi' },
      { name: '南通市', districtCode: '320600', pinyin: 'nantongshi' },
      { name: '扬州市', districtCode: '321000', pinyin: 'yangzhoushi' },
      { name: '徐州市', districtCode: '320300', pinyin: 'xuzhoushi' },
      { name: '连云港市', districtCode: '320700', pinyin: 'lianyungangshi' }
    ]
  },
  {
    name: '四川省',
    cities: [
      { name: '成都市', districtCode: '510100', pinyin: 'chengdushi' },
      { name: '绵阳市', districtCode: '510700', pinyin: 'mianyangshi' },
      { name: '德阳市', districtCode: '510600', pinyin: 'deyangshi' },
      { name: '宜宾市', districtCode: '511500', pinyin: 'yibinshi' },
      { name: '南充市', districtCode: '511300', pinyin: 'nanchongshi' },
      { name: '泸州市', districtCode: '510500', pinyin: 'luzhoushi' },
      { name: '乐山市', districtCode: '511100', pinyin: 'leshanshi' }
    ]
  },
  {
    name: '湖北省',
    cities: [
      { name: '武汉市', districtCode: '420100', pinyin: 'wuhanshi' },
      { name: '宜昌市', districtCode: '420500', pinyin: 'yichangshi' },
      { name: '襄阳市', districtCode: '420600', pinyin: 'xiangyangshi' },
      { name: '荆州市', districtCode: '421000', pinyin: 'jingzhoushi' },
      { name: '黄冈市', districtCode: '421100', pinyin: 'huanggangshi' }
    ]
  },
  {
    name: '湖南省',
    cities: [
      { name: '长沙市', districtCode: '430100', pinyin: 'changshashi' },
      { name: '株洲市', districtCode: '430200', pinyin: 'zhuzhoushi' },
      { name: '湘潭市', districtCode: '430300', pinyin: 'xiangtanshi' },
      { name: '衡阳市', districtCode: '430400', pinyin: 'hengyangshi' },
      { name: '岳阳市', districtCode: '430600', pinyin: 'yueyangshi' },
      { name: '张家界市', districtCode: '430800', pinyin: 'zhangjiajieshi' }
    ]
  },
  {
    name: '福建省',
    cities: [
      { name: '福州市', districtCode: '350100', pinyin: 'fuzhoushi' },
      { name: '厦门市', districtCode: '350200', pinyin: 'xiamenshi' },
      { name: '泉州市', districtCode: '350500', pinyin: 'quanzhoushi' },
      { name: '漳州市', districtCode: '350600', pinyin: 'zhangzhoushi' }
    ]
  },
  {
    name: '山东省',
    cities: [
      { name: '济南市', districtCode: '370100', pinyin: 'jinanshi' },
      { name: '青岛市', districtCode: '370200', pinyin: 'qingdaoshi' },
      { name: '烟台市', districtCode: '370600', pinyin: 'yantaishi' },
      { name: '潍坊市', districtCode: '370700', pinyin: 'weifangshi' },
      { name: '威海市', districtCode: '371000', pinyin: 'weihaishi' }
    ]
  },
  {
    name: '河南省',
    cities: [
      { name: '郑州市', districtCode: '410100', pinyin: 'zhengzhoushi' },
      { name: '洛阳市', districtCode: '410300', pinyin: 'luoyangshi' },
      { name: '开封市', districtCode: '410200', pinyin: 'kaifengshi' },
      { name: '南阳市', districtCode: '411300', pinyin: 'nanyangshi' }
    ]
  },
  {
    name: '陕西省',
    cities: [
      { name: '西安市', districtCode: '610100', pinyin: 'xianshi' },
      { name: '咸阳市', districtCode: '610400', pinyin: 'xianyangshi' },
      { name: '宝鸡市', districtCode: '610300', pinyin: 'baojishi' },
      { name: '延安市', districtCode: '610600', pinyin: 'yananshi' }
    ]
  },
  {
    name: '辽宁省',
    cities: [
      { name: '沈阳市', districtCode: '210100', pinyin: 'shenyangshi' },
      { name: '大连市', districtCode: '210200', pinyin: 'dalianshi' },
      { name: '鞍山市', districtCode: '210300', pinyin: 'anshanshi' }
    ]
  },
  {
    name: '吉林省',
    cities: [
      { name: '长春市', districtCode: '220100', pinyin: 'changchunshi' },
      { name: '吉林市', districtCode: '220200', pinyin: 'jilinshi' }
    ]
  },
  {
    name: '黑龙江省',
    cities: [
      { name: '哈尔滨市', districtCode: '230100', pinyin: 'haerbinshi' },
      { name: '齐齐哈尔市', districtCode: '230200', pinyin: 'qiqihaershi' },
      { name: '牡丹江市', districtCode: '231000', pinyin: 'mudanjiangshi' }
    ]
  },
  {
    name: '河北省',
    cities: [
      { name: '石家庄市', districtCode: '130100', pinyin: 'shijiazhuangshi' },
      { name: '唐山市', districtCode: '130200', pinyin: 'tangshanshi' },
      { name: '保定市', districtCode: '130600', pinyin: 'baodingshi' },
      { name: '廊坊市', districtCode: '131000', pinyin: 'langfangshi' }
    ]
  },
  {
    name: '安徽省',
    cities: [
      { name: '合肥市', districtCode: '340100', pinyin: 'hefeishi' },
      { name: '芜湖市', districtCode: '340200', pinyin: 'wuhushi' },
      { name: '蚌埠市', districtCode: '340300', pinyin: 'bengbushi' },
      { name: '黄山市', districtCode: '341000', pinyin: 'huangshanshi' }
    ]
  },
  {
    name: '江西省',
    cities: [
      { name: '南昌市', districtCode: '360100', pinyin: 'nanchangshi' },
      { name: '九江市', districtCode: '360400', pinyin: 'jiujiangshi' },
      { name: '赣州市', districtCode: '360700', pinyin: 'ganzhoushi' }
    ]
  },
  {
    name: '广西壮族自治区',
    cities: [
      { name: '南宁市', districtCode: '450100', pinyin: 'nanningshi' },
      { name: '桂林市', districtCode: '450300', pinyin: 'guilinshi' },
      { name: '柳州市', districtCode: '450200', pinyin: 'liuzhoushi' }
    ]
  },
  {
    name: '海南省',
    cities: [
      { name: '海口市', districtCode: '460100', pinyin: 'haikoushi' },
      { name: '三亚市', districtCode: '460200', pinyin: 'sanyashi' }
    ]
  },
  {
    name: '贵州省',
    cities: [
      { name: '贵阳市', districtCode: '520100', pinyin: 'guiyangshi' },
      { name: '遵义市', districtCode: '520300', pinyin: 'zunyishi' }
    ]
  },
  {
    name: '云南省',
    cities: [
      { name: '昆明市', districtCode: '530100', pinyin: 'kunmingshi' },
      { name: '大理白族自治州', districtCode: '532900', pinyin: 'dalishi' },
      { name: '丽江市', districtCode: '530700', pinyin: 'lijiangshi' }
    ]
  },
  {
    name: '西藏自治区',
    cities: [
      { name: '拉萨市', districtCode: '540100', pinyin: 'lasashi' }
    ]
  },
  {
    name: '甘肃省',
    cities: [
      { name: '兰州市', districtCode: '620100', pinyin: 'lanzhoushi' }
    ]
  },
  {
    name: '青海省',
    cities: [
      { name: '西宁市', districtCode: '630100', pinyin: 'xiningshi' }
    ]
  },
  {
    name: '宁夏回族自治区',
    cities: [
      { name: '银川市', districtCode: '640100', pinyin: 'yinchuanshi' }
    ]
  },
  {
    name: '新疆维吾尔自治区',
    cities: [
      { name: '乌鲁木齐市', districtCode: '650100', pinyin: 'wulumuqishi' }
    ]
  },
  {
    name: '内蒙古自治区',
    cities: [
      { name: '呼和浩特市', districtCode: '150100', pinyin: 'huhehaoteshi' },
      { name: '包头市', districtCode: '150200', pinyin: 'baotoushi' }
    ]
  },
  {
    name: '山西省',
    cities: [
      { name: '太原市', districtCode: '140100', pinyin: 'taiyuanshi' },
      { name: '大同市', districtCode: '140200', pinyin: 'datongshi' }
    ]
  }
];

// 展平所有城市列表（用于模糊搜索）
export const ALL_CITIES = PROVINCES_DATA.reduce((acc, prov) => {
  prov.cities.forEach(c => {
    acc.push({
      ...c,
      provinceName: prov.name
    });
  });
  return acc;
}, []);

/**
 * 模糊搜索城市
 * @param {string} keyword 关键词（支持中文如 '深圳'、'深' 或拼音如 'shenzhen'）
 */
export function searchCities(keyword) {
  if (!keyword || !keyword.trim()) return [];
  const key = keyword.trim().toLowerCase();
  return ALL_CITIES.filter(c => {
    const rawName = c.name.replace(/市|州|地区/g, '');
    return c.name.toLowerCase().includes(key) ||
      rawName.toLowerCase().includes(key) ||
      c.pinyin.includes(key) ||
      c.provinceName.includes(key);
  });
}

