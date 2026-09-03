# 进度日志

## v2 历史（已归档）
- v1/v2 完成：回合制战斗、对话系统、节点大地图、剧情、龙与魔法生物（_smoke.js 全战役驱动留存）

## 2026-08-31 会话 · v3 开放世界
- [x] Phase 0 素材：Kenney CC0 包下载入 assets/（town/dun/rpg_sheet/ui），findings.md 索引
- [x] Phase 1 地图引擎：tilemap 120×90、WASD自由行走、碰撞、相机lerp、区域横幅、小地图、飘雪
  - 验证：SMOKE1（walk dy=138.2 / water blocked / road passable / region banners）PASS
- [x] Phase 2 世界内容：
  - 五地标：临冬城(城墙+4房+井+篝火)、黑城堡(帐篷)、君临(城墙+主堡+民房)、龙石岛(海中开岛+栈桥)、巨人巢穴(立石阵)
  - 采集点10处(药草/浆果/矿石)→背包HUD；路牌可读；篝火休整回满
  - POI 发现横幅；E键互动气泡
  - 修复：树精灵透明底露黑→植被下垫地面；狼林改雪原 biome（x<46,y<52 雪带+巢穴雪地空地）
  - 验证：SMOKE1 PASS（pois/pier/gather 全 OK）+ 四视角截图目检通过
- [x] Phase 3 NPC与任务：城镇NPC游荡+?标记+E对话；支线3个(送药草/浆果/矿石)+讨伐任务；任务日志面板
  - 验证：SMOKE2 全 OK（q_herb/q_berry/q_ore/q_kill/questlog）+ 3x 放大目检 NPC 名牌与气泡
- [x] Phase 4 野怪生态+遭遇战+驯服：
  - MOB_SPAWNS 18锚点分布雪原/狼林/平原/海岸；游荡AI+警戒追击+红!标记；接触→遭遇战(色调按生态)
  - 战斗新增【驯服】指令(键5)：可驯=spider/wolf/giant，hp<30%门槛，成功率随残血提升；失败激怒
  - 胜利结算：击杀经验累计+驯服经验补发、掉落鲜肉；newCampaign 初始化 G.beasts
  - 修复真实bug：begin() 原在 loadAssets 前 newCampaign→buildMobs 读 null MAP 崩溃 → 先 await loadAssets
  - 验证：SMOKE3 PASS（encounter/tame/drop/exp/主线墙战）+ 截图：狼追击红!目检通过、魔物精灵单渲核对(wolf/spider/wight/giant/walker)
- [x] Phase 5 养成系统：
  - 人物成长：expNeed/gainExp（升级加 g.hp/g.atk/g.sp，飘带提示）；第二技能 req:3 锁定（openSubMenu 显示 Lv.3 解锁）
  - 魔物伙伴：beastStats 按 lv/好感缩放；deployBeast 第5队友位（beastUnit isBeast，自动攻击指令 beastAutoAct）；recallBeast 归队
  - 跟随：updateFollower 轨迹尾随 + drawFollow 精灵跟随主角
  - 喂食：feedBeast 鲜肉(好感+2)/浆果(好感+1)+少量经验；好感提升攻击
  - 图鉴：G.seen 记录（startWave 遇敌即记）；renderBeastPanel 面板（C键开关）上阵/喂食按钮+图鉴列表
  - 胜利结算改走 gainExp/beastGainExp（上阵魔物同步获经验升级）
  - 验证：SMOKE4 PASS（wallOK/levelup/seen/deploy/feed/beast battle/beastexp 全 OK）
  - 截图：shot_panel.png 面板目检通过；shot_follow.png 误触遭遇战但确认第5格队友位显示冰原狼

## 2026-09-01 会话② · A1 主文件集成 + 回归（完成）
- [x] 烘焙管线离线化：_tmp_bake.html 输出 base64 → _tmp_bakewrite.js 写 assets/lpc/baked/*.png（36 张 tinted walk/idle）+ LPC_BBOX 表入主文件
- [x] 主文件集成：LPC loader(loadLPC/drawLpc/drawFace 改裁切) + MF loader(mfCanvas/mfExplore) + unitSprite(lpc>mf>自绘) + FOES/NPC 挂 lpc/mf 键 + 标题页 .t-cred 署名
- [x] 修复战斗朝向反向：误删 fr 逻辑曾使敌我背对 → 恢复 v3 规则 `flip=u.side==='player'`（v3 备份佐证），makeUnit/unitSprite 去 fr
- [x] 修复头像沉底：裁切改 (16,140,22,24)，faces 条目检 4 肖像全清晰
- [x] drawFollow 删不可达 LPC 分支；follow 截图改安全平原 (58,60)+巨人：LPC 琼恩右行+MF 独眼巨人尾随，目检通过
- [x] 回归：语法 OK；SMOKE1-4 ALL PASS；截图目检 title(署名)/explore-zoom(LPC 四人+?标记)/wall/walker/nk/giant/faces/follow 全过
- [x] 工具沉淀：_tmp_crop.html 裁切放大页（hash=src,x,y,w,h,sc，需绝对 file:/// URL）；_shot.js 扩 battle()/faces/zoom 模式

## 测试结果记录
| 测试 | 结果 |
|------|------|
| SMOKE1（行走/碰撞/区域/POI/栈桥/采集） | PASS |
| SMOKE2（NPC对话/支线/任务日志） | PASS |
| SMOKE3（遭遇/驯服/掉落/经验/主线墙战） | PASS |
| SMOKE4（成长/上阵/跟随/喂食/图鉴/魔物参战） | PASS |
| 截图 title/explore/explore2/3/4/wolf | 目检通过 |
| 截图 panel/follow | panel目检通过；follow误触遭遇（第5队友位已确认） |
| v4 A1 回归：SMOKE1-4 | ALL PASS（朝向/头像修复后） |
| v4 A1 截图：title/explore-zoom/wall/walker/nk/giant/faces/follow | 目检全过 |

## 截图记录（Temp/bfshot/）
- shot_title.png 标题；shot_explore.png 临冬城；shot_explore2.png 狼林雪原；shot_explore3.png 君临；shot_explore4.png 龙石岛+栈桥；shot_wolf.png 平原狼追击红!
- shot_panel.png 魔物面板(上阵/喂食/图鉴)；shot_follow.png 遭遇战5格队伍栏

## 2026-09-01 会话 · v4 启动 + A1 精灵管线
- [x] 用户否定自绘建模 → 选定「LPC人物 + medieval-fantasy 中世纪怪」；task_plan/findings 已改写 A1
- [x] _lpc/ 稀疏克隆（spritesheets + sources/state/meta.ts + sheet_definitions 768 JSON）
- [x] 官方层序 zPos 整理入 findings.md；assets/lpc 68 层文件（_tmp_copylpc.js）；assets/mf/monsters 9 怪
- [x] compose_test.html：tint(luminance-ramp)+compose(z 升序)+idle 回退 walk col0
- [x] 11 recipe 逐角色 3× 截图目检全过（琼恩/艾莉亚/布蕾妮/丹妮/学士/铁匠/卫兵/守夜人/村妇/尸鬼/异鬼）；布蕾妮板甲提亮定稿
- [x] MF 怪物格目检过（dragon/king skeleton/cyclop/skeleton/goblin/bat/snake/slim/leonard）
- Errors：file:// canvas 污染→--allow-file-access-from-files；tunic/apron 无 idle→回退；琼恩披风过暗→提亮
- 主文件集成与回归见下方「会话②」；**A1 全部完成** → 下一步 A2 多地图引擎

## 2026-09-01 会话③ · A2 多地图引擎（完成）
- [x] 引擎重构：genMap(id) 调度 + MW/MH 改 let + terrainNorth（原 genMap 地形体原样搬迁）；loadAssets 只 buildTiles
- [x] MAPS 注册表 5 图：north(全 v3 内容不变)+winterfell/wolfswood/kingslanding/dragonstone 占位地形/world/npcs/mobs/towns
- [x] loadMap(id,sx,sy)：#loadOv 加载画面(地图名+副题+流光条)→genMap/buildNpcs/buildMobs→出生点/相机/跟随归位→reveal→区域横幅
- [x] 门系统：prop kind 'gate' 非实体 + drawDynProp 石拱门(锁=灰梁/开=金梁+辉光+名称)；tryInteract 锁定时 ribbon 提示 lockTxt，解锁 loadMap
- [x] north 四门：临冬城(60,30无锁)/狼林(10,38 wf_open)/君临(95,72 kl_open)/船坞渡海(112,52 ds_open)；各占位图设返回门
- [x] 战争迷雾：G.fog[mapId] 持久 Uint8Array + FOGCV 增量合成(仅新点亮 tile 自 MINICV 拷贝)；updateExplore/loadMap reveal 半径3；drawMinimap 画 FOGCV(未探索=暗)
- [x] 修复：龙石岛门原(116,53)被 NPC 克雷森(116,54)拦截（tryInteract 先 NPC 后 prop）→ 门移至船坞(112,52)
- [x] 占位图 biome 修正：winterfell/wolfswood 全雪+雪松（原混入草地/绿松）
- [x] 雪路砖：t43  baked 绿草底露绿 → 程序化 makeSnowPathTile×3 → TILE.pathS；pickTile case3 由 SNOWAT(genMap←MAPS.snowAt) 分发；north 雪带路/WF/WW 路全变雪石砖
- [x] 验证：SMOKE1-4 PASS；a2 无头 12 项全 OK（lockKL/enterKL/backNorth/WF/WFback/lockWW/WW/WWback/DS/DSback/fog246tiles）；截图 gt(门外观)/swf/sww/skl/sds + crop_wf(雪路/门/名牌) 目检过
- [x] _shot.js 扩 a2 + swf/sww/skl/sds + gt 模式；a2 budget 45000；修 harness 模板串 '\n' 转义；新增 _crop.js 裁切工具
- Errors：harness '\n' 被模板串吃成换行致全模式语法错 → '\\n'；a2 虚拟时间超 16s budget → 45000；DS 门被 NPC 拦截 → 移位；路砖绿底 → 程序化雪路砖（file:// 下 getImageData 会污染，禁像素改色，走程序化绘制）

## 2026-09-01 会话④ · A3 五张地图内容（完成）
- [x] 素材普查：_tmp_tiles.html 生成 town+dun 全量 contact sheet 截图；定案可用道具 t90暗门/t92木桶/t93钱袋/t104铁砧/t105面包/t106罐/t112拱门/d18·d28旗帜/d64·d65墓碑/d72木箱/d74大锅
- [x] 引擎小扩展：makeRockTile 火山黑岩×3 → TILE.rockS + ROCKAT（genMap 读 M.rockAt）+ pickTile case2 分发 + prerenderMini COL[2] 覆写（龙石岛小地图黑岩色）
- [x] drawDynProp 新 kind：weirwood（白干红叶心树+刻 face）/volcano（黑锥+熔光脉冲）；tryInteract 加两条风味 ribbon；wolfswood 飘雾 overlay（3 椭圆雾带漂移）
- [x] winterfell：双层 wallRing（外郭+内堡）+主堡+旗帜+神木林心树+墓窖(暗门+墓碑)+铁匠铺(铁砧+桶)+粮仓市集+篝火+3采集+3POI+5NPC(halle/chayle/porther/beth/gared)
- [x] wolfswood：狼穴空地+支路+狼穴(暗门+墓碑+sign)+猎人欧文+5采集+狼穴POI+2狼 mob+towns 扩
- [x] kingslanding：外墙+红堡内环(主堡+d18/d28)+街市摊(面包/罐/桶/钱袋)+跳蚤窝(大锅)+码头(木箱/桶)+4NPC(gold/mer/tova/septon)+4POI
- [x] dragonstone：火山口+龙穴(拱门+旗)+栈桥(木箱/桶)+龙晶采集×3+2NPC(mard/salla)+3POI
- [x] NPC_LPC +13 id 映射既有 recipe（新图 NPC 全 LPC 分层渲染）
- [x] _shot.js 新增 swf2/sww2/skl2/sds2 地标视角模式（loadMap 后 sleep 2600 等横幅淡出）
- [x] 验证：语法 OK；SMOKE1-4 PASS；a2 12/12 OK（门往返无回归）；swf/sww/skl/sds+swf2/sww2/skl2/sds2 截图目检过；crop_wfkeep（主堡+心树）/crop_wfcrypt（墓窖+铁匠+LPC NPC）目检过

## 下一步
- B4 UI 美化（task #5，Kenney 套件）→ C1-C3
- Phase 7（原 v3 收尾项）已并入 v4 C2/C3，不再单独执行

## 2026-09-01 会话⑦ · B1 五生态战斗背景（完成）
- [x] 架构：canvas#cv 置于 #world DOM 场景层之上、#tone/.lightrays/.vignette 之下；initBattle 记 `G.bTheme=opts.tone||'wall'`，战斗中不透明程序化绘制覆盖下层 DOM 冬景
- [x] `drawBattleBg(th,t)` 五主题（W1280/H720/地平线GY430，bRnd 确定性伪随机）：
  - wall(默认)：夜空+50星+2条极光带('lighter'+sin波动)+月晕+远山+长城冰墙体(渐变+雪顶+双塔)+雪地+40冰晶闪
  - forest：绿渐变+7光斑+3层松树视差(摇摆)+苔地+3团漂移雾
  - city：黄昏渐变+落日+垛口城墙+双塔+主堡穹顶+2面飘旗+6火把(辉光+火苗抖动)+尘土
  - sea：风暴天+4流云+火山锥(火山口熔光脉冲)+8条sin浪线+左断崖+黑岩地+5熔裂纹
  - night：近黑夜空+70闪星+130蓝眼亡者潮带+蓝雾+临冬城城墙(垛口+3塔)+12火把线+暗雪
- [x] TONES 加 sea 色调；startEncounter 按图重映射（dragonstone→sea/wolfswood→forest/kingslanding→city/其余wall）
- [x] 修真实游玩 bug：runDlg 弹对白时 scene='story' 致战斗视图条件失效→背景+单位全空白；frame() 加 `bv` 条件含 'story'
- [x] _shot.js：battle() 助手（WALL_WAVES/GIANT_WAVES/DESERTER_WAVES/FINAL_WAVES/自定义 sea 波）+ bg_wall/forest/city/sea/night 截图模式 + dbg 异常捕获模式
- [x] 验证：5 生态截图目检全过；回归 SMOKE1-4 PASS + a2 12/12 + a4 8/8 + a5 14/14
- Errors：首版截图仍是旧 DOM 冬景（canvas 未绘制）→ dbg 证明函数无异常 → 根因 scene='story'（见 task_plan Errors 表）

## 2026-09-01 会话⑤ · A4 招募系统+数值重调（完成）
- [x] 每人第3技能 req:6：jon 凛冬已至(冰全体)/dany 血火同源(火全体)/arya 凡人皆有一死(高暴击)/bri 塔斯的誓约；openSubMenu 既有锁定显示无需改
- [x] FOE_TIERS 8档章节分档（序章[.71,.79,1.2]→终局[1.45,1.3,.9]）makeUnit 敌方侧应用；尸鬼序章=181/38 达标
- [x] 经验曲线拉长：expNeed=300+(lv-1)*170（升级≈4-6场战）
- [x] newCampaign 仅琼恩 + G.chapter=0；RECRUIT_LV={arya:2,bri:4,dany:7}
- [x] recruit(key,lv)：旗标免疫+补等级入队+showRecruitCard 演出（#recruitOv 金框卡+加入横幅+LPC立绘+SFX.win，2600ms/点击关闭）+setChapter(n) 供 A5
- [x] SMOKE4 适配：墙战前 recruit arya/bri；depOK 改动态 nH+1
- [x] _shot.js a4 断言模式（8项）+ a4c 招募卡截图模式（setTimeout shim 拦自动关）
- [x] 验证：语法 OK；SMOKE1-4 PASS；a4 八项全 OK；a4c 卡截图目检过（金框/横幅/艾莉亚立绘/名牌）
- Errors：招募卡虚拟时间下自动关先于截图 → a4c 用 setTimeout(ms===2600) 拦截

## 2026-09-01 会话⑥ · A5 章节化剧本与目标系统（完成）
- [x] A5 引擎（主文件 3342-3507）：CH_TITLES 8章；startChapter(n)→chapterCard(showBanner)→CH_OPEN[n]；setObjective/renderObj（#objHud 左上目标HUD+跨图提示「前往·XX」）；updateObjective 350ms 节流（check()或近距判定 r*TS）完成→ribbon+next 链
- [x] STORY v4 七章脚本全接入：ch0 教学+篝火链 / ch1 墓窖救艾莉亚(recruit) / ch2 黑城堡守墙两波+异鬼现身 / ch3 巨人抉择+护送遇布蕾妮(recruit) / ch4 逃兵战+城门盘查→kl_open / ch5 瑟曦王座三分支谈判→ds_open / ch6 龙石岛龙临演出+丹妮入队(recruit) / ch7 长夜三波决战→ending
- [x] 招募接入剧情：NPC_HOOKS oldbear(ch2 墙战)/cap(ch4 逃兵)；loadMap 抵达钩子 ch6；setChapter 驱动 FOE_TIERS 敌档
- [x] a5 无头全流程 14 断言：ch0/obj_fire/ch1/crypt/ch2/wall/giant/escort/cap/throne/ch6/ch7/ending
- [x] 修 5 个 harness/回归 bug（详 Errors 表）：drive DLG 等待环 / 无头清 MOBS / wall 泵至旗标 / stand() NPC 现位置 / loadMap 不 await+waitf
- [x] a2 回归修：A5 章节对白 2.6s 后弹卡 tryInteract → a2 setInterval 50ms 自动 skipStory + nearGate 等 DLG 清
- [x] 验证：SMOKE1-4 PASS×2；a4 8/8；a2 12/12；a5 14/14 连续两遍（exit 0）

## 测试结果记录（追加）
| 测试 | 结果 |
|------|------|
| A5 后 SMOKE1-4 | ALL PASS ×2 |
| a2 门/雾 12 项（修后） | ALL OK（fog 281 tiles） |
| a4 八项 | ALL OK |
| a5 全章节流程 14 项 | ALL OK ×2 |
| B1 后 SMOKE1-4 + a2 + a4 + a5 | ALL PASS / 12/12 / 8/8 / 14/14 |
| B2/B3 后回归：SMOKE1-4 / a2 / a4 | ALL PASS / 12/12 / 8/8 |
| a5（pump 演出补帧修复后） | 14/14 OK |

## 截图记录（追加）
- shot_a5.png 无头全流程终页 14/14 OK
- shot_bg_wall/forest/city/sea/night.png B1 五生态战斗背景，目检全过

## 2026-09-01 会话⑧ · B2 巨龙威慑 + B3 军队演出（完成）
- [x] B2 龙临演出：dragonDescent()/drawDescent()（letterbox 黑边+云+远啸+剪影渐大+落地震屏+火焰粒子；__holdCine 可定格）；第6章 ds_event 接入
- [x] B2 大地图掠袭：startRaid()/drawRaid()（龙影掠顶+阴影+风压粒子+龙啸），剧情/随机触发
- [x] B2 Dracarys：战斗中卓耿横穿喷火（大图+火粒子+震屏）
- [x] B3 列阵全景：armyPanorama()/drawArmy()（7s 横移镜头扫数百程序化士兵+史塔克/坦格利安旗+火把巡移），第7章 ch7_open 后接入
- [x] B3 终局冲锋层：drawBattleBg night 分支 `G.battleFinal&&G.wave===2` → 背光带+生者70(左→右,长枪/火把点)+亡者90(右→左,蓝眼)+交线烟尘
- [x] 验证：b2_desc（letterbox+落地喷火星、HUD 隐藏、#flash 手动熄）/b2_raid/b3_army（横移中段）截图目检过；b3_charge 经 overlay-freeze 裁切目检（两军+夜王齐现）
- [x] 修 a5 回归：ch7/ending FAIL → 根因 armyPanorama Promise 靠 frame() 内 drawArmy 结算，无头 rAF 饥饿且跳完对白后 pump 仅 canvas 变化不触发 BeginFrame → a5 pump 加演出强制帧分支（ARMY/DESC/RAID 活跃时 frame()+sleep(120)）
- [x] 回归：语法 OK；SMOKE1-4 PASS；a2 12/12；a4 8/8；a5 复跑 14/14（pump 演出补帧后 ch7/ending OK）
- Errors：bash 路径反斜杠→单引号；dbg 右溢出→extra 前置；rAF 饥饿→强制 frame()；合成器丢帧→overlay-freeze；a5 ch7 演出饿死→pump 演出分支（均见 task_plan Errors 表）

## 截图记录（会话⑧）
- shot_b2_desc.png 龙临落地定格；shot_b2_raid.png 掠袭；shot_b3_army.png 列阵横移；shot_b3_charge.png+crop_charge_ov.png 终局两军冲锋

## 2026-09-01 会话⑨ · B4 UI全面美化（Kenney套件）（完成）
- [x] 9-slice 面板：dlg/cmdWrap/questLog/beastPanel/worldHud/objHud 六面板 panel_blue（border-image 10 fill）+投影
- [x] 按钮 Kenney 化：标题开始/结算 buttonLong_blue；对话选择 buttonLong_brown；命令窗 +/− buttonSquare；hover brightness / pressed 换 _pressed 图
- [x] 血条：barBack + barGreen/barBlue 三层（左右 cap + repeat-x 中段）用于队伍卡 HP/SP 与 worldHud HP
- [x] 标题页重做：tDra 龙剪影（整数×18 + source-in #182742 改色 + 冷光 shadowBlur26）+ 双金框 ::before/::after + roster 四人 LPC 头像（panelInset_beige 框）+ buttonLong 开始按钮
- [x] 队伍卡重做：LPC 头像 + HP/SP 条 + BP 点 + Lv 徽章；updateTiles 同步 Lv
- [x] 头像统一入口 paintFace（LPC face 优先、FOES/unitSprite 魔物兜底）；dlgFace/roster/队伍卡通用
- [x] 范围决策：标题「继续征程」按钮随 C2 存档系统一起做（B4 只做开始按钮）
- [x] 验证：title 目检（龙剪影+4头像+双金框+按钮）；b4_ui crop_party/crop_cmd 目检；crop_dlg3 对话面板+头像框+金名；crop_hud worldHud 目检
- [x] 回归：SMOKE1-4 PASS；a2 12/12；a4 8/8；a5 14/14
- Errors（均见 task_plan 表）：DRA.a.img TypeError；title budget 12000；harness battle() 绕过 partyBar；bash node -e 反斜杠；dlg 截图序章误报→cleanStart；_crop2 相对路径全黑

## 测试结果记录（追加·B4）
| 测试 | 结果 |
|------|------|
| B4 后 SMOKE1-4 | ALL PASS |
| a2 门/雾 12 项 | 12/12 OK |
| a4 八项 | 8/8 OK |
| a5 全章节 14 项 | 14/14 OK |

## 截图记录（会话⑨）
- shot_title.png 新标题（龙剪影+4头像+金框+buttonLong）；crop_party/crop_cmd 队伍卡+命令窗；crop_dlg3 对话框；crop_hud worldHud

## 下一步
- ✅ B4 完成 → C1 支线×12 / C2 存档系统（含标题继续征程按钮）/ C3 测试收尾（task #6）

## 2026-09-01 会话⑩ · C1 支线任务×16（完成）
- [x] 引擎扩展：find 类型(target={map,tag})+prop kind 'quest'+ambush 自定义波；q.turnin 跨图交付；turnChoices 双奖励档；q.autoDone 战毕即结；任务日志 主线/支线 页签
- [x] 12 新支线落地（q_herbW/q_oreW/q_candle/q_escort/q_ferry/q_letter/q_soup/q_secret/q_cat/q_dglass/q_table/q_hunter）+既有4 → 16
- [x] _shot.js c1 模式：逐条 传送→接取→目标→交付，断言 st==='done'，19 断言
- [x] 修 findProp NPC 拦截：salla 游荡挡 q_table 考察 → 传送前 90px 内 NPC 移 -160
- [x] 验证：c1 19/19 PASS；回归 a2 12/12

## 2026-09-01 会话⑪ · C2 存档系统（完成）
- [x] 标题 #titleContinue「继续征程」按钮（hasSave 显隐、stopPropagation、read 档）
- [x] saveGame/loadGame/hasSave/refreshContinue + 5s 间隔自动存档；SAVE_KEY='bhl_save_v1'
- [x] 序列化：雾 base64 分块；人类队友 {key,lv,exp,hp,maxhp,sp,maxsp,atk}；上阵魔物经 G.deploy 重建；flags/bag/quests/stats/seen/beasts/locs/dragonDone/_chK/坐标
- [x] 读档目标重建：CH_OPEN 拆出同步 OBJSET[0..7]（fn3 按 giant_done 分支）；loadGame 调 OBJSET[chapter]+快进已达成阶段（ofw<8）
- [x] evGiant 补 G.flags.giant_done=1（ch3 读档分支依据）
- [x] _shot.js c2 模式 11 断言：prologue/ch1/saved/contBtn/loaded/rest_ch/quest/party(含狼)/pos/obj(墓窖+check fn)/fog
- [x] 修三轮：游戏侧编辑补落盘；harness 补 kills+=2 推序章 stage1；saved 键名 bhl_save→bhl_save_v1
- [x] 验证：c2 11/11 PASS；c1 19/19；a5 复跑中（OBJSET 重构后回归）

## 测试结果记录（追加·C1/C2）
| 测试 | 结果 |
|------|------|
| c1 支线 19 断言 | 19/19 PASS |
| c2 存档/读档 11 断言 | 11/11 PASS |
| a2 门/雾（C1 后） | 12/12 OK |

## 截图记录（会话⑩⑪）
- shot_c1.png 支线报告 19/19；shot_c2.png 存档报告 11/11

## 2026-09-01 会话⑫ · C3 测试收尾（完成，v4 全部完工）
- [x] c2 收尾：saved 键名修正 bhl_save→bhl_save_v1 → c2 11/11 PASS；OBJSET 重构后 a5 复跑 13/13 OK
- [x] _shot.js：shoot() 增 dom 输出模式（--dump-dom 解析 pre 报告）；新 tcont 模式（newCampaign→enterExplore→saveGame→resetGame，标题页含「继续征程」）
- [x] _smoke.js 重写为总控：SMOKE1-4 页内断言链（?smoke + dump-dom）+ camp 子命令（a5 dom 全战役 13 断言单跑）；旧 v3 VM 驱动作废
- [x] 通关率：模拟 4/4 WIN（13/13：序章→招募→切图→战斗→巨人/护送→瑟曦→龙石岛→第7章→终局），≥60% 达标
- [x] 修 camp 判定：a5 实为 13 断言（阈值误写 14 致全 WIN 判 LOSE）
- [x] 清理：删 _tmp_bake.html/_tmp_bake_err.txt/_tmp_bake_out.txt/_tmp_bakewrite.js/_tmp_copylpc.js/_tmp_crop.html/_tmp_tiles.html/_tmp_zpos.js/_shotdbg.js/_sprdbg.js/_smoke_run.js/_crop.js/compose_test.html/_game.js/Temp _crop2.js；保留 _dl/_lpc/_v4parts（素材源）
- [x] 留档：截图/ 目录 22 张（title/tcont/a5/c1/c2/四地标 gt/五生态战斗背景/龙临/列阵/冲锋/队伍卡/对话/雪路门/LPC探索）
- [x] 验证：SMOKE1-4 PASS；tcont 截图目检（开始+继续双按钮）

## 测试结果记录（追加·C3 终验）
| 测试 | 结果 |
|------|------|
| SMOKE1-4 断言链（?smoke） | ALL PASS |
| a5 全战役（OBJSET 重构后复跑） | 13/13 OK |
| 模拟通关 ×4（camp） | 4/4 WIN（≥60% 达标） |
| c1 支线 / c2 存档 | 19/19、11/11 PASS |
| tcont 标题继续按钮 | 目检通过 |

## v4 验收对照
1. 仅琼恩开局+剧情入队 ✅（a4/a5） 2. 5图/加载/迷雾/门锁 ✅（a2） 3. 7章连贯+16支线 ✅（a5/c1）
4. 角色魔物可辨+龙威慑+军队宏壮 ✅（A1/B2/B3） 5. 生态战斗背景+Kenney UI ✅（B1/B4） 6. 存档+通关率 ✅（c2/camp 4/4）

## 2026-09-01 会话⑬ · 文档交付（完成）
- [x] 游戏说明文档.md：概述/按键/界面/探索(门禁表)/战斗(五指令+增幅+BREAK+敌方特性)/角色(技能表+成长)/敌人图鉴/驯服养成/道具/支线系统/存档/贴士；全部数值取自源码（794-1063 / 1292-1710 / 3095-3560 / 3917-4070）
- [x] 全流程攻略.md：序章→第7章逐章（目标+战斗波次表+分支对照：巨人潜行/正面、瑟曦三分支、决战迎战/再准备）、16 支线总表（委托人坐标/要求/奖励）、招募练级规划表、驯服三兽攻略、终局前自查清单
- [x] 数据校验点：tameChance=.55+.35×(1-hp%)-.15；FOE_TIERS 8 档（序章.71→终局1.45）；夜王 1950/88/盾6/防8 弱瓦钢+龙晶；卓耿助战=终局第3波第2轮；龙晶匕首 320 伤；BREAK=伤×1.4 无视防御

## 2026-09-02 会话⑭ · 真3D 重写 v5（D0–D2 完成）
用户反馈 2D 像素建模太丑 → 方向确认为 Three.js 真3D 重写渲染层，逻辑全保留；计划 D0–D5
- [x] D0 spike：three r128 + GLTFLoader/SkeletonUtils 本地引入；_shot.js 加 --use-angle=swiftshader --enable-unsafe-swiftshader，headless WebGL 截图通路打通
- [x] D1 资产：CC0 GLB（KayKit/Quaternius/Kenney）下载选角，_bake3d.js bake 成 base64 → assets3d/models_{chars,mobs,props}.js；models_debug.html 陈列目检；bake 时矩阵烘焙进几何（applyMatrix4）→ 实例朝向=GLB 原始朝向
- [x] D2 探索：顶点色地面单 draw call / ≤15 组 InstancedMesh 建筑树道具 / 角色 SkeletonUtils.clone+walk / 45° 跟随相机 / 2D 覆盖层改 project3D 投影；五图探索截图目检通过，SMOKE/a2 绿
- [x] 架构：#cv3(WebGL) 垫底 + #cv(2D) 透明叠层；RENDER_MODE='3d'|'2d' 兜底；唯一耦合模块 assets3d/adapter3d.js（window.A3D）

## 2026-09-02 会话⑮ · D3 战斗 3D（进行中，17:00 收工）
- [x] frame() 战斗接线：bv 分支调 A3D.renderBattle(dt,t,battleView())；单位循环 pos=A3D.projectUnit(u)，血条/护盾/弱点箭头 2D 层锚点对齐（截图目检 ✅ 蜘蛛护盾菱形、弱点标记落位正确）
- [x] 正交战斗相机数学：横 70px/unit、纵深 55px/unit、相机 z 移 -70/55 → screen_x=u.x、地面 z=0→屏 y=430；~25 处 FX 与覆盖层零改动
- [x] 修战斗残留探索场景（renderExplore/renderBattle 切 exGroup.visible）；雾距重调 42-46/78-95（相机距 ~40，旧值把单位雾化）
- [x] p_wall 朝向探针 probe3：原始宽度沿 Z；战斗排需 rot=+π/2（0/π=细棍、-π/2 背面剔除不可见）
- [x] 单位 blob 圆影（CircleGeometry，opacity .22）；bEnsure 克隆+emissive 白闪/dissolve 渐隐/lunge 回弹 对齐 drawSprite 语义
- [!] **明日第一件事**：墙排渲出位置偏高、与天空带重叠（红 tint 试拍暴露位置；灰/深 tint 与天带混淆看似「缺失」）。疑 baked p_wall 几何原点不在底部。步骤：① 探针打印 p_wall baked Box3 min/max → ② 战斗 instTo 补 y/z 偏移使墙底落 z=-6 地面 → ③ tint 定 0x46566a（塔 0x3a4a5e）→ ④ 复查单位朝向（玩家应背影，若露脸翻 rotation.y）→ ⑤ 重拍 wall/walker/nk/giant/bg_city/bg_sea/b4_ui 目检 → ⑥ 回归 c1 dom / c2 dom / _smoke.js 全绿 → 关 D3
- [ ] D4 演出+头像、D5 回归+清理 待做

## 2026-09-03 会话⑯ · D3 收尾 + 战斗 UI 修复（完成，D3 关闭）
- [x] probe3d 结论：全部资产 baked 原点 min.y≈0（归一即底部原点）；墙排偏高真因=正交投影把 z=-6 排推高 → 墙排移 z≈-2（sy2.9 tint 0x46566a）、塔 z=-2.5
- [x] 尺寸层级：bEnsure 加全局倍率 BS=2.4（人形≈124px，贴近 2D 比例且露出队伍栏上方可点）；玩家 1.2；MOB3D：wolf .6 / spider .65(原 .85 过大收小) / giant 2.2 / wight 1.1 / walker 1.45 / nk 1.6 / bandit 1.15
- [x] 用户反馈①：战斗中隐藏 #objHud（renderObj 场景门控）
- [x] 用户反馈②：战斗指令鼠标流——tryConfirmEnemy 供 Enter/点击共用；target 相位默认 hover + ←→/Tab 切换 + Enter/空格确认 + 右键取消；3D hover 改 A3D.projectUnit 投影框（2D 精灵 sw/sh 与模型不符）；选敌时 #partyBar pointer-events:none（全宽底栏吞点击）
- [x] 新 clix harness 13 断言（面板隐藏/指令行可点/选敌命中/Enter 确认/partyBar 透传）13/13 PASS
- [x] c2 harness 修 flake：注入前 waitf 空等篝火目标 800 泵≈48s 虚拟时间（预算 60s）→ 先等击杀目标文本出现再注入；c2 11/11 ×2 稳定
- [x] 重拍 wall/walker/nk/giant/bg_city/bg_sea/b4_ui 目检：墙排高置不压单位、玩家背影/敌正面、层级合理
- [x] 回归全绿：c1 19/19、c2 11/11×2、clix 13/13、SMOKE1-4 PASS
- [x] D3 关闭。下一步：D4 演出+头像 3D 化；新需求（几十 boss/几百怪/装备/UI/比例）走 planning-with-files 规划；D5 清理旧 2D 资源

| 测试 | 结果 |
|------|------|
| clix 点击流 13 断言 | 13/13 PASS |
| c1 支线 / c2 存档 | 19/19、11/11 ×2 |
| SMOKE1-4 | PASS |

## 2026-09-03 会话⑰ · E0 资产扩充收口 + 改名上 GitHub（完成）
- [x] 新怪 18 种全链路：poly.pizza 同源 API（无 key：/api/search/<kw>?Limit&Type=models；previewUrl uuid==GLB uuid → static.poly.pizza/<uuid>.glb）→ _dl3d.js 下载 24.48MB 全 OK → _bake3d.js 裁剪烘焙 → models_mobs.js 2.6MB→14.4MB
- [x] 名单微调（bear/mammoth/troll 无 CC0 动画源）：orcEnemy 顶巨魔 / demon 顶火元素 / direwolf=Husky / wraith=Ghost；新增人形怪 knightBlack/rogue（KayKit Adventurers CC0，GitHub branch main）
- [x] probe3d 验证全绿：37 key 无 PARSE_FAIL，baked min.y 全=0；尺寸表入 findings；教训：bash 拼中文路径 file:// URL 失败（ERR_FILE_NOT_FOUND 看似空输出）→ 改 node execFileSync（_probe_run.js）
- [x] 文件改名：冰火旅人.html→**powergame.html**、备份→powergame_v3_backup.html、说明→MANUAL.md、攻略→WALKTHROUGH.md、截图/→screenshots/；_shot.js L5 与 MANUAL 内引用同步
- [x] GitHub 首次入库：.gitignore 排 _dl(210M)/_lpc(444M)/_tmp3d/_tmp_*/.claude；git init+commit+merge 远端占位 README+push → https://github.com/zhanghongming6/powergame.git @ 977c422（715 文件，含 assets 16M/assets3d 24M）
- [ ] 明日第一件事：**E1** 数据 schema（SPECIES 25/ELEMS 6/TIERS 4/BOSSNAMED 36+，seeded 生成 ≥500 图鉴条目，makeUnit 认 `.` key 跳过 FOE_TIERS），详见 task_plan.md

## 2026-09-03 会话⑱ · E1 数据 schema 与图鉴生成（完成；实现于上轮终端遗留工作区，本会话验证收口+入库）
- [x] 数据 schema（powergame.html L844–967）：SPECIES 25（旧 7 并入+新 18，nk 仅 boss 基底）/ELEMS 6（none/frost/fire/poison/shadow/holy，tint+weak 轮转+statMod）/TIERS 4（normal/elite/champ/boss，hp×1→8、sc×1→1.35）
- [x] genVariants（seed=20260903 mulberry 系）：key=`sp.elem.tier` → 576 变种入 FOES（数值=base×elem×tier×(1±.08) 抖动；weak=元素弱点+种弱点去重前3；vt:true 免章节档）；FOES 总 619 key（7 基+576+36 命名）
- [x] BOSSNAMED 36（ch1–ch7 按章守门，drop 橙装 key 预挂 E3）→ genNamed 注册 FOES（tier:'boss'+named:true+shield/def+2+exp×1.5）
- [x] 引擎兼容：makeUnit 仅 `side==='enemy'&&!d.vt` 叠章节档（旧基种照旧，尸鬼序章仍 181）；TAMEABLE 升种级+tameSp(spOf)；spOf 工具函数
- [x] 2D 兜底：VARSPR/VARPAL 模板（新 18 种无 LPC/MF 时 makeSprite 不崩）；bandit 补兜底
- [x] 3D（adapter3d.js）：MOB3D 25 种全映射；bModel 认 dot key（u.sp→spOf）；bEnsure：elem tint 乘材质色 + tscale 体型 + boss/champ 脚底 RingGeometry 光环（boss .5/champ .32，色=元素 tint）
- [x] harness：_shot e1 模式 10 断言（total500/variants576/named36/named_in/wb_fields/wight_unchanged/vt_skip/base_tier/tame/sprite_all 全 key unitSprite 无异常）10/10 PASS；var/varz 截图目检：霜霸主异鬼蓝环+大体、毒首领蜘蛛绿环、火精英狼染色 ✅
- [x] 回归全绿：SMOKE1-4 PASS；c1 19/19；c2 11/11；clix 13/13；camp(a5) 13/13 WIN
- [ ] 下一步：**E2** 遇敌池化（MAPS.mobs→sp[]+elemBias+tierRoll）+ 世界 boss POI（interact→BOSSNAMED 按章取未灭者，胜→flag+橙装+图鉴），详见 task_plan.md
