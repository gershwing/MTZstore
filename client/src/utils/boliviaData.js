// Datos geográficos de Bolivia: Departamento → Provincia → Ciudades/Municipios
// Fuente: División política administrativa de Bolivia

const BOLIVIA_DATA = {
  "La Paz": {
    "Murillo": ["La Paz", "El Alto", "Palca", "Mecapaca", "Achocalla", "Viacha"],
    "Omasuyos": ["Achacachi", "Ancoraimes", "Huarina", "Santiago de Huata", "Huatajata"],
    "Pacajes": ["Coro Coro", "Caquiaviri", "Calacoto", "Comanche", "Charaña"],
    "Camacho": ["Puerto Acosta", "Mocomoco", "Puerto Carabuco", "Humanata"],
    "Muñecas": ["Chuma", "Mocomoco", "Ayata", "Aucapata"],
    "Larecaja": ["Sorata", "Guanay", "Tipuani", "Mapiri", "Teoponte"],
    "Franz Tamayo": ["Apolo", "Pelechuco"],
    "Ingavi": ["Viacha", "Guaqui", "Tiahuanacu", "Desaguadero", "Taraco"],
    "Loayza": ["Luribay", "Sapahaqui", "Yaco", "Malla", "Cairoma"],
    "Inquisivi": ["Inquisivi", "Quime", "Cajuata", "Colquiri", "Ichoca"],
    "Sud Yungas": ["Chulumani", "Irupana", "Yanacachi", "Palos Blancos", "La Asunta"],
    "Nor Yungas": ["Coroico", "Coripata", "Caranavi"],
    "Abel Iturralde": ["Ixiamas", "San Buenaventura"],
    "Bautista Saavedra": ["Charazani", "Curva"],
    "Manco Kapac": ["Copacabana", "San Pedro de Tiquina", "Tito Yupanki"],
    "Gualberto Villarroel": ["San Pedro de Curahuara", "Papel Pampa", "Chacarilla"],
    "Jose Manuel Pando": ["Santiago de Machaca", "Catacora"],
    "Caranavi": ["Caranavi", "Alto Beni"],
  },
  "Cochabamba": {
    "Cercado": ["Cochabamba"],
    "Campero": ["Aiquile", "Pasorapa", "Omereque"],
    "Ayopaya": ["Independencia", "Morochata", "Cocapata"],
    "Esteban Arze": ["Tarata", "Anzaldo", "Arbieto", "Sacabamba", "Cliza"],
    "Arani": ["Arani", "Vacas"],
    "Arque": ["Arque", "Tacopaya"],
    "Capinota": ["Capinota", "Santivañez", "Sicaya"],
    "German Jordan": ["Cliza", "Toko", "Tolata"],
    "Quillacollo": ["Quillacollo", "Sipe Sipe", "Tiquipaya", "Vinto", "Colcapirhua"],
    "Chapare": ["Sacaba", "Colomi", "Villa Tunari", "Chimoré"],
    "Tapacari": ["Tapacarí"],
    "Carrasco": ["Totora", "Pojo", "Pocona", "Chimoré", "Puerto Villarroel", "Entre Ríos"],
    "Mizque": ["Mizque", "Vila Vila", "Alalay"],
    "Punata": ["Punata", "Villa Rivero", "San Benito", "Tacachi", "Cuchumuela"],
    "Bolivar": ["Bolívar"],
    "Tiraque": ["Tiraque", "Shinahota"],
  },
  "Santa Cruz": {
    "Andrés Ibáñez": ["Santa Cruz de la Sierra", "Cotoca", "Porongo", "La Guardia", "El Torno", "Warnes"],
    "Warnes": ["Warnes", "Okinawa"],
    "Obispo Santistevan": ["Montero", "General Saavedra", "Mineros", "Fernández Alonso"],
    "Ichilo": ["Buena Vista", "San Carlos", "Yapacaní", "San Juan de Yapacaní"],
    "Chiquitos": ["San José de Chiquitos", "Pailón", "Roboré"],
    "Sara": ["Portachuelo", "Santa Rosa del Sara", "Colpa Bélgica"],
    "Cordillera": ["Lagunillas", "Charagua", "Cabezas", "Cuevo", "Gutiérrez", "Camiri", "Boyuibe"],
    "Vallegrande": ["Vallegrande", "Trigal", "Moro Moro", "Postrer Valle", "Pucara", "Samaipata"],
    "Florida": ["Samaipata", "Pampa Grande", "Mairana", "Quirusillas"],
    "Ñuflo de Chávez": ["Concepción", "San Javier", "San Ramón", "San Julián", "San Antonio de Lomerío"],
    "Ángel Sandóval": ["San Matías"],
    "Manuel María Caballero": ["Comarapa", "Saipina"],
    "Germán Busch": ["Puerto Suárez", "Puerto Quijarro", "Carmen Rivero Tórrez"],
    "Guarayos": ["Ascensión de Guarayos", "Urubichá", "El Puente"],
    "Velasco": ["San Ignacio de Velasco", "San Miguel de Velasco", "San Rafael"],
  },
  "Oruro": {
    "Cercado": ["Oruro", "Caracollo", "El Choro", "Soracachi"],
    "Avaroa": ["Challapata", "Quillacas"],
    "Carangas": ["Corque", "Choquecota"],
    "Sajama": ["Curahuara de Carangas", "Turco"],
    "Litoral": ["Huachacalla", "Escara", "Cruz de Machacamarca", "Yunguyo de Litoral"],
    "Poopó": ["Poopó", "Pazña", "Antequera"],
    "Pantaleón Dalence": ["Huanuni", "Machacamarca"],
    "Ladislao Cabrera": ["Salinas de Garcí Mendoza", "Pampa Aullagas"],
    "Sabaya": ["Sabaya", "Coipasa", "Chipaya"],
    "Saucarí": ["Toledo", "Eucaliptus"],
    "Tomás Barrón": ["Eucaliptus", "Santiago de Huayllamarca"],
    "Sud Carangas": ["Santiago de Andamarca", "Belén de Andamarca"],
    "San Pedro de Totora": ["Totora"],
    "Sebastián Pagador": ["Santiago de Huari"],
    "Mejillones": ["La Rivera", "Todos Santos"],
    "Nor Carangas": ["Huayllamarca"],
  },
  "Potosí": {
    "Tomás Frías": ["Potosí", "Tinguipaya", "Yocalla", "Urmiri", "Chaquí"],
    "Rafael Bustillo": ["Uncía", "Chayanta", "Llallagua", "Chuquihuta"],
    "Cornelio Saavedra": ["Betanzos", "Tacobamba", "Chaqui"],
    "Chayanta": ["Colquechaca", "Ravelo", "Pocoata", "Ocurí"],
    "Charcas": ["San Pedro de Buena Vista", "Toro Toro"],
    "Nor Chichas": ["Cotagaita", "Vitichi", "Sacaca"],
    "Alonso de Ibáñez": ["Sacaca", "Caripuyo"],
    "Sud Chichas": ["Tupiza", "Atocha", "Villazón"],
    "Nor Lípez": ["Colcha K", "San Pedro de Quemes"],
    "Sur Lípez": ["San Pablo de Lípez", "Mojinete", "San Antonio de Esmoruco"],
    "José María Linares": ["Puna", "Caiza D", "Ckochas"],
    "Antonio Quijarro": ["Uyuni", "Tomave", "Porco"],
    "Bernardino Bilbao": ["Arampampa", "Acasio"],
    "Daniel Campos": ["Llica", "Tahua"],
    "Modesto Omiste": ["Villazón"],
    "Enrique Baldivieso": ["San Agustín"],
  },
  "Chuquisaca": {
    "Oropeza": ["Sucre", "Yotala", "Poroma"],
    "Azurduy": ["Azurduy", "Tarvita"],
    "Zudáñez": ["Zudáñez", "Presto", "Mojocoya", "Icla"],
    "Tomina": ["Padilla", "Tomina", "Sopachuy", "Villa Alcalá", "El Villar"],
    "Hernando Siles": ["Monteagudo", "Huacareta"],
    "Yamparáez": ["Tarabuco", "Yamparáez"],
    "Nor Cinti": ["Camargo", "San Lucas", "Incahuasi", "Villa Charcas"],
    "Sud Cinti": ["Villa Abecia", "Culpina", "Las Carreras"],
    "Belisario Boeto": ["Villa Serrano"],
    "Luis Calvo": ["Villa Vaca Guzmán", "Huacaya", "Macharetí"],
  },
  "Tarija": {
    "Cercado": ["Tarija"],
    "Aniceto Arce": ["Padcaya", "Bermejo"],
    "Gran Chaco": ["Yacuiba", "Caraparí", "Villamontes"],
    "Avilez": ["Uriondo", "Yunchará"],
    "Méndez": ["San Lorenzo", "El Puente"],
    "O'Connor": ["Entre Ríos"],
  },
  "Beni": {
    "Cercado": ["Trinidad", "San Javier"],
    "Vaca Díez": ["Riberalta", "Guayaramerín"],
    "José Ballivián": ["Reyes", "Rurrenabaque", "Santa Rosa", "San Borja"],
    "Yacuma": ["Santa Ana del Yacuma", "Exaltación"],
    "Moxos": ["San Ignacio de Moxos"],
    "Marbán": ["Loreto", "San Andrés"],
    "Mamoré": ["San Joaquín", "San Ramón", "Puerto Siles"],
    "Iténez": ["Magdalena", "Baures", "Huacaraje"],
  },
  "Pando": {
    "Nicolás Suárez": ["Cobija", "Porvenir", "Bolpebra", "Bella Flor"],
    "Manuripi": ["Puerto Rico", "San Pedro", "Filadelfia", "Puerto Gonzalo Moreno"],
    "Madre de Dios": ["Puerto Gonzalo Moreno", "San Lorenzo", "Sena"],
    "Abuná": ["Santa Rosa del Abuná", "Ingavi"],
    "Federico Román": ["Nueva Esperanza", "Santos Mercado", "Villa Nueva"],
  },
};

// Helper: obtener lista de departamentos
export const getDepartamentos = () => Object.keys(BOLIVIA_DATA).sort();

// Helper: obtener provincias de un departamento
export const getProvincias = (departamento) => {
  if (!departamento || !BOLIVIA_DATA[departamento]) return [];
  return Object.keys(BOLIVIA_DATA[departamento]).sort();
};

// Helper: obtener ciudades de una provincia dentro de un departamento
export const getCiudades = (departamento, provincia) => {
  if (!departamento || !provincia || !BOLIVIA_DATA[departamento]?.[provincia]) return [];
  return [...BOLIVIA_DATA[departamento][provincia]].sort();
};

export default BOLIVIA_DATA;
