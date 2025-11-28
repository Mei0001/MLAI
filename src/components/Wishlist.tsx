'use client';

import { useState, useEffect } from 'react';
import { WishlistItem, WishlistBudget } from '@/types';
import { wishlistStorage } from '@/lib/storage';
import { calculateWishlistPriority } from '@/lib/ai';

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [budget, setBudget] = useState<WishlistBudget>({
    total: 50000,
    spent: 0,
    remaining: 50000,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    enthusiasm: 5,
    category: '',
    url: '',
  });
  const [sortBy, setSortBy] = useState<'priority' | 'price' | 'enthusiasm'>('priority');

  useEffect(() => {
    setItems(wishlistStorage.getAll());
    setBudget(wishlistStorage.getBudget());
  }, []);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const handleAddItem = () => {
    if (!newItem.name.trim() || newItem.price <= 0) return;

    const item: WishlistItem = {
      id: generateId(),
      name: newItem.name,
      description: newItem.description,
      price: newItem.price,
      enthusiasm: newItem.enthusiasm,
      category: newItem.category || 'その他',
      url: newItem.url,
      priorityScore: calculateWishlistPriority(newItem.enthusiasm, newItem.price, budget.remaining),
      status: 'wanted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    wishlistStorage.save(item);
    setItems([...items, item]);
    setShowAddForm(false);
    setNewItem({
      name: '',
      description: '',
      price: 0,
      enthusiasm: 5,
      category: '',
      url: '',
    });
  };

  const handlePurchase = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    wishlistStorage.updateStatus(id, 'purchased');
    
    const newSpent = budget.spent + item.price;
    const newBudget = {
      ...budget,
      spent: newSpent,
      remaining: budget.total - newSpent,
    };
    wishlistStorage.saveBudget(newBudget);
    setBudget(newBudget);
    
    setItems(items.map(i => 
      i.id === id ? { ...i, status: 'purchased' } : i
    ));
  };

  const handleRemove = (id: string) => {
    wishlistStorage.delete(id);
    setItems(items.filter(i => i.id !== id));
  };

  const handleBudgetChange = (total: number) => {
    const newBudget = {
      ...budget,
      total,
      remaining: total - budget.spent,
    };
    wishlistStorage.saveBudget(newBudget);
    setBudget(newBudget);
    
    // Recalculate priorities
    const updatedItems = items.map(item => ({
      ...item,
      priorityScore: calculateWishlistPriority(item.enthusiasm, item.price, newBudget.remaining),
    }));
    updatedItems.forEach(item => wishlistStorage.save(item));
    setItems(updatedItems);
  };

  const sortedItems = [...items]
    .filter(i => i.status === 'wanted')
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return (b.priorityScore || 0) - (a.priorityScore || 0);
        case 'price':
          return a.price - b.price;
        case 'enthusiasm':
          return b.enthusiasm - a.enthusiasm;
        default:
          return 0;
      }
    });

  const purchasedItems = items.filter(i => i.status === 'purchased');

  const getPriorityColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getPriorityBg = (score: number) => {
    if (score >= 70) return 'bg-emerald-500/20';
    if (score >= 40) return 'bg-amber-500/20';
    return 'bg-rose-500/20';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-300">予算管理</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">総予算:</span>
            <input
              type="number"
              value={budget.total}
              onChange={(e) => handleBudgetChange(Number(e.target.value))}
              className="w-28 px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">使用済み</span>
            <span className="text-rose-400">{formatPrice(budget.spent)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">残り予算</span>
            <span className="text-emerald-400">{formatPrice(budget.remaining)}</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (budget.spent / budget.total) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sort & Add Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['priority', 'price', 'enthusiasm'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                sortBy === sort
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
              }`}
            >
              {sort === 'priority' ? '優先度順' : sort === 'price' ? '価格順' : '熱意順'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          追加
        </button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">ウィッシュリストに追加</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">アイテム名 *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="欲しいもの..."
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">説明</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="詳細..."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">価格 *</label>
                  <input
                    type="number"
                    value={newItem.price || ''}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">カテゴリ</label>
                  <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    placeholder="電子機器..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  熱意レベル: {newItem.enthusiasm}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newItem.enthusiasm}
                  onChange={(e) => setNewItem({ ...newItem, enthusiasm: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>少し欲しい</span>
                  <span>とても欲しい</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">URL</label>
                <input
                  type="url"
                  value={newItem.url}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItem.name.trim() || newItem.price <= 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-xl transition-all"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Items */}
      <div className="space-y-3">
        {sortedItems.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p>ウィッシュリストは空です</p>
          </div>
        ) : (
          sortedItems.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/50 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Priority Score */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getPriorityBg(item.priorityScore || 0)}`}>
                  <span className={`text-lg font-bold ${getPriorityColor(item.priorityScore || 0)}`}>
                    {item.priorityScore || 0}
                  </span>
                </div>
                
                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-slate-200">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                      )}
                    </div>
                    <span className="text-lg font-semibold text-slate-200 whitespace-nowrap">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs px-2 py-1 bg-slate-700/50 rounded-md text-slate-400">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">熱意:</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-3 rounded-full ${
                              i < item.enthusiasm ? 'bg-indigo-500' : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        リンク →
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handlePurchase(item.id)}
                    disabled={item.price > budget.remaining}
                    className="px-3 py-1.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    購入済み
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="px-3 py-1.5 text-xs bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 transition-all"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Purchased Items */}
      {purchasedItems.length > 0 && (
        <div className="pt-4 border-t border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-400 mb-3">購入済み ({purchasedItems.length})</h3>
          <div className="space-y-2">
            {purchasedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-800/20 border border-slate-700/30 rounded-xl flex items-center justify-between opacity-60"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-400 line-through">{item.name}</span>
                </div>
                <span className="text-sm text-slate-500">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
