import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import coreURL from '@ffmpeg/core?url';
import wasmURL from '@ffmpeg/core/wasm?url';

const $=id=>document.getElementById(id);
const input=$('audio'),convert=$('convert'),status=$('status'),bar=$('bar'),save=$('save'),bitDepth=$('bitDepth');
let selected=null,ffmpeg=null,outputUrl=null,busy=false,stage='待機',logs=[];
const log=m=>{logs.push(`[${new Date().toLocaleTimeString()}] ${String(m)}`);if(logs.length>100)logs.shift();};
const say=m=>{status.textContent=m;log(m);};
function fail(e){
 const details=[`段階: ${stage}`,`エラー: ${e?.message||String(e)}`,`種類: ${e?.name||'不明'}`,e?.stack||'',`URL: ${location.href}`,`ブラウザ: ${navigator.userAgent}`,'直近ログ:',...logs.slice(-40)].filter(Boolean).join('\n');
 $('errorText').textContent=details;$('errorBox').classList.add('show');log(`ERROR ${e?.message||e}`);
}
input.addEventListener('change',()=>{
 selected=input.files?.[0]||null;save.classList.remove('show');$('errorBox').classList.remove('show');
 if(outputUrl){URL.revokeObjectURL(outputUrl);outputUrl=null;}
 if(!selected){$('fileInfo').classList.remove('show');convert.disabled=true;return;}
 $('fileInfo').textContent=`${selected.name} · ${(selected.size/1048576).toFixed(2)} MB`;$('fileInfo').classList.add('show');
 if(!selected.name.toLowerCase().endsWith('.wav')){say('WAVファイルを選択してください。');convert.disabled=true;return;}
 if(selected.size>80*1048576){say('80MBを超えています。');convert.disabled=true;return;}
 say('準備完了。変換開始を押してください。');convert.disabled=false;
});
async function engine(){
 if(ffmpeg?.loaded)return;
 stage='FFmpegモジュール読み込み';say('変換エンジンを読み込んでいます…');
 ffmpeg=new FFmpeg();
 ffmpeg.on('log',({message})=>log(`FFmpeg: ${message}`));
 ffmpeg.on('progress',({progress})=>{if(Number.isFinite(progress))bar.style.width=`${Math.min(99,Math.max(0,progress*100))}%`;});
 stage='Worker/Core読み込み';say('端末内の変換エンジンを起動しています…');
 // Both core JS and WASM are emitted as same-origin build assets, not fetched from a CDN.
 await ffmpeg.load({coreURL,wasmURL});
 return {fetchFile};
}
convert.addEventListener('click',async()=>{
 if(!selected||busy)return;busy=true;convert.disabled=true;save.classList.remove('show');$('errorBox').classList.remove('show');bar.style.width='0%';logs=[];
 const src='input.wav',dst='rootnote.flac';
 try{
  const {fetchFile}=await engine();
  stage='WAV読み込み';say('WAVを読み込んでいます…');await ffmpeg.writeFile(src,await fetchFile(selected));
  stage='FLAC変換';say('FLACへ変換しています…');
  const depth=bitDepth.value==='24'?24:16; 
  const sampleFormat=depth===24?'s32':'s16'; 
  await ffmpeg.exec(['-hide_banner','-i',src,'-map_metadata','-1','-vn','-ac','2','-ar','44100','-sample_fmt',sampleFormat,'-c:a','flac','-compression_level','5',dst]);
  stage='変換結果取得';say('変換結果を準備しています…');const data=await ffmpeg.readFile(dst);
  const blob=new Blob([data],{type:'audio/flac'});if(!blob.size)throw new Error('出力ファイルが空です。');
  outputUrl=URL.createObjectURL(blob);save.href=outputUrl;save.download=(selected.name.replace(/\.wav$/i,'')||'audio')+'_RootNote.flac';save.classList.add('show');
  bar.style.width='100%';stage='完了';say(`変換完了（${depth} bit）：${(blob.size/1048576).toFixed(2)} MB`);
  await ffmpeg.deleteFile(src);await ffmpeg.deleteFile(dst);
 }catch(e){say('変換に失敗しました。エラー詳細を確認してください。');fail(e);}
 finally{busy=false;convert.disabled=!selected;}
});
$('copyError').onclick=async()=>{try{await navigator.clipboard.writeText($('errorText').textContent);$('copyError').textContent='コピーしました';}catch(e){say('コピーできません。ログを保存してください。');}};
$('saveError').onclick=()=>{const u=URL.createObjectURL(new Blob([$('errorText').textContent],{type:'text/plain'}));const a=document.createElement('a');a.href=u;a.download='RootNote_error_log.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);};
if('serviceWorker' in navigator && location.protocol.startsWith('http')) {
 navigator.serviceWorker.register('./sw.js').catch(e=>log(`Service Worker registration: ${e.message}`));
}