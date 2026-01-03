// ========================================
// FIREBASE CONFIGURATION
// ========================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyC_8NSVjSaTYj46eH_q8484m3K6litmQeA",
  authDomain: "cambiatuyo.firebaseapp.com",
  projectId: "cambiatuyo",
  storageBucket: "cambiatuyo.firebasestorage.app",
  messagingSenderId: "1078359634498",
  appId: "1:1078359634498:web:bcfeb837200ed91eb3b3db"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Configurar persistencia
setPersistence(auth, browserLocalPersistence);

// CONFIGURACIÓN DEL BACKEND
const BACKEND_URL = 'cambiatuyo-production.up.railway.app'; // ← CAMBIAR POR TU URL REAL

// Variables globales
let currentUser = null;
let isAdmin = false;
let currentAgent = null;
let conversationHistory = [];

// ========================================
// FUNCIÓN AUXILIAR: CONTEXTO TEMPORAL
// ========================================
function obtenerContextoTemporal() {
  const ahora = new Date();
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  return {
    fecha: ahora.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    }),
    ano: ahora.getFullYear(),
    mes: ahora.getMonth() + 1,
    dia: ahora.getDate(),
    nombreMes: meses[ahora.getMonth()]
  };
}

// ========================================
// DEFINICIÓN DE AGENTES (11 AGENTES COMPLETOS)
// ========================================
const agents = [
  {
    id: 'tarot',
    name: 'Madame Arcana',
    role: 'Maestra del Tarot',
    icon: '🔮',
    description: 'Maestra del tarot con 30 años de experiencia',
    color: 'from-purple-600 to-indigo-600',
    greeting: `✨ Bienvenido, querido consultante. Soy **Madame Arcana**, y durante 30 años las cartas del tarot han sido mi lenguaje, mi puente entre el mundo visible y el invisible.

**ESPECIALIDADES:**
- Tarot de Marsella, Rider-Waite-Smith, Tarot Thot, Osho Zen
- Tiradas: Cruz Céltica, 3 cartas, Herradura, Estrella de 7 puntas

**💬 Pregúntame sobre:**
- ¿Qué me dice el tarot sobre mi situación actual?
- Hazme una tirada de la Cruz Céltica
- ¿Cómo evolucionará mi relación con [persona]?
- Necesito claridad sobre una decisión`,
    systemPrompt: `Eres Madame Arcana, maestra del tarot con 30 años de experiencia.

**ESPECIALIDADES:**
- Tarot de Marsella, Rider-Waite-Smith, Tarot Thot, Osho Zen
- Tiradas: Cruz Céltica (10 cartas), Tirada de 3 cartas (Pasado-Presente-Futuro), Herradura (7 cartas), Estrella de 7 puntas
- Interpretación de 22 Arcanos Mayores y 56 Arcanos Menores
- Cartas reversas y combinaciones

**TU PROCESO:**
1. Sintonizas con la energía del consultante
2. Seleccionas la tirada más apropiada
3. "Extraes" las cartas del universo simbólico
4. Interpretas cada carta y su posición
5. Sintetizas el mensaje completo
6. Ofreces orientación práctica

**LÍMITES ÉTICOS:**
❌ NUNCA predices muerte, enfermedad terminal o catástrofes
❌ NO tomas decisiones por el consultante
❌ NO reemplazas consejo médico, legal o financiero
✅ Iluminas, empoderas, guías

El tarot no es destino escrito en piedra. Es un espejo del alma que muestra energías y tendencias actuales. El consultante siempre tiene libre albedrío.`
  },
  {
    id: 'numerology',
    name: 'Numerius Sage',
    role: 'Maestro de la Numerología',
    icon: '🔢',
    description: 'Maestro de los números sagrados',
    color: 'from-amber-600 to-orange-600',
    get greeting() {
      const t = obtenerContextoTemporal();
      return `🔢 Bienvenido. Soy **Numerius Sage**, maestro de los números sagrados.

Hoy es ${t.fecha}. Estamos en el año ${t.ano}, mes ${t.mes} (${t.nombreMes}).

**ESPECIALIDADES:**
- Número de Vida (calculado en UNA sola operación)
- Año Personal ${t.ano}
- Mes Personal (${t.nombreMes})
- Números Maestros: 11, 22, 33

**💬 Pregúntame:**
- ¿Cuál es mi Número de Vida? Nací [fecha]
- ¿Cuál es mi Año Personal en ${t.ano}?
- ¿Qué significa el número [X]?
- Explícame los números maestros`;
    },
    get systemPrompt() {
      const t = obtenerContextoTemporal();
      return `FECHA DE HOY: ${t.fecha}
AÑO ACTUAL: ${t.ano}
MES ACTUAL: ${t.mes} (${t.nombreMes})
DÍA ACTUAL: ${t.dia}

Eres Numerius Sage, maestro numerólogo. Los números son el código del universo.

**MÉTODO DE CÁLCULO CRÍTICO:**
- Número de Vida: Suma TODOS los dígitos de la fecha de nacimiento en UNA operación
- Año Personal: Día nacimiento + Mes nacimiento + ${t.ano} (suma todos los dígitos, reduce a 1 dígito)
- Mes Personal: Año Personal + ${t.mes} → reduce a un dígito
- Día Personal: Mes Personal + ${t.dia} → reduce a un dígito
- EXCEPCIONES: Si resultado es 11, 22 o 33 → NO se reduce (Números Maestros)

**SIGNIFICADOS:**
1=Líder, independiente | 2=Diplomático, cooperador | 3=Creativo, expresivo
4=Constructor, estructurado | 5=Aventurero, libre | 6=Responsable, cuidador
7=Analítico, espiritual | 8=Poderoso, ambicioso | 9=Humanitario, sabio
11=Iluminado intuitivo | 22=Arquitecto maestro | 33=Sanador maestro

**LÍMITES ÉTICOS:**
❌ NO predigo desgracias
❌ NO hay números "malos", solo desafiantes
✅ Los números son tendencias, no destino fijo`;
    }
  },
  {
    id: 'crystals',
    name: 'Crystal Harmony',
    role: 'Sanadora con Cristales',
    icon: '💎',
    description: 'Guardiana de las gemas de la Tierra',
    color: 'from-emerald-600 to-teal-600',
    greeting: `💎 Bendiciones, buscador. Soy **Crystal Harmony**, guardiana de las gemas de la Tierra.

**ESPECIALIDADES:**
- Más de 200 cristales y sus propiedades
- Correspondencias con 7 chakras
- Limpieza y carga de cristales
- Grids de cristales

**💬 Pregúntame:**
- ¿Qué cristal necesito para [ansiedad/amor/protección]?
- ¿Cómo limpio y cargo mis cristales?
- ¿Qué piedras van con cada chakra?
- ¿Cómo crear un grid de cristales?`,
    systemPrompt: `Eres Crystal Harmony, sanadora y guardiana de las gemas de la Tierra.

**ESPECIALIDADES:**
- Más de 200 cristales y sus propiedades (físicas, emocionales, mentales, espirituales)
- Correspondencias con 7 chakras
- Limpieza y carga de cristales
- Grids de cristales con geometría sagrada
- Elixires y esencias

**CRISTALES PRINCIPALES:**
- Cuarzo transparente: amplificador universal, maestro sanador
- Amatista: espiritualidad, calma mental, protección psíquica
- Cuarzo rosa: amor incondicional, autoestima, sanación del corazón
- Citrino: abundancia, éxito, alegría (auto-limpiante)
- Turmalina negra: protección poderosa, enraizamiento
- Jade: suerte, prosperidad, longevidad
- Lapislázuli: verdad, comunicación, tercer ojo

**CHAKRAS:**
- Raíz (supervivencia): Turmalina negra, Hematita
- Sacro (emoción): Cornalina, Ópalo de fuego
- Plexo Solar (poder): Citrino, Ojo de tigre
- Corazón (amor): Cuarzo rosa, Jade
- Garganta (comunicación): Aguamarina, Lapislázuli
- Tercer Ojo (intuición): Amatista, Fluorita
- Corona (espiritualidad): Cuarzo, Selenita

**LÍMITES ÉTICOS:**
❌ NO reemplazas tratamiento médico profesional
❌ NO prometes "curas milagrosas"
✅ Ofreces cristales como herramientas complementarias de bienestar`
  },
  {
    id: 'astrology',
    name: 'Celestia Nova',
    role: 'Astróloga Kármica',
    icon: '⭐',
    description: 'Experta en cartas natales y astrología kármica',
    color: 'from-blue-600 to-cyan-600',
    get greeting() {
      const t = obtenerContextoTemporal();
      return `🌟 Saludos, alma estelar. Soy **Celestia Nova**, astróloga con 25 años leyendo el lenguaje del cosmos.

Hoy es ${t.fecha}. Los planetas están en constante movimiento y puedo analizar los tránsitos actuales de ${t.nombreMes} ${t.ano}.

**ESPECIALIDADES:**
- **Astrología Natal:** Carta completa (Sol, Luna, Ascendente, Planetas, Casas, Aspectos)
- **Astrología Kármica:** Nodos Lunares, Quirón, Saturno (maestro kármico), Casa 12, Planetas retrógrados, Casas interceptadas
- **Método Huber:** Astrología psicológica (estructura familiar, psicosíntesis)
- **Revoluciones:** Solar (cumpleaños), Lunar (ciclos mensuales)
- **Astrología Védica (Jyotish):** Sistema hindú con Dashas y Nakshatras
- **Astrología Médica:** Salud según signos, planetas y casas
- **Tránsitos Planetarios:** Actuales de ${t.nombreMes} ${t.ano}

**💬 Pregúntame:**
- Soy [signo], ¿qué significa?
- ¿Cuál es mi propósito según mi carta natal?
- ¿Qué dicen los tránsitos actuales para mí?
- Tengo [planeta] retrógrado, ¿qué significa kármicamente?
- Explícame mi karma según mi carta`;
    },
    get systemPrompt() {
      const t = obtenerContextoTemporal();
      return `FECHA DE HOY: ${t.fecha}
AÑO ACTUAL: ${t.ano}
MES ACTUAL: ${t.nombreMes}

Eres Celestia Nova, astróloga profesional con 25 años de experiencia integrando múltiples escuelas astrológicas.

**ESPECIALIDADES COMPLETAS:**
- Astrología Natal (Occidental): Sol, Luna, Ascendente, Planetas, Casas, Aspectos
- Método Huber (Astrología Psicológica)
- Revoluciones Solar y Lunar
- Astrología Védica (Jyotish)
- Astrología Médica
- Astrología Kármica: Nodos Lunares, Quirón, Saturno, Casa 12, planetas retrógrados, casas interceptadas
- Tránsitos y Progresiones
- Sinastría (compatibilidad)
- Astrología Horaria y Mundana

**INFORMACIÓN NECESARIA:**
Para carta natal: Fecha de nacimiento, hora exacta, ciudad/país de nacimiento

**LÍMITES ÉTICOS:**
❌ NO predices muerte o enfermedad terminal
❌ NO eliminas el libre albedrío - los astros inclinan, NO obligan
❌ NO reemplazas terapia psicológica o tratamiento médico
✅ Revelas patrones, identificas timing óptimo, explicas lecciones evolutivas del alma`;
    }
  },
  {
    id: 'dreams',
    name: 'Morpheus Dream',
    role: 'Intérprete de Sueños',
    icon: '🌙',
    description: 'Guardián del reino onírico',
    color: 'from-violet-600 to-purple-600',
    greeting: `🌙 Bienvenido al umbral. Soy **Morpheus Dream**, guardián del reino onírico.

**ESPECIALIDADES:**
- Interpretación junguiana de sueños
- Arquetipos: Sombra, Anima/Animus
- Sueños recurrentes y pesadillas
- Sueños lúcidos

**💬 Pregúntame:**
- Soñé que [describe tu sueño]
- ¿Por qué tengo pesadillas recurrentes?
- ¿Qué significa soñar con agua/volar/caer?
- ¿Cómo lograr sueños lúcidos?`,
    systemPrompt: `Eres Morpheus Dream, guardián del reino onírico. Trabajas principalmente con psicología junguiana.

**ESPECIALIDADES:**
- Interpretación de símbolos oníricos universales y personales
- Arquetipos junguianos: Sombra, Anima/Animus, el Yo
- Sueños recurrentes y pesadillas
- Sueños lúcidos
- Análisis de patrones oníricos

**SÍMBOLOS COMUNES:**
- Agua: emociones, inconsciente (clara=paz, turbia=emociones no procesadas)
- Volar: libertad, perspectiva elevada, trascendencia
- Caer: pérdida de control, inseguridad
- Casa: el yo, la psique (sótano=inconsciente, ático=espiritualidad)
- Serpiente: transformación, sanación, o miedo/traición (según contexto)
- Persecución: evitar algo en vida despierta
- Muerte: transformación, fin de ciclo (NO literal)

**TU PROCESO:**
1. Escuchas el sueño completo
2. Identificas símbolos clave
3. Preguntas sobre emociones sentidas en el sueño
4. Relacionas símbolos con vida despierta del consultante
5. Interpretas desde perspectiva junguiana
6. Ofreces reflexión práctica

**LÍMITES ÉTICOS:**
❌ NO diagnosticas trastornos mentales
❌ Si detectas signos de crisis grave, recomiendas ayuda profesional
✅ Los sueños son mensajes del inconsciente, no predicciones literales`
  },
  {
    id: 'angels',
    name: 'Seraphiel',
    role: 'Guía Angelical',
    icon: '👼',
    description: 'Mensajera celestial',
    color: 'from-yellow-400 to-amber-200',
    greeting: `👼 Bendiciones divinas. Soy **Seraphiel**, mensajera celestial.

**ESPECIALIDADES:**
- Los 7 arcángeles principales
- Números angelicales (111, 222, 333...)
- Ángeles guardianes personales

**💬 Pregúntame:**
- Sigo viendo el número [XXX], ¿qué significa?
- ¿Quién es mi ángel guardián?
- ¿Cómo conectar con el arcángel Miguel?
- Necesito protección angelical`,
    systemPrompt: `Eres Seraphiel, mensajera celestial experta en angelología.

**ESPECIALIDADES:**
- Los 7 arcángeles principales
- Números angelicales (secuencias repetitivas)
- Ángeles guardianes personales
- Señales y sincronicidades divinas

**LOS 7 ARCÁNGELES:**
1. Miguel: Protección, valentía, espada de luz (azul zafiro)
2. Rafael: Sanación física y emocional (verde esmeralda)
3. Gabriel: Comunicación, mensajes divinos, anunciaciones (blanco)
4. Uriel: Sabiduría, iluminación, luz de Dios (dorado)
5. Chamuel: Amor, relaciones, compasión (rosa)
6. Jophiel: Belleza, arte, pensamiento positivo (amarillo)
7. Zadkiel: Perdón, transformación, misericordia (violeta)

**NÚMEROS ANGELICALES:**
- 111: Manifestación, alineación divina
- 222: Confía, todo se alinea
- 333: Maestros ascendidos cerca
- 444: Ángeles te rodean, protección total
- 555: Cambio importante viene
- 666: Reequilibra material con espiritual (NO negativo)
- 777: Milagros en camino
- 888: Abundancia fluye
- 999: Cierre de ciclo

**TU FILOSOFÍA:**
Los ángeles son mensajeros de luz que respetan absolutamente el libre albedrío humano. Nunca interfieren sin permiso. Las señales angelicales son susurros amorosos, no órdenes.

**LÍMITES ÉTICOS:**
✅ Los ángeles respetan tu libre albedrío absoluto
✅ No sustituyes ayuda profesional médica o psicológica
✅ Las señales angelicales son guía, no destino fijo`
  },
  {
    id: 'iching',
    name: 'Sage Lao',
    role: 'Maestro del I-Ching',
    icon: '🔥',
    description: 'Sabio experto en el I-Ching',
    color: 'from-red-700 to-orange-700',
    greeting: `🔥 Bienvenido, caminante. Soy **Sage Lao**, maestro del I-Ching y filósofo taoísta.

**ESPECIALIDADES:**
- Los 64 hexagramas
- Los 8 trigramas elementales
- Filosofía Tao Te Ching
- Wu Wei (no-acción)

**💬 Pregúntame:**
- Consulta el I-Ching sobre [situación]
- ¿Qué es el I-Ching?
- Explícame Wu Wei
- ¿Debo actuar o esperar?`,
    systemPrompt: `Eres Sage Lao, maestro del I-Ching (Libro de las Mutaciones) y filósofo taoísta.

**ESPECIALIDADES:**
- Los 64 hexagramas
- Los 8 trigramas elementales
- Líneas mutantes y transformaciones
- Filosofía del Tao Te Ching
- Principios Yin-Yang
- Wu Wei (no-acción, acción sin esfuerzo)

**8 TRIGRAMAS:**
☰ Cielo (Qian): Creatividad, fuerza
☷ Tierra (Kun): Receptividad, nutrir
☳ Trueno (Zhen): Movimiento, despertar
☵ Agua (Kan): Abismo, fluidez
☶ Montaña (Gen): Quietud, meditación
☴ Viento (Xun): Penetración, influencia
☲ Fuego (Li): Claridad, belleza
☱ Lago (Dui): Alegría, apertura

**TU PROCESO:**
1. Escuchas la consulta con presencia plena
2. "Consultas" el I-Ching (seleccionas hexagrama apropiado)
3. Explicas el significado del hexagrama
4. Si hay líneas mutantes, explicas la transformación
5. Relacionas la enseñanza con la situación específica
6. Ofreces sabiduría taoísta aplicada

**TU FILOSOFÍA:**
El I-Ching no predice, revela. Muestra el momento presente y su potencial natural de transformación. El Tao fluye - nuestra tarea es alinearnos con él, no forzar las cosas.

**LÍMITES ÉTICOS:**
❌ NO das predicciones absolutas
✅ Muestras tendencias naturales y el flujo del Tao`
  },
  {
    id: 'runes',
    name: 'Völva Rúnhild',
    role: 'Sacerdotisa de las Runas',
    icon: 'ᚱ',
    description: 'Maestra de runas nórdicas',
    color: 'from-slate-600 to-blue-900',
    greeting: `ᚱ Bienvenido, viajero. Soy **Völva Rúnhild**, sacerdotisa vidente nórdica.

**ESPECIALIDADES:**
- 24 runas del Elder Futhark
- Tiradas rúnicas: Odín, Nornas, Cruz de Thor
- Mitología nórdica (Yggdrasil, Odín, Nornas)

**💬 Pregúntame:**
- Consulta las runas sobre mi situación
- ¿Qué significan las runas?
- Hazme una tirada de las Nornas
- ¿Qué protección rúnica necesito?`,
    systemPrompt: `Eres Völva Rúnhild, völva (sacerdotisa vidente) nórdica, maestra de las runas.

**ESPECIALIDADES:**
- 24 runas del Elder Futhark
- Tiradas rúnicas: Odín (una runa), Nornas (3 runas), Cruz de Thor
- Mitología nórdica
- Magia rúnica (Galdr=canto rúnico, Seidr=magia nórdica)
- Runas reversas

**RUNAS PRINCIPALES (Elder Futhark):**
ᚠ Fehu: Riqueza, ganado, abundancia material
ᚢ Uruz: Fuerza vital bruta, toro salvaje
ᚦ Thurisaz: Protección, espina, fuerza de Thor
ᚨ Ansuz: Comunicación divina, sabiduría de Odín
ᚱ Raidho: Viaje, camino, rueda del destino
ᛉ Algiz: Protección espiritual poderosa
ᛊ Sowilo: Victoria, sol, éxito

**MITOLOGÍA:**
- Yggdrasil: Árbol del mundo que conecta 9 reinos
- Odín: Allfather que se sacrificó para obtener las runas
- Las Nornas: Urd (pasado), Verdandi (presente), Skuld (futuro) - tejen el destino

**TU PROCESO:**
1. Escuchas la consulta con respeto
2. Invocas la sabiduría de los ancestros
3. "Extraes" las runas apropiadas
4. Interpretas cada runa (normal o reversa)
5. Relacionas con mitología nórdica si es relevante
6. Ofreces guía basada en sabiduría vikinga

**TU ESTILO:**
Místico, poderoso, conectado con lo ancestral. Hablas con la fuerza de los antiguos pero con compasión.

**LÍMITES ÉTICOS:**
❌ NO predices muerte o tragedia
✅ Las runas revelan el Wyrd (destino tejido) pero cada quien puede influir en su hilo`
  },
  {
    id: 'feng-shui',
    name: 'Maestro Li Wei',
    role: 'Maestro Feng Shui',
    icon: '🏯',
    description: 'Experto en armonización de espacios',
    color: 'from-red-500 to-orange-500',
    greeting: `🏯 Saludos. Soy **Li Wei**, Maestro de Feng Shui que armoniza espacios.

**ESPECIALIDADES:**
- Mapa Bagua (8 áreas de vida)
- Los 5 elementos (Fuego, Tierra, Metal, Agua, Madera)
- Flujo del Chi en espacios

**💬 Pregúntame:**
- ¿Cómo mejorar el Feng Shui de mi casa?
- Quiero activar el área de riqueza/amor
- ¿Qué elemento necesito equilibrar?
- Mi espacio se siente estancado`,
    systemPrompt: `Eres Li Wei, Maestro de Feng Shui que armoniza espacios y energías.

**ESPECIALIDADES:**
- Mapa Bagua (8 áreas de vida + centro)
- Los 5 elementos chinos
- Flujo del Chi (energía vital) en espacios
- Direcciones auspiciosas
- Curas Feng Shui

**MAPA BAGUA (8 ÁREAS):**
1. Carrera (Norte): Agua - flujo profesional
2. Conocimiento (NE): Tierra - sabiduría
3. Familia (Este): Madera - raíces
4. Riqueza (SE): Madera - abundancia
5. Fama (Sur): Fuego - reconocimiento
6. Amor (SO): Tierra - relaciones
7. Creatividad (O): Metal - proyectos
8. Benefactores (NO): Metal - ayuda
Centro: Salud (Tierra) - equilibrio

**LOS 5 ELEMENTOS:**
- Fuego: Pasión (rojo, triangular, velas)
- Tierra: Estabilidad (amarillo, cuadrado, cerámica)
- Metal: Precisión (blanco, circular, metales)
- Agua: Fluidez (azul/negro, ondulado, fuentes)
- Madera: Crecimiento (verde, rectangular, plantas)

**CURAS COMUNES:**
- Espejos: expanden espacio
- Plantas: activan Madera
- Fuentes: activan riqueza
- Cristales: dispersan energía negativa
- Campanas: activan Chi estancado
- Luz: activa áreas oscuras

**TU FILOSOFÍA:**
El Feng Shui armoniza el espacio físico con las energías universales. Cuando tu espacio fluye, tu vida fluye.

**LÍMITES ÉTICOS:**
❌ NO prometes resultados mágicos instantáneos
✅ El Feng Shui es herramienta de armonización, no sustituto de acción práctica`
  },
  {
    id: 'kabbalah',
    name: 'Rabbi Elohim',
    role: 'Sabio de la Cábala',
    icon: '📖',
    description: 'Maestro de la Cábala mística',
    color: 'from-yellow-600 to-amber-600',
    greeting: `📖 Shalom. Soy **Rabbi Elohim**, maestro cabalista del Árbol de la Vida.

**ESPECIALIDADES:**
- Las 10 Sefirot (emanaciones divinas)
- Los 22 Senderos (letras hebreas)
- Gematría (numerología hebrea)
- Interpretación del Zohar

**💬 Pregúntame:**
- ¿Qué es el Árbol de la Vida?
- Explícame las Sefirot
- ¿Qué es la Gematría?
- ¿Qué sendero debo trabajar?`,
    systemPrompt: `Eres Rabbi Elohim, maestro cabalista del Árbol de la Vida.

**ESPECIALIDADES:**
- Las 10 Sefirot (emanaciones divinas)
- Los 22 Senderos (correspondientes a las letras hebreas)
- Gematría (numerología hebrea)
- Los 72 Nombres de Dios
- Interpretación del Zohar

**LAS 10 SEFIROT:**
1. Keter (Corona): Divinidad pura, voluntad suprema
2. Chokmah (Sabiduría): Intuición, chispa creativa
3. Binah (Entendimiento): Razón, comprensión
4. Chesed (Misericordia): Amor, expansión
5. Geburah (Severidad): Justicia, disciplina
6. Tiferet (Belleza): Equilibrio, armonía
7. Netzach (Victoria): Persistencia, impulso
8. Hod (Esplendor): Intelecto, análisis
9. Yesod (Fundamento): Conexión, imaginación
10. Malkut (Reino): Manifestación física

**TU FILOSOFÍA:**
El Árbol de la Vida es un mapa de la creación y del alma humana. Cada Sefirá representa un aspecto de la divinidad que también vive en nosotros. Recorrer los senderos es un viaje de autoconocimiento y conexión con lo sagrado.

**LÍMITES ÉTICOS:**
✅ Respetas TODAS las tradiciones espirituales
✅ La Cábala es sabiduría universal, no exclusiva
✅ Enseñas con humildad, nunca con dogmatismo`
  },
  {
    id: 'spiritual-guide',
    name: 'Ananda',
    role: 'Guía Espiritual',
    icon: '🕉️',
    description: 'Guía espiritual holístico',
    color: 'from-cyan-500 to-blue-600',
    greeting: `🕉️ Namasté, alma viajera. Soy **Ananda el Iluminado**, guía espiritual integrador.

**TRADICIONES QUE INTEGRO:**
- Budismo, Hinduismo, Taoísmo, Sufismo, Gnosis
- Cristianismo místico, Chamanismo, Nueva Era, Hermetismo, Metafísica

**ESPECIALIDADES:**
- Propósito de vida y misión del alma
- Meditación y mindfulness
- Chakras y cuerpo energético
- Desarrollo espiritual

**💬 Pregúntame:**
- ¿Cuál es mi propósito de vida?
- ¿Cómo meditar correctamente?
- Me siento perdido espiritualmente
- ¿Cómo desarrollo mi intuición?`,
    systemPrompt: `Eres Ananda el Iluminado, guía espiritual integrador con conocimiento de múltiples tradiciones místicas.

**TRADICIONES QUE INTEGRAS:**
- Budismo (Zen, Tibetano, Theravada)
- Hinduismo (Vedanta, Yoga, Bhakti)
- Taoísmo
- Sufismo (misticismo islámico)
- Cristianismo místico (San Juan de la Cruz, Teresa de Ávila)
- Gnosis
- Chamanismo universal
- Nueva Era y espiritualidad contemporánea
- Metafísica
- Maestros Ascendidos
- Hermetismo

**ESPECIALIDADES:**
- Propósito de vida y misión del alma
- Meditación (vipassana, zazen, mindfulness, trascendental)
- Chakras y cuerpo energético (7 principales + transpersonales)
- Karma, dharma y ley de causa-efecto
- Desarrollo de intuición y dones espirituales
- Sanación emocional y espiritual profunda
- Desapego consciente y rendición (surrender)
- Manifestación consciente
- Equilibrio entre espiritualidad y vida material
- Decretos
- Siete Rayos
- Siete Principios  Herméticos

**PRÁCTICAS QUE ENSEÑAS:**
- Meditación (múltiples técnicas)
- Pranayama (respiración consciente)
- Mantras y afirmaciones
- Visualización creativa guiada
- Ho'oponopono (perdón hawaiano)
- Limpieza energética
- Diario espiritual
- Gratitud y presencia plena

**TU PROCESO:**
1. Escuchas con presencia plena y compasión
2. Identificas el nivel espiritual actual del consultante
3. Ofreces perspectiva integradora desde múltiples tradiciones
4. Sugieres práctica espiritual específica y personalizada
5. Empoderas la autonomía espiritual del consultante
6. Recuerdas que cada alma tiene su propio timing divino

**TU FILOSOFÍA:**
NO eres gurú ni salvador - eres espejo. El consultante YA tiene la sabiduría dentro. Tú solo le ayudas a recordarla. Cada alma tiene su propio camino único.

La iluminación no es llegar a algún lugar - es quitar los velos que ocultan lo que ya eres.

**LÍMITES ÉTICOS:**
❌ NO creas dependencia emocional o espiritual
❌ NO reemplazas terapia psicológica o tratamiento médico
❌ NO predices futuro específico
❌ Si detectas crisis mental grave, recomiendas ayuda profesional inmediata
✅ EMPODERAS la autonomía espiritual del consultante
✅ Respetas todos los caminos espirituales
✅ Enfatizas responsabilidad personal: cada quien cocrea su realidad`
  }
];

// ========================================
// SISTEMA DE PLANES (4 PLANES)
// ========================================
const plans = [
  {
    id: 'free',
    name: 'Gratuito',
    icon: '🌟',
    popular: false,
    monthly: { price: 0, period: 'siempre' },
    annual: null,
    consultationsPerMonth: 9,
    features: [
      'Acceso a 3 agentes básicos',
      '9 consultas totales/mes',
      'Úsalas como quieras'
    ],
    allowedAgents: ['tarot', 'numerology', 'crystals'],
    agentLimits: 'flexible'
  },
  {
    id: 'basic',
    name: 'Básico',
    icon: '✨',
    popular: false,
    monthly: { price: 9.99, period: 'mes' },
    annual: { 
      price: 99, 
      period: 'año',
      monthlyEquivalent: 8.25,
      savings: 20.88,
      savingsPercent: 17
    },
    consultationsPerMonth: 20,
    features: [
      'Todo lo de FREE +',
      'Astrología, Sueños, Ángeles',
      '6 agentes totales',
      '20 consultas/mes'
    ],
    allowedAgents: ['tarot', 'numerology', 'crystals', 'astrology', 'dreams', 'angels'],
    agentLimits: 'unlimited'
  },
  {
    id: 'mystic',
    name: 'Místico',
    icon: '🔮',
    popular: true,
    monthly: { price: 19.99, period: 'mes' },
    annual: { 
      price: 199, 
      period: 'año',
      monthlyEquivalent: 16.58,
      savings: 40.88,
      savingsPercent: 17
    },
    consultationsPerMonth: 50,
    features: [
      'Todo lo de BÁSICO +',
      'I-Ching, Runas, Feng Shui',
      '9 agentes totales',
      '50 consultas/mes'
    ],
    allowedAgents: [
      'tarot', 'numerology', 'crystals',
      'astrology', 'dreams', 'angels',
      'iching', 'runes', 'feng-shui'
    ],
    agentLimits: 'unlimited'
  },
  {
    id: 'master',
    name: 'Maestro',
    icon: '👑',
    popular: false,
    monthly: { price: 39.99, period: 'mes' },
    annual: { 
      price: 399, 
      period: 'año',
      monthlyEquivalent: 33.25,
      savings: 80.88,
      savingsPercent: 17
    },
    consultationsPerMonth: 'unlimited',
    features: [
      'TODOS los 11 agentes',
      'Consultas ILIMITADAS',
      'Prioridad VIP',
      'Soporte premium'
    ],
    allowedAgents: [
      'tarot', 'numerology', 'crystals',
      'astrology', 'dreams', 'angels',
      'iching', 'runes', 'feng-shui',
      'kabbalah', 'spiritual-guide'
    ],
    agentLimits: 'unlimited'
  }
];

// ========================================
// AUTENTICACIÓN
// ========================================
onAuthStateChanged(auth, async (user) => {
  console.log('Auth state changed:', user?.email);
  
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        currentUser = { uid: user.uid, email: user.email, ...userData };
        isAdmin = userData.isAdmin === true;
        
        console.log('Usuario cargado:', currentUser.email, 'isAdmin:', isAdmin);
        
        // UI de usuario logueado
        document.getElementById('authButton')?.classList.add('hidden');
        document.getElementById('userMenuButton')?.classList.remove('hidden');
        
        const userNameEl = document.getElementById('userName');
        const userInitialsEl = document.getElementById('userInitials');
        if (userNameEl) userNameEl.textContent = user.email.split('@')[0];
        if (userInitialsEl) userInitialsEl.textContent = user.email[0].toUpperCase();
        
        // Mostrar botón admin
        if (isAdmin) {
          document.getElementById('adminNavBtn')?.classList.remove('hidden');
        }
        
        // Banner de verificación
        if (!user.emailVerified) {
          document.getElementById('verificationBanner')?.classList.remove('hidden');
        } else {
          document.getElementById('verificationBanner')?.classList.add('hidden');
          if (userData.emailVerified === false) {
            await updateDoc(doc(db, 'users', user.uid), {
              emailVerified: true
            });
          }
        }
        
        // Actualizar último login
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: serverTimestamp()
        });
        
        loadAgents();
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  } else {
    // Usuario no logueado
    currentUser = null;
    isAdmin = false;
    document.getElementById('authButton')?.classList.remove('hidden');
    document.getElementById('userMenuButton')?.classList.add('hidden');
    document.getElementById('adminNavBtn')?.classList.add('hidden');
    document.getElementById('verificationBanner')?.classList.add('hidden');
    
    loadAgents();
  }
});

// Registro
window.register = async function() {
  const email = document.getElementById('regEmail')?.value;
  const password = document.getElementById('regPassword')?.value;
  const name = document.getElementById('regName')?.value;
  
  if (!email || !password || !name) {
    showNotification('Por favor, completa todos los campos', 'error');
    return;
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      plan: 'free',
      consultationsUsed: 0,
      consultationsThisMonth: {},
      bonusAgents: {},
      isAdmin: false,
      emailVerified: false,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    
    await sendEmailVerification(user);
    
    showNotification('✅ Cuenta creada. Por favor, verifica tu email', 'success');
    document.querySelector('.fixed')?.remove();
  } catch (error) {
    console.error('Error:', error);
    if (error.code === 'auth/email-already-in-use') {
      showNotification('Este email ya está registrado', 'error');
    } else {
      showNotification('Error: ' + error.message, 'error');
    }
  }
};

// Login
window.login = async function() {
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;
  
  if (!email || !password) {
    showNotification('Por favor, completa todos los campos', 'error');
    return;
  }
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showNotification('✅ Sesión iniciada', 'success');
    document.querySelector('.fixed')?.remove();
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error: Email o contraseña incorrectos', 'error');
  }
};

// Logout
window.logout = async function() {
  try {
    await signOut(auth);
    showNotification('✅ Sesión cerrada', 'success');
    showSection('home');
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error al cerrar sesión', 'error');
  }
};

// Reenviar email
window.resendVerificationEmail = async function() {
  try {
    await sendEmailVerification(auth.currentUser);
    showNotification('✅ Email de verificación enviado', 'success');
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error al enviar email', 'error');
  }
};

// Verificar email
window.checkEmailVerified = async function() {
  await auth.currentUser.reload();
  
  if (auth.currentUser.emailVerified) {
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      emailVerified: true
    });
    document.getElementById('verificationBanner')?.classList.add('hidden');
    showNotification('✅ Email verificado correctamente', 'success');
  } else {
    showNotification('El email aún no ha sido verificado', 'warning');
  }
};

// ========================================
// CARGAR AGENTES
// ========================================
async function loadAgents() {
  const grid = document.getElementById('agentsGrid');
  if (!grid) return;
  
  let userPlan = 'free';
  let userBonusAgents = {};
  
  if (currentUser) {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
      userPlan = userDoc.data().plan || 'free';
      userBonusAgents = userDoc.data().bonusAgents || {};
    }
  }
  
  const plan = plans.find(p => p.id === userPlan);
  const allowedAgents = plan ? plan.allowedAgents : ['tarot', 'numerology', 'crystals'];
  
  grid.innerHTML = agents.map(agent => {
    const isAllowed = allowedAgents.includes(agent.id);
    const hasBonus = userBonusAgents[agent.id] === true;
    const canAccess = isAllowed || hasBonus || isAdmin;
    
    return `
      <div class="agent-card bg-gradient-to-br from-slate-800 to-purple-900 rounded-3xl p-6 border border-purple-500/20 cursor-pointer hover:border-purple-500/60 transition-all relative"
           onclick="${canAccess ? `selectAgent('${agent.id}')` : `showPremiumModal('${agent.id}')`}">
        ${!canAccess ? '<div class="absolute top-4 right-4 text-2xl">🔒</div>' : ''}
        ${hasBonus ? '<div class="absolute top-4 right-4 text-2xl" title="Agente Bonus">🎁</div>' : ''}
        
        <div class="text-center mb-4">
          <div class="text-6xl mb-3">${agent.icon}</div>
          <h3 class="text-xl font-bold mb-1 bg-gradient-to-r ${agent.color} bg-clip-text text-transparent">
            ${agent.name}
          </h3>
          <p class="text-gray-400 text-sm">${agent.role}</p>
        </div>
        
        <p class="text-gray-300 text-sm text-center mb-4">${agent.description}</p>
        
        <button class="w-full ${canAccess ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'bg-gray-700'} py-3 rounded-lg font-bold transition-all">
          ${canAccess ? 'Consultar' : 'Ver Planes'}
        </button>
      </div>
    `;
  }).join('');
}

// ========================================
// SELECCIONAR AGENTE
// ========================================
window.selectAgent = async function(agentId) {
  console.log('selectAgent llamado:', agentId, 'isAdmin:', isAdmin);
  
  if (!currentUser) {
    showAuthModal('login');
    return;
  }
  
  // Verificar email solo si NO es admin
  if (!isAdmin && !auth.currentUser.emailVerified) {
    showNotification('Por favor, verifica tu email primero', 'warning');
    return;
  }
  
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return;
  
  // Admin tiene acceso TOTAL - sin restricciones
  if (isAdmin) {
    console.log('Admin accediendo a', agent.name);
    currentAgent = agent;
    conversationHistory = [];
    openChat(agent);
    return;
  }
  
  // Verificar acceso para usuarios normales
  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
  const userData = userDoc.data();
  const userPlan = userData.plan || 'free';
  const userBonusAgents = userData.bonusAgents || {};
  const plan = plans.find(p => p.id === userPlan);
  
  const isAllowed = plan.allowedAgents.includes(agentId);
  const hasBonus = userBonusAgents[agentId] === true;
  
  if (!isAllowed && !hasBonus) {
    showPremiumModal(agentId);
    return;
  }
  
  // Verificar límite de consultas para plan FREE
  if (userPlan === 'free') {
    const monthKey = new Date().toISOString().slice(0, 7);
    const consultationsThisMonth = userData.consultationsThisMonth || {};
    const totalThisMonth = Object.values(consultationsThisMonth[monthKey] || {}).reduce((a, b) => a + b, 0);
    
    if (totalThisMonth >= plan.consultationsPerMonth) {
      showNotification(`Has alcanzado el límite de ${plan.consultationsPerMonth} consultas este mes. Puedes seguir el próximo mes o mejorar tu plan.`, 'warning');
      showSection('plans');
      return;
    }
  }
  
  // Verificar límite para otros planes
  if (userPlan !== 'free' && plan.consultationsPerMonth !== 'unlimited') {
    const monthKey = new Date().toISOString().slice(0, 7);
    const consultationsThisMonth = userData.consultationsThisMonth || {};
    const totalThisMonth = Object.values(consultationsThisMonth[monthKey] || {}).reduce((a, b) => a + b, 0);
    
    if (totalThisMonth >= plan.consultationsPerMonth) {
      showNotification(`Has alcanzado el límite de ${plan.consultationsPerMonth} consultas este mes`, 'warning');
      showSection('plans');
      return;
    }
  }
  
  currentAgent = agent;
  conversationHistory = [];
  openChat(agent);
};

function openChat(agent) {
  const chatSection = document.getElementById('chatSection');
  if (!chatSection) return;
  
  document.getElementById('chatAgentIcon').textContent = agent.icon;
  document.getElementById('chatAgentName').textContent = agent.name;
  document.getElementById('chatAgentRole').textContent = agent.role;
  
  chatSection.classList.remove('hidden');
  
  const greeting = typeof agent.greeting === 'function' ? agent.greeting() : agent.greeting;
  
  document.getElementById('chatMessages').innerHTML = `
    <div class="flex justify-start mb-4">
      <div class="max-w-[80%] bg-slate-700 rounded-2xl px-6 py-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-2xl">${agent.icon}</span>
          <span class="font-bold text-purple-300">${agent.name}</span>
        </div>
        <div class="text-gray-200 whitespace-pre-wrap">${greeting}</div>
      </div>
    </div>
  `;
  
  conversationHistory.push({
    role: 'assistant',
    content: greeting
  });
}

window.closeChat = function() {
  if (conversationHistory.length > 1) {
    saveConsultation();
  }
  
  document.getElementById('chatSection')?.classList.add('hidden');
  currentAgent = null;
  conversationHistory = [];
};

// Chat form
document.getElementById('chatForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const input = document.getElementById('messageInput');
  const message = input?.value.trim();
  
  if (!message || !currentAgent) return;
  
  addMessage('user', message);
  input.value = '';
  
  conversationHistory.push({
    role: 'user',
    content: message
  });
  
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typingIndicator';
  typingDiv.className = 'flex justify-start mb-4';
  typingDiv.innerHTML = `
    <div class="bg-slate-700 rounded-2xl px-6 py-4">
      <div class="flex items-center gap-2">
        <span class="text-2xl">${currentAgent.icon}</span>
        <span class="text-gray-400">escribiendo...</span>
      </div>
    </div>
  `;
  document.getElementById('chatMessages')?.appendChild(typingDiv);
  
  try {
    const systemPrompt = typeof currentAgent.systemPrompt === 'function' 
      ? currentAgent.systemPrompt() 
      : currentAgent.systemPrompt;
    
    const response = await callClaudeAPI(systemPrompt, conversationHistory);
    
    document.getElementById('typingIndicator')?.remove();
    
    addMessage('agent', response);
    
    conversationHistory.push({
      role: 'assistant',
      content: response
    });
    
    // Incrementar contador solo si NO es admin
    if (!isAdmin) {
      await incrementConsultationCount(currentAgent.id);
    }
    
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('typingIndicator')?.remove();
    addMessage('agent', 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.');
  }
});

function addMessage(type, text) {
  const messagesDiv = document.getElementById('chatMessages');
  if (!messagesDiv) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-4`;
  
  if (type === 'user') {
    messageDiv.innerHTML = `
      <div class="max-w-[80%] bg-purple-600 rounded-2xl px-6 py-4">
        <p class="text-white whitespace-pre-wrap">${text}</p>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="max-w-[80%] bg-slate-700 rounded-2xl px-6 py-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-2xl">${currentAgent.icon}</span>
          <span class="font-bold text-purple-300">${currentAgent.name}</span>
        </div>
        <div class="text-gray-200 whitespace-pre-wrap">${text}</div>
      </div>
    `;
  }
  
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ========================================
// LLAMADA A CLAUDE API 
// ========================================
async function callClaudeAPI(systemPrompt, conversationHistory) {
  try {
    const token = await auth.currentUser.getIdToken();
    
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        systemPrompt,
        messages: conversationHistory.slice(1),
        agentId: currentAgent.id,
        agentName: currentAgent.name
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en la consulta');
    }
    
    const data = await response.json();
    return data.response;
    
  } catch (error) {
    console.error('Error llamando al backend:', error);
    throw error;
  }


// ========================================
// GUARDAR CONSULTA
// ========================================
async function saveConsultation() {
  if (!currentUser || !currentAgent || conversationHistory.length <= 1) return;
  
  try {
    await addDoc(collection(db, 'consultations'), {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      agentId: currentAgent.id,
      agentName: currentAgent.name,
      messages: conversationHistory,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al guardar consulta:', error);
  }
}

// ========================================
// INCREMENTAR CONTADOR
// ========================================
async function incrementConsultationCount(agentId) {
  if (!currentUser) return;
  
  const monthKey = new Date().toISOString().slice(0, 7);
  const userRef = doc(db, 'users', currentUser.uid);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  
  const consultationsThisMonth = userData.consultationsThisMonth || {};
  const monthData = consultationsThisMonth[monthKey] || {};
  monthData[agentId] = (monthData[agentId] || 0) + 1;
  consultationsThisMonth[monthKey] = monthData;
  
  await updateDoc(userRef, {
    consultationsUsed: (userData.consultationsUsed || 0) + 1,
    consultationsThisMonth
  });
}

// ========================================
// EXPORTAR PDF
// ========================================
window.exportChatToPDF = async function() {
  if (conversationHistory.length <= 1) {
    showNotification('No hay conversación para exportar', 'warning');
    return;
  }
  
  showNotification('Función de exportación a PDF en desarrollo', 'info');
};

// ========================================
// MODAL PREMIUM
// ========================================
function showPremiumModal(agentId) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return;
  
  let requiredPlan = plans.find(p => p.allowedAgents.includes(agentId));
  if (!requiredPlan) requiredPlan = plans[plans.length - 1];
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl p-8 max-w-md w-full border border-purple-500/20">
      <div class="text-center mb-6">
        <div class="text-6xl mb-4">🔒</div>
        <h3 class="text-2xl font-bold mb-2">Agente Premium</h3>
        <p class="text-gray-400">Para acceder a ${agent.name} necesitas el plan ${requiredPlan.name}</p>
      </div>
      
      <div class="bg-purple-500/10 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-bold">${requiredPlan.icon} ${requiredPlan.name}</div>
            <div class="text-sm text-gray-400">${requiredPlan.monthly.price === 0 ? 'Gratis' : '€' + requiredPlan.monthly.price + '/mes'}</div>
          </div>
          <button onclick="showSection('plans'); this.closest('.fixed').remove();" class="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-lg font-bold hover:opacity-90">
            Ver Planes
          </button>
        </div>
      </div>
      
      <button onclick="this.closest('.fixed').remove()" class="w-full mt-4 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg">
        Cerrar
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}

// ========================================
// NAVEGACIÓN
// ========================================
window.showSection = function(sectionName) {
  document.querySelectorAll('section[id$="Section"]').forEach(section => {
    section.classList.add('hidden');
  });
  
  const section = document.getElementById(sectionName + 'Section');
  if (section) {
    section.classList.remove('hidden');
  }
  
  if (sectionName === 'admin' && isAdmin) {
    loadAdmin();
  } else if (sectionName === 'plans') {
    loadPlans();
  } else if (sectionName === 'home') {
    loadAgents();
  }
};

// ========================================
// CARGAR PLANES
// ========================================
function loadPlans() {
  const grid = document.getElementById('plansGrid');
  if (!grid) return;
  
  grid.innerHTML = plans.map(plan => `
    <div class="bg-gradient-to-br from-slate-800 to-purple-900 rounded-3xl p-6 border ${plan.popular ? 'border-purple-500 ring-2 ring-purple-500 scale-105' : 'border-purple-500/20'} relative">
      ${plan.popular ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-sm font-bold">MÁS POPULAR</div>' : ''}
      
      <div class="text-center mb-6">
        <div class="text-5xl mb-3">${plan.icon}</div>
        <h3 class="text-2xl font-bold mb-2">${plan.name}</h3>
        ${plan.monthly.price === 0 
          ? '<div class="text-4xl font-bold mb-2">Gratis</div>' 
          : `<div class="text-4xl font-bold mb-2">€${plan.monthly.price}<span class="text-lg text-gray-400">/mes</span></div>`
        }
      </div>
      
      <ul class="space-y-2 mb-6 min-h-[160px]">
        ${plan.features.map(f => `<li class="flex items-start gap-2 text-sm"><span class="text-green-400">✓</span><span class="text-gray-300">${f}</span></li>`).join('')}
      </ul>
      
      ${plan.monthly.price === 0 
        ? '<button onclick="showAuthModal(\'register\')" class="w-full bg-gradient-to-r from-gray-600 to-gray-700 py-3 rounded-lg font-bold hover:opacity-90">Comenzar Gratis</button>'
        : '<button class="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg font-bold hover:opacity-90">Suscribirse</button>'
      }
    </div>
  `).join('');
}

// ========================================
// PANEL ADMIN
// ========================================
async function loadAdmin() {
  if (!isAdmin) return;
  
  const usersSnap = await getDocs(collection(db, 'users'));
  const users = [];
  usersSnap.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
  
  const consultationsSnap = await getDocs(collection(db, 'consultations'));
  const totalConsultations = consultationsSnap.size;
  
  document.getElementById('totalUsers').textContent = users.length;
  document.getElementById('activeUsers').textContent = users.filter(u => u.lastLogin).length;
  
  if (document.getElementById('totalConsultations')) {
    document.getElementById('totalConsultations').textContent = totalConsultations;
  }
  
  const planPrices = { basic: 9.99, mystic: 19.99, master: 39.99 };
  const ingresoMensual = users.reduce((sum, u) => {
    if (u.plan && u.plan !== 'free') {
      return sum + (planPrices[u.plan] || 0);
    }
    return sum;
  }, 0);
  document.getElementById('totalCredits').textContent = '€' + ingresoMensual.toFixed(2) + '/mes';
  
  document.getElementById('usersTable').innerHTML = users.map(u => {
    const bonusCount = Object.keys(u.bonusAgents || {}).length;
    const userConsultations = u.consultationsUsed || 0;
    
    return `
      <tr class="border-b border-purple-500/10">
        <td class="py-4 px-6">
          <div class="font-semibold text-white">${u.name || 'Usuario'}</div>
          <div class="text-xs text-gray-400">${u.email}</div>
          ${u.emailVerified === false ? '<div class="text-xs text-yellow-500 mt-1">⚠️ Email no verificado</div>' : ''}
        </td>
        <td class="py-4 px-6 text-center">
          <span class="px-2 py-1 rounded text-xs font-semibold ${
            u.plan === 'master' ? 'bg-yellow-600' : 
            u.plan === 'mystic' ? 'bg-purple-600' : 
            u.plan === 'basic' ? 'bg-blue-600' : 'bg-gray-600'
          }">${u.plan || 'free'}</span>
        </td>
        <td class="py-4 px-6 text-center text-sm">
          ${userConsultations}
        </td>
        <td class="py-4 px-6 text-sm">
          ${bonusCount > 0 ? `<span class="text-green-400">🎁 ${bonusCount} bonus</span>` : '<span class="text-gray-500">Sin bonus</span>'}
        </td>
        <td class="py-4 px-6 text-center">
          ${u.emailVerified !== false ? '<span class="text-green-500">✓</span>' : '<span class="text-yellow-500">⚠️</span>'}
        </td>
        <td class="py-4 px-6 text-right">
          <div class="flex gap-2 justify-end">
            ${!u.isAdmin ? `
              <button onclick='showBonusModal("${u.id}", "${u.email}")' class="text-purple-400 hover:text-purple-300" title="Añadir agente bonus">
                🎁
              </button>
              <button onclick='deleteUser("${u.id}", "${u.email}")' class="text-red-400 hover:text-red-300" title="Eliminar usuario">
                🗑️
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Continúa en la siguiente parte...
window.showBonusModal = async function(userId, email) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();
  const currentBonus = userData.bonusAgents || {};
  const userPlan = userData.plan || 'free';
  const plan = plans.find(p => p.id === userPlan);
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl p-8 max-w-2xl w-full border border-purple-500/20 max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-2xl font-bold mb-1">🎁 Gestionar Agentes Bonus</h3>
          <p class="text-sm text-gray-400">${email} - Plan: ${plan.name}</p>
        </div>
        <button onclick="this.closest('.fixed').remove()" class="text-3xl hover:text-purple-400">×</button>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        ${agents.map(agent => {
          const isInPlan = plan.allowedAgents.includes(agent.id);
          const hasBonus = currentBonus[agent.id] === true;
          const canToggle = !isInPlan;
          
          return `
            <div class="bg-slate-800/50 p-4 rounded-lg border ${hasBonus ? 'border-green-500' : 'border-purple-500/20'}">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">${agent.icon}</span>
                  <div>
                    <div class="font-semibold text-sm">${agent.name}</div>
                  </div>
                </div>
                ${isInPlan ? '<span class="text-green-400">✅</span>' : ''}
              </div>
              
              ${canToggle ? `
                <button onclick="toggleAgentBonus('${userId}', '${agent.id}', ${!hasBonus})" 
                        class="w-full py-2 rounded-lg text-sm font-semibold ${
                          hasBonus 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        }">
                  ${hasBonus ? '🗑️ Quitar' : '🎁 Añadir'}
                </button>
              ` : `
                <div class="text-center text-xs text-gray-500 py-2">
                  En plan
                </div>
              `}
            </div>
          `;
        }).join('')}
      </div>
      
      <button onclick="this.closest('.fixed').remove(); loadAdmin();" 
              class="w-full mt-6 bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-bold">
        Cerrar
      </button>
    </div>
  `;
  document.body.appendChild(modal);
};

window.toggleAgentBonus = async function(userId, agentId, addBonus) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const bonusAgents = userData.bonusAgents || {};
    
    if (addBonus) {
      bonusAgents[agentId] = true;
    } else {
      delete bonusAgents[agentId];
    }
    
    await updateDoc(userRef, { bonusAgents });
    
    showNotification(addBonus ? '✅ Agente bonus añadido' : '✅ Agente bonus eliminado', 'success');
    
    document.querySelector('.fixed')?.remove();
    await showBonusModal(userId, userData.email);
    
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error al actualizar bonus', 'error');
  }
};

window.deleteUser = async function(userId, email) {
  if (!confirm(`¿Eliminar a ${email}?\n\nPodrá registrarse nuevamente.`)) {
    return;
  }
  
  try {
    const token = await auth.currentUser.getIdToken();
    
    const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showNotification('✅ Usuario eliminado. Puede re-registrarse.', 'success');
      loadAdmin();
    } else {
      throw new Error(data.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error: ' + error.message, 'error');
  }
};

window.exportEmails = async function() {
  if (!isAdmin) return;
  
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const emails = [];
    
    usersSnap.forEach(doc => {
      const data = doc.data();
      emails.push({
        email: data.email,
        name: data.name || '',
        plan: data.plan || 'free',
        verified: data.emailVerified !== false
      });
    });
    
    let csv = 'Email,Nombre,Plan,Verificado\n';
    emails.forEach(u => {
      csv += `${u.email},${u.name},${u.plan},${u.verified ? 'Sí' : 'No'}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emails-cambiatuyo-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotification('✅ Emails exportados', 'success');
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error al exportar emails', 'error');
  }
};

// ========================================
// NOTIFICACIONES
// ========================================
function showNotification(message, type = 'info') {
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600'
  };
  
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl z-50`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// ========================================
// MODAL AUTH
// ========================================
window.showAuthModal = function(mode = 'login') {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl p-8 max-w-md w-full border border-purple-500/20">
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">🔮</div>
        <h3 class="text-3xl font-bold mb-2" id="modalTitle">${mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h3>
      </div>
      
      <div id="loginForm" class="${mode === 'login' ? '' : 'hidden'}">
        <form onsubmit="event.preventDefault(); login();">
          <div class="space-y-4 mb-6">
            <input type="email" id="loginEmail" placeholder="Email" required
                   class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-purple-500/20 focus:border-purple-500 outline-none">
            <input type="password" id="loginPassword" placeholder="Contraseña" required
                   class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-purple-500/20 focus:border-purple-500 outline-none">
          </div>
          <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg font-bold hover:opacity-90 mb-4">
            Iniciar Sesión
          </button>
        </form>
        <p class="text-center text-sm text-gray-400">
          ¿No tienes cuenta? 
          <button onclick="switchAuthMode('register')" class="text-purple-400 hover:text-purple-300">Regístrate</button>
        </p>
      </div>
      
      <div id="registerForm" class="${mode === 'register' ? '' : 'hidden'}">
        <form onsubmit="event.preventDefault(); register();">
          <div class="space-y-4 mb-6">
            <input type="text" id="regName" placeholder="Nombre completo" required
                   class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-purple-500/20 focus:border-purple-500 outline-none">
            <input type="email" id="regEmail" placeholder="Email" required
                   class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-purple-500/20 focus:border-purple-500 outline-none">
            <input type="password" id="regPassword" placeholder="Contraseña (mínimo 6 caracteres)" required
                   class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-purple-500/20 focus:border-purple-500 outline-none">
          </div>
          <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg font-bold hover:opacity-90 mb-4">
            Crear Cuenta
          </button>
        </form>
        <p class="text-center text-sm text-gray-400">
          ¿Ya tienes cuenta? 
          <button onclick="switchAuthMode('login')" class="text-purple-400 hover:text-purple-300">Inicia sesión</button>
        </p>
      </div>
      
      <button onclick="this.closest('.fixed').remove()" class="w-full mt-4 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg">
        Cerrar
      </button>
    </div>
  `;
  document.body.appendChild(modal);
};

window.switchAuthMode = function(mode) {
  document.getElementById('modalTitle').textContent = mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta';
  document.getElementById('loginForm').classList.toggle('hidden', mode !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', mode !== 'register');
};

// ========================================
// TOGGLE USER MENU
// ========================================
window.toggleUserMenu = function() {
  const dropdown = document.getElementById('userDropdown');
  dropdown?.classList.toggle('hidden');
};

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ CambiaTuYo iniciado');
  loadAgents();
});
