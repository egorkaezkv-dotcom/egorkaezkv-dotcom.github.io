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
document.querySelector('[data-inquiry]')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const input = new FormData(form);
  const fields = ['name', 'email', 'company', 'message'].map(key => String(input.get(key) || '').trim()).filter(Boolean);
  const link = document.createElement('a');
  link.href = 'mailto:ceo.mail.offer@gmail.com?subject=' + encodeURIComponent('FORMA · ' + input.get('kind')) + '&body=' + encodeURIComponent(fields.join('\n\n'));
  link.textContent = 'Открыть письмо для отправки';
  form.querySelector('output').replaceChildren(link);
  link.click();
});
