var tlist = {
    1: ["清明", "2023-04-05"],
    2: ["劳动", "2023-05-01"],
    3: ["端午", "2023-06-22"],
    4: ["中秋", "2023-09-29"],
    5: ["国庆", "2023-10-01"],
    6: ["元旦", "2024-01-01"],
    7: ["春节", "2024-02-10"],
    8: ["元宵", "2024-02-24"],
    9: ["清明", "2024-04-04"],
    10: ["劳动", "2024-05-01"]
  };
  let tnow = new Date();
  let tnowf =
    tnow.getFullYear() + "-" + (tnow.getMonth() + 1) + "-" + tnow.getDate();
  
  /* 计算2个日期相差的天数，不包含今天，如：2016-12-13到2016-12-15，相差2天
   * @param startDateString
   * @param endDateString
   * @returns
   */
  function dateDiff(startDateString, endDateString) {
    var separator = "-"; //日期分隔符
    var startDates = startDateString.split(separator);
    var endDates = endDateString.split(separator);
    var startDate = new Date(startDates[0], startDates[1] - 1, startDates[2]);
    var endDate = new Date(endDates[0], endDates[1] - 1, endDates[2]);
    return parseInt(
      (endDate - startDate) / 1000 / 60 / 60 / 24
    ).toString();
  }
  
  //计算输入序号对应的时间与现在的天数间隔
  function tnumcount(num) {
    let dnum = num;
    return dateDiff(tnowf, tlist[dnum][1]);
  }
  
  //获取最接近的日期
  function now() {
    for (var i = 1; i <= Object.getOwnPropertyNames(tlist).length; i++) {
      if (Number(dateDiff(tnowf, tlist[i.toString()][1])) >= 0) {
        //console.log("最近的日期是:" + tlist[i.toString()][0]);
        //console.log("列表长度:" + Object.getOwnPropertyNames(tlist).length);
        //console.log("时间差距:" + Number(dateDiff(tnowf, tlist[i.toString()][1])));
        return i;
      }
    }
  }
  
  //如果是0天，发送emoji;
  let nowlist = now();
  function today(day) {
    let daythis = day;
    if (daythis == "0") {
      datenotice();
      return "🎉";
    } else {
      return daythis+"天";
    }
  }
  
  //提醒日当天发送通知
  function datenotice() {
    if ($persistentStore.read("timecardpushed") != tlist[nowlist][1] && tnow.getHours() >= 6) {
      $persistentStore.write(tlist[nowlist][1], "timecardpushed");
      $notification.post("假日祝福","", "今天是" + tlist[nowlist][1] + "日 " + tlist[nowlist][0] + "   🎉")
    } else if ($persistentStore.read("timecardpushed") == tlist[nowlist][1]) {
      //console.log("当日已通知");
    }
  }
  
  //>图标依次切换乌龟、兔子、闹钟、礼品盒
  function icon_now(num){
    if(num<=7 && num>3 ){
      return "hare"
    }else if(num<=3 && num>0){
      return "timer"
    }else if(num==0){
      return "gift"
    }else{
      return "tortoise"
    }
  }
  
  /**
   * @日历算法来源 https://github.com/jjonline/calendar.js/blob/master/calendar.js
   * @1900-2100区间内的公历、农历互转
   * @charset UTF-8
   * @Author  Jea杨(JJonline@JJonline.Cn)
   * @Time    2014-7-21
   * @Time    2016-8-13 Fixed 2033hex、Attribution Annals
   * @Time    2016-9-25 Fixed lunar LeapMonth Param Bug
   * @Time    2017-7-24 Fixed use getTerm Func Param Error.use solar year,NOT lunar year
   * @Version 1.0.3
   * @公历转农历：calendar.solar2lunar(1987,11,01); //[you can ignore params of prefix 0]
   * @农历转公历：calendar.lunar2solar(1987,09,10); //[you can ignore params of prefix 0]
   */
  const calendar = {
  
      /**
       * 农历1900-2100的润大小信息表
       * @Array Of Property
       * @return Hex
       */
      lunarInfo: [0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,//1900-1909
          0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,//1910-1919
          0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,//1920-1929
          0x06566, 0x0d4a0, 0x0ea50, 0x16a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,//1930-1939
          0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,//1940-1949
          0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,//1950-1959
          0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,//1960-1969
          0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,//1970-1979
          0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,//1980-1989
          0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,//1990-1999
          0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,//2000-2009
          0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,//2010-2019
          0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,//2020-2029
          0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,//2030-2039
          0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,//2040-2049
          /**Add By JJonline@JJonline.Cn**/
          0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,//2050-2059
          0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,//2060-2069
          0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,//2070-2079
          0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,//2080-2089
          0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,//2090-2099
          0x0d520],//2100
  
      /**
       * 公历每个月份的天数普通表
       * @Array Of Property
       * @return Number
       */
      solarMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  
      /**
       * 天干地支之天干速查表
       * @Array Of Property trans["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]
       * @return Cn string
       */
      Gan: ["\u7532", "\u4e59", "\u4e19", "\u4e01", "\u620a", "\u5df1", "\u5e9a", "\u8f9b", "\u58ec", "\u7678"],
  
      /**
       * 天干地支之地支速查表
       * @Array Of Property
       * @trans["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]
       * @return Cn string
       */
      Zhi: ["\u5b50", "\u4e11", "\u5bc5", "\u536f", "\u8fb0", "\u5df3", "\u5348", "\u672a", "\u7533", "\u9149", "\u620c", "\u4ea5"],
  
      /**
       * 天干地支之地支速查表<=>生肖
       * @Array Of Property
       * @trans["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"]
       * @return Cn string
       */
      Animals: ["\u9f20", "\u725b", "\u864e", "\u5154", "\u9f99", "\u86c7", "\u9a6c", "\u7f8a", "\u7334", "\u9e21", "\u72d7", "\u732a"],
  
      /**
       * 阳历节日
       */
      festival: {
          '1-1': {title: '元旦节'},
          '2-14': {title: '情人节'},
          '5-1': {title: '劳动节'},
          '5-4': {title: '青年节'},
          '6-1': {title: '儿童节'},
          '9-10': {title: '教师节'},
          '10-1': {title: '国庆节'},
          '12-25': {title: '圣诞节'},
  
          '3-8': {title: '妇女节'},
          '3-12': {title: '植树节'},
          '4-1': {title: '愚人节'},
          '5-12': {title: '护士节'},
          '7-1': {title: '建党节'},
          '8-1': {title: '建军节'},
          '12-24': {title: '平安夜'},
      },
  
      /**
       * 农历节日
       */
      lFestival: {
          '12-30': {title: '除夕'},
          '1-1': {title: '春节'},
          '1-15': {title: '元宵节'},
          '2-2': {title: '龙抬头'},
          '5-5': {title: '端午节'},
          '7-7': {title: '七夕节'},
          '7-15': {title: '中元节'},
          '8-15': {title: '中秋节'},
          '9-9': {title: '重阳节'},
          '10-1': {title: '寒衣节'},
          '10-15': {title: '下元节'},
          '12-8': {title: '腊八节'},
          '12-23': {title: '北方小年'},
          '12-24': {title: '南方小年'},
      },
  
      /**
       * 返回默认定义的阳历节日
       */
      getFestival() {
          return this.festival
      },
  
      /**
       * 返回默认定义的内容里节日
       */
      getLunarFestival() {
          return this.lFestival
      },
  
      /**
       *
       * @param param {Object} 按照festival的格式输入数据，设置阳历节日
       */
      setFestival(param = {}) {
          this.festival = param
      },
  
      /**
       *
       * @param param {Object} 按照lFestival的格式输入数据，设置农历节日
       */
      setLunarFestival(param = {}) {
          this.lFestival = param
      },
  
      /**
       * 24节气速查表
       * @Array Of Property
       * @trans["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"]
       * @return Cn string
       */
      solarTerm: ["\u5c0f\u5bd2", "\u5927\u5bd2", "\u7acb\u6625", "\u96e8\u6c34", "\u60ca\u86f0", "\u6625\u5206", "\u6e05\u660e", "\u8c37\u96e8", "\u7acb\u590f", "\u5c0f\u6ee1", "\u8292\u79cd", "\u590f\u81f3", "\u5c0f\u6691", "\u5927\u6691", "\u7acb\u79cb", "\u5904\u6691", "\u767d\u9732", "\u79cb\u5206", "\u5bd2\u9732", "\u971c\u964d", "\u7acb\u51ac", "\u5c0f\u96ea", "\u5927\u96ea", "\u51ac\u81f3"],
  
      /**
       * 1900-2100各年的24节气日期速查表
       * @Array Of Property
       * @return 0x string For splice
       */
      sTermInfo: ['9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bcf97c3598082c95f8c965cc920f',
          '97bd0b06bdb0722c965ce1cfcc920f', 'b027097bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
          '97bcf97c359801ec95f8c965cc920f', '97bd0b06bdb0722c965ce1cfcc920f', 'b027097bd097c36b0b6fc9274c91aa',
          '97b6b97bd19801ec9210c965cc920e', '97bcf97c359801ec95f8c965cc920f', '97bd0b06bdb0722c965ce1cfcc920f',
          'b027097bd097c36b0b6fc9274c91aa', '9778397bd19801ec9210c965cc920e', '97b6b97bd19801ec95f8c965cc920f',
          '97bd09801d98082c95f8e1cfcc920f', '97bd097bd097c36b0b6fc9210c8dc2', '9778397bd197c36c9210c9274c91aa',
          '97b6b97bd19801ec95f8c965cc920e', '97bd09801d98082c95f8e1cfcc920f', '97bd097bd097c36b0b6fc9210c8dc2',
          '9778397bd097c36c9210c9274c91aa', '97b6b97bd19801ec95f8c965cc920e', '97bcf97c3598082c95f8e1cfcc920f',
          '97bd097bd097c36b0b6fc9210c8dc2', '9778397bd097c36c9210c9274c91aa', '97b6b97bd19801ec9210c965cc920e',
          '97bcf97c3598082c95f8c965cc920f', '97bd097bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
          '97b6b97bd19801ec9210c965cc920e', '97bcf97c3598082c95f8c965cc920f', '97bd097bd097c35b0b6fc920fb0722',
          '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bcf97c359801ec95f8c965cc920f',
          '97bd097bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
          '97bcf97c359801ec95f8c965cc920f', '97bd097bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
          '97b6b97bd19801ec9210c965cc920e', '97bcf97c359801ec95f8c965cc920f', '97bd097bd07f595b0b6fc920fb0722',
          '9778397bd097c36b0b6fc9210c8dc2', '9778397bd19801ec9210c9274c920e', '97b6b97bd19801ec95f8c965cc920f',
          '97bd07f5307f595b0b0bc920fb0722', '7f0e397bd097c36b0b6fc9210c8dc2', '9778397bd097c36c9210c9274c920e',
          '97b6b97bd19801ec95f8c965cc920f', '97bd07f5307f595b0b0bc920fb0722', '7f0e397bd097c36b0b6fc9210c8dc2',
          '9778397bd097c36c9210c9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bd07f1487f595b0b0bc920fb0722',
          '7f0e397bd097c36b0b6fc9210c8dc2', '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
          '97bcf7f1487f595b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
          '97b6b97bd19801ec9210c965cc920e', '97bcf7f1487f595b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722',
          '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bcf7f1487f531b0b0bb0b6fb0722',
          '7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
          '97bcf7f1487f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
          '97b6b97bd19801ec9210c9274c920e', '97bcf7f0e47f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722',
          '9778397bd097c36b0b6fc9210c91aa', '97b6b97bd197c36c9210c9274c920e', '97bcf7f0e47f531b0b0bb0b6fb0722',
          '7f0e397bd07f595b0b0bc920fb0722', '9778397bd097c36b0b6fc9210c8dc2', '9778397bd097c36c9210c9274c920e',
          '97b6b7f0e47f531b0723b0b6fb0722', '7f0e37f5307f595b0b0bc920fb0722', '7f0e397bd097c36b0b6fc9210c8dc2',
          '9778397bd097c36b0b70c9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721', '7f0e37f1487f595b0b0bb0b6fb0722',
          '7f0e397bd097c35b0b6fc9210c8dc2', '9778397bd097c36b0b6fc9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721',
          '7f0e27f1487f595b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
          '97b6b7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722',
          '9778397bd097c36b0b6fc9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722',
          '7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721',
          '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
          '97b6b7f0e47f531b0723b0787b0721', '7f0e27f0e47f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722',
          '9778397bd097c36b0b6fc9210c91aa', '97b6b7f0e47f149b0723b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722',
          '7f0e397bd07f595b0b0bc920fb0722', '9778397bd097c36b0b6fc9210c8dc2', '977837f0e37f149b0723b0787b0721',
          '7f07e7f0e47f531b0723b0b6fb0722', '7f0e37f5307f595b0b0bc920fb0722', '7f0e397bd097c35b0b6fc9210c8dc2',
          '977837f0e37f14998082b0787b0721', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e37f1487f595b0b0bb0b6fb0722',
          '7f0e397bd097c35b0b6fc9210c8dc2', '977837f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
          '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722', '977837f0e37f14998082b0787b06bd',
          '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722',
          '977837f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722',
          '7f0e397bd07f595b0b0bc920fb0722', '977837f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
          '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722', '977837f0e37f14998082b0787b06bd',
          '7f07e7f0e47f149b0723b0787b0721', '7f0e27f0e47f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722',
          '977837f0e37f14998082b0723b06bd', '7f07e7f0e37f149b0723b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722',
          '7f0e397bd07f595b0b0bc920fb0722', '977837f0e37f14898082b0723b02d5', '7ec967f0e37f14998082b0787b0721',
          '7f07e7f0e47f531b0723b0b6fb0722', '7f0e37f1487f595b0b0bb0b6fb0722', '7f0e37f0e37f14898082b0723b02d5',
          '7ec967f0e37f14998082b0787b0721', '7f07e7f0e47f531b0723b0b6fb0722', '7f0e37f1487f531b0b0bb0b6fb0722',
          '7f0e37f0e37f14898082b0723b02d5', '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
          '7f0e37f1487f531b0b0bb0b6fb0722', '7f0e37f0e37f14898082b072297c35', '7ec967f0e37f14998082b0787b06bd',
          '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e37f0e37f14898082b072297c35',
          '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722',
          '7f0e37f0e366aa89801eb072297c35', '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f149b0723b0787b0721',
          '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e37f0e366aa89801eb072297c35', '7ec967f0e37f14998082b0723b06bd',
          '7f07e7f0e47f149b0723b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722', '7f0e37f0e366aa89801eb072297c35',
          '7ec967f0e37f14998082b0723b06bd', '7f07e7f0e37f14998083b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722',
          '7f0e37f0e366aa89801eb072297c35', '7ec967f0e37f14898082b0723b02d5', '7f07e7f0e37f14998082b0787b0721',
          '7f07e7f0e47f531b0723b0b6fb0722', '7f0e36665b66aa89801e9808297c35', '665f67f0e37f14898082b0723b02d5',
          '7ec967f0e37f14998082b0787b0721', '7f07e7f0e47f531b0723b0b6fb0722', '7f0e36665b66a449801e9808297c35',
          '665f67f0e37f14898082b0723b02d5', '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
          '7f0e36665b66a449801e9808297c35', '665f67f0e37f14898082b072297c35', '7ec967f0e37f14998082b0787b06bd',
          '7f07e7f0e47f531b0723b0b6fb0721', '7f0e26665b66a449801e9808297c35', '665f67f0e37f1489801eb072297c35',
          '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722'],
  
      /**
       * 数字转中文速查表
       * @Array Of Property
       * @trans ['日','一','二','三','四','五','六','七','八','九','十']
       * @return Cn string
       */
      nStr1: ["\u65e5", "\u4e00", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d", "\u4e03", "\u516b", "\u4e5d", "\u5341"],
  
      /**
       * 日期转农历称呼速查表
       * @Array Of Property
       * @trans ['初','十','廿','卅']
       * @return Cn string
       */
      nStr2: ["\u521d", "\u5341", "\u5eff", "\u5345"],
  
      /**
       * 月份转农历称呼速查表
       * @Array Of Property
       * @trans ['正','一','二','三','四','五','六','七','八','九','十','冬','腊']
       * @return Cn string
       */
      nStr3: ["\u6b63", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d", "\u4e03", "\u516b", "\u4e5d", "\u5341", "\u51ac", "\u814a"],
  
      /**
       * 返回农历y年一整年的总天数
       * @param y lunar Year
       * @return Number
       * @eg:var count = calendar.lYearDays(1987) ;//count=387
       */
      lYearDays: function (y) {
          let i, sum = 348;
          for (i = 0x8000; i > 0x8; i >>= 1) {
              sum += (this.lunarInfo[y - 1900] & i) ? 1 : 0;
          }
          return (sum + this.leapDays(y));
      },
  
      /**
       * 返回农历y年闰月是哪个月；若y年没有闰月 则返回0
       * @param y lunar Year
       * @return Number (0-12)
       * @eg:var leapMonth = calendar.leapMonth(1987) ;//leapMonth=6
       */
      leapMonth: function (y) { //闰字编码 \u95f0
          return (this.lunarInfo[y - 1900] & 0xf);
      },
  
      /**
       * 返回农历y年闰月的天数 若该年没有闰月则返回0
       * @param y lunar Year
       * @return Number (0、29、30)
       * @eg:var leapMonthDay = calendar.leapDays(1987) ;//leapMonthDay=29
       */
      leapDays: function (y) {
          if (this.leapMonth(y)) {
              return ((this.lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
          }
          return (0);
      },
  
      /**
       * 返回农历y年m月（非闰月）的总天数，计算m为闰月时的天数请使用leapDays方法
       * @param y lunar Year
       * @param m lunar Month
       * @return Number (-1、29、30)
       * @eg:var MonthDay = calendar.monthDays(1987,9) ;//MonthDay=29
       */
      monthDays: function (y, m) {
          if (m > 12 || m < 1) {
              return -1
          }//月份参数从1至12，参数错误返回-1
          return ((this.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
      },
  
      /**
       * 返回公历(!)y年m月的天数
       * @param y solar Year
       * @param m solar Month
       * @return Number (-1、28、29、30、31)
       * @eg:var solarMonthDay = calendar.leapDays(1987) ;//solarMonthDay=30
       */
      solarDays: function (y, m) {
          if (m > 12 || m < 1) {
              return -1
          } //若参数错误 返回-1
          const ms = m - 1;
          if (ms === 1) { //2月份的闰平规律测算后确认返回28或29
              return (((y % 4 === 0) && (y % 100 !== 0) || (y % 400 === 0)) ? 29 : 28);
          } else {
              return (this.solarMonth[ms]);
          }
      },
  
      /**
       * 农历年份转换为干支纪年
       * @param  lYear 农历年的年份数
       * @return Cn string
       */
      toGanZhiYear: function (lYear) {
          var ganKey = (lYear - 3) % 10;
          var zhiKey = (lYear - 3) % 12;
          if (ganKey === 0) ganKey = 10;//如果余数为0则为最后一个天干
          if (zhiKey === 0) zhiKey = 12;//如果余数为0则为最后一个地支
          return this.Gan[ganKey - 1] + this.Zhi[zhiKey - 1];
  
      },
  
      /**
       * 公历月、日判断所属星座
       * @param  cMonth [description]
       * @param  cDay [description]
       * @return Cn string
       */
      toAstro: function (cMonth, cDay) {
          const s = "\u6469\u7faf\u6c34\u74f6\u53cc\u9c7c\u767d\u7f8a\u91d1\u725b\u53cc\u5b50\u5de8\u87f9\u72ee\u5b50\u5904\u5973\u5929\u79e4\u5929\u874e\u5c04\u624b\u6469\u7faf";
          const arr = [20, 19, 21, 21, 21, 22, 23, 23, 23, 23, 22, 22];
          return s.substr(cMonth * 2 - (cDay < arr[cMonth - 1] ? 2 : 0), 2) + "\u5ea7";//座
      },
  
      /**
       * 传入offset偏移量返回干支
       * @param offset 相对甲子的偏移量
       * @return Cn string
       */
      toGanZhi: function (offset) {
          return this.Gan[offset % 10] + this.Zhi[offset % 12];
      },
  
      /**
       * 传入公历(!)y年获得该年第n个节气的公历日期
       * @param y y公历年(1900-2100)
       * @param n n二十四节气中的第几个节气(1~24)；从n=1(小寒)算起
       * @return day Number
       * @eg:var _24 = calendar.getTerm(1987,3) ;//_24=4;意即1987年2月4日立春
       */
      getTerm: function (y, n) {
          if( y < 1900 || y > 2100 || n < 1 || n > 24) {
              return -1;
          }
          const _table = this.sTermInfo[y - 1900];
          const _calcDay = []
          for (let index = 0; index < _table.length; index += 5) {
              const chunk = parseInt('0x' + _table.substr(index, 5)).toString()
              _calcDay.push(
                chunk[0],
                chunk.substr(1, 2),
                chunk[3],
                chunk.substr(4, 2)
              )
          }
          return parseInt(_calcDay[n - 1]);
      },
  
      /**
       * 传入农历数字月份返回汉语通俗表示法
       * @param m lunar month
       * @return Cn string
       * @eg:var cnMonth = calendar.toChinaMonth(12) ;//cnMonth='腊月'
       */
      toChinaMonth: function (m) { // 月 => \u6708
          if (m > 12 || m < 1) {
              return -1
          } //若参数错误 返回-1
          let s = this.nStr3[m - 1];
          s += "\u6708";//加上月字
          return s;
      },
  
      /**
       * 传入农历日期数字返回汉字表示法
       * @param d lunar day
       * @return Cn string
       * @eg:var cnDay = calendar.toChinaDay(21) ;//cnMonth='廿一'
       */
      toChinaDay: function (d) { //日 => \u65e5
          let s;
          switch (d) {
              case 10:
                  s = '\u521d\u5341';
                  break;
              case 20:
                  s = '\u4e8c\u5341';
                  break;
              case 30:
                  s = '\u4e09\u5341';
                  break;
              default :
                  s = this.nStr2[Math.floor(d / 10)];
                  s += this.nStr1[d % 10];
          }
          return (s);
      },
  
      /**
       * 年份转生肖[!仅能大致转换] => 精确划分生肖分界线是"立春"
       * @param y year
       * @return Cn string
       * @eg:var animal = calendar.getAnimal(1987) ;//animal='兔'
       */
      getAnimal: function (y) {
          return this.Animals[(y - 4) % 12]
      },
  
      /**
       * 传入阳历年月日获得详细的公历、农历object信息 <=>JSON
       * !important! 公历参数区间1900.1.31~2100.12.31
       * @param yPara  solar year
       * @param mPara  solar month
       * @param dPara  solar day
       * @return JSON object
       * @eg:console.log(calendar.solar2lunar(1987,11,01));
       */
      solar2lunar: function (yPara, mPara, dPara) {
          let y = parseInt(yPara);
          let m = parseInt(mPara);
          let d = parseInt(dPara);
          //年份限定、上限
          if (y < 1900 || y > 2100) {
              return -1;// undefined转换为数字变为NaN
          }
          //公历传参最下限
          if (y === 1900 && m === 1 && d < 31) {
              return -1;
          }
  
          //未传参  获得当天
          let objDate;
          if (!y) {
              objDate = new Date();
          } else {
              objDate = new Date(y, parseInt(m) - 1, d);
          }
          let i, leap = 0, temp = 0;
          //修正ymd参数
          y = objDate.getFullYear();
          m = objDate.getMonth() + 1;
          d = objDate.getDate();
          let offset = (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) - Date.UTC(1900, 0, 31)) / 86400000;
          for (i = 1900; i < 2101 && offset > 0; i++) {
              temp = this.lYearDays(i);
              offset -= temp;
          }
          if (offset < 0) {
              offset += temp;
              i--;
          }
  
          //是否今天
          let isTodayObj = new Date(),
              isToday = false;
          if (isTodayObj.getFullYear() === y && isTodayObj.getMonth() + 1 === m && isTodayObj.getDate() === d) {
              isToday = true;
          }
          //星期几
          let nWeek = objDate.getDay(),
              cWeek = this.nStr1[nWeek];
          //数字表示周几顺应天朝周一开始的惯例
          if (nWeek === 0) {
              nWeek = 7;
          }
          //农历年
          const year = i;
          leap = this.leapMonth(i); //闰哪个月
          let isLeap = false;
  
          //效验闰月
          for (i = 1; i < 13 && offset > 0; i++) {
              //闰月
              if (leap > 0 && i === (leap + 1) && isLeap === false) {
                  --i;
                  isLeap = true;
                  temp = this.leapDays(year); //计算农历闰月天数
              } else {
                  temp = this.monthDays(year, i);//计算农历普通月天数
              }
              //解除闰月
              if (isLeap === true && i === (leap + 1)) {
                  isLeap = false;
              }
              offset -= temp;
          }
          // 闰月导致数组下标重叠取反
          if (offset === 0 && leap > 0 && i === leap + 1) {
              if (isLeap) {
                  isLeap = false;
              } else {
                  isLeap = true;
                  --i;
              }
          }
          if (offset < 0) {
              offset += temp;
              --i;
          }
          //农历月
          const month = i;
          //农历日
          const day = offset + 1;
          //天干地支处理
          const sm = m - 1;
          const gzY = this.toGanZhiYear(year);
  
          // 当月的两个节气
          // bugfix-2017-7-24 11:03:38 use lunar Year Param `y` Not `year`
          const firstNode = this.getTerm(y, (m * 2 - 1));//返回当月「节」为几日开始
          const secondNode = this.getTerm(y, (m * 2));//返回当月「节」为几日开始
  
          // 依据12节气修正干支月
          let gzM = this.toGanZhi((y - 1900) * 12 + m + 11);
          if (d >= firstNode) {
              gzM = this.toGanZhi((y - 1900) * 12 + m + 12);
          }
  
          //传入的日期的节气与否
          let isTerm = false;
          let Term = null;
          if (firstNode === d) {
              isTerm = true;
              Term = this.solarTerm[m * 2 - 2];
          }
          if (secondNode === d) {
              isTerm = true;
              Term = this.solarTerm[m * 2 - 1];
          }
          //日柱 当月一日与 1900/1/1 相差天数
          const dayCyclical = Date.UTC(y, sm, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10;
          const gzD = this.toGanZhi(dayCyclical + d - 1);
          //该日期所属的星座
          const astro = this.toAstro(m, d);
  
          const solarDate = y + '-' + m + '-' + d;
          const lunarDate = year + '-' + month + '-' + day;
  
          const festival = this.festival;
          const lFestival = this.lFestival;
  
          const festivalDate = m + '-' + d;
          let lunarFestivalDate = month + '-' + day;
  
          // bugfix https://github.com/jjonline/calendar.js/issues/29
          // 农历节日修正：农历12月小月则29号除夕，大月则30号除夕
          // 此处取巧修正：当前为农历12月29号时增加一次判断并且把lunarFestivalDate设置为12-30以正确取得除夕
          // 天朝农历节日遇闰月过前不过后的原则，此处取农历12月天数不考虑闰月
          // 农历润12月在本工具支持的200年区间内仅1574年出现
          if (month === 12 && day === 29 && this.monthDays(year, month) === 29) {
              lunarFestivalDate = '12-30';
          }
          return {
              date: solarDate,
              lunarDate: lunarDate,
              festival: festival[festivalDate] ? festival[festivalDate].title : null,
              lunarFestival: lFestival[lunarFestivalDate] ? lFestival[lunarFestivalDate].title : null,
              'lYear': year,
              'lMonth': month,
              'lDay': day,
              'Animal': this.getAnimal(year),
              'IMonthCn': (isLeap ? "\u95f0" : '') + this.toChinaMonth(month),
              'IDayCn': this.toChinaDay(day),
              'cYear': y,
              'cMonth': m,
              'cDay': d,
              'gzYear': gzY,
              'gzMonth': gzM,
              'gzDay': gzD,
              'isToday': isToday,
              'isLeap': isLeap,
              'nWeek': nWeek,
              'ncWeek': "\u661f\u671f" + cWeek,
              'isTerm': isTerm,
              'Term': Term,
              'astro': astro
          };
      },
  
      /**
       * 传入农历年月日以及传入的月份是否闰月获得详细的公历、农历object信息 <=>JSON
       * !important! 参数区间1900.1.31~2100.12.1
       * @param y  lunar year
       * @param m  lunar month
       * @param d  lunar day
       * @param isLeapMonth  lunar month is leap or not.[如果是农历闰月第四个参数赋值true即可]
       * @return JSON object
       * @eg:console.log(calendar.lunar2solar(1987,9,10));
       */
      lunar2solar: function (y, m, d, isLeapMonth) {
          y = parseInt(y)
          m = parseInt(m)
          d = parseInt(d)
          isLeapMonth = !!isLeapMonth;
          const leapOffset = 0;
          const leapMonth = this.leapMonth(y);
          const leapDay = this.leapDays(y);
          if (isLeapMonth && (leapMonth !== m)) {
              return -1;
          }//传参要求计算该闰月公历 但该年得出的闰月与传参的月份并不同
          if (y === 2100 && m === 12 && d > 1 || y === 1900 && m === 1 && d < 31) {
              return -1;
          }//超出了最大极限值
          const day = this.monthDays(y, m);
          let _day = day;
          //bugFix 2016-9-25
          //if month is leap, _day use leapDays method
          if (isLeapMonth) {
              _day = this.leapDays(y, m);
          }
          if (y < 1900 || y > 2100 || d > _day) {
              return -1;
          }//参数合法性效验
  
          //计算农历的时间差
          let offset = 0;
          let i;
          for (i = 1900; i < y; i++) {
              offset += this.lYearDays(i);
          }
          let leap = 0, isAdd = false;
          for (i = 1; i < m; i++) {
              leap = this.leapMonth(y);
              if (!isAdd) {//处理闰月
                  if (leap <= i && leap > 0) {
                      offset += this.leapDays(y);
                      isAdd = true;
                  }
              }
              offset += this.monthDays(y, i);
          }
          //转换闰月农历 需补充该年闰月的前一个月的时差
          if (isLeapMonth) {
              offset += day;
          }
          //1900年农历正月一日的公历时间为1900年1月30日0时0分0秒(该时间也是本农历的最开始起始点)
          const strap = Date.UTC(1900, 1, 30, 0, 0, 0);
          const calObj = new Date((offset + d - 31) * 86400000 + strap);
          const cY = calObj.getUTCFullYear();
          const cM = calObj.getUTCMonth() + 1;
          const cD = calObj.getUTCDate();
  
          return this.solar2lunar(cY, cM, cD);
      }
  };

var lunar = calendar.solar2lunar();
var nowsolar = lunar.cMonth + '月' + lunar.cDay + '日（' + lunar.astro + '）';
var nowlunar = lunar.IMonthCn + lunar.IDayCn + ' ' + lunar.gzYear + lunar.gzMonth + lunar.gzDay + ' ' + lunar.Animal + '年';

function getRandomPoem() {
  const poems = [
    "心头影事幻重重，化作佳人绝代容。",
    "转眼苑枯便不同，昔日芳草化飞蓬。",
    "心头影事幻重重，化作佳人绝代容。恰似东山山上月，轻轻走出最高峰。",
    "转眼苑枯便不同，昔日芳草化飞蓬。饶君老去形骸在，变似南方竹节弓。",
    "意外娉婷忽见知，结成鸳侣慰相思。此身似历茫茫海，一颗骊珠乍得时。",
    "邂逅谁家一女郎，玉肌兰气郁芳香。可怜璀璨松精石，不遇知音在路旁。",
    "名门娇女态翩翩，阅尽倾城觉汝贤。比似园林多少树，枝头一果娉鮓妍。",
    "一自消魂那壁厢，至今寤寐不断忘。当时交臂还相失，此后思君空断肠。",
    "我与伊人本一家，情缘虽尽莫咨嗟。清明过了春归去，几见狂蜂恋落花。",
    "青女欲来天气凉，蒹葭和露晚苍苍。黄蜂散尽花飞尽，怨杀无情一夜霜。",
    "飞来野鹜恋丛芦，能向芦中小住无。一事寒心留不得，层冰吹冻满平湖。",
    "莫道无情渡口舟，舟中木马解回头。不知负义儿家婿，尚解回头一顾不。",
    "游戏拉萨十字街，偶逢商女共徘徊。匆匆绾个同心结，掷地旋看已自开。",
    "长干小生最可怜，为立祥幡傍柳边。树底阿哥须护惜，莫教飞石到幡前。",
    "手写瑶笺被雨淋，模糊点画费探寻。纵然灭却书中字，难灭情人一片心。",
    "小印圆匀黛色深，私钳纸尾意沉吟。烦君刻画相思去，印入伊人一寸心。",
    "细腰蜂语蜀葵花，何日高堂供曼遮。但使侬骑花背稳，请君驮上法王家。",
    "含情私询意中人，莫要空门证法身。卿果出家吾亦逝，入山和汝断红尘。",
    "至诚皈命喇嘛前，大道明明为我宣。无奈此心狂未歇，归来仍到那人边。",
    "入定修观法眼开，乞求三宝降灵台。观中诸圣何曾见，不请情人却自来。",
    "静时修止动修观，历历情人挂眼前。肯把此心移学道，即生成佛有何难。",
    "醴泉甘露和流霞，不是寻常卖酒家。空女当垆亲赐饮，醉乡开出吉祥花。",
    "为竖幡幢诵梵经，欲凭道力感娉婷。琼筵果奉佳人召，知是前朝佛法灵。",
    "贝齿微张笑靥开，双眸闪电座中来。无端觑看情郎面，不觉红涡晕两腮。",
    "情到浓时起致辞，可能长作玉交枝。除非死后当分散，不遣生前有别离。",
    "曾虑多情损梵行，入山又恐别倾城。世间安得双全法，不负如来不负卿。",
    "绝似花蜂困网罗，奈他工布少年何。圆成好梦才三日，又拟将身学佛陀。",
    "别后行踪费我猜，可曾非议赴阳台。同行只有钗头凤，不解人前告密来。",
    "微笑知君欲诱谁，两行玉齿露参差。此时心意真相属，可肯侬前举誓词。",
    "飞来一对野鸳鸯，撮合劳他贳酒娘。但使有情成眷属，不辞辛苦作慈航。",
    "密意难为父母陈，暗中私说与情人。情人更向情人说，直到仇家听得真。",
    "腻婥仙人不易寻，前朝遇我忽成禽。无端又被卢桑夺，一入侯门似海深。",
    "明知宝物得来难，在手何曾作宝看。直到一朝遗失后，每思奇痛彻心肝。",
    "深怜密爱誓终身，忽抱瑟琶向别人。自理愁肠磨病骨，为卿憔悴欲成尘。",
    "盗过佳人便失踪，求神问卜冀重逢。思量昔日天真处，只有依稀一梦中。",
    "少年浪迹爱章台，性命唯堪寄酒怀。传语当垆诸女伴，卿如不死定常来。",
    "美人不是母胎生，应是桃花树长成。已恨桃花容易落，落花比汝尚多情。",
    "生小从来识彼姝，问渠家世是狼无。成堆血肉留难住，奔去荒山何所图。",
    "山头野马性难驯，机陷犹堪制彼身。自叹神通空具足，不能调伏枕边人。",
    "羽毛零乱不成衣，深悔苍鹰一怒非。我为忧思自憔悴，那能无损旧腰围。",
    "浮云内黑外边黄，此是天寒欲雨霜。班弟貌僧心是俗，明明末法到沧桑。",
    "外虽解冻内偏凝，骑马还防踏暗冰。往诉不堪逢彼怒，美人心上有层冰。",
    "弦望相看各有期，本来一体异盈亏。腹中顾兔消磨尽，始是清光饱满时。",
    "前月推移后月行，暂时分手不须衰。吉祥白月行看近，又到佳期第二回。",
    "须弥不动住中央，日月游行绕四方。各驾轻车投熟路，未须却脚叹迷阳。",
    "新月才看一线明，气吞碧落便横行。初三自诩清光满，十五何来皓魄盈。",
    "十地庄严住法王，誓言诃护有金刚。神通大力知无敌，尽逐魔军去八荒。",
    "杜宇新从漠地来，天边春色一时回。还如意外情人至，使我心花顷刻开。",
    "不观生灭与无常，但逐轮回向死亡。绝顶聪明矜世智，叹他于此总茫茫。",
    "君看众犬吠狺狺，饲以雏豚亦易训。只有家中雌老虎，愈温存处愈生嗔。",
    "抱惯娇躯识重轻，就中难测是深情。输他一种觇星术，星斗弥天认得清。",
    "郁郁南山树草繁，还从幽处会婵娟。知情只有闲鹦鹉，莫向三叉路口言。",
    "拉萨游女漫如云，琼结佳人独秀群。我向此中求伴侣，最先属意便为君。",
    "龙钟黄犬老多髭，镇日司阍仗尔才。莫道夜深吾出去，莫言破晓我归来。",
    "为寻情侣去匆匆，破晓归来积雪中。就里机关谁识得，仓央嘉措布拉宫。",
    "夜走拉萨逐绮罗，有名荡子是汪波。而今秘密浑无用，一路琼瑶足迹多。",
    "玉软香温被裹身，动人怜处是天真。疑他别有机权在，巧为钱刀作笑颦。",
    "轻垂辫发结冠缨，临别叮咛缓缓行。不久与君须会合，暂时判袂莫伤情。",
    "跨鹤高飞意壮哉，云霄一羽雪皑皑。此行莫恨天涯远，咫尺理塘归去来。",
    "死后魂游地狱前，冥王业镜正高悬。一困阶下成禽日，万鬼同声唱凯旋。",
    "卦箭分明中鹄来，箭头颠倒落尘埃。情人一见还成鹄，心箭如何挽得回。",
    "孔雀多生印度东，娇鹦工布产偏丰。二禽相去当千里，同在拉萨一市中。",
    "行事曾叫众口哗，本来白璧有微瑕。少年琐碎零星步，曾到拉萨卖酒家。",
    "鸟对垂杨似有情，垂杨亦爱鸟轻盈。若叫树鸟长如此，伺隙苍鹰那得撄。",
    "结尽同心缔尽缘，此生虽短意缠绵。与卿再世相逢日，玉树临风一少年。",
    "吩咐林中解语莺，辩才虽好且休鸣。画眉阿姊垂杨畔，我要听他唱一声。",
    "纵使龙魔逐我来，张牙舞爪欲为灾。眼前苹果终须吃，大胆将他摘一枚。",
    "但曾相见便相知，相见何如不见时。安得与君相诀绝，免教辛苦作相思。"
  ];
  const randomIndex = Math.floor(Math.random() * poems.length);
  return poems[randomIndex];
}

function title_random() {
  const randomChoice = Math.floor(Math.random() * 3);
  
  switch (randomChoice) {
    case 0:
      return nowsolar;
    case 1:
      return nowlunar;
    case 2:
      return getRandomPoem();
    default:
      return "Unknown";
  }
}

console.log(title_random());

  $done({
  title:title_random(tnumcount(Number(nowlist))),
  icon:icon_now(tnumcount(Number(nowlist))),
  content:tlist[nowlist][0]+":"+today(tnumcount(nowlist))+","+tlist[Number(nowlist) + Number(1)][0] +":"+ tnumcount(Number(nowlist) + Number(1))+ "天,"+tlist[Number(nowlist) + Number(2)][0]+":"+tnumcount(Number(nowlist) + Number(2))+"天"
  })