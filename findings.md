# 研究发现（v3 开放世界）

## 已确认的架构决策（用户选定）
- 美术：下载CC0素材到本地 assets/（Kenney，全部 CC0/public domain，可商用无需署名，署名自愿）
- 视角：俯视角2D；战斗：保留回合制；养成：标准版（驯服/升级/喂食/上阵/跟随）

## 已下载素材包（_dl/ 目录，待整理进 assets/）
| 包 | 用途 | 规格 |
|----|------|------|
| kenney_tiny-town | 地形/树木/房屋/城堡/栅栏/道具 | 132 tiles, 12×11, 16px, 1px margin, tile_0000..0131 行优先 |
| kenney_tiny-dungeon | 角色/魔物/道具/室内 | 同上 |
| kenney_roguelike-rpg-pack | 水域/冰缘水面/少量道具 | sheet 968×526, 17px pitch(16+1), 57列 |
| kenney_roguelike-characters | 备用角色/小动物(左上四足兽) | 同上pitch |
| kenney_ui-pack-rpg-expansion | UI面板/槽/按钮/箭头/图标 | PNG/ 单独文件 + sheet+XML |

## 素材索引（行优先 index = row*cols+col）

### tiny-town（12列）经截图核对
- 草地: 0 素草 / 1 花 / 2 黄花；泥土上缘 12-14 / 泥 24-26 / 泥下缘 36-38 / 角 39-42
- 石板路: 43
- 树: 3秋树 4松树 5圆树 15秋高树 16松高树 17苗 27秋小 28松小 29蘑菇；丛 6-11,18-23
- 木栅栏: 44,45,46 / 47竖 / 56,57,58 / 59 / 68,69,70 / 71 / 80,81,82 / 83指示牌
- 石墙屋顶(灰): 48,49,50 / 窗51 / 红顶 52,53,54 / 55 / 60,61,62 / 角63,67
- 民房: 棕墙72,73 门74 / 灰墙76,77 门78 / 门窗84-91
- 城堡墙: 96,97,98角 / 99,100,101,102,103 / 108,109,110竖 / 111,112,113,114拱门
- 道具: 92帐篷 93金币 94蜂箱 95靶 104小棚 105井 106木桶 107罐 117钥匙 118弓 119箭

### tiny-dungeon（12列）经截图核对
- 主角映射: 琼恩=88(兜帽战士, 改色黑+灰) 丹妮莉丝=99(长发女, 改色白/蓝) 艾莉亚=112(绿帽射手, 改色灰褐) 布蕾妮=87(羽饰骑士)
- NPC: 84法师(学士) 85男孩 86光头战士 98战士 100盔战士 111矮人(铁匠)
- 魔物映射: 尸鬼=108绿幽灵(改色苍白冰绿) 异鬼=96黑骑士(改色冰蓝) 巨人=109壮汉(×2放大改色) 恶魔=110(火焰生物/红祭司怪)
- 宝箱/道具: 101,102,103箱 104,105盾 106,107剑 113-116药水 117锤 118,119斧
- 城镇摆件: 72桌 75架 82桶 63墓碑 64,65石碑

### roguelike-rpg-pack 水域（57列）经放大截图核对
- 开放水面: 0
- 草缘池塘: TL2 T3 TR4 / L59 R61 / BL116 B117 BR118
- 白冰缘水(北境海/冻湖): TL173 T174 TR175 / L230 R232 / BL287 B288 BR289

### UI包（PNG/单独文件，名字即语义）
- 面板: panel_beige.png/panel_blue.png 等（panel*）；横条框: panelFlat_*
- 血条: barBack_horizontal* + barRed/Green/Blue_horizontal*（左/中/右 九片拼接）
- 按钮: buttonLong_blue/brown/beige/grey.png；方形: buttonSquare_*
- 箭头/光标: arrowBeige_left/right；勾选/叉: iconCheck_*, iconCross_*
- 图标: 剑/盾等小图标若干

## 程序化改色方案（保持风格统一）
- 雪地 = 草地系tiles 绿→白蓝色阶映射；雪松 = 松树 绿→冰白
- 水面加运行时微光动画；北部区域叠加飘雪粒子（复用SNOW）
- 蜘蛛/龙/夜王: 沿用v2自定义像素（makeSprite自带描边，风格兼容），龙仅演出/终局
- 行走动画: 静态精灵 + 程序化2帧步幅bob + 左右镜像 + 背面帧(头部发色替换)生成

## v3 地图 biome 与渲染要点
- 雪带：y<24 全雪；24-32 过渡；狼林 x<46&&y<52 雪原（与 regionAt wolfswood 对齐）；其余草地
- 植被tiles(6/7/8)源精灵透明底 → prerenderMap 必须先垫地面（snow/grass 按 biome），否则露黑底
- 龙石岛 x113-118,y49-60  dirt+栈桥 y52 x106-113；岛上有房(114,51)占 3×2 实体
- 测试工具：_smoke_run.js（Chrome dump-dom ?smoke 解析 #smokeLog）；_shot.js 四视角截图；zoom.html 2x 目检
  - 注意 zoom.html 裁的是右半屏（offset -640,-288），看全貌直接读 shot_*.png

## 环境（沿用v2）
- node v18 可用；python 不可用；Chrome headless 截图写 Temp
- 当前项目目录: 桌面\05-待整理\新建文件夹 (3)

## v4 美术资源决策（2026-09-01 用户选定）
- **人物**：LPC（64px 4方向9帧行走动画，分层 body/torso/legs/feet/hair/head/weapon/cape…）
  - 源：GitHub liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator（spritesheets/）
  - 许可 CC-BY-SA/GPL → 游戏内必须放署名页（credits）
- **怪物/建筑**：superpowers-asset-packs/medieval-fantasy（CC0）：dragon/king skeleton(夜王)/cyclop(巨人)/skeleton(尸鬼)/goblin/城堡
  - 源：GitHub sparklinlabs/superpowers-asset-packs（raw 直下）
- 狼/蜘蛛：狼=Kenney roguelike 改色放大；蜘蛛=自绘24×32升级
- 运行时合成：按角色 recipe 分层 drawImage 到离屏 canvas（全帧），缓存帧序列
- 改色：简单调色板替换（披风黑/发色白 等，按需）

## LPC 合成管线（A1 · 2026-09-01 验证通过）

### 格式与朝向（截图目检确认）
- walk.png = 576×256（9帧×4行）；idle.png = 128×256（2帧×4行）；64px 格
- 行序：row0=up(背) row1=left row2=down(正面朝下) row3=right
- 战斗立绘=idle row3 frame0（朝右）；头像=walk row2 头部裁切(16,128+12,22,24)→64×64
- **朝向规则（v3 备份佐证）**：v3 战斗源(makeSprite)与 LPC/MF 均朝右 → 战斗镜像 `flip=u.side==='player'`（仅玩家侧镜像）
- 探索野怪：自绘底图朝左(face>0 镜像)、MF 朝右(face<0 镜像)、LPC 用真实方向行

### 官方层序（_lpc/sheet_definitions zPos，升序绘制；sources/state/meta.ts 证实按 zPos 排序合成）
shadow 0 → cape-bg/weapon-bg/quiver 5–9 → body 10 → feet-shoes 15 → legs 20 → boots 25 →
dress-slit 30 → shirt/tunic 35 → apron 40 → dress-bodice 45 → chainmail 50 →
torso armour(leather/plate) 60 → cape-fg 85 → head 100 → hair-bg 9 / hair-fg 120 → helm 130 → weapon-fg 140

### 磁盘路径怪癖
- body 女体文件夹=thin（b_fem 源 legs/pants/thin、feet/boots/basic/thin）
- tunic/apron/dress 预染色：按颜色分子目录（walk/<color>.png）；tunic/apron **无 idle** → idle 回退=复制 walk 第0帧两格
- 武器 sheet 文件名特殊：weapon/sword/longsword/walk/longsword.png、universal_behind/walk/longsword.png；spear 用 walk/foreground.png+background.png

### 资产子集 assets/lpc（68 文件，平铺名，_tmp_copylpc.js 生成）
b_male/b_fem/b_skel、hd_m/hd_f、legs_m/legs_f、boots_m/boots_f、shirt_m、tunic_f、mail_m/mail_f、
lthr_m、plate_m/plate_f、apron_m、dress_f、dslit_f、capes_f/capes_b、capet_f/capet_b、
hr_parted/hr_bob/hr_braid_b/hr_braid_f/hr_xlong_b/hr_xlong_f/hr_bald/hr_long、helm_nasal、
w_lsword_f/b、w_dagger_f/b、w_spear_f/b（各 _walk/_idle；武器仅 _walk）

### 怪物映射（assets/mf/monsters · CC0）
尸鬼=skeleton · 异鬼/夜王=king skeleton · 巨人=cyclop · 龙=dragon · 杂兵=goblin/bat/snake/slim

### 11 个 recipe（compose_test.html RECIPES，键序0-10，逐角色3×截图目检 ✅）
0 琼恩(黑披风capet+锁子甲+长剑) 1 艾莉亚(tunic+匕+棕bob) 2 布蕾妮(plate提亮tint[[64,70,84],[176,186,204]]+金辫+长剑)
3 丹妮莉丝(银xlong发+蓝裙) 4 学士(灰shirt+秃) 5 铁匠(apron+棕发) 6 卫兵(锁子甲+nasal盔+矛)
7 守夜人(黑capes+暗锁子甲) 8 村妇(棕tunic+长发) 9 尸鬼(b_skel蓝灰tint) 10 异鬼(b_skel冰蓝tint+冰剑)

### 合成器要点（compose_test.html，移植进主文件）
- tint(src,dark,light)：lum=0.299r+0.587g+0.114b → lerp(dark,light) 逐像素改色
- compose(recipe,anim)：按 z 升序 drawImage；idle 缺失层回退 walk col0
- 截图命令必须带 --allow-file-access-from-files，否则 file:// canvas 污染 getImageData 抛错白屏

## 真3D v5 技术要点（2026-09-02 · assets3d/）

### bake 与朝向（probe 页目检确认）
- _bake3d.js 把 matrixWorld 烘进几何（applyMatrix4）→ InstancedMesh 朝向=GLB 原始朝向
- p_wall=宽板、宽度沿 Z、原始面朝 ±X → 战斗排 rot=+π/2 才宽面对相机；rot 0/π=细棍；-π/2 背面剔除不可见
- p_wallBlock=立方(w/h=1)；p_roofGable=宽顶(w/h≈1.93)；p_pineTallA=细高树
- **probe3d 结论（2026-09-03）**：全部资产 baked min.y≈0，归一即底部原点（旧「原点不在底部」假设推翻）；墙排偏高真因=正交投影把 z=-6 地面排推上屏 → 墙排改 z≈-2（sy2.9）、塔 z=-2.5 即落位

### 正交战斗相机
- BHW=640/70、BHH=360/70、BPHI=asin(55/70)；bCam.position.set(0,40*sp,40*cp-70/55)，lookAt(0,0,-70/55)
- 效果：screen_x=u.x（70px/unit）、地面 z=0→屏 y=430（纵深 55px/unit）→ 全部 FX/覆盖层零改动对齐
- 单位映射 gx=(u.x-640)/70、gz=(u.y-430)/55；玩家 rotation.y=π=背影、敌 0=正面（截图目检确认）

### 模型尺寸表（probe3d · 高归一=1 时的 宽×深）
- jon .88×.51 · arya .90×.30 · wight 1.07×.36 · walker 1.28×.80 · npc2 1.33×.60 · giant 1.43×.52
- wolf .40×2.07（长条）· spider 3.05×2.70（巨扁）· p_wall .1×1 · p_wallBlock 1×1 · p_roofGable 1.93×1.88
- **E0 新怪 18 种（2026-09-03 probe 全绿，baked min.y 全=0）**：
  bat .67×1.06 · snake .35×.95 · slime 1.30×1.57 · goblin 1.09×.40 · skeleton .91×.26（T姿宽臂）
  zombie 1.39×.50 · orc 1.46×.58 · orcEnemy 1.12×.70（巨魔替身）· demon 3.27×1.23（展臂极宽）
  blueDemon 1.63×.76 · golemIce 2.82×1.25 · golemEvo 1.71×.85 · shaman .92×.49（raw minY -1.66，归一后正常）
  dragonWhelp 2.84×1.58 · direwolf .31×1.22（四足）· wraith 1.77×.40 · knightBlack 1.09×1.05 · rogue 1.31×.69
  → 展臂宽型（demon/golemIce/dragonWhelp/skeleton）占位用 max(w,d)；四足长条（direwolf/wolf）注意旋转后投影

### 战斗尺寸层级与点击流（2026-09-03）
- BS=2.4 全局战斗倍率（bEnsure g.scale=md[1]*BS）；玩家 1.2→≈124px；MOB3D：wolf .6 / spider .65 / giant 2.2 / wight 1.1 / walker 1.45 / nk 1.6 / bandit 1.15
- 竖向 1 单位≈43px（cos 收缩）；脚底屏 y≈u.y+1；#partyBar(y≥598 全宽) 会吞敌单位点击 → 选敌相位 pointer-events:none，leaveTarget/confirmAction 恢复
- 3D hover 不能用 2D 精灵 sw/sh：改 A3D.projectUnit 投影框 w=max(56,hh*.75)、top-18..y+12
- tryConfirmEnemy 统一 Enter/点击确认；target 相位默认 hover=首个活敌，←→/Tab 循环、Enter/空格/j 确认、Esc/右键取消

### harness 教训（clix/c2）
- clix 模式：战斗点击流 13 断言（elementFromPoint 验证指令行最顶层、projectUnit 命中、partyBar 透传、Enter/点击双确认）
- c2 flake 根因：--virtual-time-budget=60s 下 waitf 800 泵×tick60≈48s 空转（等尚未出现的目标文本）→ 后继阶段预算不足；解法=先等击杀目标文本出现再注入 kills（注意 _chK 在 CH_OPEN[0] 快照，注入必须晚于目标激活）

### headless 截图 harness（swiftshader 虚拟时间）
- 每 rAF 里渲 WebGL 会饿死虚拟时间 → __NORT（frame 跳过实时渲染）、__SHOTSTOP（run 后停 rAF 截最后合成帧）、__NOGL（smoke 跳 tick/brender）
- 显式驱动：__T.tick（探索）、__T.brender（战斗），冰火旅人.html ~3831/3840
- zoom3x/zwall 在 3D 模式只复制 2D #cv 层 → 无效；目检用 Temp/bfshot/crop.ps1 裁全分辨率 shot
- BENV 雾：相机距 ~40 → fogN 42-46 / fogF 78-95，旧值 14-20/40-60 会把单位雾化
- **file:// URL 教训（2026-09-03）**：bash 直接拼 `file:///$PWD/…`（中文路径）→ Chrome ERR_FILE_NOT_FOUND、dump-dom 输出错误页（看着像「空输出」）；正解=仿 _shot.js：node `cp.execFileSync(CHROME,[…,'file:///'+path.join(__dirname,f).replace(/\\/g,'/')])`；probe3d 验证脚本=_probe_run.js

### 双 canvas 架构
- #cv3(WebGL,alpha) 垫底 + #cv(2D 透明) 叠覆盖层（小地图/血条/护盾/飘雪/E 提示）；RENDER_MODE='3d'|'2d' 兜底；耦合仅 adapter3d.js（window.A3D）

## E0 资产获取管线（2026-09-03 · mobs 7→25）
- **poly.pizza 同源 API（无需 key）**：`https://poly.pizza/api/search/<kw>?Limit=N&Type=models`（返回 results[].previewUrl 内嵌 uuid）；外部 api.poly.pizza 需 key 被拒
- **previewUrl 的 webp uuid == GLB uuid** → `https://static.poly.pizza/<uuid>.glb` 直下（已用现有 wolf/walker/king 等全部旧模型 uuid 对账验证）
- 出处：现有 chars/mobs = Quaternius CC0（poly.pizza）；props = Kenney CC0（ETdoFresh/kenney.nl 镜像）；knightBlack/rogue = KayKit Adventurers CC0（GitHub 用户 KayKit-Game-Assets，branch main，~3.5MB/个带多动画）
- 计划内无 CC0 动画源：bear / mammoth / troll（poly.pizza 全库搜无）→ 名单按「按包可得性微调」条款改为 18 新种：orcEnemy 顶巨魔、demon 顶火元素、direwolf=Husky、wraith=Ghost
- 下载 24.48MB 全 OK（_dl3d.js，>500B skip-if-exists）；bake 后 models_mobs.js 14.4MB（本地 file:// 游戏，质量优先预算内）
- KEEP_ANIM=/Walk$|Idle$|Death|Slash|Attack|Flying/i：knightBlack 3.57MB→1.86MB，多数新怪 200-600K
