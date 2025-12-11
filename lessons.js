/* lessons.js — banco de exercícios (usado por lesson.html)
   Cada "lesson" puxa 5 exercícios. Inclui explicação curta para erros.
*/

const LESSONS = [
  {
    type: "choice",
    question: "Qual é a tradução de 'Dog'?",
    options: ["Cachorro", "Gato", "Maçã"],
    answer: "Cachorro",
    explanation: "Dog = cachorro."
  },
  {
    type: "write",
    question: "Traduza para inglês: 'Maçã'",
    answer: "apple",
    explanation: "Apple é 'maçã' em inglês."
  },
  {
    type: "drag",
    question: "Monte a frase correta: 'Eu gosto de gatos' (arraste as palavras)",
    words: ["I","like","cats","banana","blue"],
    answer: "I like cats",
    explanation: "A ordem correta em inglês é 'I like cats'."
  },
  {
    type: "choice",
    question: "Qual frase significa 'Eu estou feliz'?",
    options: ["I am happy","I am tired","I am big"],
    answer: "I am happy",
    explanation: "'Happy' = feliz."
  },
  {
    type: "write",
    question: "Traduza para inglês: 'Menino'",
    answer: "boy",
    explanation: "'Boy' significa menino."
  }
];

/* Funções utilitárias (opcionais) */

function getLessonSet(lessonId) {
  // atualmente reusa o mesmo banco — pronto para expandir por id
  return LESSONS;
}

/* Export (para navegadores sem modules, deixamos global) */
window.LESSON_BANK = LESSONS;
window.getLessonSet = getLessonSet;
