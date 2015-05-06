/*

 取得目前活動進行狀態, 包含:

 進行日: day
 系統時間: system_time
 已經進行的路徑: event_route
 目前能夠選的選項, 和該選項目前投票狀態: options

 */

if(!window.FakeData) window.FakeData = {};
window.FakeData.get_vote_data = {};

/* send */
window.FakeData.get_vote_data.send_data =
{
    fb_uid: "13212312312312" // facebook uid
};



/* get */
window.FakeData.get_vote_data.recive_data =
{
    "res": "ok",
    "user_vote": "4", // 如果使用者已經有投票, 傳回使用者投的 city_index
    "day": 3, // 目前活動進行日
    "system_time": "13/36/36", // 目前系統時間 hh = 時, mm = 分, ss = 秒
    "event_route": [0, 3, 5], // 目前已經進行的路徑, 數值對應到 city_data.js 中的個別城市的 index
    "options":
        [
            {"city_index": 4, "num_votes": 333}, // city_index 對應到 city_data.js 中個別城市的 index
            {"city_index": 5, "num_votes": 22},
            {"city_index": 6, "num_votes": 4444}
        ]
};
