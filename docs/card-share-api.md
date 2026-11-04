# 心情卡片分享 · 后端接口文档

- 域名：`https://aiballs.cn`
- 通用返回格式：`{ "code": 0, "data": ..., "msg": "" }`。`code` 为 0 或 200 表示成功；401 表示未登录或登录过期
- 鉴权：请求头 `Authorization: Bearer <token>`（token 由登录接口 `/api/auth/wx-login` 返回）
- 时间字段 `createTime`：请返回已格式化好、可直接展示的字符串，如 `刚刚`、`10:25`、`11-03 21:40`

> [!IMPORTANT]
> 1. **查看卡片**和**评论列表**必须允许**未登录**访问（好友第一次从分享打开时还没登录），**不要返回 401**。有 token 时再计算 `isOwner` / `myReactions`。
> 2. 评论属于用户生成内容，后端必须调用微信内容安全接口 `msgSecCheck`（v2）做检测，否则小程序审核不会通过。卡片的 `note` 字段同样要检测。

---

## 1. 创建卡片
`POST /api/cards`　**需登录**

请求体：
```json
{
  "clientId": "card_1730688000000",
  "dateStr": "2026.11.04",
  "weekDay": "星期三",
  "moodId": "chill",
  "moodName": "放空摸鱼",
  "moodEmoji": "☁️",
  "moodColor": "#13C2C2",
  "moodGradient": "linear-gradient(...)",
  "weatherId": "sunny",
  "weatherName": "晴空万里",
  "weatherEmoji": "☀️",
  "weatherTemp": "25℃",
  "quote": "治愈金句",
  "note": "用户碎碎念（≤150 字）",
  "nickName": "解压旅人",
  "avatarUrl": "https://..."
}
```
- `clientId`：客户端本地 id，**用于幂等**：同一用户重复提交同一个 `clientId` 时，返回已有卡片的 id
- `nickName` / `avatarUrl`：作者的展示信息；如果服务端已保存用户资料，以服务端为准

返回 `data`：
```json
{ "id": "c_8f3a2b" }
```
> 卡片 id 会出现在分享链接里，建议用不可猜测的随机串，不要用自增 id。

## 2. 获取卡片详情
`GET /api/cards/:id`　**登录可选**

返回 `data`：
```json
{
  "id": "c_8f3a2b",
  "dateStr": "2026.11.04",
  "weekDay": "星期三",
  "moodId": "chill",
  "moodName": "放空摸鱼",
  "moodEmoji": "☁️",
  "moodColor": "#13C2C2",
  "moodGradient": "linear-gradient(...)",
  "weatherName": "晴空万里",
  "weatherEmoji": "☀️",
  "weatherTemp": "25℃",
  "quote": "...",
  "note": "...",
  "creator": { "id": "u_1", "nickName": "解压旅人", "avatarUrl": "https://..." },
  "isOwner": false,
  "reactions": { "hug": 8, "tea": 5, "pet": 6, "cheer": 4 },
  "myReactions": ["hug"],
  "commentCount": 12
}
```
卡片不存在时返回非 0 的 `code`（如 404），小程序会显示“卡片不存在”。

## 3. 评论列表
`GET /api/cards/:id/comments?page=1&pageSize=20`　**登录可选**，按时间倒序

返回 `data`：
```json
{
  "list": [
    { "id": "m_1", "userName": "温热白巧", "userAvatar": "https://...", "content": "抱抱你🫂", "createTime": "10:25" }
  ],
  "total": 12,
  "hasMore": false
}
```

## 4. 发表评论
`POST /api/cards/:id/comments`　**需登录**

请求体：
```json
{ "content": "抱抱你🫂", "nickName": "温热白巧", "avatarUrl": "https://..." }
```
- `content`：1~200 字，需过 `msgSecCheck`；不通过时返回 `{ "code": 4001, "msg": "内容含违规信息，请修改后再试" }`（小程序会直接提示 `msg`）
- 建议限频，例如同一用户 5 秒内最多发 1 条

返回 `data`：新评论对象（字段同评论列表中的 list 项）。

## 5. 轻互动（抱抱 / 甜茶 / 摸头 / 干杯）
`POST /api/cards/:id/reactions`　**需登录**

请求体：`{ "type": "hug" }`，`type` 取值为 `hug | tea | pet | cheer`。同一用户再次提交同一 type 表示**取消**。

返回 `data`：
```json
{
  "reactions": { "hug": 9, "tea": 5, "pet": 6, "cheer": 4 },
  "myReactions": ["hug"]
}
```

