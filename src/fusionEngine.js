import { MONSTERS, FAMILY_CROSS_TABLE, SPECIAL_RECIPES, QUAD_SPECIAL_RECIPES, FAMILIES } from "./monsterData";

// 位階配合で生まれないモンスターのリスト（スカウトのみ、または特殊配合のみで作成可能）
const EXCLUDED_FROM_GENERIC_FUSION = new Set([
  "スライム",
  "ズッキーニャ",
  "からくりエッグ",
  "マンドラ",
  "モコッキー",
  "おおがらす",
  "ベロゴン",
  "かまっち",
  "ガップリン",
  "エテポンゲ",
  "ナスビナーラ",
  "あおバチ騎兵",
  "エビルドライブ",
  "ドロルメイジ",
  "モーモン",
  "サボテンボール",
  "トマトマーレ",
  "プリズニャン",
  "どんぐりベビー",
  "スカルゴン",
  "ポグフィッシュ",
  "かれくさネズミ",
  "りゅうはかせ",
  "ゴールドマン",
  "ビーライダー",
  "ブラウニー",
  "いわとびあくま",
  "あばれこまいぬ",
  "パールモービル",
  "メドーサボール",
  "はさみくわがた",
  "リカント",
  "おおさそり",
  "ガマキャノン",
  "きりさきピエロ",
  "マネマネ",
  "メイデンドール",
  "おおみみず",
  "メタルスライム",
  "キラーパンサー",
  "くらやみハーピー",
  "あくまの書",
  "ふくぶくろ",
  "スペクテット",
  "スラ忍イエロー",
  "スラ忍レッド",
  "スラ忍ブラウン",
  "スラ忍グリーン",
  "スラ忍パープル",
  "スラ忍ブルー",
  "スラ忍オレンジ",
  "スラ忍ピンク",
  "スラ忍ブラック",
  "カンダタこぶん",
  "大魔王の右手",
  "大魔王の左手",
  "ぶちキング",
  "海竜",
  "ヘルコンドル",
  "ガーゴイル",
  "フェアリーバット",
  "ドラゴビショップ",
  "キラースコップ",
  "プオーン",
  "もりもりベス",
  "くもの大王",
  "おおドラキー",
  "アイアンブルドー",
  "メタルハンター",
  "キングスライム",
  "セイレーンゴースト",
  "じごくのもんばん",
  "アラウネ",
  "イノブタマン",
  "グリーンモッキー",
  "れんごく天馬",
  "デスフラッター",
  "サイコロン",
  "なぞのしんかん",
  "ソードファントム",
  "ティコ",
  "ククリ",
  "はぐれメタル",
  "アルゴンリザード",
  "マッドビー",
  "ブラッドレディ",
  "かぶとこぞう",
  "デーモンレスラー",
  "ボーンナイト",
  "デスマドモアゼル",
  "キラーピッケル",
  "エビルチャリオット",
  "ルーファ",
  "ポンポコあにき",
  "だいあくまの書",
  "キラーポッド",
  "リザードファッツ",
  "タイラントワーム",
  "ウィングタイガ",
  "ボストロール",
  "病魔パンデルム",
  "スライダーヒーロー",
  "じごくのメンドーサ",
  "死神スライダーク",
  "ドラゴンライダー",
  "ジャミラス",
  "魔王の書",
  "黒騎士レオコーン",
  "少年レオソード",
  "トライワインダー",
  "ドラゴンロード",
  "よろいムカデ",
  "キラーマシン"
]);

// Fast lookups
const monsterMap = new Map();
MONSTERS.forEach(m => monsterMap.set(m.name, m));

const specialRecipeMap = new Map();
SPECIAL_RECIPES.forEach(r => {
  specialRecipeMap.set(`${r.parentA}_${r.parentB}`, r.child);
  specialRecipeMap.set(`${r.parentB}_${r.parentA}`, r.child);
});

// Precompute sorted lists by family
const GENERIC_A_RANK_MONSTERS = new Set([
  "アンドレアル",
  "マンイーター",
  "とうだいタイガー",
  "ウィングデビル",
  "ギガミュータント",
  "バブルキング",
  "バッファロン",
  "魔王の使い",
  "デッドマスカー",
  "グレンデル",
  "ボル",
  "ダークキング",
  "黒竜丸",
  "サンダーバード",
  "ユニコーン",
  "木馬の騎士",
  "コスモファントム",
  "がいこつけんし"
]);

const familyMonstersCache = new Map();
Object.values(FAMILIES).forEach(family => {
  const sorted = MONSTERS.filter(m => {
    // 1. Check basic excluded set (F, E, D, B, C exclusions)
    if (EXCLUDED_FROM_GENERIC_FUSION.has(m.name)) {
      return false;
    }
    // 2. A rank and higher restrictions:
    // A rank is only generic if explicitly in the GENERIC_A_RANK_MONSTERS list.
    if (m.rank === 'A') {
      return GENERIC_A_RANK_MONSTERS.has(m.name);
    }
    // S rank is only generic if it is "ゆうれい船"
    if (m.rank === 'S') {
      return m.name === 'ゆうれい船';
    }
    // SS rank does not appear in generic fusions
    if (m.rank === 'SS') {
      return false;
    }
    return true;
  }).sort((a, b) => a.level - b.level);
  familyMonstersCache.set(family, sorted);
});

// 特定の親Aと親Bの組み合わせで特殊配合があるか検索する
// 特殊配合はA x B だけでなく B x A も対象
export function getSpecialCombination(parentA, parentB) {
  if (!parentA || !parentB) return null;
  const childName = specialRecipeMap.get(`${parentA.name}_${parentB.name}`);
  return childName ? monsterMap.get(childName) || null : null;
}

// 系統と基準位階より「1つ上（以上）で最も位階が近いモンスター」を探す
export function findNextHighestMonster(family, baseLevel) {
  const familyMonsters = familyMonstersCache.get(family) || [];
  if (familyMonsters.length === 0) return null;

  // baseLevelより大きく、最も近い位階のモンスターを探す
  const nextMonster = familyMonsters.find(m => m.level > baseLevel);

  // もしbaseLevel以上のモンスターがいなければ、その系統で最も位階が高いモンスターを返す
  return nextMonster || familyMonsters[familyMonsters.length - 1];
}

// 配合シミュレーションを実行する
// 戻り値: { special: Monster|null, choices: [{type: string, monster: Monster}] }
export function simulateFusion(parentA, parentB) {
  if (!parentA || !parentB) return null;

  // 1. まず特殊配合をチェック
  const specialResult = getSpecialCombination(parentA, parentB);
  if (specialResult) {
    return {
      special: specialResult,
      choices: []
    };
  }

  // 2. 位階配合の処理
  // 父親・母親の位階の大小関係を把握
  const higherLevel = Math.max(parentA.level, parentB.level);
  const lowerLevel = Math.min(parentA.level, parentB.level);

  // 同一モンスター同士の配合
  if (parentA.name === parentB.name) {
    return {
      special: null,
      choices: [
        {
          type: "同一モンスター配合",
          description: "親と全く同じモンスターが生まれます",
          monster: parentA
        }
      ]
    };
  }

  // 同系統同士の配合
  if (parentA.family === parentB.family) {
    // 両親のうち位階が上のモンスターよりもさらに位階が1つ上の、同じ系統のモンスター
    const child = findNextHighestMonster(parentA.family, higherLevel);
    return {
      special: null,
      choices: [
        {
          type: "同系統配合",
          description: `位階の高い親(${parentA.name === parentB.name ? parentA.name : (parentA.level >= parentB.level ? parentA.name : parentB.name)})より位階が上の${parentA.family}`,
          monster: child
        }
      ]
    };
  }

  // 違う系統のモンスター同士の配合
  // 3つの選択肢が生まれる
  const choices = [];

  // ① 父母のうち位階が高いものより位階が1つ強い父親と同じ系統のモンスター
  const choice1 = findNextHighestMonster(parentA.family, higherLevel);
  if (choice1) {
    choices.push({
      type: "父系統継承",
      description: `位階の高い親(${higherLevel}基準)より上の、父親の系統(${parentA.family})`,
      monster: choice1
    });
  }

  // ② 父母のうち位階が高いものより位階が1つ強い母親と同じ系統のモンスター
  const choice2 = findNextHighestMonster(parentB.family, higherLevel);
  if (choice2) {
    choices.push({
      type: "母系統継承",
      description: `位階の高い親(${higherLevel}基準)より上の、母親の系統(${parentB.family})`,
      monster: choice2
    });
  }

  // ③ 系統交差表ルールで決まった系統で、父母のうち位階が低いものより位階が1つ高い系統のモンスター
  const crossedFamily = FAMILY_CROSS_TABLE[parentA.family]?.[parentB.family];
  if (crossedFamily) {
    const choice3 = findNextHighestMonster(crossedFamily, lowerLevel);
    if (choice3) {
      choices.push({
        type: "系統交差配合",
        description: `系統法則(${parentA.family}×${parentB.family}＝${crossedFamily})で、位階の低い親(${lowerLevel}基準)より上のモンスター`,
        monster: choice3
      });
    }
  }

  return {
    special: null,
    choices: choices
  };
}

// 逆引き検索：指定のモンスターを生み出すことができる親ペアの一覧を取得する
let allParentsCache = null;

function buildParentsCache() {
  const cache = new Map();
  MONSTERS.forEach(m => cache.set(m.name, []));

  // 1. 特殊配合の逆引き
  SPECIAL_RECIPES.forEach(recipe => {
    const parentAObj = monsterMap.get(recipe.parentA);
    const parentBObj = monsterMap.get(recipe.parentB);
    if (parentAObj && parentBObj) {
      const list = cache.get(recipe.child);
      if (list) {
        list.push({
          parentA: parentAObj,
          parentB: parentBObj,
          type: "特殊配合",
          isSpecial: true
        });
      }
    }
  });

  // 4体配合の逆引き
  QUAD_SPECIAL_RECIPES.forEach(recipe => {
    const grandparentsObjs = recipe.grandparents.map(gpName => monsterMap.get(gpName)).filter(Boolean);
    if (grandparentsObjs.length === 4) {
      const list = cache.get(recipe.child);
      if (list) {
        list.push({
          grandparents: grandparentsObjs,
          type: `4体配合 (${recipe.name})`,
          isQuad: true
        });
      }
    }
  });

  // 2. 位階配合の全探索逆引き
  for (let i = 0; i < MONSTERS.length; i++) {
    const pA = MONSTERS[i];
    for (let j = i; j < MONSTERS.length; j++) {
      const pB = MONSTERS[j];
      
      // 特殊配合の親同士は除く（特殊配合が優先されるため）
      const childName = specialRecipeMap.get(`${pA.name}_${pB.name}`);
      if (childName) {
        continue;
      }

      const simResult = simulateFusion(pA, pB);
      if (!simResult) continue;

      // 生まれる候補のモンスターをキャッシュの対応する場所にプッシュ
      simResult.choices.forEach(choice => {
        const list = cache.get(choice.monster.name);
        if (list) {
          list.push({
            parentA: pA,
            parentB: pB,
            type: pA.name === pB.name ? "同一モンスター配合" : (pA.family === pB.family ? "同系統配合" : "位階配合"),
            isSpecial: false
          });
        }
      });
    }
  }

  allParentsCache = cache;
}

export function findParentsFor(targetMonster) {
  if (!targetMonster) return [];
  if (!allParentsCache) {
    buildParentsCache();
  }
  return allParentsCache.get(targetMonster.name) || [];
}
