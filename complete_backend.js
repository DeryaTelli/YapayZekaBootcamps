// server.js - Complete Backend API
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına maksimum 100 istek
    message: {
        success: false,
        message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
    }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(cors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:8080'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Veri dosyalarını oluştur
async function initializeDataStructure() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        const files = ['tests.json', 'statistics.json', 'users.json'];
        for (const file of files) {
            const filePath = path.join(DATA_DIR, file);
            try {
                await fs.access(filePath);
            } catch {
                await fs.writeFile(filePath, JSON.stringify([]));
            }
        }
        console.log('✅ Veri yapısı hazırlandı');
    } catch (error) {
        console.error('❌ Veri yapısı oluşturulamadı:', error);
    }
}

// Veri okuma/yazma fonksiyonları
async function readData(filename) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`${filename} okunamadı:`, error);
        return [];
    }
}

async function writeData(filename, data) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`${filename} yazılamadı:`, error);
        return false;
    }
}

// Yapay Zeka Test Üretici Sınıfı - Geliştirilmiş
class AITestGenerator {
    constructor() {
        this.questionTemplates = {
            'matematik': {
                kolay: [
                    { q: "{a} + {b} = ?", type: "addition", level: 1 },
                    { q: "{a} - {b} = ?", type: "subtraction", level: 1 },
                    { q: "{a} × {b} = ?", type: "multiplication", level: 1 },
                    { q: "{a} ÷ {b} = ?", type: "division", level: 1 },
                    { q: "{a}'nın %{b}'si kaçtır?", type: "percentage_basic", level: 1 },
                    { q: "{a} sayısının yarısı kaçtır?", type: "half", level: 1 }
                ],
                orta: [
                    { q: "{a}² = ?", type: "square", level: 2 },
                    { q: "√{a} = ?", type: "sqrt", level: 2 },
                    { q: "{a}x + {b} = {c}, x = ?", type: "linear_equation", level: 2 },
                    { q: "{a}% of {b} = ?", type: "percentage", level: 2 },
                    { q: "({a} + {b}) × {c} = ?", type: "order_operations", level: 2 },
                    { q: "{a}/{b} + {c}/{d} = ?", type: "fraction_addition", level: 2 }
                ],
                zor: [
                    { q: "∫({a}x + {b})dx = ?", type: "integral", level: 3 },
                    { q: "d/dx({a}x² + {b}x + {c}) = ?", type: "derivative", level: 3 },
                    { q: "sin²θ + cos²θ = ?", type: "trigonometry", level: 3 },
                    { q: "{a}x² + {b}x + {c} = 0 denkleminin kökleri?", type: "quadratic", level: 3 },
                    { q: "log₂({a}) = ?", type: "logarithm", level: 3 }
                ],
                expert: [
                    { q: "lim(x→∞) ({a}x² + {b}x + {c})/(x²) = ?", type: "limit", level: 4 },
                    { q: "∫₀^π sin(x)dx = ?", type: "definite_integral", level: 4 },
                    { q: "∑(n=1 to ∞) 1/n² = ?", type: "infinite_series", level: 4 },
                    { q: "f(x) = {a}x³ + {b}x² + {c}x + {d} fonksiyonunun türevi?", type: "polynomial_derivative", level: 4 }
                ]
            },
            'tarih': {
                kolay: [
                    { q: "Osmanlı İmparatorluğu hangi yılda kuruldu?", answer: "1299", options: ["1299", "1453", "1071", "1326"], explanation: "Osmanlı İmparatorluğu 1299 yılında Osman Bey tarafından kurulmuştur." },
                    { q: "İstanbul'un fethi hangi yılda gerçekleşti?", answer: "1453", options: ["1453", "1299", "1402", "1500"], explanation: "İstanbul, 1453 yılında II. Mehmet tarafından fethedilmiştir." },
                    { q: "Türkiye Cumhuriyeti hangi yılda kuruldu?", answer: "1923", options: ["1923", "1922", "1924", "1920"], explanation: "Türkiye Cumhuriyeti 29 Ekim 1923'te ilan edilmiştir." },
                    { q: "Atatürk hangi yılda doğdu?", answer: "1881", options: ["1881", "1880", "1882", "1879"], explanation: "Mustafa Kemal Atatürk 1881 yılında Selanik'te doğmuştur." },
                    { q: "Malazgirt Savaşı hangi yılda yapıldı?", answer: "1071", options: ["1071", "1099", "1453", "1299"], explanation: "Malazgirt Savaşı 1071 yılında Sultan Alparslan önderliğinde yapılmıştır." }
                ],
                orta: [
                    { q: "Tanzimat Fermanı hangi padişah döneminde ilan edildi?", answer: "Abdülmecit", options: ["Abdülmecit", "Mahmut II", "Abdülhamit II", "Selim III"], explanation: "Tanzimat Fermanı 1839'da Sultan Abdülmecit döneminde ilan edilmiştir." },
                    { q: "Milli Mücadele dönemi hangi yıllar arasındadır?", answer: "1919-1922", options: ["1919-1922", "1914-1918", "1923-1925", "1920-1923"], explanation: "Milli Mücadele 19 Mayıs 1919'da başlayıp 1922'de sona ermiştir." },
                    { q: "Lozan Antlaşması hangi yılda imzalandı?", answer: "1923", options: ["1923", "1922", "1924", "1920"], explanation: "Lozan Antlaşması 24 Temmuz 1923'te imzalanmıştır." },
                    { q: "İlk Türk-İslam devleti hangisidir?", answer: "Karahanlılar", options: ["Karahanlılar", "Gazneliler", "Selçuklular", "Osmanlı"], explanation: "Karahanlılar ilk Türk-İslam devletlerinden biridir." },
                    { q: "Çanakkale Savaşları hangi yılda gerçekleşti?", answer: "1915", options: ["1915", "1914", "1916", "1917"], explanation: "Çanakkale Savaşları 1915 yılında yapılmıştır." }
                ],
                zor: [
                    { q: "Osmanlı'da ilk anayasa hangi padişah döneminde ilan edildi?", answer: "II. Abdülhamit", options: ["II. Abdülhamit", "V. Murat", "III. Selim", "II. Mahmut"], explanation: "İlk Osmanlı Anayasası (Kanuni Esasi) 1876'da II. Abdülhamit döneminde ilan edilmiştir." },
                    { q: "Kut'ül Amare Zaferi hangi yılda gerçekleşti?", answer: "1916", options: ["1916", "1915", "1917", "1914"], explanation: "Kut'ül Amare Zaferi 1916 yılında Halil Paşa komutasında kazanılmıştır." },
                    { q: "Sivas Kongresi hangi tarihlerde yapıldı?", answer: "4-11 Eylül 1919", options: ["4-11 Eylül 1919", "23 Temmuz 1919", "19 Mayıs 1919", "1-7 Ağustos 1919"], explanation: "Sivas Kongresi 4-11 Eylül 1919 tarihleri arasında yapılmıştır." },
                    { q: "Amasya Genelgesi hangi tarihte yayınlandı?", answer: "22 Haziran 1919", options: ["22 Haziran 1919", "19 Mayıs 1919", "23 Temmuz 1919", "4 Eylül 1919"], explanation: "Amasya Genelgesi 22 Haziran 1919'da yayınlanmıştır." }
                ],
                expert: [
                    { q: "Osmanlı'da Devşirme sistemi hangi padişah döneminde kurumlaştı?", answer: "I. Murat", options: ["I. Murat", "Orhan Bey", "I. Bayezit", "Yıldırım Bayezit"], explanation: "Devşirme sistemi I. Murat döneminde kurumlaşmıştır." },
                    { q: "Karolofça Antlaşması hangi yılda imzalandı?", answer: "1699", options: ["1699", "1683", "1718", "1774"], explanation: "Karolofça Antlaşması 1699 yılında imzalanmış, Osmanlı'nın ilk toprak kaybını kabul ettiği antlaşmadır." },
                    { q: "Türk Tarih Kurumu hangi yılda kuruldu?", answer: "1931", options: ["1931", "1928", "1933", "1925"], explanation: "Türk Tarih Kurumu 1931 yılında Atatürk'ün direktifiyle kurulmuştur." }
                ]
            },
            'ingilizce': {
                kolay: [
                    { q: "What is 'merhaba' in English?", answer: "Hello", options: ["Hello", "Goodbye", "Thank you", "Please"], explanation: "'Merhaba' kelimesinin İngilizce karşılığı 'Hello'dur." },
                    { q: "How do you say 'köpek' in English?", answer: "Dog", options: ["Dog", "Cat", "Bird", "Fish"], explanation: "'Köpek' kelimesinin İngilizce karşılığı 'Dog'dur." },
                    { q: "What does 'book' mean in Turkish?", answer: "Kitap", options: ["Kitap", "Kalem", "Masa", "Sandalye"], explanation: "'Book' kelimesi Türkçe'de 'Kitap' anlamına gelir." },
                    { q: "What is the opposite of 'big'?", answer: "Small", options: ["Small", "Large", "Huge", "Giant"], explanation: "'Big' kelimesinin zıttı 'Small'dur." },
                    { q: "How do you say 'water' in Turkish?", answer: "Su", options: ["Su", "Süt", "Çay", "Kahve"], explanation: "'Water' kelimesinin Türkçe karşılığı 'Su'dur." }
                ],
                orta: [
                    { q: "Which is correct? 'I ____ to school yesterday.'", answer: "went", options: ["went", "go", "going", "goes"], explanation: "Geçmiş zaman için 'went' kullanılır." },
                    { q: "What does 'beautiful' mean?", answer: "Güzel", options: ["Güzel", "Çirkin", "Büyük", "Küçük"], explanation: "'Beautiful' kelimesi 'Güzel' anlamına gelir." },
                    { q: "Choose the correct form: 'She ____ English very well.'", answer: "speaks", options: ["speaks", "speak", "speaking", "spoke"], explanation: "Üçüncü tekil şahıs için 'speaks' kullanılır." },
                    { q: "What is the past tense of 'eat'?", answer: "ate", options: ["ate", "eaten", "eating", "eats"], explanation: "'Eat' fiilinin geçmiş hali 'ate'dir." },
                    { q: "Which article is correct? '____ apple'", answer: "An", options: ["An", "A", "The", "No article"], explanation: "Sesli harfle başlayan kelimeler için 'an' kullanılır." }
                ],
                zor: [
                    { q: "Which sentence uses the present perfect correctly?", answer: "I have lived here for 5 years", options: ["I have lived here for 5 years", "I am living here for 5 years", "I live here for 5 years", "I lived here for 5 years"], explanation: "Present perfect tense için 'have/has + past participle' yapısı kullanılır." },
                    { q: "What is the passive form of 'They built the house'?", answer: "The house was built by them", options: ["The house was built by them", "The house is built by them", "The house has been built by them", "The house will be built by them"], explanation: "Geçmiş zamanda passive yapı 'was/were + past participle' şeklindedir." },
                    { q: "Choose the correct conditional: 'If I ____ rich, I would travel.'", answer: "were", options: ["were", "was", "am", "will be"], explanation: "Second conditional'da 'were' kullanılır." },
                    { q: "What type of word is 'quickly'?", answer: "Adverb", options: ["Adverb", "Adjective", "Noun", "Verb"], explanation: "'Quickly' bir zarftır (adverb)." }
                ],
                expert: [
                    { q: "Identify the subjunctive mood: 'If I ____ you, I would study harder.'", answer: "were", options: ["were", "was", "am", "will be"], explanation: "Subjunctive mood'da 'were' kullanılır." },
                    { q: "What is the correct form? 'I wish I ____ taller.'", answer: "were", options: ["were", "was", "am", "will be"], explanation: "Wish yapısından sonra subjunctive 'were' kullanılır." },
                    { q: "Choose the correct: 'Neither John nor Mary ____ here.'", answer: "is", options: ["is", "are", "was", "were"], explanation: "Neither...nor yapısında son ögeye göre fiil seçilir." }
                ]
            },
            'fen': {
                kolay: [
                    { q: "Suyun kaynama noktası kaç derecedir?", answer: "100°C", options: ["100°C", "0°C", "50°C", "200°C"], explanation: "Su deniz seviyesinde 100°C'de kaynar." },
                    { q: "İnsanın kaç duyu organı vardır?", answer: "5", options: ["5", "4", "6", "7"], explanation: "İnsanın görme, işitme, koklama, tatma ve dokunma olmak üzere 5 duyu organı vardır." },
                    { q: "Güneş sisteminde kaç gezegen vardır?", answer: "8", options: ["8", "9", "7", "10"], explanation: "Güneş sisteminde 8 gezegen bulunmaktadır." },
                    { q: "En sert mineral hangisidir?", answer: "Elmas", options: ["Elmas", "Altın", "Demir", "Kuvars"], explanation: "Elmas doğadaki en sert mineraldir." }
                ],
                orta: [
                    { q: "DNA'nın açılımı nedir?", answer: "Deoksiribonükleik Asit", options: ["Deoksiribonükleik Asit", "Ribonükleik Asit", "Amino Asit", "Protein"], explanation: "DNA, Deoksiribonükleik Asit'in kısaltmasıdır." },
                    { q: "Fotosentez hangi organellerde gerçekleşir?", answer: "Kloroplast", options: ["Kloroplast", "Mitokondri", "Ribozom", "Çekirdek"], explanation: "Fotosentez kloroplastlarda gerçekleşir." },
                    { q: "Newton'un kaç hareket yasası vardır?", answer: "3", options: ["3", "2", "4", "5"], explanation: "Newton'un 3 hareket yasası vardır." }
                ],
                zor: [
                    { q: "Heisenberg Belirsizlik İlkesi neyi ifade eder?", answer: "Konum ve momentumun aynı anda kesin ölçülemezliği", options: ["Konum ve momentumun aynı anda kesin ölçülemezliği", "Enerjinin korunumu", "Kütlenin enerjiye dönüşümü", "Işık hızının sabitliği"], explanation: "Heisenberg İlkesi, bir parçacığın konumu ve momentumunun aynı anda kesin olarak ölçülemeyeceğini belirtir." }
                ]
            }
        };
    }

    generateMathQuestion(template, difficulty) {
        let question = template.q;
        let answer, options;

        const difficultyRanges = {
            kolay: { min: 1, max: 10 },
            orta: { min: 1, max: 50 },
            zor: { min: 1, max: 100 },
            expert: { min: 1, max: 1000 }
        };

        const range = difficultyRanges[difficulty];
        const a = Math.floor(Math.random() * range.max) + range.min;
        const b = Math.floor(Math.random() * range.max) + range.min;
        const c = a + b;
        const d = Math.floor(Math.random() * range.max) + range.min;

        question = question.replace(/{a}/g, a).replace(/{b}/g, b).replace(/{c}/g, c).replace(/{d}/g, d);

        switch(template.type) {
            case 'addition':
                answer = a + b;
                options = this.generateMathOptions(answer, 'add');
                break;
            case 'subtraction':
                answer = Math.abs(a - b);
                options = this.generateMathOptions(answer, 'sub');
                break;
            case 'multiplication':
                answer = a * b;
                options = this.generateMathOptions(answer, 'mul');
                break;
            case 'division':
                answer = Math.floor(a / Math.max(1, b));
                options = this.generateMathOptions(answer, 'div');
                break;
            case 'square':
                answer = a * a;
                options = this.generateMathOptions(answer, 'square');
                break;
            case 'sqrt':
                const perfectSquare = Math.pow(Math.floor(Math.sqrt(a)), 2);
                answer = Math.sqrt(perfectSquare);
                options = this.generateMathOptions(answer, 'sqrt');
                break;
            case 'percentage_basic':
                answer = Math.floor((b * a) / 100);
                options = this.generateMathOptions(answer, 'percent');
                break;
            case 'half':
                answer = a / 2;
                options = this.generateMathOptions(answer, 'half');
                break;
            case 'linear_equation':
                answer = Math.floor((c - b) / Math.max(1, a));
                options = this.generateMathOptions(answer, 'equation');
                break;
            case 'trigonometry':
                answer = 1;
                options = ["1", "0", "2", "π"];
                break;
            case 'integral':
                answer = `(${a}/2)x² + ${b}x + C`;
                options = [
                    `(${a}/2)x² + ${b}x + C`,
                    `${a}x² + ${b}x + C`,
                    `${a}x + ${b} + C`,
                    `(${a}/3)x³ + ${b}x + C`
                ];
                break;
            case 'derivative':
                answer = `${2*a}x + ${b}`;
                options = [
                    `${2*a}x + ${b}`,
                    `${a}x² + ${b}x`,
                    `${a}x + ${c}`,
                    `${2*a}x² + ${b}`
                ];
                break;
            default:
                answer = a + b;
                options = this.generateMathOptions(answer, 'default');
        }

        const shuffledOptions = this.shuffleArray(options);
        const correctIndex = shuffledOptions.findIndex(opt => opt.toString() === answer.toString());

        return {
            question,
            options: shuffledOptions.map(String),
            correct: correctIndex,
            explanation: `Bu sorunun cevabı: ${answer}. ${this.getMathExplanation(template.type, a, b, c, answer)}`,
            type: template.type,
            difficulty
        };
    }

    generateMathOptions(correctAnswer, type) {
        const options = [correctAnswer];
        
        for (let i = 0; i < 3; i++) {
            let wrongAnswer;
            switch(type) {
                case 'add':
                case 'sub':
                case 'mul':
                case 'div':
                    wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
                    break;
                case 'square':
                    wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
                    break;
                case 'sqrt':
                    wrongAnswer = correctAnswer + Math.floor(Math.random() * 4) - 2;
                    break;
                default:
                    wrongAnswer = correctAnswer + Math.floor(Math.random() * 6) - 3;
            }
            
            if (wrongAnswer !== correctAnswer && wrongAnswer > 0 && !options.includes(wrongAnswer)) {
                options.push(wrongAnswer);
            }
        }
        
        while (options.length < 4) {
            const wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
            if (wrongAnswer !== correctAnswer && wrongAnswer > 0 && !options.includes(wrongAnswer)) {
                options.push(wrongAnswer);
            }
        }
        
        return options.slice(0, 4);
    }

    getMathExplanation(type, a, b, c, answer) {
        const explanations = {
            addition: `${a} ve ${b} sayılarını topladığımızda ${answer} elde ederiz.`,
            subtraction: `${a} ve ${b} sayıları arasındaki fark ${answer}'dir.`,
            multiplication: `${a} ile ${b}'yi çarptığımızda ${answer} elde ederiz.`,
            division: `${a}'yı ${b}'ye böldğümüzde ${answer} elde ederiz.`,
            square: `${a}'nın karesi ${answer}'dir.`,
            sqrt: `${a*a}'nın karekökü ${answer}'dir.`,
            trigonometry: 'Trigonometrik özdeşlik: sin²θ + cos²θ = 1',
            integral: 'İntegral alırken kuvvet 1 artırılır ve katsayı yeni kuvvete bölünür.',
            derivative: 'Türev alırken kuvvet katsayıyla çarpılır ve kuvvet 1 azaltılır.'
        };
        return explanations[type] || 'Matematiksel işlem sonucu.';
    }

    generateQuestion(subject, difficulty, questionNumber) {
        const subjectKey = subject.toLowerCase().replace(/\s+/g, '');
        
        // Konu eşleştirmeleri
        const subjectMappings = {
            'matematik': 'matematik',
            'math': 'matematik',
            'tarih': 'tarih',
            'history': 'tarih',
            'ingilizce': 'ingilizce',
            'english': 'ingilizce',
            'fen': 'fen',
            'fenbilimleri': 'fen',
            'science': 'fen',
            'biology': 'fen',
            'physics': 'fen',
            'chemistry': 'fen'
        };

        const mappedSubject = subjectMappings[subjectKey] || subjectKey;
        
        if (this.questionTemplates[mappedSubject] && this.questionTemplates[mappedSubject][difficulty]) {
            const templates = this.questionTemplates[mappedSubject][difficulty];
            const template = templates[Math.floor(Math.random() * templates.length)];
            
            if (mappedSubject === 'matematik') {
                return this.generateMathQuestion(template, difficulty);
            } else {
                // Diğer konular için hazır sorular
                const shuffledOptions = this.shuffleArray([...template.options]);
                const newCorrectIndex = shuffledOptions.indexOf(template.answer);
                
                return {
                    question: template.q,
                    options: shuffledOptions,
                    correct: newCorrectIndex,
                    explanation: template.explanation || `Doğru cevap: ${template.answer}`,
                    difficulty,
                    subject: mappedSubject
                };
            }
        }

        return this.generateGenericQuestion(subject, difficulty, questionNumber);
    }

    generateGenericQuestion(subject, difficulty, questionNumber) {