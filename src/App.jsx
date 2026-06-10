import React, { useState, useMemo } from "react";
import { MONSTERS, FAMILIES, RANKS, SPECIAL_RECIPES } from "./monsterData";
import { simulateFusion, findParentsFor } from "./fusionEngine";
import { 
  Search, 
  Layers, 
  HelpCircle, 
  GitFork, 
  X, 
  Plus, 
  ArrowRight,
  Info
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("fusion"); // fusion, monsters, reverse, special
  const [searchQuery, setSearchQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");
  
  // 配合用ステート
  const [parentA, setParentA] = useState(null);
  const [parentB, setParentB] = useState(null);
  const [selectingParent, setSelectingParent] = useState(null); // 'A' or 'B'
  
  // 詳細表示モンスター
  const [selectedMonster, setSelectedMonster] = useState(null);
  
  // 逆引きターゲット
  const [reverseTarget, setReverseTarget] = useState(null);

  // 逆引き親ペアのメモ化
  const reverseParents = useMemo(() => {
    return findParentsFor(reverseTarget);
  }, [reverseTarget]);

  // フィルタリングされたモンスター
  const filteredMonsters = useMemo(() => {
    return MONSTERS.filter(m => {
      const matchQuery = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFamily = familyFilter === "all" || m.family === familyFilter;
      const matchRank = rankFilter === "all" || m.rank === rankFilter;
      return matchQuery && matchFamily && matchRank;
    }).sort((a, b) => a.level - b.level);
  }, [searchQuery, familyFilter, rankFilter]);

  // 現在の配合結果シミュレーション
  const fusionResult = useMemo(() => {
    if (parentA && parentB) {
      return simulateFusion(parentA, parentB);
    }
    return null;
  }, [parentA, parentB]);

  // モンスター選択処理
  const handleSelectMonster = (monster) => {
    if (selectingParent === "A") {
      setParentA(monster);
      setSelectingParent(null);
    } else if (selectingParent === "B") {
      setParentB(monster);
      setSelectingParent(null);
    }
  };

  // 逆引き検索を実行してタブを切り替える
  const triggerReverseSearch = (monster) => {
    setReverseTarget(monster);
    setActiveTab("reverse");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          <span>⚔️</span> DQMテリーSP 配合シミュレータ
        </h1>
        <p className="app-subtitle">位階配合・特殊配合を完全シミュレート</p>
      </header>

      {/* タブナビゲーション */}
      <nav className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === "fusion" ? "active" : ""}`}
          onClick={() => setActiveTab("fusion")}
        >
          <Layers size={16} /> 配合シミュレータ
        </button>
        <button 
          className={`tab-btn ${activeTab === "monsters" ? "active" : ""}`}
          onClick={() => setActiveTab("monsters")}
        >
          <Search size={16} /> モンスター図鑑
        </button>
        <button 
          className={`tab-btn ${activeTab === "reverse" ? "active" : ""}`}
          onClick={() => setActiveTab("reverse")}
        >
          <GitFork size={16} /> 逆引き配合
        </button>
        <button 
          className={`tab-btn ${activeTab === "special" ? "active" : ""}`}
          onClick={() => setActiveTab("special")}
        >
          <HelpCircle size={16} /> 特殊配合一覧
        </button>
      </nav>

      {/* メインコンテンツ */}
      <main className="main-content">
        
        {/* Tab 1: 配合シミュレータ */}
        {activeTab === "fusion" && (
          <div className="section-panel">
            <h2 style={{ marginBottom: "16px", color: "var(--accent-color)" }}>配合シミュレーション</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>
              父親と母親となるモンスターを選択してください。位階・系統に基づいた位階配合、および特殊配合を自動判定します。
            </p>

            <div className="fusion-workspace">
              {/* 親A */}
              <div 
                className={`parent-slot ${parentA ? "selected" : ""}`}
                onClick={() => setSelectingParent("A")}
              >
                {parentA ? (
                  <div>
                    <span className={`family-badge family-${Object.keys(FAMILIES).find(k => FAMILIES[k] === parentA.family)?.toLowerCase()}`}>
                      {parentA.family}
                    </span>
                    <h3 style={{ margin: "10px 0 6px 0" }}>{parentA.name}</h3>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                      <span className={`rank-badge rank-${parentA.rank}`}>{parentA.rank}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>位階: {parentA.level}</span>
                    </div>
                  </div>
                ) : (
                  <div className="parent-slot-placeholder">
                    <Plus size={36} />
                    <span>親A (父親) を選択</span>
                  </div>
                )}
                {parentA && (
                  <button 
                    style={{ marginTop: "12px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem", textDecoration: "underline" }}
                    onClick={(e) => { e.stopPropagation(); setParentA(null); }}
                  >
                    変更する
                  </button>
                )}
              </div>

              {/* VS */}
              <div className="fusion-vs">×</div>

              {/* 親B */}
              <div 
                className={`parent-slot ${parentB ? "selected" : ""}`}
                onClick={() => setSelectingParent("B")}
              >
                {parentB ? (
                  <div>
                    <span className={`family-badge family-${Object.keys(FAMILIES).find(k => FAMILIES[k] === parentB.family)?.toLowerCase()}`}>
                      {parentB.family}
                    </span>
                    <h3 style={{ margin: "10px 0 6px 0" }}>{parentB.name}</h3>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                      <span className={`rank-badge rank-${parentB.rank}`}>{parentB.rank}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>位階: {parentB.level}</span>
                    </div>
                  </div>
                ) : (
                  <div className="parent-slot-placeholder">
                    <Plus size={36} />
                    <span>親B (母親) を選択</span>
                  </div>
                )}
                {parentB && (
                  <button 
                    style={{ marginTop: "12px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem", textDecoration: "underline" }}
                    onClick={(e) => { e.stopPropagation(); setParentB(null); }}
                  >
                    変更する
                  </button>
                )}
              </div>
            </div>

            {/* モンスター選択用パネル（選択中のみ表示） */}
            {selectingParent && (
              <div style={{ border: "1px solid var(--accent-color)", padding: "16px", borderRadius: "12px", backgroundColor: "rgba(0,0,0,0.3)", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ color: "var(--accent-color)" }}>
                    親{selectingParent}を選択中
                  </h4>
                  <button onClick={() => setSelectingParent(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                    <X size={18} />
                  </button>
                </div>
                
                <div className="search-filter-bar">
                  <div className="search-input-wrapper">
                    <Search className="search-icon" size={16} />
                    <input 
                      type="text" 
                      placeholder="名前・説明で検索..." 
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select className="filter-select" value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)}>
                    <option value="all">すべての系統</option>
                    {Object.values(FAMILIES).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <select className="filter-select" value={rankFilter} onChange={(e) => setRankFilter(e.target.value)}>
                    <option value="all">すべてのランク</option>
                    {Object.values(RANKS).map(r => (
                      <option key={r} value={r}>ランク {r}</option>
                    ))}
                  </select>
                </div>

                <div className="monster-list" style={{ maxHeight: "250px" }}>
                  {filteredMonsters.map(m => (
                    <div 
                      key={m.id} 
                      className="monster-list-item"
                      onClick={() => handleSelectMonster(m)}
                    >
                      <div className="monster-list-item-info">
                        <div className="monster-name">{m.name}</div>
                        <div className="monster-meta">
                          <span className={`family-badge family-${Object.keys(FAMILIES).find(k => FAMILIES[k] === m.family)?.toLowerCase()}`}>
                            {m.family}
                          </span>
                          <span className={`rank-badge rank-${m.rank}`}>{m.rank}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>位階:{m.level}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredMonsters.length === 0 && (
                    <div className="empty-state">該当するモンスターが見つかりません。</div>
                  )}
                </div>
              </div>
            )}

            {/* 配合結果 */}
            {fusionResult && (
              <div className="fusion-result-container">
                <h3 style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🔮</span> 配合結果候補
                </h3>

                {fusionResult.special ? (
                  <div className="result-card-grid" style={{ gridTemplateColumns: "1fr" }}>
                    <div 
                      className="result-card special-result"
                      onClick={() => setSelectedMonster(fusionResult.special)}
                    >
                      <div className="result-badge">特殊配合</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span className={`family-badge family-${Object.keys(FAMILIES).find(k => FAMILIES[k] === fusionResult.special.family)?.toLowerCase()}`}>
                            {fusionResult.special.family}
                          </span>
                          <h4 style={{ margin: "8px 0 4px 0", fontSize: "1.2rem" }}>{fusionResult.special.name}</h4>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>位階: {fusionResult.special.level}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className={`rank-badge rank-${fusionResult.special.rank}`} style={{ transform: "scale(1.2)" }}>
                            {fusionResult.special.rank}
                          </span>
                        </div>
                      </div>
                      <p style={{ marginTop: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {fusionResult.special.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="result-card-grid">
                    {fusionResult.choices.map((choice, idx) => (
                      <div 
                        key={idx}
                        className="result-card"
                        onClick={() => setSelectedMonster(choice.monster)}
                      >
                        <div className="result-badge" style={{ backgroundColor: "#2e3748", color: "#fff" }}>
                          {choice.type}
                        </div>
                        <span className={`family-badge family-${Object.keys(FAMILIES).find(k => FAMILIES[k] === choice.monster.family)?.toLowerCase()}`}>
                          {choice.monster.family}
                        </span>
                        <h4 style={{ margin: "8px 0 4px 0", fontSize: "1.1rem" }}>{choice.monster.name}</h4>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>位階: {choice.monster.level}</span>
                          <span className={`rank-badge rank-${choice.monster.rank}`}>{choice.monster.rank}</span>
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px" }}>
                          {choice.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: モンスター図鑑 */}
        {activeTab === "monsters" && (
          <div className="section-panel">
            <h2 style={{ marginBottom: "16px", color: "var(--accent-color)" }}>モンスター図鑑</h2>
            
            <div className="search-filter-bar">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={16} />
                <input 
                  type="text" 
                  placeholder="モンスター名や説明、特徴で検索..." 
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select className="filter-select" value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)}>
                <option value="all">すべての系統</option>
                {Object.values(FAMILIES).map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <select className="filter-select" value={rankFilter} onChange={(e) => setRankFilter(e.target.value)}>
                <option value="all">すべてのランク</option>
                {Object.values(RANKS).map(r => (
                  <option key={r} value={r}>ランク {r}</option>
                ))}
              </select>
            </div>

            <div className="result-card-grid">
              {filteredMonsters.map(m => (
                <div 
                  key={m.id} 
                  className="result-card"
                  onClick={() => setSelectedMonster(m)}
                >
                  <span className={`family-badge family-${Object.keys(FAMILIES).find(k => FAMILIES[k] === m.family)?.toLowerCase()}`}>
                    {m.family}
                  </span>
                  <h4 style={{ margin: "8px 0 4px 0", fontSize: "1.1rem" }}>{m.name}</h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>位階: {m.level}</span>
                    <span className={`rank-badge rank-${m.rank}`}>{m.rank}</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {m.description}
                  </p>
                </div>
              ))}
              {filteredMonsters.length === 0 && (
                <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                  条件に該当するモンスターが登録されていません。
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: 逆引き配合 */}
        {activeTab === "reverse" && (
          <div className="section-panel">
            <h2 style={{ marginBottom: "16px", color: "var(--accent-color)" }}>逆引き配合検索</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>
              生み出したいモンスターを一覧から選択してください。配合に必要な親の組み合わせを表示します。
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* モンスター選択 */}
              <div style={{ borderRight: "1px solid var(--border-color)", paddingRight: "16px" }}>
                <div className="search-filter-bar" style={{ flexDirection: "column" }}>
                  <div className="search-input-wrapper" style={{ width: "100%" }}>
                    <Search className="search-icon" size={16} />
                    <input 
                      type="text" 
                      placeholder="モンスターを検索..." 
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="monster-list" style={{ maxHeight: "450px" }}>
                  {filteredMonsters.map(m => (
                    <div 
                      key={m.id} 
                      className={`monster-list-item ${reverseTarget?.id === m.id ? "selected" : ""}`}
                      style={reverseTarget?.id === m.id ? { borderColor: "var(--accent-color)", backgroundColor: "rgba(229,169,59,0.05)" } : {}}
                      onClick={() => setReverseTarget(m)}
                    >
                      <div className="monster-list-item-info">
                        <div className="monster-name">{m.name}</div>
                        <div className="monster-meta">
                          <span className={`family-badge family-${Object.keys(FAMILIES).find(k => FAMILIES[k] === m.family)?.toLowerCase()}`}>
                            {m.family}
                          </span>
                          <span className={`rank-badge rank-${m.rank}`}>{m.rank}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>位階:{m.level}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 配合候補の表示 */}
              <div>
                {reverseTarget ? (
                  <div>
                    <h3 style={{ marginBottom: "12px" }}>
                      <span className={`rank-badge rank-${reverseTarget.rank}`} style={{ marginRight: "8px" }}>{reverseTarget.rank}</span>
                      {reverseTarget.name} の作り方
                    </h3>

                    {(() => {
                      const parents = reverseParents;
                      if (parents.length === 0) {
                        return (
                          <div className="empty-state">
                            このモンスターは位階配合や現在の登録レシピからは直接配合できません。（野生のみ、またはより複雑な配合が必要）
                          </div>
                        );
                      }
                      return (
                        <div className="parents-list">
                          {parents.map((p, idx) => (
                            <div key={idx} className="parent-pair-card">
                              {p.isQuad ? (
                                <div style={{ width: "100%" }}>
                                  <div style={{ color: "var(--accent-color)", fontSize: "0.75rem", fontWeight: "bold", marginBottom: "4px" }}>
                                    {p.type}
                                  </div>
                                  <div className="grandparent-grid">
                                    {p.grandparents.map((gp, gidx) => (
                                      <div 
                                        key={gidx} 
                                        className="parent-mini-card clickable-text"
                                        onClick={() => setSelectedMonster(gp)}
                                      >
                                        <span className={`rank-badge rank-${gp.rank}`} style={{ fontSize: "0.6rem", width: "16px", height: "16px", lineHeight: "16px" }}>
                                          {gp.rank}
                                        </span>
                                        {gp.name}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="parent-pair-visual">
                                    <div 
                                      className="parent-mini-card clickable-text"
                                      onClick={() => setSelectedMonster(p.parentA)}
                                    >
                                      <span className={`rank-badge rank-${p.parentA.rank}`} style={{ fontSize: "0.65rem", width: "18px", height: "18px", lineHeight: "18px" }}>
                                        {p.parentA.rank}
                                      </span>
                                      {p.parentA.name}
                                    </div>
                                    <span style={{ color: "var(--text-muted)" }}>+</span>
                                    <div 
                                      className="parent-mini-card clickable-text"
                                      onClick={() => setSelectedMonster(p.parentB)}
                                    >
                                      <span className={`rank-badge rank-${p.parentB.rank}`} style={{ fontSize: "0.65rem", width: "18px", height: "18px", lineHeight: "18px" }}>
                                        {p.parentB.rank}
                                      </span>
                                      {p.parentB.name}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: "0.75rem", color: p.isSpecial ? "var(--accent-color)" : "var(--text-muted)", fontWeight: p.isSpecial ? "bold" : "normal" }}>
                                    {p.type}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="empty-state" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <GitFork size={40} style={{ color: "var(--border-color)", marginBottom: "12px" }} />
                    <span>左側のリストからモンスターを選んでください。</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: 特殊配合一覧 */}
        {activeTab === "special" && (
          <div className="section-panel">
            <h2 style={{ marginBottom: "16px", color: "var(--accent-color)" }}>特殊配合レシピ一覧</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>
              特定のペアを組み合わせることで誕生する強力なモンスターのレシピです。
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {SPECIAL_RECIPES.map((recipe, idx) => {
                const parentAObj = MONSTERS.find(m => m.id === recipe.parentA);
                const parentBObj = MONSTERS.find(m => m.id === recipe.parentB);
                const childObj = MONSTERS.find(m => m.id === recipe.child);

                if (!parentAObj || !parentBObj || !childObj) return null;

                return (
                  <div key={idx} className="result-card special-result" style={{ cursor: "default" }}>
                    <div className="result-badge">特殊配合</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      
                      {/* 親の組み合わせ */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div 
                          className="parent-mini-card clickable-text"
                          onClick={() => setSelectedMonster(parentAObj)}
                        >
                          <span className={`rank-badge rank-${parentAObj.rank}`} style={{ fontSize: "0.65rem", width: "18px", height: "18px", lineHeight: "18px" }}>
                            {parentAObj.rank}
                          </span>
                          {parentAObj.name}
                        </div>
                        <span style={{ color: "var(--accent-color)" }}>×</span>
                        <div 
                          className="parent-mini-card clickable-text"
                          onClick={() => setSelectedMonster(parentBObj)}
                        >
                          <span className={`rank-badge rank-${parentBObj.rank}`} style={{ fontSize: "0.65rem", width: "18px", height: "18px", lineHeight: "18px" }}>
                            {parentBObj.rank}
                          </span>
                          {parentBObj.name}
                        </div>
                      </div>

                      {/* 矢印 */}
                      <div style={{ display: "flex", justifyContent: "center", color: "var(--accent-color)" }}>
                        <ArrowRight size={16} style={{ transform: "rotate(90deg)" }} />
                      </div>

                      {/* 生まれる子供 */}
                      <div 
                        className="parent-mini-card clickable-text" 
                        style={{ border: "1px solid var(--accent-color)", width: "100%", justifyContent: "center", padding: "8px", backgroundColor: "rgba(229,169,59,0.05)" }}
                        onClick={() => setSelectedMonster(childObj)}
                      >
                        <span className={`rank-badge rank-${childObj.rank}`} style={{ fontSize: "0.75rem", width: "22px", height: "22px", lineHeight: "22px" }}>
                          {childObj.rank}
                        </span>
                        <span style={{ fontSize: "1rem", fontWeight: "bold" }}>{childObj.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* モンスター詳細ダイアログ (モーダル) */}
      {selectedMonster && (
        <div className="modal-overlay" onClick={() => setSelectedMonster(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>モンスター詳細</h3>
              <button className="modal-close-btn" onClick={() => setSelectedMonster(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <span className={`family-badge family-${Object.keys(FAMILIES).find(k => FAMILIES[k] === selectedMonster.family)?.toLowerCase()}`}>
                    {selectedMonster.family}
                  </span>
                  <h2 style={{ marginTop: "8px", fontSize: "1.6rem", fontWeight: "700" }}>{selectedMonster.name}</h2>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>基準位階: {selectedMonster.level}</span>
                </div>
                <span className={`rank-badge rank-${selectedMonster.rank}`} style={{ transform: "scale(1.4)" }}>
                  {selectedMonster.rank}
                </span>
              </div>

              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", backgroundColor: "rgba(0,0,0,0.15)", padding: "12px", borderRadius: "8px", borderLeft: "4px solid var(--accent-color)" }}>
                {selectedMonster.description}
              </p>

              <h4 style={{ margin: "20px 0 8px 0", color: "var(--accent-color)" }}>ステータス適正</h4>
              <div className="status-grid">
                <div className="status-item">
                  <div className="status-label">HP</div>
                  <div className="status-value">{selectedMonster.hp}</div>
                </div>
                <div className="status-item">
                  <div className="status-label">MP</div>
                  <div className="status-value">{selectedMonster.mp}</div>
                </div>
                <div className="status-item">
                  <div className="status-label">攻撃力</div>
                  <div className="status-value">{selectedMonster.atk}</div>
                </div>
                <div className="status-item">
                  <div className="status-label">守備力</div>
                  <div className="status-value">{selectedMonster.def}</div>
                </div>
                <div className="status-item">
                  <div className="status-label">すばやさ</div>
                  <div className="status-value">{selectedMonster.agi}</div>
                </div>
                <div className="status-item">
                  <div className="status-label">かしこさ</div>
                  <div className="status-value">{selectedMonster.wis}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button 
                  className="tab-btn" 
                  style={{ border: "1px solid var(--border-color)", padding: "8px 12px" }}
                  onClick={() => {
                    setParentA(selectedMonster);
                    setActiveTab("fusion");
                    setSelectedMonster(null);
                  }}
                >
                  親Aに設定
                </button>
                <button 
                  className="tab-btn" 
                  style={{ border: "1px solid var(--border-color)", padding: "8px 12px" }}
                  onClick={() => {
                    setParentB(selectedMonster);
                    setActiveTab("fusion");
                    setSelectedMonster(null);
                  }}
                >
                  親Bに設定
                </button>
                <button 
                  className="tab-btn active" 
                  style={{ padding: "8px 12px" }}
                  onClick={() => {
                    triggerReverseSearch(selectedMonster);
                    setSelectedMonster(null);
                  }}
                >
                  作り方を調べる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
