(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const core = $('#coreButton');
  const csrf = { value: '' };
  let recorder = null, mediaStream = null, recordingTimer = 0, pendingAction = null, pendingNote = '';
  let busy = false, toastTimer = 0;
  let voiceReplies = localStorage.getItem('jarvis_voice_replies') === '1';

  function toast(message) {
    const el = $('#toast'); el.textContent = message; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 5600);
  }
  function setState(value) {
    for (const state of ['listening','thinking','speaking','error']) core.classList.toggle(`state-${state}`, value === state);
    $('#voiceLabel').textContent = value === 'listening' ? 'LISTENING' : value === 'thinking' ? 'THINKING' : value === 'speaking' ? 'SPEAKING' : value === 'error' ? 'ATTENTION' : 'STANDBY';
    $('#coreCaption').textContent = value === 'listening' ? 'ICH HÖRE ZU' : value === 'thinking' ? 'LOKALE ANALYSE' : value === 'speaking' ? 'JARVIS ANTWORTET' : value === 'error' ? 'VERBINDUNG PRÜFEN' : 'BEREIT FÜR DEINE ANFRAGE';
    post('/api/state', {state:value}).catch(() => {});
  }
  async function request(path, {method='GET',body,blob,contentType}={}) {
    const headers = {'X-Jarvis-CSRF':csrf.value};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (blob) headers['Content-Type'] = contentType || blob.type || 'audio/webm';
    const res = await fetch(path, {method,headers,body:body !== undefined ? JSON.stringify(body) : blob});
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Lokaler Jarvis-Server antwortet mit HTTP ${res.status}.`);
    return data;
  }
  const post = (path, body) => request(path, {method:'POST',body});

  function addMessage(role, text, label) {
    const area = $('#conversation'); area.querySelector('.welcome-line')?.remove();
    const node = document.createElement('article'); node.className = `message ${role}`;
    if (label) { const cap = document.createElement('span'); cap.className = 'message-label'; cap.textContent = label; node.append(cap); }
    const content = document.createElement('span'); content.textContent = text; node.append(content);
    area.append(node); area.scrollTop = area.scrollHeight;
  }
  function openChat() {
    $('#chatPanel').hidden = false; $('#chatDock').classList.add('active');
    setTimeout(() => $('#promptInput').focus(), 80);
  }
  function closeChat() { $('#chatPanel').hidden = true; $('#chatDock').classList.remove('active'); $('#coreButton').focus(); }
  function setBusy(value) {
    busy = value; $('#sendButton').disabled = value; $('#cancelButton').hidden = !value;
    $('#promptInput').disabled = value; if (value) setState('thinking');
  }
  function speak(text) {
    if (!voiceReplies || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 3500));
    utterance.lang = 'de-DE'; utterance.rate = 1.02;
    utterance.onstart = () => setState('speaking');
    utterance.onend = () => setState('idle'); utterance.onerror = () => setState('idle');
    window.speechSynthesis.speak(utterance);
  }
  async function send(text = $('#promptInput').value) {
    const prompt = String(text).trim(); if (!prompt || busy) return;
    $('#promptInput').value = ''; addMessage('user', prompt); openChat(); setBusy(true);
    try {
      const response = await post('/api/chat', {text:prompt});
      addMessage('assistant', response.text, 'JARVIS · QWEN 3.5'); speak(response.text);
    } catch (err) { addMessage('error', err.message, 'VERBINDUNG / FEHLER'); setState('error'); toast(err.message); }
    finally { setBusy(false); if (!window.speechSynthesis?.speaking) setState('idle'); }
  }
  function clearStream() {
    clearTimeout(recordingTimer); recordingTimer = 0;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null; recorder = null;
    $('#voiceButton').classList.remove('active'); $('#voiceButton').setAttribute('aria-label','Mikrofon aktivieren');
  }
  async function toggleVoice() {
    if (recorder && recorder.state === 'recording') { clearStream(); return; }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      toast('Dieser Browser unterstützt keine lokale Mikrofonaufnahme. Nutze eine aktuelle Version von Chrome oder Edge.'); return;
    }
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,channelCount:1},video:false});
      const mime = ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/mp4'].find(t => MediaRecorder.isTypeSupported(t)) || '';
      recorder = mime ? new MediaRecorder(mediaStream,{mimeType:mime}) : new MediaRecorder(mediaStream);
      const chunks = [];
      recorder.ondataavailable = e => { if (e.data?.size) chunks.push(e.data); };
      recorder.onerror = () => { clearStream(); setState('error'); toast('Die Aufnahme ist fehlgeschlagen.'); };
      recorder.onstop = async () => {
        const blob = new Blob(chunks,{type:recorder?.mimeType || mime || 'audio/webm'});
        if (blob.size < 1200) { clearStream(); setState('idle'); toast('Aufnahme zu kurz.'); return; }
        clearStream(); openChat(); setBusy(true);
        try {
          const response = await request('/api/voice',{method:'POST',blob,contentType:blob.type});
          addMessage('user',response.transcript,'DU · LOKALES WHISPER');
          addMessage('assistant',response.text,'JARVIS · QWEN 3.5'); speak(response.text);
        } catch(err) { addMessage('error',err.message,'SPRACHFEHLER'); toast(err.message); }
        finally { setBusy(false); if (!window.speechSynthesis?.speaking) setState('idle'); }
      };
      recorder.start(250); $('#voiceButton').classList.add('active'); $('#voiceButton').setAttribute('aria-label','Aufnahme beenden');
      setState('listening');
      recordingTimer = setTimeout(() => clearStream(), 25_000);
      toast('Ich höre zu. Drücke das Mikrofon erneut, wenn du fertig bist.');
    } catch(err) { clearStream(); setState('error'); toast(`Mikrofon nicht verfügbar: ${err.message}`); }
  }
  function showConfirm({title,body,action,eyebrow='JARVIS-FUNKTION'}) {
    pendingAction = action; $('#confirmTitle').textContent = title; $('#confirmText').textContent = body;
    $('#confirmEyebrow').textContent = eyebrow; $('#confirmDialog').showModal();
  }
  async function launch(feature) {
    let popup = window.open('about:blank','_blank');
    if (popup) popup.opener = null;
    try {
      const {url} = await post('/api/open',{feature});
      if (popup) popup.location.replace(url); else window.location.assign(url);
    } catch(err) { popup?.close(); toast(err.message); }
  }
  async function loadMemory() {
    const list = $('#memoryList'); list.replaceChildren();
    try {
      const data = await request('/api/memory');
      if (!data.files.length) { const p=document.createElement('p');p.className='muted';p.textContent='Noch keine gespeicherten Notizen.';list.append(p);return; }
      data.files.forEach(file => { const article=document.createElement('article');article.textContent=`${file.name}\n${file.text}`;list.append(article); });
    } catch(err) { const p=document.createElement('p');p.className='muted';p.textContent=err.message;list.append(p); }
  }
  async function loadDiagnostics() {
    const box = $('#diagnostics'); box.replaceChildren();
    try {
      const d = await request('/api/health');
      const rows = [
        ['Lokales Modell', d.ollama.model_ready ? `${d.ollama.model} · bereit` : d.ollama.running ? 'Modell nicht installiert' : 'Ollama nicht erreichbar', d.ollama.model_ready],
        ['OpenCode', d.opencode ? 'CLI gefunden' : 'Nicht gefunden', d.opencode],
        ['Lokale Sprache', d.voice_ready ? 'Whisper-Umgebung bereit' : 'Setup einmalig erforderlich', d.voice_ready],
        ['Visualizer', d.visualizer ? 'Läuft' : 'Bei Bedarf startbar', true],
        ['Handtracking', d.hands ? 'Board läuft' : 'Kamera bleibt aus', true]
      ];
      rows.forEach(([name,value,ok]) => { const row=document.createElement('div');row.className='diagnostic-row';const l=document.createElement('span');l.textContent=name;const r=document.createElement('b');r.textContent=value;r.className=ok?'ok':'bad';row.append(l,r);box.append(row); });
    } catch(err) { const p=document.createElement('p');p.className='muted';p.textContent=err.message;box.append(p); }
  }
  async function saveMemory() {
    pendingNote = $('#memoryInput').value.trim(); if (!pendingNote) { toast('Schreibe zuerst eine Notiz.'); return; }
    $('#memoryPreview').textContent = pendingNote; $('#memoryConfirmDialog').showModal();
  }

  $('#coreButton').addEventListener('click',openChat); $('#chatDock').addEventListener('click',openChat); $('#closeChat').addEventListener('click',closeChat);
  $('#sendButton').addEventListener('click',() => send());
  $('#promptInput').addEventListener('keydown',e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
  $('#cancelButton').addEventListener('click',async() => { window.speechSynthesis?.cancel();await post('/api/cancel',{}).catch(()=>{});setBusy(false);setState('idle');toast('Antwort gestoppt.'); });
  $('#voiceButton').addEventListener('click',toggleVoice);
  $('#faceButton').addEventListener('click',() => launch('visualizer'));
  $('#handsButton').addEventListener('click',() => showConfirm({title:'Handtracking öffnen?',body:'Das Barehands-Board wird in einem neuen Tab geöffnet. Die Kamera bleibt aus, bis du sie dort ausdrücklich aktivierst. Kamerabilder werden lokal verarbeitet.',action:async popup=>{await launch('hands');},eyebrow:'KAMERA · OPT-IN'}));
  $('#memoryButton').addEventListener('click',() => { $('#memoryDialog').showModal();loadMemory(); });
  $('#settingsButton').addEventListener('click',() => { $('#settingsDialog').showModal();loadDiagnostics(); });
  $('#saveMemoryButton').addEventListener('click',saveMemory);
  $('#memoryConfirmCancel').addEventListener('click',() => $('#memoryConfirmDialog').close());
  $('#memoryConfirmAccept').addEventListener('click',async() => { try { const r=await post('/api/memory/save',{text:pendingNote});$('#memoryInput').value='';$('#memoryConfirmDialog').close();await loadMemory();toast(`Lokal gespeichert: ${r.name}`); } catch(err) { toast(err.message); } });
  $('#confirmCancel').addEventListener('click',() => $('#confirmDialog').close());
  $('#confirmAccept').addEventListener('click',async() => { const action=pendingAction;pendingAction=null;$('#confirmDialog').close();if(action)await action(); });
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click',() => document.getElementById(b.dataset.close).close()));
  $('#voiceReplies').checked = voiceReplies;
  $('#voiceReplies').addEventListener('change',e => {voiceReplies=e.currentTarget.checked;localStorage.setItem('jarvis_voice_replies',voiceReplies?'1':'0');});

  (async() => {
    try {
      const boot = await request('/api/bootstrap'); csrf.value = boot.csrf;
      await loadDiagnostics();
      const o = boot.diagnostics.ollama;
      $('#systemLabel').textContent = o.model_ready ? 'LOKALES MODELL · BEREIT' : o.running ? 'MODELL FEHLT' : 'OLLAMA OFFLINE';
      $('#statusLight').classList.toggle('online',!!(o.model_ready && boot.diagnostics.opencode));
      $('#statusLight').classList.toggle('error',!o.model_ready || !boot.diagnostics.opencode);
      if (!boot.diagnostics.opencode) toast('OpenCode wurde nicht gefunden. Prüfe die lokale Installation.');
      else if (!o.running) toast('Ollama ist nicht erreichbar. Starte Ollama und lade Jarvis neu.');
      else if (!o.model_ready) toast(`Das Modell ${boot.model} fehlt. Jarvis lädt es nicht automatisch herunter.`);
    } catch(err) { $('#systemLabel').textContent='JARVIS SERVER NICHT ERREICHBAR';$('#statusLight').classList.add('error');toast(err.message); }
  })();
  document.addEventListener('keydown',e => { if (e.key==='Escape') { window.speechSynthesis?.cancel();setState('idle'); } });
})();
