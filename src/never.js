/* The pages are a place to enjoy replies and to watch the news lightly (githito.xapi PRINCIPLES.md): no fear of
   being swayed by advertising, not a place for slander, nothing that upsets anyone.
   What the pages never show, whatever their own switches say: cruel news, news that touches one person's
   honour or private life, and slander in what people themselves write. These are the same three lists as
   githito.xapi's filters.mjs, which leaves the same things out when it collects; the pages apply them
   again to what they read, so that a change holds at once and what an older file still holds does not
   play. Change the two together. No lookbehind is used: older browsers do not have it. Alcohol and smoking
   (ALCOHOL, TOBACCO, COMPANY) are the lists of the same names there. */
(function (global) {
/* The owner's filter switches (githito.xapi config.json "filters"), carried in the stock files: a filter
   that is off lets everything through here too. setSwitches() is called with a stock file's "filters". */
let SW = {};
const off = k => SW[k] === false;
const gated = (k, re) => ({ test: s => !off(k) && re.test(s), source: re.source });
const CRUEL_WORDS = [
  /* killing and bodies */
  '殺害|殺人|強殺|殺傷|刺殺|射殺|銃殺|絞殺|撲殺|惨殺|虐殺|毒殺|爆殺|殺し(?!文句)|殺され|殺そう|殺した',
  '遺体|死体|変死|白骨|バラバラ(?:殺人|遺体|事件|にされ)|(?:遺体|手足|指|腕|脚|首|頭部)[^。]{0,6}切断|斬首|首を切|首を絞|拷問|処刑|死刑',
  '心中|自殺|自死|自傷|飛び降り|飛び込み自|首つり|首吊',
  '焼死|水死|溺死|圧死|餓死|衰弱死|凍死|窒息死|暴行死|傷害致死|過失致死|致死(?!率|量)|死なせ|死傷',
  '刺され[^。]{0,8}(?:死亡|重傷|重体|けが|ケガ|負傷|搬送)|(?:包丁|ナイフ|刃物|日本刀|カッター)[^。]{0,14}(?:刺|切|襲)|刺[^。]{0,10}(?:死亡|重傷|重体|殺|逮捕)|刺傷|切りつけ|斬りつけ|通り魔',
  '無差別(?:殺|に|テロ|襲撃|攻撃)|銃撃|銃乱射|乱射|発砲|自爆テロ|自爆攻撃|爆弾テロ|人質|監禁|誘拐|人身売買|臓器売買',
  /* sexual violence and abuse */
  'わいせつ|性的(?!少数|マイノリティ|指向)|性被害|性加害|性暴力|性犯罪|不同意|レイプ|強姦|強制性交|性交|買春|売春|淫行|児童ポルノ|盗撮|痴漢|下着泥棒|ストーカー',
  '虐待|暴行|ＤＶ|(?:^|[^A-Za-z])DV(?![A-Za-z])|体罰|リンチ|血まみれ|血だらけ|流血',
  /* violence that reached children */
  '(?:乳児|幼児|園児|児童|女児|男児|赤ちゃん|子ども|子供|小学生|中学生|高校生)[^。]{0,14}(?:死亡|死なせ|重体|放置|遺棄|置き去り|連れ去)',
  '(?:^|[^0-9０-９])(?:[0-9０-９]|1[0-7]|１[０-７])歳[^。]{0,14}(?:死亡|死なせ|重体|放置|遺棄|置き去り|連れ去)',
  /* attacks counted in deaths */
  '(?:空爆|砲撃|爆撃|攻撃|襲撃|銃撃|テロ|乱闘)[^。]{0,14}(?:死亡|死者|犠牲|死傷)',
];
const PERSONAL_WORDS = [
  /* a person before the law */
  '容疑|被告|受刑者|死刑囚|逮捕|書類送検|送検|起訴|摘発|有罪|実刑|懲役|執行猶予|禁錮|罰金刑|前科|指名手配|出頭|自首|家宅捜索|強制捜査|任意同行|事情聴取|取り調べ',
  /* allegations, exposures, private life */
  '疑惑|告発|暴露|スキャンダル|不祥事|文春砲|週刊誌報道|不倫|浮気|二股|略奪愛|隠し子|密会|お泊まり|熱愛',
  'パワハラ|セクハラ|モラハラ|いじめ|懲戒|停職|免職|解任要求|辞任要求|更迭要求',
  '薬物|大麻|覚醒剤|覚せい剤|コカイン|合成麻薬|闇営業|反社|裏社会',
  /* pile-ons and remarks on a person */
  '炎上|批判殺到|バッシング|物議|誹謗|中傷|袋叩き|晒し|ネットリンチ|整形(?!外科)|激太り|激ヤセ|老けた|不仲|確執|黒歴史|嘘つき',
];
const SLANDER_WORDS = [
  /* threats and wishing harm */
  '死ね|氏ね|しねよ|殺す|殺し(?!文句)|ころす|消えろ|失せろ|くたばれ|地獄に落ち|呪[うっ]',
  /* insults and slurs */
  'クズ|カス(?!タ|テ|ミ|ピ|ケ)|ゴミ(?!箱|出し|袋|拾い)|(?:^|[^ダ])クソ|くそ(?!う)|糞|ブス|デブ|ハゲ|ババア|ばばあ|ジジイ|じじい|老害|無能|低能|ガイジ|キチガイ|きちがい|精神病|メンヘラ|障害者|チョン|シナ人|土人|底辺|負け犬|陰キャ|不細工|キモ[いっすオ]?|きもい|気持ち悪|変態|ビッチ|売女|淫乱|ヤリマン|ヤリチン',
  /* charges against a person */
  '嘘つき|うそつき|詐欺師|犯罪者|前科|泥棒|盗人|パクリ|盗作|売名|ステマ|整形|枕営業|不倫して|浮気して|二股|虐待して|脱税|横領',
  /* pointing at a person */
  '晒[しすせそ]|特定(?:した|して|しま|班|完了)|住所|本名|実名|勤務先|職場に|学校名|電話番号|通報し|訴えて|訴える|開示請求|慰謝料',
  /* talk about running somebody down */
  '誹謗|中傷|悪口|陰口|アンチ(?!エイジ)|袋叩き|叩かれ|嫌われ|ハブられ|仲間はずれ|いじめ|虐め|無視され|ブロックされ',
];
const CRUEL = gated('cruel', new RegExp(CRUEL_WORDS.join('|')));
const PERSONAL = gated('personal', new RegExp(PERSONAL_WORDS.join('|')));
const SLANDER = gated('slander', new RegExp(SLANDER_WORDS.join('|')));
/* Harmless sayings are taken out before the words are looked for (a nail driven home is a warning). */
const SAYINGS = /(?:くぎ|釘|クギ|とどめ|トドメ)を?刺|(?:蚊|ハチ|蜂|虫|クラゲ)に刺/g;
const plain = text => String(text || '').replace(SAYINGS, '');
const cruel = text => CRUEL.test(plain(text));
const personal = text => PERSONAL.test(plain(text));
const slander = text => SLANDER.test(plain(text));
/* Alcohol and smoking (the pages are read by the young too). News keeps them when it is a company's news
   (a brewer's results, a new beer on sale, a tobacco maker's price rise). Car and sea sickness are no drinking. */
const ALCOHOL = gated('alcohol', /お酒|酒(?![井田々])|飲酒|禁酒|晩酌|泥酔|酔っ|酔い|酔う|酔え|二日酔|ほろ酔|ほろよい|呑[みむまん]|飲み会|飲みに|飲み歩き|はしご酒|ハシゴ酒|飲み過ぎ|飲みすぎ|飲んだくれ|宅飲み|家飲み|朝飲み|昼飲み|夜飲み|朝から飲|昼から飲|朝呑|昼呑|ちょい飲み|立ち飲み|角打ち|せんべろ|飲み放題|飲み屋|飲み友|飲み仲間|飲み行|飲みいこ|飲み行こ|一杯やろ|一杯やる|一杯やり|一杯いこ|一杯行こ|一杯ひっかけ|二次会|三次会|飲兵衛|呑兵衛|のんべえ|アル中|🍾|居酒屋|酒場|乾杯|カンパイ|かんぱい|ビール|ビアガーデン|ビアホール|ビアバー|ワイン|日本酒|焼酎|ハイボール|チューハイ|酎ハイ|サワー|カクテル|ウイスキー|ウィスキー|ウォッカ|テキーラ|シャンパン|梅酒|生中(?!継)|ストゼロ|アルコール|酒豪|ベロンベロン|🍺|🍻|🥂|🍷|🍸|🍹|🥃|🍶|\b(?:beers?|wine|drunk|alcohol|whiske?y|vodka|tequila|cocktails?|hangover|tipsy|booze|sake)\b/i);
const TOBACCO = gated('tobacco', /タバコ|たばこ|煙草|喫煙|禁煙|分煙|加熱式|アイコス|IQOS|ベイプ|VAPE|ヤニ(?!ヤ)|一服|紫煙|吸い殻|吸殻|灰皿|葉巻|シガー|シーシャ|ニコチン|スモーカー|🚬|\b(?:cigarettes?|cigars?|smok(?:e|es|ed|ing)|vap(?:e|es|ing)|nicotine|tobacco|juul)\b/i);
const COMPANY = /アサヒ|キリン|サッポロ|サントリー|宝酒造|宝ホールディングス|白鶴|月桂冠|菊正宗|大関|黄桜|獺祭|旭酒造|オエノン|メルシャン|ニッカ|JT|日本たばこ|日本たばこ産業|フィリップ・?モリス|ブリティッシュ・?アメリカン・?タバコ|BAT|ハイネケン|ディアジオ|ペルノ|アンハイザー|バドワイザー|カールスバーグ|モルソン|コンステレーション|鳥貴族|ワタミ|串カツ田中|酒造|醸造|株式会社|ホールディングス|HD|グループ|社長|会長|CEO|決算|売上|業績|株価|株主|上場|買収|合併|提携|新商品|新製品|発売|値上げ|値下げ|出荷|工場|事業|市場|シェア|増益|減益|増収|減収|黒字|赤字|最高益|純利益|営業利益|輸出|販売|出店|閉店|店舗|メーカー|ブランド|企業/;
const adult = text => ALCOHOL.test(String(text || '').replace(/(?:車|船|乗り物)酔い/g, '')) || TOBACCO.test(String(text || ''));
/* Remarks about politicians, parties, the government, papers and broadcasters (POLITICAL_TARGET, ATTACK in
   githito.xapi's filters.mjs): what runs them down never plays; a reply that names them does not play either. */
const POLITICAL_TARGET = gated('politics', /麻生|安倍|岸田|石破|高市|萩生田|二階|枝野|玉木|榛葉|蓮舫|辻元|志位|山本太郎|小泉進次郎|河野太郎|茂木敏充|吉村洋文|橋下徹|小池百合子|野田佳彦|[一-鿿]{1,4}(?:首相|総理|大臣|防衛相|外相|法相|財務相|経産相|厚労相|文科相|国交相|総務相|農水相|環境相|官房長官|幹事長|党首|総裁|議員|知事|市長|元首相|前首相)|政府|政権|内閣|官邸|国会|与党|野党|自民|立憲|立民|維新|公明|共産党|国民民主|参政党|れいわ|社民|保守党|朝日新聞|毎日新聞|読売新聞|産経|日経新聞|NHK|ＮＨＫ|TBS|フジテレビ|テレ朝|日テレ|テレビ東京|マスコミ|マスゴミ|新聞社|共同通信|時事通信|文春|新潮|\b(?:Trump|Biden|Harris|Obama|Clinton|Pelosi|Vance|Newsom|DeSantis|Schumer|McConnell|Netanyahu|Putin|Zelensky|Democrats?|Republicans?|GOP|White House|Congress|Senate|Senator|Governor|President|CNN|Fox News|MSNBC|New York Times|Washington Post|Guardian|BBC|Reuters|legacy media|mainstream media|MSM|government|Parliament|Labour|UKLabour|Tory|Tories|Starmer|Sunak|Farage|Reform UK|propaganda|woke|leftists?|liberals?|conservatives?|Covid|Ukraine|Russia|Kerch|Crimea|Gaza|Israel|Iran|NATO)\b/i);
const ATTACK = gated('politics', /酷い|ひどい|最悪|最低|無能|辞めろ|辞任しろ|やめろ|説明しろ|責任取れ|責任とれ|しろや|しろよ|せえや|売国|嘘つき|ウソつき|嘘ばかり|恥を知れ|恥ずかし|情けない|ふざけ|許せない|許さない|ありえない|あり得ない|おかし[いな]|ケチ|バカ|馬鹿|アホ|クズ|老害|税金泥棒|裏切|反日|媚中|媚韓|国賊|害悪|独裁|腐って|腐敗|利権|癒着|無責任|開き直|居直|逃げ[るた]|ダメだ|呆れ|あきれ|失望|茶番|ポンコツ|頑なに|いい加減に|\b(?:stupid|corrupt|liar|lies|lying|disgrace\w*|terrible|worst|failed|incompetent|resign|shame\w*|pathetic|fraud|evil|traitor|clown|idiot\w*|moron\w*|criminal|dictator)\b/i);
/* Insults and swearing in English, and what an ordinary person's reply may not do: run anything down. */
const SLANDER_EN = gated('slander', /\b(?:fuck\w*|f\*+ck\w*|f\*+\w*|shit\w*|stfu|wtf|bitch\w*|bastard\w*|asshole\w*|dick\w*|cunt\w*|trash|garbage|idiot\w*|moron\w*|stupid|dumb\w*|pedo\w*|scum\w*|clowns?|liars?|pathetic|disgusting|losers?|retard\w*|cringe|ponzi|scam\w*|is a joke|hell)\b/i);
const NEGATIVE = gated('negative', /最悪|最低|うざ|ウザ|キモ|きもい|気持ち悪|くだらな|つまらな|下手くそ|ヘタクソ|しょうもな|不快|嫌い|ムカつ|むかつ|腹立|ふざけ|ありえな|あり得な|ひどい|酷い|\b(?:fake|staged|pretend\w*|nonsense|worst|sick and tired|hate\w*|sucks?|awful|terrible|horrible|ugly|annoying|boring|overrated|jesus christ|vote|voters?|war|country|done posting|off from X|leav(?:e|ing) X)\b/i);
const politicsTarget = text => POLITICAL_TARGET.test(String(text || ''));
const politicsAttack = text => POLITICAL_TARGET.test(String(text || '')) && ATTACK.test(String(text || ''));
/* news: a headline (with the line under it) that may not play. */
/* Advertising (githito.xapi's principle 2: no fear of being swayed by ads): promotions, sponsored posts, PR,
   calls to buy or enter. */
const ADVERT = gated('advert', /#PR\b|＃PR|【PR】|［PR］|\[PR\]|〈PR〉|\bPR\b|広告|宣伝|案件|タイアップ|プロモーション|スポンサー|アフィリエイト|楽天ROOM|購入はこちら|ご購入|お買い求め|予約はこちら|ご予約|予約受付|予約開始|発売中|発売しました|発売開始|好評発売|販売中|ご注文|通販|グッズ|クーポン|割引|[0-9０-９]+[%％]\s*(?:オフ|OFF|off)|セール|期間限定|今だけ|キャンペーン|応募|抽選で|当選|フォロー[&＆]\s*(?:RT|リポスト)|リポストで|詳しくはプロフ|プロフのリンク|リンクから|LINEスタンプ|BuyPR|\b(?:ad|ads|#ad|sponsored|promo|promotion|partnered|partnership|use code|discount|sale|buy now|shop now|order now|pre-?orders?|link in bio|out now|on sale|available now|giveaway|subscribe|merch|affiliate|coupon)\b/i);
const advert = text => ADVERT.test(String(text || ''));
/* News is well-known people's own posts (X filters them too): the light check githito.xapi makes
   (filters.mjs famousLight) — insults, alcohol and smoking (a company's news aside), attacks on politicians,
   the marks of a paid advertisement. A singer's new song or tour on their own account is not an advertisement. */
const PAID_AD = gated('advert', /#PR\b|＃PR|【PR】|［PR］|\[PR\]|〈PR〉|広告|案件|タイアップ|スポンサー|アフィリエイト|楽天ROOM|#ad\b|#sponsored\b|\bsponsored\b|\bpaid partnership\b/i);
/* Violence (the same words as githito.xapi's VIOLENT): hitting, kicking, crushing or killing someone, a
   comedian's joke included. Kicking a ball, killing time, mashing food, a scribble are not violence. */
const VIOLENT = gated('violence', /(?<!時間|暇|ひま|時)[はも]\s*潰[しすさせそ]|潰してや|潰したる|潰すぞ|殴(?!り書)|ぶん殴|蹴り潰|蹴り殺|蹴り飛ば|蹴飛ば|蹴っ飛ば|ぶっ蹴|蹴りを入れ|蹴り入れ|ぶっ潰|叩き潰|踏み潰|捻り潰|ひねり潰|握り潰|ぶっ殺|ぶち殺|殺[さしすせそ](?!風景)|殺害|殺人|刺し殺|刺殺|撲殺|絞め殺|射殺|半殺し|血祭り|叩きのめ|ボコボコ|ぼこぼこ|ボコる|ボコっ|しばき|しばく|シバく|シバき|ぶっ飛ばす|ぶっとばす|ぶっ飛ばし|暴力|暴行|リンチ|拷問|首を?絞め|首しめ|\b(?:i(?:'ll| will| am going to| gonna) (?:kill|hurt|beat|punch|stab|shoot)|kill (?:you|him|her|them|everyone|y'all)|beat (?:you|him|her|them|everyone) up|punch(?:ed|ing)? (?:you|him|her|them|someone|in the face)|stab(?:bed|bing|s)?|assault(?:ed|ing)?|violen(?:ce|t)|murder(?:ed|ing|s)?|beat(?:en|ing)? to death)\b/i);
const violent = text => VIOLENT.test(String(text || ''));
const famousOk = text => !(slander(text) || violent(text) || (adult(text) && !COMPANY.test(String(text || ''))) || politicsAttack(text) || PAID_AD.test(String(text || '')));
/* The check githito.xapi makes twice (filters.mjs safeWords), made a third time here on each card of what
   people said: own: a well-known person's own post. */
const safeWords = (text, own) => !(cruel(text) || personal(text) || slander(text) || SLANDER_EN.test(String(text || '')) || adult(text) || advert(text) || (own ? politicsAttack(text) : politicsTarget(text) || NEGATIVE.test(String(text || ''))));
global.NSNever = { setSwitches: sw => { SW = sw && typeof sw === 'object' ? { ...sw } : {}; }, switchOff: off, cruel, personal, slander, adult, advert, violent, famousOk, politicsTarget, politicsAttack, safeWords, news: text => cruel(text) || personal(text) || politicsAttack(text) || (adult(text) && !COMPANY.test(String(text || ''))) };
})(typeof window !== 'undefined' ? window : globalThis);
