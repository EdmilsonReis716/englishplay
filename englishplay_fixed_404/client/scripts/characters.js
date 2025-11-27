document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.character-card').forEach(card => {
    const speakBtn = card.querySelector('.speak');
    const animBtn = card.querySelector('.play-anim');
    const textarea = card.querySelector('.say-text');
    const name = card.dataset.name;
    speakBtn.addEventListener('click', ()=>{
      const text = textarea.value || ('Hello, I am ' + name);
      speakText(text, card.dataset.voice);
    });
    animBtn.addEventListener('click', ()=>{
      const svg = card.querySelector('svg');
      svg.classList.toggle('play');
      setTimeout(()=> svg.classList.remove('play'), 1200);
    });
  });
});

function speakText(text, voiceTag){
  if (!('speechSynthesis' in window)){ alert('TTS não suportado no seu navegador'); return; }
  const utter = new SpeechSynthesisUtterance(text);
  // choose a voice heuristically
  const voices = speechSynthesis.getVoices();
  if (voices.length){
    let v = voices.find(v=> v.lang.startsWith('en')) || voices[0];
    utter.voice = v;
  }
  utter.rate = 1;
  speechSynthesis.speak(utter);
}
