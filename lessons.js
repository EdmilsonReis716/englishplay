/* ============================================================
   lições.js — Banco de lições e exercícios ENGLISHPLAY
   Estruturado em 10 sessões com IDs individuais.
============================================================ */

/*
Estrutura usada pelo index.html:

SESSOES = [
    {
        nome: "Introdução",
        licoes: [
            { id: "1" },
            { id: "2" },
            ...
        ]
    }
]
*/

/* ============================================================
   SESSÕES E LISTA DE LIÇÕES
============================================================ */

const SESSOES = [
    {
        nome: "📘 Sessão 1 — Básico",
        licoes: [
            { id: "1" },
            { id: "2" },
            { id: "3" },
            { id: "4" },
            { id: "5" }
        ]
    },
    {
        nome: "📗 Sessão 2 — Verbos",
        licoes: [
            { id: "6" },
            { id: "7" },
            { id: "8" },
            { id: "9" },
            { id: "10" }
        ]
    },
    {
        nome: "📙 Sessão 3 — Frases úteis",
        licoes: [
            { id: "11" },
            { id: "12" },
            { id: "13" },
            { id: "14" },
            { id: "15" }
        ]
    },
    {
        nome: "📒 Sessão 4 — Objetos e Lugares",
        licoes: [
            { id: "16" },
            { id: "17" },
            { id: "18" },
            { id: "19" },
            { id: "20" }
        ]
    },
    {
        nome: "📓 Sessão 5 — Ações do dia",
        licoes: [
            { id: "21" },
            { id: "22" },
            { id: "23" },
            { id: "24" },
            { id: "25" }
        ]
    }
];

/* ============================================================
   EXERCÍCIOS DAS LIÇÕES
============================================================ */

const LESSONS = {

    /* --------------------------
        LIÇÃO 1
    -------------------------- */
    "1": [
        {
            type: "choice",
            question: "Qual é a tradução de 'Dog'?",
            options: ["Cachorro", "Gato", "Mesa"],
            answer: "Cachorro"
        },
        {
            type: "write",
            question: "Traduza: 'Maçã'",
            answer: "apple"
        },
        {
            type: "drag",
            question: "Monte: 'Eu gosto de gatos'",
            words: ["I","like","cats","banana"],
            answer: "I like cats"
        }
    ],

    /* --------------------------
        LIÇÃO 2
    -------------------------- */
    "2": [
        {
            type: "choice",
            question: "O que significa 'Cat'?",
            options: ["Gato", "Carro", "Casa"],
            answer: "Gato"
        },
        {
            type: "write",
            question: "Traduza: 'Menino'",
            answer: "boy"
        },
        {
            type: "drag",
            question: "Monte: 'Você é legal'",
            words: ["You","are","nice","dog"],
            answer: "You are nice"
        }
    ],

    /* --------------------------
        LIÇÃO 3
    -------------------------- */
    "3": [
        {
            type: "choice",
            question: "Como se diz 'Obrigado' em inglês?",
            options: ["Please", "Thanks", "Sorry"],
            answer: "Thanks"
        },
        {
            type: "write",
            question: "Traduza: 'Livro'",
            answer: "book"
        },
        {
            type: "drag",
            question: "Monte: 'Eu estou feliz'",
            words: ["I","am","happy","sad"],
            answer: "I am happy"
        }
    ],

    /* --------------------------
        LIÇÃO 4
    -------------------------- */
    "4": [
        {
            type: "choice",
            question: "Escolha: 'Car'",
            options: ["Peixe", "Carro", "Chuva"],
            answer: "Carro"
        },
        {
            type: "write",
            question: "Traduza: 'Água'",
            answer: "water"
        },
        {
            type: "drag",
            question: "Monte: 'Ela é minha amiga'",
            words: ["She","is","my","friend"],
            answer: "She is my friend"
        }
    ],

    /* --------------------------
        LIÇÃO 5
    -------------------------- */
    "5": [
        {
            type: "choice",
            question: "Tradução correta para 'Blue':",
            options: ["Azul", "Amarelo", "Vermelho"],
            answer: "Azul"
        },
        {
            type: "write",
            question: "Traduza: 'Escola'",
            answer: "school"
        },
        {
            type: "drag",
            question: "Monte: 'Eu moro aqui'",
            words: ["I","live","here","car"],
            answer: "I live here"
        }
    ],

    /* --------------------------
        A partir da lição 6 — criadas dinamicamente
    -------------------------- */
};

/* ============================================================
   GERAR LIÇÕES AUTOMÁTICAS PARA COMPLETAR ATÉ A LIÇÃO 25
============================================================ */

for (let i = 6; i <= 25; i++) {
    LESSONS[i] = LESSONS[i] || [
        {
            type: "choice",
            question: `Escolha a tradução correta (lição ${i}):`,
            options: ["Sim", "Não", "Talvez"],
            answer: "Sim"
        },
        {
            type: "write",
            question: `Traduza a palavra 'Casa' (lição ${i})`,
            answer: "house"
        },
        {
            type: "drag",
            question: `Monte a frase: 'Eu gosto de estudar' (lição ${i})`,
            words: ["I","like","to","study","banana"],
            answer: "I like to study"
        }
    ];
}

/* ============================================================
   FUNÇÃO PARA PEGAR LIÇÃO PELO ID
============================================================ */

function getLesson(id) {
    return LESSONS[id] || [];
}

