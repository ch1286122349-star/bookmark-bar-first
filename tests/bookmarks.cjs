const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../extension/background.js','utf8');
function setup(){
 const events={}, moves=[], errors=[];
 const nodes={ '1':{id:'1',parentId:'0'}, bar2:{id:'bar2',parentId:'0',folderType:'bookmarks-bar'}, other:{id:'other',parentId:'0',folderType:'other'}, nested:{id:'nested',parentId:'1'}};
 const api={get:async id=>nodes[id]?[{...nodes[id]}]:Promise.reject(Error('已删除')),
 move:async(id,d)=>{moves.push({id,...d});Object.assign(nodes[id],d);events.onMoved(id,{...d,oldParentId:d.parentId});}};
 for(const k of ['onCreated','onMoved','onImportBegan','onImportEnded']) api[k]={addListener:fn=>events[k]=fn};
 const ctx=vm.createContext({chrome:{bookmarks:api},console:{error:(...x)=>errors.push(x)}});vm.runInContext(source,ctx);
 return {nodes,events,moves,errors,flush:()=>vm.runInContext('queue',ctx),create(id,parentId,index=8,url='https://example.com'){nodes[id]={id,parentId,index,url};events.onCreated(id,{...nodes[id]});}};
}
(async()=>{
 let s=setup();s.create('a','1');await s.flush();assert.equal(s.nodes.a.index,0);
 s.create('b','bar2');await s.flush();assert.equal(s.nodes.b.index,0);
 s.create('c','other',0);await s.flush();assert.equal(s.moves.length,2);
 Object.assign(s.nodes.c,{parentId:'1',index:12});s.events.onMoved('c',{parentId:'1',oldParentId:'other'});await s.flush();assert.equal(s.nodes.c.index,0);
 s.create('d','nested');await s.flush();assert.equal(s.moves.length,3);
 s.create('folder','1',3,null);await s.flush();assert.equal(s.moves.length,3);
 s.events.onImportBegan();s.create('import','1');await s.flush();assert.equal(s.nodes.import.index,8);s.events.onImportEnded();
 s.nodes.a.index=7;s.events.onMoved('a',{parentId:'1',oldParentId:'1'});await s.flush();assert.equal(s.nodes.a.index,7);
 s.create('gone','1');delete s.nodes.gone;await s.flush();assert.equal(s.errors.length,1);
 s.create('next','1');await s.flush();assert.equal(s.nodes.next.index,0);
 s=setup();s.create('cold','1');await s.flush();assert.equal(s.nodes.cold.index,0);
 console.log('回归通过：本地/账号双书签栏、先建后移、子文件夹不动、导入跳过、手动排序、删除竞态、异常后续跑、冷启动。');
})();
