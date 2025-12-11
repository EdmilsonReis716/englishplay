/* =============================================================
   lessons.js — Banco oficial de exercícios do EnglishPlay
   Cada aula puxa 5 exercícios daqui.
   Tipos disponíveis:
   ✔ choice  (múltipla escolha)
   ✔ write   (escrita)
   ✔ drag    (arrastar palavras)
============================================================= */

const LESSON_BANK = [
    /* =======================
       EXERCÍCIO 1 — ESCOLHA
    ======================== */
    {
        type: "choice",
        question: "Qual é a tradução de 'Dog'?",
        options: ["Cachorro", "Gato", "Banana"],
        answer: "Cachorro"
    },

    /* =======================
       EXERCÍCIO 2 — ESCRITA
    ======================== */
    {
        type: "write",
        question: "Traduza para inglês: 'Maçã'",
        answer: "apple"
    },

    /* =======================
       EXERCÍCIO 3 — ARRASTAR PALAVRAS
    ======================== */
    {
        type: "drag",
        question: "Monte a frase: 'Eu gosto de gatos'",
        words: ["I", "like", "cats", "banana", "blue"],
        answer: "I like cats"
    },

    /* =======================
       EXERCÍCIO 4 — ESCOLHA
    ======================== */
    {
        type: "choice",
        question: "Qual frase significa: 'Eu estou feliz'?",
        options: [
            "I am happy",
            "I am tired",
            "I am big"
        ],
        answer: "I am happy"
    },

    /* =======================
       EXERCÍCIO 5 — ESCRITA
    ======================== */
    {
        type: "write",
        question: "Traduza para inglês: 'Menino'",
        answer: "boy"
    }
];


/* =============================================================
   FUTURA EXPANSÃO
============================================================= */

/*
Você poderá adicionar muito mais exercícios assim:

LESSON_BANK.push({
    type: "choice",
    question: "Qual é a cor 'Blue'?",
    options: ["Azul", "Vermelho", "Preto"],
    answer: "Azul"
});

OU separar por categorias, exemplo:

const LessonSection1 = [ ... ];
const LessonSection2 = [ ... ];

E no lesson.html escolher qual seção carregar.
*/
