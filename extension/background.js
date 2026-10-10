'use strict';

let importing = false;
let queue = Promise.resolve();

function enqueue(id) {
  queue = queue.then(async () => {
    if (importing) return;
    const [node] = await chrome.bookmarks.get(id);
    if (!node?.url || node.unmodifiable || !node.parentId) return;
    const [parent] = await chrome.bookmarks.get(node.parentId);
    // 使用实际保存目录，不依赖目录名称、层级或书签栏类型。
    if (!parent || parent.unmodifiable || parent.id === '0' || importing) return;
    const [latest] = await chrome.bookmarks.get(id);
    if (!latest || latest.parentId !== parent.id || latest.index === 0) return;
    await chrome.bookmarks.move(id, { parentId: parent.id, index: 0 });
    const [saved] = await chrome.bookmarks.get(id);
    if (saved?.parentId === parent.id && saved.index !== 0) {
      throw new Error('书签移动后没有位于第一位');
    }
  }).catch(error => console.error('书签置顶失败：', error));
}

chrome.bookmarks.onImportBegan.addListener(() => { importing = true; });
chrome.bookmarks.onImportEnded.addListener(() => { importing = false; });
chrome.bookmarks.onCreated.addListener((id, node) => {
  if (!importing && node.url && !node.unmodifiable) enqueue(id);
});
// 星标弹窗选择文件夹可能发生在创建之后，必须处理最终目录变化。
// 同目录拖动不处理，避免干扰手动排序或触发循环。
chrome.bookmarks.onMoved.addListener((id, info) => {
  if (!importing && info.parentId !== info.oldParentId) enqueue(id);
});
