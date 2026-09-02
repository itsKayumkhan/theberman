// Source: INE — municipios de más de 20.000 habitantes, agrupados por comunidad autónoma y provincia.
export const SPAIN_NESTED: Record<string, Record<string, string[]>> = {
    'Andalucía': {
        'Almería': ['Almería', 'El Ejido', 'Roquetas de Mar'],
        'Cádiz': ['Algeciras', 'Chiclana de la Frontera', 'Cádiz', 'El Puerto de Santa María', 'Jerez de la Frontera', 'La Línea de la Concepción', 'San Fernando', 'Sanlúcar de Barrameda'],
        'Córdoba': ['Cabra', 'Córdoba', 'Lucena', 'Montilla', 'Palma del Río', 'Puente Genil'],
        'Granada': ['Almuñécar', 'Armilla', 'Atarfe', 'Baza', 'Granada', 'Loja', 'Motril'],
        'Huelva': ['Almonte', 'Cartaya', 'Huelva', 'Isla Cristina', 'Lepe'],
        'Jaén': ['Andújar', 'Jaén', 'Linares', 'Martos', 'Úbeda'],
        'Málaga': ['Antequera', 'Benalmádena', 'Cártama', 'Estepona', 'Fuengirola', 'Marbella', 'Mijas', 'Málaga', 'Nerja', 'Rincón de la Victoria', 'Ronda', 'Torremolinos', 'Torrox', 'Vélez-Málaga'],
        'Sevilla': ['Alcalá de Guadaíra', 'Dos Hermanas', 'Sevilla', 'Utrera'],
    },
    'Aragón': {
        'Huesca': ['Barbastro', 'Huesca', 'Jaca', 'Monzón'],
        'Teruel': ['Alcañiz', 'Teruel'],
        'Zaragoza': ['Calatayud', 'Ejea de los Caballeros', 'Utebo', 'Zaragoza'],
    },
    'Principado de Asturias': {
        'Asturias': ['Avilés', 'Castrillón', 'Gijón', 'Langreo', 'Mieres', 'Oviedo', 'Siero'],
    },
    'Canarias': {
        'Las Palmas': ['Arrecife', 'Arucas', 'Ingenio', 'Las Palmas de Gran Canaria', 'Puerto del Rosario', 'San Bartolomé de Tirajana', 'Santa Lucía de Tirajana', 'Telde'],
        'Santa Cruz de Tenerife': ['Adeje', 'Granadilla de Abona', 'La Orotava', 'Los Realejos', 'San Cristóbal de La Laguna', 'Santa Cruz de Tenerife'],
    },
    'Cantabria': {
        'Cantabria': ['Camargo', 'Castro-Urdiales', 'Piélagos', 'Santander', 'Torrelavega'],
    },
    'Castilla y León': {
        'Burgos': ['Aranda de Duero', 'Burgos', 'Miranda de Ebro'],
        'León': ['León', 'Ponferrada', 'San Andrés del Rabanedo', 'Villaquilambre'],
        'Palencia': ['Palencia'],
        'Salamanca': ['Salamanca'],
        'Segovia': ['Segovia'],
        'Soria': ['Soria'],
        'Valladolid': ['Laguna de Duero', 'Medina del Campo', 'Valladolid'],
        'Zamora': ['Zamora'],
        'Ávila': ['Ávila'],
    },
    'Castilla-La Mancha': {
        'Albacete': ['Albacete', 'Almansa', 'Hellín', 'Villarrobledo'],
        'Ciudad Real': ['Alcázar de San Juan', 'Ciudad Real', 'Puertollano', 'Tomelloso', 'Valdepeñas'],
        'Cuenca': ['Cuenca'],
        'Guadalajara': ['Azuqueca de Henares', 'Guadalajara'],
        'Toledo': ['Illescas', 'Seseña', 'Talavera de la Reina', 'Toledo'],
    },
    'Cataluña': {
        'Barcelona': ['Badalona', 'Barberà del Vallès', 'Barcelona', 'Calella', 'Castellar del Vallès', 'Castelldefels', 'Cerdanyola del Vallès', 'Cornellà de Llobregat', 'El Prat de Llobregat', 'Esplugues de Llobregat', 'Gavà', 'Granollers', 'Igualada', "L'Hospitalet de Llobregat", 'Manlleu', 'Manresa', 'Mataró', 'Mollet del Vallès', 'Montcada i Reixac', 'Olesa de Montserrat', 'Premià de Mar', 'Ripollet', 'Rubí', 'Sabadell', 'Sant Adrià de Besòs', 'Sant Andreu de la Barca', 'Sant Boi de Llobregat', 'Sant Cugat del Vallès', 'Sant Feliu de Llobregat', 'Sant Pere de Ribes', 'Sant Vicenç dels Horts', 'Santa Coloma de Gramenet', 'Santa Perpètua de Mogoda', 'Sitges', 'Terrassa', 'Vic', 'Viladecans', 'Vilafranca del Penedès', 'Vilanova i la Geltrú'],
        'Girona': ['Banyoles', 'Blanes', 'Figueres', 'Girona', 'Salt', 'Sant Feliu de Guíxols'],
        'Lleida': ['Lleida'],
        'Tarragona': ['Cambrils', 'Reus', 'Salou', 'Tarragona', 'Tortosa', 'Valls'],
    },
    'Ceuta': {
        'Ceuta': ['Ceuta'],
    },
    'Comunidad de Madrid': {
        'Madrid': ['Alcalá de Henares', 'Alcobendas', 'Alcorcón', 'Algete', 'Aranjuez', 'Arganda del Rey', 'Arroyomolinos', 'Boadilla del Monte', 'Colmenar Viejo', 'Coslada', 'Fuenlabrada', 'Getafe', 'Humanes de Madrid', 'Las Rozas de Madrid', 'Leganés', 'Madrid', 'Majadahonda', 'Móstoles', 'Parla', 'Pinto', 'Pozuelo de Alarcón', 'Rivas-Vaciamadrid', 'San Sebastián de los Reyes', 'Torrejón de Ardoz', 'Tres Cantos', 'Valdemoro', 'Villaviciosa de Odón'],
    },
    'Comunidad Valenciana': {
        'Alicante': ['Alacant/Alicante', 'Alcoi/Alcoy', 'Almoradí', 'Altea', 'Aspe', 'Benidorm', 'Calp', 'Crevillent', 'Dénia', 'Elda', 'Elx/Elche', 'Ibi', "L'Alfàs del Pi", 'Mutxamel', 'Novelda', 'Orihuela', 'Petrer', "Sant Joan d'Alacant", 'Sant Vicent del Raspeig', 'Santa Pola', 'Torrevieja', 'Villajoyosa/Vila Joiosa', 'Xàbia/Jávea'],
        'Castellón': ['Almassora', 'Benicarló', 'Benicasim/Benicàssim', 'Borriana/Burriana', 'Castelló de la Plana', 'Onda', 'Segorbe', 'Vila-real', 'Vinaròs'],
        'Valencia': ['Alaquàs', 'Alboraya', 'Aldaia', 'Almàssera', 'Alzira', 'Burjassot', 'Gandia', 'Manises', 'Mislata', 'Moncada', 'Oliva', 'Ontinyent', 'Paiporta', 'Paterna', 'Picassent', 'Sagunt/Sagunto', 'Silla', 'Torrent', 'València', 'Xirivella', 'Xàtiva'],
    },
    'Extremadura': {
        'Badajoz': ['Almendralejo', 'Badajoz', 'Don Benito', 'Mérida', 'Villanueva de la Serena'],
        'Cáceres': ['Cáceres', 'Navalmoral de la Mata', 'Plasencia'],
    },
    'Galicia': {
        'A Coruña': ['A Coruña', 'Ames', 'Arteixo', 'Cambre', 'Carballo', 'Culleredo', 'Ferrol', 'Narón', 'Oleiros', 'Ribeira', 'Santiago de Compostela'],
        'Lugo': ['Lugo'],
        'Ourense': ['Ourense'],
        'Pontevedra': ['Cangas', 'La Estrada', 'Lalín', 'Marín', 'O Porriño', 'Ponteareas', 'Pontevedra', 'Redondela', 'Vigo', 'Vilagarcía de Arousa'],
    },
    'Islas Baleares': {
        'Baleares': ['Alcúdia', 'Calvià', 'Ciutadella de Menorca', 'Eivissa', 'Inca', 'Llucmajor', 'Manacor', 'Marratxí', 'Maó', 'Palma'],
    },
    'La Rioja': {
        'La Rioja': ['Arnedo', 'Calahorra', 'Logroño'],
    },
    'Melilla': {
        'Melilla': ['Melilla'],
    },
    'Comunidad Foral de Navarra': {
        'Navarra': ['Barañáin', 'Burlada', 'Estella-Lizarra', 'Pamplona/Iruña', 'Tafalla', 'Tudela'],
    },
    'País Vasco': {
        'Vizcaya': ['Amorebieta-Etxano', 'Barakaldo', 'Basauri', 'Bilbao', 'Durango', 'Erandio', 'Etxebarri', 'Getxo', 'Leioa', 'Portugalete', 'Santurtzi', 'Sestao'],
        'Guipúzcoa': ['Arrasate/Mondragón', 'Azpeitia', 'Donostia/San Sebastián', 'Eibar', 'Errenteria', 'Hernani', 'Irun', 'Zarautz'],
        'Álava': ['Vitoria-Gasteiz'],
    },
    'Región de Murcia': {
        'Murcia': ['Alcantarilla', 'Caravaca de la Cruz', 'Cartagena', 'Cieza', 'Las Torres de Cotillas', 'Lorca', 'Mazarrón', 'Molina de Segura', 'Murcia', 'San Javier', 'San Pedro del Pinatar', 'Torre-Pacheco', 'Yecla', 'Águilas'],
    },
};
