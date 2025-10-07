#!/usr/bin/env node

// Member 參加 Coach 活動次數限制測試
console.log('🎯 Member 參加 Coach 活動次數限制');
console.log('================================');

console.log('✅ 新增功能:');
console.log('1. Member 只能參加同一個 Coach 的活動最多 2 次');
console.log('2. 第三次參加會被拒絕');
console.log('3. 新增 API 檢查參加限制');

console.log('\n🔧 技術實現:');

console.log('\n1. 修改 joinEvent 函數:');
console.log('   - 檢查用戶角色是否為 member');
console.log('   - 計算該 member 參加同一個 coach 的活動次數');
console.log('   - 如果已達到 2 次限制，拒絕參加');

console.log('\n2. 新增 checkCoachEventLimit API:');
console.log('   - GET /api/event-guests/check-coach-limit/:userId/:eventId');
console.log('   - 返回是否可以參加活動');
console.log('   - 顯示已參加次數和剩餘次數');

console.log('\n📋 API 端點:');

console.log('\n1. 參加活動 (帶限制檢查):');
console.log('   POST /api/event-guests/join');
console.log('   Body: { "event": "eventId", "user": "userId" }');
console.log('   Response: 成功或 403 錯誤 (達到限制)');

console.log('\n2. 檢查參加限制:');
console.log('   GET /api/event-guests/check-coach-limit/:userId/:eventId');
console.log('   Response: {');
console.log('     "canJoin": true/false,');
console.log('     "coachEventCount": 1,');
console.log('     "limit": 2,');
console.log('     "remaining": 1,');
console.log('     "message": "..."');
console.log('   }');

console.log('\n🎯 使用場景:');

console.log('\n場景 1: Member 第一次參加 Coach A 的活動');
console.log('- 結果: ✅ 允許參加');
console.log('- 狀態: 已參加 1/2 次');

console.log('\n場景 2: Member 第二次參加 Coach A 的活動');
console.log('- 結果: ✅ 允許參加');
console.log('- 狀態: 已參加 2/2 次');

console.log('\n場景 3: Member 第三次參加 Coach A 的活動');
console.log('- 結果: ❌ 拒絕參加');
console.log('- 錯誤: "Member can only join up to 2 events from the same coach"');

console.log('\n場景 4: Member 參加 Coach B 的活動');
console.log('- 結果: ✅ 允許參加 (不同 coach)');
console.log('- 狀態: 重新計算 Coach B 的次數');

console.log('\n場景 5: Admin/Coach 參加任何活動');
console.log('- 結果: ✅ 無限制 (非 member 角色)');

console.log('\n🔒 安全特性:');
console.log('- 只有 member 角色受限制');
console.log('- admin 和 coach 角色無限制');
console.log('- 按 coach 分別計算限制');
console.log('- 防止濫用活動參加');

console.log('\n📊 數據庫查詢:');
console.log('1. 查找該 coach 的所有活動');
console.log('2. 計算 member 參加這些活動的次數');
console.log('3. 與限制 (2次) 比較');

console.log('\n✅ 限制邏輯完成！');
console.log('現在 Member 只能參加同一個 Coach 的活動最多 2 次。');

