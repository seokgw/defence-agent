// 코덱스 설치 아이콘: 외부 이미지 없이 코드로 그리는 256x256 RGBA PNG.
import {writeFile,mkdir} from 'node:fs/promises';
import {deflateSync} from 'node:zlib';
const width=256, rows=Buffer.alloc((width*4+1)*width);
for(let y=0;y<width;y++)for(let x=0;x<width;x++){
 const i=y*(width*4+1)+1+x*4;
 const dx=Math.max(24-x,0,x-231),dy=Math.max(24-y,0,y-231);
 if(dx*dx+dy*dy>24*24)continue;
 rows[i]=30;rows[i+1]=58;rows[i+2]=138;rows[i+3]=255;
 const px=x-128,py=y-128,r=Math.hypot(px,py),a=Math.atan2(py,px);
 if(r>=48&&r<=72&&Math.abs(a)>0.68){rows[i]=255;rows[i+1]=255;rows[i+2]=255;}
}
function crc(bytes){let c=0xffffffff;for(const byte of bytes){c^=byte;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
function chunk(name,data){const kind=Buffer.from(name),length=Buffer.alloc(4),check=Buffer.alloc(4);length.writeUInt32BE(data.length);check.writeUInt32BE(crc(Buffer.concat([kind,data])));return Buffer.concat([length,kind,data,check]);}
const header=Buffer.alloc(13);header.writeUInt32BE(width,0);header.writeUInt32BE(width,4);header[8]=8;header[9]=6;
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
await mkdir(new URL('./assets/',import.meta.url),{recursive:true});
await writeFile(new URL('./assets/brand-icon.png',import.meta.url),png);
console.log('CODEX_ICON_256_RGBA_READY');