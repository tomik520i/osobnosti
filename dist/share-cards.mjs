// Deterministic local drawing. No images, answers, or prompts leave this browser.
const W=1080,H=1350;
export function drawCard(spec){
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const c=canvas.getContext('2d');c.fillStyle='#1e2024';c.fillRect(0,0,W,H);
  const ink='#e7e9ed',muted='#bbbdc1';
  function text(value,x,y,size=30,color=ink,font='Arial'){c.font=`${size}px ${font}`;c.fillStyle=color;c.fillText(value,x,y);}
  function lines(value,x,y,width,size=30,color=ink,max=3){c.font=`${size}px Arial`;const wrapped=[];let line='';for(const word of value.split(/\s+/)){const next=line?`${line} ${word}`:word;if(c.measureText(next).width>width&&line){wrapped.push(line);line=word;}else line=next;}if(line)wrapped.push(line);const visible=wrapped.slice(0,max);if(wrapped.length>max){let last=visible[max-1];while(c.measureText(last+'…').width>width)last=last.slice(0,-1);visible[max-1]=last+'…';}visible.forEach((line,i)=>text(line,x,y+i*size*1.35,size,color));return visible.length*size*1.35;}
  text('osobnosti.',64,88,40);text(spec.tag.toUpperCase(),64,146,21,muted);
  lines(spec.title,64,220,952,58,ink,2);
  lines(spec.subtitle,64,310,952,27,muted,2);
  if(spec.type==='temperament'){
    const x=150,y=430,w=780,h=500;
    c.fillStyle='#37393d';c.fillRect(x,y,w/2,h/2);c.fillStyle='#35373b';c.fillRect(x+w/2,y,w/2,h/2);
    c.fillStyle='#37393d';c.fillRect(x,y+h/2,w/2,h/2);c.fillStyle='#3c3e42';c.fillRect(x+w/2,y+h/2,w/2,h/2);
    c.fillStyle='#adafb322';c.fillRect(x+w*.375,y,w*.25,h);c.fillRect(x,y+h*.375,w,h*.25);
    c.strokeStyle='#b0b2b6';c.lineWidth=2;c.beginPath();c.moveTo(x+w/2,y);c.lineTo(x+w/2,y+h);c.moveTo(x,y+h/2);c.lineTo(x+w,y+h/2);c.stroke();
    text('Melancholik',x+25,y+45,34);text('Cholerik',x+w/2+25,y+45,34);text('Flegmatik',x+25,y+h-25,34);text('Sangvinik',x+w/2+25,y+h-25,34);
    text('Více rozkolísání',x,y-20,24,muted);text('Více emoční stability',x,y+h+37,24,muted);
    text('Menší extraverze',x,y+h+85,24,muted);text('Větší extraverze',x+w-235,y+h+85,24,muted);
    const px=x+(spec.e-1)/4*w,py=y+(spec.s-1)/4*h;c.beginPath();c.arc(Math.max(x+12,Math.min(x+w-12,px)),Math.max(y+12,Math.min(y+h-12,py)),12,0,Math.PI*2);c.fillStyle='#212327';c.fill();c.strokeStyle='#edeff3';c.lineWidth=4;c.stroke();
    text(`Extraverze ${spec.e.toFixed(1).replace('.',',')} / 5  ·  Stabilita ${spec.s.toFixed(1).replace('.',',')} / 5`,64,1090,26);
  }else{
    const rows=spec.rows||[],dy=Math.min(132,720/Math.max(1,rows.length));
    if(!rows.length)lines('Zatím nejsou vybrané odpovědi pro tuto kartu.',64,480,950,32,muted);
    rows.forEach((row,i)=>{const y=425+i*dy;text(row.label,64,y,rows.length>8?32:36);if(row.value!==undefined){const v=row.value===null?'—':row.value.toFixed(1).replace('.',',')+' / 5';c.font='bold 36px Arial';c.fillStyle=ink;c.textAlign='right';c.fillText(v,1016,y);c.textAlign='left';c.fillStyle='#7e8084';c.fillRect(64,y+24,952,7);if(row.value!==null){c.fillStyle=row.color||'#76787c';c.beginPath();c.arc(64+(row.value-1)/4*952,y+27,11,0,Math.PI*2);c.fill();c.strokeStyle='#dee0e4';c.lineWidth=2;c.stroke();}}else{text(row.detail||'',64,y+34,27,muted);}});
  }
  c.fillStyle='#35373b';c.fillRect(0,1175,W,175);
  lines(spec.note,64,1220,952,28,ink,2);text(spec.source,64,1310,22,muted);
  return canvas;
}
export function saveCanvas(canvas,filename){canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);},'image/png');}
