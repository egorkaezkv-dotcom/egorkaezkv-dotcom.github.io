document.querySelectorAll('.choose').forEach(link => {
  link.addEventListener('click', () => {
    const field = document.querySelector('form select');
    field.selectedIndex = Number(link.dataset.choice);
    const result = document.querySelector('form output');
    result.replaceChildren();
  });
});
document.querySelector('[data-demo]')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const result = form.querySelector('output');
  const heading = document.createElement('strong');
  heading.textContent = 'Предпросмотр заявки';
  const details = document.createElement('span');
  details.textContent = [data.get('service'), data.get('name').trim(), data.get('email').trim(), data.get('message').trim()].filter(Boolean).join(' · ');
  result.replaceChildren(heading, details);
});
document.querySelector('[data-demo]')?.addEventListener('input', event => {
  event.currentTarget.querySelector('output').replaceChildren();
});
const apiOrigin="https://forma-atelier.dynv6.net";
const inquiryForm=document.querySelector('[data-inquiry]');
let online=false;
if(inquiryForm){
  fetch(apiOrigin+'/ready',{credentials:'omit',referrerPolicy:'no-referrer'}).then(r=>{
    if(!r.ok)return;
    online=true;
    inquiryForm.querySelector('button').textContent='Отправить заявку';
    inquiryForm.querySelector('button').previousElementSibling.textContent='Отправьте заявку напрямую в студию.';
  }).catch(()=>{});
}
let receipt=crypto.randomUUID();
inquiryForm?.addEventListener('input',()=>{receipt=crypto.randomUUID();});
document.querySelector('[data-inquiry]')?.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const input = new FormData(form);
  if(online){
    const button=form.querySelector('button');
    button.disabled=true;
    try{
      const data=Object.fromEntries(['name','email','company','kind','message','fax'].map(key=>[key,String(input.get(key)||'').trim()]));
      const r=await fetch(apiOrigin+'/inquiries',{method:'POST',credentials:'omit',referrerPolicy:'no-referrer',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,id:receipt,analytics:window.formaReceiptContext?.()||null})});
      const out=form.querySelector('output');
      if(r.ok){form.reset();receipt=crypto.randomUUID();out.textContent='Заявка получена студией.';}
      else out.textContent=r.status===429?'Достигнут лимит отправки. Попробуйте позже.':'Проверьте данные или напишите в Telegram.';
    }catch{form.querySelector('output').textContent='Подтверждение не получено. Повторите попытку или напишите в Telegram.';}
    finally{button.disabled=false;}
    return;
  }
  const fields = ['name', 'email', 'company', 'message'].map(key => String(input.get(key) || '').trim()).filter(Boolean);
  const link = document.createElement('a');
  link.href = 'mailto:ceo.mail.offer@gmail.com?subject=' + encodeURIComponent('FORMA · ' + input.get('kind')) + '&body=' + encodeURIComponent(fields.join('\n\n'));
  link.textContent = 'Открыть письмо для отправки';
  form.querySelector('output').replaceChildren(link);
  link.click();
});
