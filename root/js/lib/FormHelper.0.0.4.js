// JavaScript Document
(function(){
	
"use strict";

window.FormHelper = {};

/* address complete */

//縣市/郵遞區號
var county,zone,zipCode;
/*
county = new Array("台北市", "基隆市", "新北市", "宜蘭縣", "新竹市", 
                   "新竹縣", "桃園縣", "苗栗縣", "台中市", "彰化縣",
                   "南投縣", "嘉義市", "嘉義縣", "雲林縣", "台南市",
                   "高雄市", "澎湖縣", "屏東縣", "台東縣", "花蓮縣",
                   "金門縣", "連江縣", "南海諸島", "釣魚台列嶼");
zone=new Array(24);
zipCode = new Array(24);
*/
county = ["台北市", "基隆市", "新北市", "宜蘭縣", "新竹市",
                   "新竹縣", "桃園縣", "苗栗縣", "台中市", "彰化縣",
                   "南投縣", "嘉義市", "嘉義縣", "雲林縣", "台南市",
                   "高雄市", "澎湖縣", "屏東縣", "台東縣", "花蓮縣",
                   "金門縣", "連江縣", "南海諸島"];
zone=new Array(23);
zipCode = new Array(23);
// for "台北市"
zone[0] = ["中正區","大同區","中山區","松山區","大安區","萬華區",
                    "信義區","士林區","北投區","內湖區","南港區","文山區"];
// for "基隆市"
zone[1] = ["仁愛區","信義區","中正區","中山區","安樂區","暖暖區","七堵區"];
// for "新北市"
zone[2] = ["萬里區","金山區","板橋區","汐止區","深坑區","石碇區","瑞芳區",
                    "平溪區","雙溪區","貢寮區","新店區","坪林區","烏來區","永和區","中和區","土城區",
                    "三峽區","樹林區","鶯歌區","三重區","新莊區","泰山區","林口區","蘆洲區","五股區",
                    "八里區","淡水區","三芝區","石門區"];
// for "宜蘭縣"
zone[3] = ["宜蘭市","頭城鎮","礁溪鄉","壯圍鄉","員山鄉","羅東鎮","三星鄉",
                    "大同鄉","五結鄉","冬山鄉","蘇澳鎮","南澳鄉"];
// for "新竹市"
zone[4] = new Array("新竹市");
// for "新竹縣"
zone[5] = ["竹北市","湖口鄉","新豐鄉","新埔鄉","關西鎮","芎林鄉","寶山鄉",
                    "竹東鎮","五峰鄉","橫山鄉","尖石鄉","北埔鄉","峨嵋鄉"];
// for "桃園縣"
zone[6] = ["中壢市","平鎮市","龍潭鄉","楊梅鎮","新屋鄉","觀音鄉","桃園市",
                    "龜山鄉","八德市","大溪鎮","復興鄉","大園鄉","蘆竹鄉"];
// for "苗栗縣"
zone[7] = ["竹南鎮","頭份鎮","三灣鄉","南庄鄉","獅潭鄉","後龍鎮","通霄鎮","苑裡鎮","苗栗市",
                    "造橋鄉","頭屋鄉","公館鄉","大湖鄉","泰安鄉","銅鑼鄉","三義鄉","西湖鄉","卓蘭鄉"];
// for "台中市"
zone[8] = ["中區","東區","南區","西區","北區","北屯區","西屯區","南屯區",
                    "太平區","大里區","霧峰區","烏日區","豐原區","后里區","石岡區",
                    "東勢區","和平區","新社區","潭子區","大雅區","神岡區","大肚區","沙鹿區","龍井區",
                    "梧棲區","清水區","大甲區","外埔區","大安區"];
// for "彰化縣"
zone[9] = ["彰化市","芬園鄉","花壇鄉","秀水鄉","鹿港鎮","福興鄉","線西鄉","和美鎮","伸港鄉",
                    "員林鎮","社頭鄉","永靖鄉","埔心鄉","溪湖鎮","大村鄉","埔鹽鄉","田中鎮","北斗鎮",
                    "田尾鄉","埤頭鄉","溪州鄉","竹塘鄉","二林鎮","大城鄉","芳苑鄉","二水鄉"];
// for "南投縣"
zone[10] = ["南投市","中寮鄉","草屯鎮","國姓鄉","埔里鎮","仁愛鄉","名間鄉",
                    "集集鄉","水里鄉","魚池鄉","信義鄉","竹山鎮","鹿谷鄉"];
// for "嘉義市"
zone[11] = new Array("嘉義市");
// for "嘉義縣"
zone[12] = ["番路鄉","梅山鄉","竹崎鄉","阿里山鄉","中埔鄉","大埔鄉","水上鄉","鹿草鄉","太保市",
                    "朴子市","東石鄉","六腳鄉","新港鄉","民雄鄉","大林鎮","溪口鄉","義竹鄉","布袋鎮"];
// for "雲林縣"
zone[13] = ["斗南市","大埤鄉","虎尾鎮","土庫鎮","褒忠鄉","東勢鄉","台西鄉","崙背鄉","麥寮鄉","斗六市",
                    "林內鄉","古坑鄉","莿桐鄉","西螺鎮","二崙鄉","北港鎮","水林鄉","口湖鄉","四湖鄉","元長鄉"];
// for "台南市"
zone[14] = ["中區","東區","南區","西區","北區","安平區","安南區",
                    "永康區","歸仁區","新化區","左鎮區","玉井區","楠西區","南化區","仁德區","關廟區","龍崎區",
                    "官田區","麻豆區","佳里區","西港區","七股區","將軍區","學甲區","北門區","新營區","後壁區",
                    "白河區","東山區","六甲區","下營區","柳營區","鹽水區","善化區","大內區","山上區","新市區","安定區"];
// for "高雄市"
zone[15] = ["新興區","前金區","苓雅區","鹽埕區","鼓山區",
                    "旗津區","前鎮區","三民區","楠梓區","小港區","左營區",
                    "仁武區","大社區","岡山區","路竹區","阿蓮區","田寮區","燕巢區","橋頭區","梓官區",
                    "彌陀區","永安區","湖內區","鳳山區","大寮區","林園區","鳥松區","大樹區","旗山區",
                    "美濃區","六龜區","內門區","杉林區","甲仙區","桃源區","那瑪夏區","茂林區","茄萣區"];
// for "澎湖縣"
zone[16] = ["馬公市","西嶼鄉","望安鄉","七美鄉","白沙鄉","湖西鄉"];
// for "屏東縣"
zone[17] = ["屏東市","三地門鄉","霧台鄉","瑪家鄉","九如鄉","里港鄉","高樹鄉","鹽埔鄉","長治鄉","麟洛鄉","竹田鄉",
                    "內埔鄉","萬丹鄉","潮州鎮","泰武鄉","來義鄉","萬巒鄉","嵌頂鄉","新埤鄉","南州鄉","林邊鄉","東港鎮",
                    "琉球鄉","佳冬鄉","新園鄉","枋寮鄉", "枋山鄉","春日鄉","獅子鄉","車城鄉","牡丹鄉","恆春鎮","滿州鄉"];
// for "台東縣"
zone[18] = ["台東市","綠島鄉","蘭嶼鄉","延平鄉","卑南鄉","鹿野鄉","關山鎮","海端鄉",
                    "池上鄉","東河鄉","成功鎮","長濱鄉","太麻里鄉","金峰鄉","大武鄉","達仁鄉"];
// for "花蓮縣"
zone[19] = ["花蓮市","新城鄉","秀林鄉","吉安鄉","壽豐鄉","鳳林鎮","光復鄉",
                    "豐濱鄉","瑞穗鄉","萬榮鄉","玉里鎮","卓溪鄉","富里鄉"];
// for "金門縣"
zone[20] = ["金沙鎮","金湖鎮","金寧鄉","金城鎮","烈嶼鄉","烏坵鄉"];
// for "連江縣"
zone[21] = ["南竿鄉","北竿鄉","莒光鄉","東引"];
// for "南海諸島"
zone[22] = ["東沙","西沙"];
// for "釣魚台列嶼"
//zone[23] = new Array("釣魚台列嶼");

zipCode = new Array(24);
// for "台北市"
zipCode[0] = ["100","103","104","105","106","108","110","111","112","114","115","116"];
// for "基隆市"
zipCode[1] = ["200","201","202","203","204","205","206"];
// for "新北市"
zipCode[2] = ["207","208","220","221","222","223","224","226","227",
                        "228","231","232","233","234","235","236","237","238","239",
                        "241","242","243","244","247","248","249","251","252","253"];
// for "宜蘭縣"
zipCode[3] = ["260","261","262","263","264","265","266","267","268","269","270","272"];
// for "新竹市"
zipCode[4] = new Array("300");
// for "新竹縣"
zipCode[5] = ["302","303","304","305","306","307","308","310","311","312","313","314","315"];
// for "桃園縣"
zipCode[6] = ["320","324","325","326","327","328","330","333","334","335","336","337","338"];
// for "苗栗縣"
zipCode[7] = ["350","351","352","353","354","356","357","358","360",
                        "361","362","363","364","365","366","367","368","369"];
// for "台中市"
zipCode[8] = ["400","401","402","403","404","406","407","408",
                        "411","412","413","414","420","421","422","423","424","426","427",
                        "428","429","432","433","434","435","436","437","438","439"];
// for "彰化縣"
zipCode[9]= ["500","502","503","504","505","506","507","508","509",
                        "510","511","5112","513","514","515","516","520","521",
                        "522","523","524","525","526","527","528","530"];
// for "南投縣"
zipCode[10] = ["540","541","542","544","545","546","551","552","553","555","556","557","558"];
// for "嘉義市"
zipCode[11] = new Array("600");
// for "嘉義縣"
zipCode[12] = ["602","603","604","605","606","607","608","611","612",
                        "613","614","615","616","621","622","623","624","625"];
// for "雲林縣"
zipCode[13] = ["630","631","632","633","634","635","636","637","638","640",
                        "643","646","647","648","649","651","652","653","654","655"];
// for "台南市
zipCode[14] = ["700","701","702","703","704","708","709",
                        "710","711","712","713","714","715","716","717","718","719",
                        "720","721","722","723","724","725","726","727","730","731",
                        "732","733","734","735","736","737","741","742","743","744","745"];
// for "高雄市"
zipCode[15] = ["800","801","802","803","804","805","806","807","811","812","813",
                         "814","815","820","821","822","823","824","825","826",
                         "827","828","829","830","831","832","833","840","842",
                        "843","844","845","846","847","848","849","851","852"];
// for "澎湖縣"
zipCode[16] = ["880","881","882","883","884","885"];
// for "屏東縣"
zipCode[17] = ["900","901","902","903","904","905","906","907","908","909","911",
                        "912","913","920","921","922","923","924","925","926","927","928",
                        "929","931","932","940","941","942","943","944","945","946","947"];
// for "台東縣"
zipCode[18] = ["950","951","952","953","954","955","956","957",
                        "958","959","961","962","963","964","965","966"];
// for "花蓮縣"
zipCode[19] = ["970","971","972","973","974","975","976","977","978","979","981","982","983"];
// for "金門縣"
zipCode[20] = ["890","891","892","893","894","896"];
// for "連江縣"
zipCode[21] = ["209","210","211","212"];
// for "南海諸島"
zipCode[22] = ["817","819","290"];
// for "釣魚台列嶼"
//zipCode[23] = new Array("290");

FormHelper.completeCounty = function($county, $zone, countyValue, zoneValue, combineZipCode)
{	
    $county.find('option').remove();
	$county.append('<option value="" selected>縣市</option>\n');
	
    for (var c = 0; c < county.length; c++)
	{
        if (countyValue == county[c]) $county.append('<option value="'+ county[c] +'" selected>'+ county[c] +'</option>\n');
        else $county.append('<option value="'+ county[c] +'">'+ county[c] +'</option>\n');
    }
	
    FormHelper.completeZone($county, $zone, zoneValue, combineZipCode);

    $county.on("change", function()
    {
        FormHelper.completeZone($county, $zone, zoneValue, combineZipCode);
    });
};

FormHelper.completeZone = function($county, $zone, zoneValue, combineZipCode)
{
    $zone.find('option').remove();
	$zone.append('<option value="" selected>地區</option>\n');
	
    if ($county.val() == '') return;
	
	var countyIndex = $county.get(0).selectedIndex-1;
	
    var zoneArray = zone[countyIndex];
    var zipCodeArray = zipCode[countyIndex];


    for (var z = 0; z < zoneArray.length; z++)
	{
		var zipCodeString = (combineZipCode == true)? " "+zipCodeArray[z] : "";
		var value = zoneArray[z] + zipCodeString;
        if(zoneValue == zoneArray[z])
        {
            $zone.append('<option value="'+ value +'" selected>'+ value +'</option>\n');
        }
        else
        {
            $zone.append('<option value="'+ value +'">'+ value +'</option>\n');
        }
    }
};

FormHelper.getAddressValue = function($county, $zone)
{
	var countyIndex = $county.get(0).selectedIndex-1;
	var zoneIndex = $zone.get(0).selectedIndex-1;
	var zoneArray = zone[countyIndex];
	var zipCodeArray = zipCode[countyIndex];
	
	var countyValue = (county[countyIndex] == undefined)? null: county[countyIndex];
	var zoneValue = (zoneArray == undefined)? null: zoneArray[zoneIndex];
	var zipCodeValue = (zipCodeArray == undefined)? null: zipCodeArray[zoneIndex];
	
	var obj = 
	{
		county: countyValue,
		zone: zoneValue,
		zipCode: zipCodeValue
	};
	
	return obj;
};

/* date complete */

window.DateCombo = DateCombo;

function DateCombo(yearDom, monthDom, dayDom, cb_onChange, yearLabel, monthLabel, dayLabel, yearUnit, monthUnit, dayUnit)
{	
	var _p = DateCombo.prototype = this;
	
	_p.update = update;
	_p.getDateValue = getDateValue;
	_p.getDateString = getDateString;
	_p.to = to;
	_p.lock = lock;
	_p.unlock = unlock;
	_p.reset = reset;

	$(yearDom).find('option').remove();
	$(monthDom).find('option').remove();
	$(dayDom).find('option').remove();
	
	if(yearLabel == null) yearLabel = "年";
	if(monthLabel == null) monthLabel = "月";
	if(dayLabel == null) dayLabel = "日";
	
	yearUnit = (yearUnit == null)? "": " " + yearUnit;
	monthUnit = (monthUnit == null)? "": " " + monthUnit;
	dayUnit = (dayUnit == null)? "": " " + dayUnit;
	
	$(yearDom).append('<option value="" selected>'+yearLabel+'</option>\n');
	$(monthDom).append('<option value="" selected>'+monthLabel+'</option>\n');
	
	var i, optionDom;
	var date = new Date();
	for(i=1900;i<=date.getFullYear();i++)
	{
		$(yearDom).append('<option value="'+ i +'">'+ i + yearUnit +'</option>\n');
	}
	
	for(i=1;i<=12;i++)
	{
		$(monthDom).append('<option value="'+ i +'">'+ i + monthUnit +'</option>\n');
	}
	
	//yearDom.selectedIndex = 1;
	//monthDom.selectedIndex = 1;
	
	$(yearDom).change(update);
	$(monthDom).change(update);
	
	$(yearDom).prop('selectedIndex', 0); 
	$(monthDom).prop('selectedIndex', 0); 
	$(dayDom).prop('selectedIndex', 0); 
	
	update();
	
	function update(evt)
	{
		var year = $(yearDom).val();
		var month = $(monthDom).val();
		
		$(dayDom).find('option').remove();
		$(dayDom).append('<option value="" selected>'+dayLabel+'</option>\n');
		
		if(year == "" || month == "") return;
		
		var d=new Date(year, month, -1);
		
		var maxValue = d.getDate()+1;
		for(var i=1;i<=maxValue;i++){
			$(dayDom).append('<option value="'+ i +'">'+ i + dayUnit +'</option>\n');
		}
		
		$(dayDom).prop('selectedIndex', 0); 
		
		if(cb_onChange)cb_onChange.apply(null, [newDayIndex]);
	}
	
	function to(year, month, day)
	{
		$(yearDom).prop('selectedIndex', parseInt(year)-1900 + 1); 
		$(monthDom).prop('selectedIndex', parseInt(month)); 
		update();
		$(dayDom).prop('selectedIndex', parseInt(day)); 
	}
	
	function reset()
	{
		to(1899, 0, 0);
	}
	
	function lock()
	{
		$(yearDom).attr("disabled", "disabled");
		$(monthDom).attr("disabled", "disabled");
		$(dayDom).attr("disabled", "disabled");
	}
	
	function unlock()
	{
		$(yearDom).removeAttr("disabled");
		$(monthDom).removeAttr("disabled");
		$(dayDom).removeAttr("disabled");
	}
	
	function getDateValue()
	{
		return {
			year: $(yearDom).val(),
			month: $(monthDom).val(),
			day: $(dayDom).val()
		};
    }
    function getDateString(splitChar)
	{
		if(splitChar == null) splitChar = "/";
		var obj = getDateValue(yearDom, monthDom, dayDom);
		if(obj.year == "" || obj.month == "" || obj.day == "") return null;
		return obj.year + splitChar + obj.month + splitChar + obj.day;
    }
}
	
}());