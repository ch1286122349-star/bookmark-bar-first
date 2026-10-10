'use strict';

let importing = false;
let queue = Promise.resolve();

function enqueue(id) {
  queue = queue.then(async () => {
    if (importing) return;
    const [node] = await chrome.bookmarks.get(id);
    if (!node?.url || node.unmodifiable || !node.parentId) return;
    const [parent] = await chrome.bookmarks.get(node.parentId);
    // 按当前父目录判断，兼容同时存在本地和账号书签栏。
    const isBar = parent?.folderType === 'bookmarks-bar'
      || (!parent?.folderType && parent?.id === '1' && parent?.parentId === '0');
    if (!isBar || parent.unmodifiable || importing) return;
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
// 星标弹窗选择书签栏可能发生在创建之后，必须处理最终目录变化。
// 同目录拖动不处理，避免干扰手动排序或触发循环。
chrome.bookmarks.onMoved.addListener((id, info) => {
  if (!importing && info.parentId !== info.oldParentId) enqueue(id);
});
