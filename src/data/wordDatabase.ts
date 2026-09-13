export interface WordEntry {
  word: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  definition: string;
  example: string;
  minLevel: number;
}

import { LanguageCode } from '../types';

export const WORD_DATABASE_EN: Record<string, WordEntry[]> = {
  ANIMALS: [
    { word: 'CAT', category: 'ANIMALS', difficulty: 'easy', definition: 'A small domesticated carnivorous mammal with soft fur.', example: 'The playful cat purred in the warm sunshine.', minLevel: 1 },
    { word: 'DOG', category: 'ANIMALS', difficulty: 'easy', definition: 'A domesticated canine known as human best friend.', example: 'The dog wagged its tail with joy.', minLevel: 1 },
    { word: 'LION', category: 'ANIMALS', difficulty: 'easy', definition: 'A large wild cat of the cat family, native to Africa.', example: 'The lion roared across the open savanna.', minLevel: 1 },
    { word: 'BEAR', category: 'ANIMALS', difficulty: 'easy', definition: 'A heavy mammal with thick fur and sharp claws.', example: 'The brown bear caught salmon in the river.', minLevel: 1 },
    { word: 'WOLF', category: 'ANIMALS', difficulty: 'easy', definition: 'A wild carnivorous mammal of the dog family.', example: 'The wolf pack howled under the full moon.', minLevel: 1 },
    { word: 'DEER', category: 'ANIMALS', difficulty: 'easy', definition: 'A hoofed grazing animal with antlers in males.', example: 'A gentle deer grazed quietly near the forest edge.', minLevel: 2 },
    { word: 'FOX', category: 'ANIMALS', difficulty: 'easy', definition: 'A small carnivorous mammal known for its bushy tail.', example: 'The clever fox darted across the snowy meadow.', minLevel: 2 },
    { word: 'TIGER', category: 'ANIMALS', difficulty: 'easy', definition: 'The largest cat species, having orange fur with black stripes.', example: 'The magnificent tiger moved silently through the jungle.', minLevel: 3 },
    { word: 'HORSE', category: 'ANIMALS', difficulty: 'easy', definition: 'A large domesticated mammal with hooves and a mane.', example: 'The wild horse galloped freely across the plains.', minLevel: 3 },
    { word: 'ZEBRA', category: 'ANIMALS', difficulty: 'easy', definition: 'An African wild horse with black-and-white stripes.', example: 'A herd of zebras gathered near the waterhole.', minLevel: 4 },
    { word: 'PANDA', category: 'ANIMALS', difficulty: 'easy', definition: 'A large black-and-white bear native to south-central China.', example: 'The giant panda munched on fresh bamboo shoots.', minLevel: 5 },
    { word: 'EAGLE', category: 'ANIMALS', difficulty: 'easy', definition: 'A large bird of prey with keen eyesight and broad wings.', example: 'The eagle soared high above the rugged mountain peaks.', minLevel: 6 },
    { word: 'GIRAFFE', category: 'ANIMALS', difficulty: 'medium', definition: 'The tallest living terrestrial animal, having an exceptionally long neck.', example: 'The giraffe easily reached tender leaves at the treetop.', minLevel: 10 },
    { word: 'ELEPHANT', category: 'ANIMALS', difficulty: 'medium', definition: 'The largest existing land animal with a flexible trunk.', example: 'The elephant sprayed refreshing water with its trunk.', minLevel: 15 },
    { word: 'DOLPHIN', category: 'ANIMALS', difficulty: 'medium', definition: 'A highly intelligent marine mammal known for playful acrobatics.', example: 'A pod of dolphins leaped gracefully beside the boat.', minLevel: 15 },
    { word: 'KANGAROO', category: 'ANIMALS', difficulty: 'medium', definition: 'A large marsupial native to Australia that hops on powerful hind legs.', example: 'The kangaroo carried its joey in its pouch.', minLevel: 20 },
    { word: 'CHEETAH', category: 'ANIMALS', difficulty: 'medium', definition: 'The fastest land animal on Earth, reaching over 60 mph.', example: 'The cheetah sprinted across the grassland with astonishing speed.', minLevel: 20 },
    { word: 'PENGUIN', category: 'ANIMALS', difficulty: 'medium', definition: 'A flightless aquatic bird living almost exclusively in the Southern Hemisphere.', example: 'The emperor penguin waddled across the Antarctic ice.', minLevel: 25 },
    { word: 'CHAMELEON', category: 'ANIMALS', difficulty: 'hard', definition: 'A specialized lizard capable of shifting its skin colors.', example: 'The chameleon blended seamlessly into the rainforest foliage.', minLevel: 40 },
    { word: 'FLAMINGO', category: 'ANIMALS', difficulty: 'medium', definition: 'A tall wading bird with distinctive pink plumage.', example: 'The flamingo stood gracefully on a single slender leg.', minLevel: 30 },
  ],

  OCEAN: [
    { word: 'FISH', category: 'OCEAN', difficulty: 'easy', definition: 'A limbless cold-blooded vertebrate living in water.', example: 'Colorful fish swam through the coral reef.', minLevel: 1 },
    { word: 'CRAB', category: 'OCEAN', difficulty: 'easy', definition: 'A crustacean with a broad carapace and stalked eyes.', example: 'The crab scuttled sideways across the sandy shore.', minLevel: 2 },
    { word: 'WHALE', category: 'OCEAN', difficulty: 'easy', definition: 'A massive marine mammal that breathes air through a blowhole.', example: 'The humpback whale breached with a dramatic splash.', minLevel: 2 },
    { word: 'SEAL', category: 'OCEAN', difficulty: 'easy', definition: 'A semi-aquatic marine mammal with sleek flippers.', example: 'The seal basked warmly on the sunny rocky outcrop.', minLevel: 3 },
    { word: 'SHARK', category: 'OCEAN', difficulty: 'easy', definition: 'A predatory marine fish with a cartilaginous skeleton.', example: 'The sleek shark glided smoothly through deep waters.', minLevel: 5 },
    { word: 'CORAL', category: 'OCEAN', difficulty: 'easy', definition: 'Marine invertebrates that build large underwater calcified reefs.', example: 'The vibrant coral provided shelter for countless creatures.', minLevel: 8 },
    { word: 'OCTOPUS', category: 'OCEAN', difficulty: 'medium', definition: 'A soft-bodied, eight-limbed mollusc renowned for intelligence.', example: 'The octopus squeezed through a narrow undersea crevice.', minLevel: 12 },
    { word: 'LOBSTER', category: 'OCEAN', difficulty: 'medium', definition: 'A large marine crustacean with formidable pincers.', example: 'The lobster hid between boulders on the sea floor.', minLevel: 18 },
    { word: 'JELLYFISH', category: 'OCEAN', difficulty: 'medium', definition: 'A free-swimming marine animal with a gelatinous bell.', example: 'The bioluminescent jellyfish glowed in the midnight abyss.', minLevel: 25 },
    { word: 'STARFISH', category: 'OCEAN', difficulty: 'medium', definition: 'A star-shaped echinoderm that clings to sea floor surfaces.', example: 'A bright orange starfish adhered to the tidal pool rock.', minLevel: 20 },
    { word: 'TURTLE', category: 'OCEAN', difficulty: 'easy', definition: 'A marine reptile with a protective shell and flipper limbs.', example: 'The sea turtle traveled thousands of miles across open ocean.', minLevel: 10 },
  ],

  SPACE: [
    { word: 'SUN', category: 'SPACE', difficulty: 'easy', definition: 'The central star of our solar system.', example: 'The sun provides warmth and energy to our planet.', minLevel: 1 },
    { word: 'MOON', category: 'SPACE', difficulty: 'easy', definition: 'The natural satellite orbiting planet Earth.', example: 'The moon illuminated the tranquil night sky.', minLevel: 1 },
    { word: 'STAR', category: 'SPACE', difficulty: 'easy', definition: 'A luminous sphere of plasma held together by its own gravity.', example: 'A twinkling star guided ancient navigators at sea.', minLevel: 1 },
    { word: 'MARS', category: 'SPACE', difficulty: 'easy', definition: 'The fourth planet from the sun, known as the Red Planet.', example: 'Rovers explore the dusty red craters of Mars.', minLevel: 2 },
    { word: 'ORBIT', category: 'SPACE', difficulty: 'easy', definition: 'The curved path of a celestial object around a star or planet.', example: 'The satellite maintains a stable orbit around Earth.', minLevel: 5 },
    { word: 'COMET', category: 'SPACE', difficulty: 'easy', definition: 'An icy celestial body that displays a glowing coma and tail.', example: 'The comet streaked brilliantly across the midnight sky.', minLevel: 7 },
    { word: 'PLANET', category: 'SPACE', difficulty: 'easy', definition: 'A large celestial body in orbit around a star.', example: 'Earth is the third planet orbiting our sun.', minLevel: 8 },
    { word: 'ROCKET', category: 'SPACE', difficulty: 'easy', definition: 'A vehicle propelled by rocket engine thrust into space.', example: 'The rocket blasted off toward the orbital station.', minLevel: 10 },
    { word: 'GALAXY', category: 'SPACE', difficulty: 'medium', definition: 'A massive system of billions of stars, gas, and dust.', example: 'The Milky Way galaxy spans over 100,000 light-years.', minLevel: 15 },
    { word: 'NEBULA', category: 'SPACE', difficulty: 'medium', definition: 'An interstellar cloud of dust, hydrogen, helium and other gases.', example: 'The colorful nebula gave birth to new shining stars.', minLevel: 20 },
    { word: 'JUPITER', category: 'SPACE', difficulty: 'medium', definition: 'The largest planet in the solar system, a majestic gas giant.', example: 'Jupiter features a massive storm called the Great Red Spot.', minLevel: 18 },
  ],

  FRUITS: [
    { word: 'APPLE', category: 'FRUITS', difficulty: 'easy', definition: 'A round fruit with crisp flesh and red, green, or yellow skin.', example: 'She ate a crisp sweet apple for an afternoon snack.', minLevel: 1 },
    { word: 'BANANA', category: 'FRUITS', difficulty: 'easy', definition: 'A long curved fruit with a yellow skin and soft sweet flesh.', example: 'Monkeys love peeling ripe yellow bananas.', minLevel: 2 },
    { word: 'ORANGE', category: 'FRUITS', difficulty: 'easy', definition: 'A round citrus fruit with a tough bright orange rind.', example: 'Freshly squeezed orange juice is packed with vitamin C.', minLevel: 3 },
    { word: 'GRAPE', category: 'FRUITS', difficulty: 'easy', definition: 'A small sweet berry growing in clusters on vines.', example: 'We plucked juicy purple grapes from the vineyard.', minLevel: 3 },
    { word: 'MANGO', category: 'FRUITS', difficulty: 'easy', definition: 'A fleshy tropical fruit with sweet yellow-orange pulp.', example: 'The ripe tropical mango was sweet and aromatic.', minLevel: 4 },
    { word: 'PEACH', category: 'FRUITS', difficulty: 'easy', definition: 'A juicy fruit with velvety skin and sweet yellow flesh.', example: 'The fragrant summer peach dripped with sweet juice.', minLevel: 5 },
    { word: 'CHERRY', category: 'FRUITS', difficulty: 'easy', definition: 'A small, round stone fruit that is typically bright red.', example: 'A pair of ripe cherries sat atop the dessert.', minLevel: 6 },
    { word: 'LEMON', category: 'FRUITS', difficulty: 'easy', definition: 'A yellow citrus fruit known for its sour acidic juice.', example: 'A slice of zesty lemon complemented the iced tea.', minLevel: 6 },
    { word: 'BERRY', category: 'FRUITS', difficulty: 'easy', definition: 'A small, pulpy, and often edible fruit.', example: 'Wild berries grew abundantly along the sunny trail.', minLevel: 5 },
    { word: 'PAPAYA', category: 'FRUITS', difficulty: 'easy', definition: 'A tropical fruit with orange flesh and small black seeds.', example: 'The sweet papaya had a smooth, buttery texture.', minLevel: 12 },
  ],

  NATURE: [
    { word: 'TREE', category: 'NATURE', difficulty: 'easy', definition: 'A woody perennial plant with an elongated stem or trunk.', example: 'The ancient oak tree provided cool shade.', minLevel: 1 },
    { word: 'RIVER', category: 'NATURE', difficulty: 'easy', definition: 'A natural flowing watercourse heading toward an ocean or lake.', example: 'The crystal river meandered peacefully through the valley.', minLevel: 2 },
    { word: 'LAKE', category: 'NATURE', difficulty: 'easy', definition: 'A large body of water surrounded by land.', example: 'The calm lake mirrored the morning mountain mist.', minLevel: 2 },
    { word: 'MOUNTAIN', category: 'NATURE', difficulty: 'medium', definition: 'A large natural elevation of the Earth surface rising abruptly.', example: 'Snow capped the jagged peaks of the majestic mountain.', minLevel: 8 },
    { word: 'FOREST', category: 'NATURE', difficulty: 'easy', definition: 'A large area dominated by tall trees and dense undergrowth.', example: 'Birds sang melodic tunes inside the pine forest.', minLevel: 5 },
    { word: 'FLOWER', category: 'NATURE', difficulty: 'easy', definition: 'The seed-bearing part of a plant with colorful petals.', example: 'Wildflowers bloomed across the sunlit hillside.', minLevel: 4 },
    { word: 'VALLEY', category: 'NATURE', difficulty: 'easy', definition: 'A low area of land between hills or mountains.', example: 'A lush green valley stretched as far as the eye could see.', minLevel: 6 },
    { word: 'DESERT', category: 'NATURE', difficulty: 'easy', definition: 'A barren area of landscape where little precipitation occurs.', example: 'Golden sand dunes shifted across the vast desert.', minLevel: 7 },
  ],

  FOOD: [
    { word: 'BREAD', category: 'FOOD', difficulty: 'easy', definition: 'A staple food made from a dough of flour and water, usually baked.', example: 'The aroma of freshly baked warm bread filled the bakery.', minLevel: 1 },
    { word: 'CHEESE', category: 'FOOD', difficulty: 'easy', definition: 'A food made from the pressed curds of milk.', example: 'A slice of aged cheddar cheese topped the burger.', minLevel: 2 },
    { word: 'PIZZA', category: 'FOOD', difficulty: 'easy', definition: 'A dish of Italian origin consisting of a flat round base with cheese and sauce.', example: 'Wood-fired pizza with fresh basil and mozzarella is delicious.', minLevel: 2 },
    { word: 'PASTA', category: 'FOOD', difficulty: 'easy', definition: 'An Italian dish made of dough from durum wheat and extruded into shapes.', example: 'She tossed al dente pasta with rich homemade pesto sauce.', minLevel: 3 },
    { word: 'SALAD', category: 'FOOD', difficulty: 'easy', definition: 'A cold dish of various mixtures of raw or cooked vegetables.', example: 'A crisp garden salad dressed with virgin olive oil and lemon.', minLevel: 4 },
    { word: 'SOUP', category: 'FOOD', difficulty: 'easy', definition: 'A liquid dish, typically made by boiling meat, fish, or vegetables in stock.', example: 'A steaming bowl of vegetable soup warmed the chilly evening.', minLevel: 3 },
    { word: 'BURGER', category: 'FOOD', difficulty: 'easy', definition: 'A round patty of ground beef or vegetarian ingredients in a sliced bun.', example: 'The grilled burger was served with crispy golden fries.', minLevel: 5 },
  ],

  WEATHER: [
    { word: 'RAIN', category: 'WEATHER', difficulty: 'easy', definition: 'Liquid precipitation in the form of drops falling from clouds.', example: 'Gentle spring rain nourished the sprouting garden seeds.', minLevel: 1 },
    { word: 'SNOW', category: 'WEATHER', difficulty: 'easy', definition: 'Atmospheric water vapor frozen into ice crystals falling in light flakes.', example: 'Fresh white snow blanketed the mountain village.', minLevel: 1 },
    { word: 'WIND', category: 'WEATHER', difficulty: 'easy', definition: 'The perceptible natural movement of the air blowing in a direction.', example: 'A crisp autumn wind spun colorful leaves through the park.', minLevel: 1 },
    { word: 'STORM', category: 'WEATHER', difficulty: 'easy', definition: 'A violent disturbance of the atmosphere with strong winds and rain.', example: 'The thunderous storm rolled dramatically across the plains.', minLevel: 3 },
    { word: 'CLOUD', category: 'WEATHER', difficulty: 'easy', definition: 'A visible mass of condensed water vapor floating in the atmosphere.', example: 'Fluffy white clouds drifted lazily across the azure sky.', minLevel: 2 },
    { word: 'FOG', category: 'WEATHER', difficulty: 'easy', definition: 'A thick cloud of tiny water droplets suspended in the atmosphere near earth.', example: 'Dense coastal fog enveloped the harbor lighthouse.', minLevel: 3 },
  ],

  SPORTS: [
    { word: 'BALL', category: 'SPORTS', difficulty: 'easy', definition: 'A solid or hollow spherical object used in games.', example: 'He kicked the soccer ball toward the goal net.', minLevel: 1 },
    { word: 'GOAL', category: 'SPORTS', difficulty: 'easy', definition: 'The object of a game, or the point scored by putting a ball into it.', example: 'The striker scored the winning goal in extra time.', minLevel: 1 },
    { word: 'SWIM', category: 'SPORTS', difficulty: 'easy', definition: 'Propel the body through water by combined bodily movements.', example: 'She trained every morning to swim the butterfly stroke.', minLevel: 2 },
    { word: 'RUN', category: 'SPORTS', difficulty: 'easy', definition: 'Move at a speed faster than a walk.', example: 'The marathoner ran with steady pace toward the finish line.', minLevel: 1 },
    { word: 'TENNIS', category: 'SPORTS', difficulty: 'easy', definition: 'A racket sport played against a single opponent or between two teams of two.', example: 'They played a thrilling match on the grass tennis court.', minLevel: 5 },
  ],

  MUSIC: [
    { word: 'SONG', category: 'MUSIC', difficulty: 'easy', definition: 'A short poem or other set of words set to music.', example: 'The catchy song echoed throughout the concert hall.', minLevel: 1 },
    { word: 'DRUM', category: 'MUSIC', difficulty: 'easy', definition: 'A percussion instrument sounded by being struck with sticks or the hands.', example: 'The energetic drum beat kept the entire crowd moving.', minLevel: 1 },
    { word: 'PIANO', category: 'MUSIC', difficulty: 'easy', definition: 'A large keyboard musical instrument with wooden hammers striking strings.', example: 'She played a graceful classical melody on the grand piano.', minLevel: 2 },
    { word: 'GUITAR', category: 'MUSIC', difficulty: 'easy', definition: 'A stringed musical instrument played with the fingers or a plectrum.', example: 'Acoustic guitar chords echoed around the cozy campfire.', minLevel: 4 },
    { word: 'FLUTE', category: 'MUSIC', difficulty: 'easy', definition: 'A wind instrument made from a tube with holes stopped by fingers.', example: 'The silvery tone of the flute drifted through the orchard.', minLevel: 5 },
  ],

  GEOGRAPHY: [
    { word: 'CITY', category: 'GEOGRAPHY', difficulty: 'easy', definition: 'A large human settlement characterized by administrative and cultural significance.', example: 'Tokyo is a bustling city known for vibrant energy.', minLevel: 1 },
    { word: 'OCEAN', category: 'GEOGRAPHY', difficulty: 'easy', definition: 'A very large expanse of sea, in particular each of the main areas.', example: 'The Pacific is the largest and deepest ocean on Earth.', minLevel: 2 },
    { word: 'ISLAND', category: 'GEOGRAPHY', difficulty: 'easy', definition: 'A piece of land entirely surrounded by water.', example: 'Hawaii is a volcanic island chain in the Pacific.', minLevel: 3 },
    { word: 'CAPITAL', category: 'GEOGRAPHY', difficulty: 'medium', definition: 'The city or town that functions as the seat of government of a country.', example: 'Paris is the historic capital of France.', minLevel: 12 },
    { word: 'BORDER', category: 'GEOGRAPHY', difficulty: 'easy', definition: 'A line separating two political or geographical areas, especially countries.', example: 'The winding river forms a natural international border.', minLevel: 6 },
  ]
};

export const WORD_DATABASE_ES: Record<string, WordEntry[]> = {
  ANIMALS: [
    { word: 'GATO', category: 'ANIMALS', difficulty: 'easy', definition: 'Mamífero felino doméstico y ágil.', example: 'El gato duerme plácidamente al sol.', minLevel: 1 },
    { word: 'PERRO', category: 'ANIMALS', difficulty: 'easy', definition: 'Mamífero carnívoro doméstico, el mejor amigo del hombre.', example: 'El perro corretea feliz en el jardín.', minLevel: 1 },
    { word: 'LEON', category: 'ANIMALS', difficulty: 'easy', definition: 'Gran mamífero carnívoro de la familia de los félidos.', example: 'El león ruge majestuoso en la sabana.', minLevel: 1 },
    { word: 'OSO', category: 'ANIMALS', difficulty: 'easy', definition: 'Mamífero omnívoro de gran tamaño y pelaje espeso.', example: 'El oso busca bayas y pesca en el río.', minLevel: 1 },
    { word: 'LOBO', category: 'ANIMALS', difficulty: 'easy', definition: 'Mamífero carnívoro salvaje que vive en manadas.', example: 'El lobo aúlla bajo la luna llena.', minLevel: 1 },
    { word: 'TIGRE', category: 'ANIMALS', difficulty: 'easy', definition: 'El felino más grande del mundo con pelaje a rayas.', example: 'El tigre camina silencioso por la selva.', minLevel: 2 },
    { word: 'CABALLO', category: 'ANIMALS', difficulty: 'easy', definition: 'Mamífero perisodáctilo domesticado de gran porte.', example: 'El caballo galopa veloz por la pradera.', minLevel: 3 },
    { word: 'AGUILA', category: 'ANIMALS', difficulty: 'easy', definition: 'Ave rapaz de gran tamaño y vista prodigiosa.', example: 'El águila planea sobre los picos nevados.', minLevel: 4 },
  ],
  OCEAN: [
    { word: 'PEZ', category: 'OCEAN', difficulty: 'easy', definition: 'Vertebrado acuático con branquias y aletas.', example: 'El pez nada entre los coloridos corales.', minLevel: 1 },
    { word: 'MAR', category: 'OCEAN', difficulty: 'easy', definition: 'Masa de agua salada que cubre gran parte de la Tierra.', example: 'Las olas del mar rompen suavemente en la orilla.', minLevel: 1 },
    { word: 'CORAL', category: 'OCEAN', difficulty: 'easy', definition: 'Invertebrados marinos que forman arrecifes.', example: 'El arrecife de coral está lleno de vida.', minLevel: 2 },
    { word: 'BALLENA', category: 'OCEAN', difficulty: 'easy', definition: 'Gran mamífero marino con respiración pulmonar.', example: 'La ballena nada majestuosa en el océano.', minLevel: 3 },
    { word: 'TIBURON', category: 'OCEAN', difficulty: 'easy', definition: 'Pez carnívoro marino con esqueleto cartilaginoso.', example: 'El tiburón nada con gran agilidad.', minLevel: 4 },
  ],
  SPACE: [
    { word: 'SOL', category: 'SPACE', difficulty: 'easy', definition: 'La estrella en el centro de nuestro sistema solar.', example: 'El sol ilumina y da calor a la Tierra.', minLevel: 1 },
    { word: 'LUNA', category: 'SPACE', difficulty: 'easy', definition: 'Satélite natural que orbita la Tierra.', example: 'La luna brilla en el cielo nocturno.', minLevel: 1 },
    { word: 'MARTE', category: 'SPACE', difficulty: 'easy', definition: 'El cuarto planeta, conocido como el planeta rojo.', example: 'Las sondas exploran la superficie de Marte.', minLevel: 2 },
    { word: 'COMETA', category: 'SPACE', difficulty: 'easy', definition: 'Cuerpo celeste de hielo y roca con cola brillante.', example: 'El cometa cruzó el cielo estrellado.', minLevel: 3 },
    { word: 'PLANETA', category: 'SPACE', difficulty: 'easy', definition: 'Cuerpo celeste que gira alrededor de una estrella.', example: 'La Tierra es un planeta habitable.', minLevel: 4 },
  ],
  FRUITS: [
    { word: 'MANZANA', category: 'FRUITS', difficulty: 'easy', definition: 'Fruta redonda de pulpa crujiente y dulce.', example: 'Comió una manzana roja muy jugosa.', minLevel: 1 },
    { word: 'PLATANO', category: 'FRUITS', difficulty: 'easy', definition: 'Fruta alargada y dulce de piel amarilla.', example: 'El plátano maduro es muy nutritivo.', minLevel: 2 },
    { word: 'NARANJA', category: 'FRUITS', difficulty: 'easy', definition: 'Cítrico dulce y jugoso rico en vitamina C.', example: 'Tomó un vaso de zumo de naranja.', minLevel: 3 },
    { word: 'FRESA', category: 'FRUITS', difficulty: 'easy', definition: 'Fruta roja pequeña y aromática.', example: 'Las fresas con nata están deliciosas.', minLevel: 3 },
  ],
  NATURE: [
    { word: 'ARBOL', category: 'NATURE', difficulty: 'easy', definition: 'Planta de tronco leñoso y ramas elevadas.', example: 'El gran árbol ofrece una agradable sombra.', minLevel: 1 },
    { word: 'RIO', category: 'NATURE', difficulty: 'easy', definition: 'Corriente natural de agua continua.', example: 'El río fluye cristalino por el valle.', minLevel: 1 },
    { word: 'LAGO', category: 'NATURE', difficulty: 'easy', definition: 'Gran masa de agua rodeada de tierra.', example: 'Pasearon en barca por el tranquilo lago.', minLevel: 2 },
    { word: 'BOSQUE', category: 'NATURE', difficulty: 'easy', definition: 'Gran extensión poblada de árboles y plantas.', example: 'El bosque alberga mucha fauna silvestre.', minLevel: 3 },
    { word: 'FLOR', category: 'NATURE', difficulty: 'easy', definition: 'Estructura reproductiva colorida de las plantas.', example: 'La flor primaveral perfuma el ambiente.', minLevel: 2 },
  ],
  FOOD: [
    { word: 'PAN', category: 'FOOD', difficulty: 'easy', definition: 'Alimento básico elaborado con harina y agua.', example: 'El pan recién horneado huele de maravilla.', minLevel: 1 },
    { word: 'QUESO', category: 'FOOD', difficulty: 'easy', definition: 'Alimento obtenido por maduración de la cuajada de leche.', example: 'El queso curado tiene un sabor intenso.', minLevel: 2 },
    { word: 'PIZZA', category: 'FOOD', difficulty: 'easy', definition: 'Masa horneada cubierta de tomate y queso.', example: 'Cenaron pizza casera recién hecha.', minLevel: 2 },
    { word: 'SOPA', category: 'FOOD', difficulty: 'easy', definition: 'Plato líquido elaborado con caldo nutritivo.', example: 'Una sopa caliente para un día frío.', minLevel: 3 },
  ],
  WEATHER: [
    { word: 'LLUVIA', category: 'WEATHER', difficulty: 'easy', definition: 'Precipitación de gotas de agua líquida.', example: 'La suave lluvia nutre los campos.', minLevel: 1 },
    { word: 'NIEVE', category: 'WEATHER', difficulty: 'easy', definition: 'Agua congelada que cae en copos blancos.', example: 'La nieve cubre las cumbres de la montaña.', minLevel: 1 },
    { word: 'VIENTO', category: 'WEATHER', difficulty: 'easy', definition: 'Corriente de aire producida en la atmósfera.', example: 'El viento fresco mecía las hojas.', minLevel: 2 },
    { word: 'NUBE', category: 'WEATHER', difficulty: 'easy', definition: 'Masa visible formada por gotas de agua suspendidas.', example: 'Una nube blanca cruza el cielo azul.', minLevel: 2 },
  ],
  SPORTS: [
    { word: 'GOL', category: 'SPORTS', difficulty: 'easy', definition: 'Entrada del balón en la portería.', example: 'Celebraron el gol en el último minuto.', minLevel: 1 },
    { word: 'BALON', category: 'SPORTS', difficulty: 'easy', definition: 'Pelota esférica para practicar deportes.', example: 'Chutó el balón con gran potencia.', minLevel: 2 },
    { word: 'CORRER', category: 'SPORTS', difficulty: 'easy', definition: 'Desplazarse rápidamente a pie.', example: 'Le gusta correr por el parque cada mañana.', minLevel: 2 },
    { word: 'FUTBOL', category: 'SPORTS', difficulty: 'easy', definition: 'Deporte entre dos equipos de once jugadores.', example: 'El fútbol apasiona a millones de personas.', minLevel: 3 },
  ],
  MUSIC: [
    { word: 'CANTO', category: 'MUSIC', difficulty: 'easy', definition: 'Emisión de sonidos modulados por la voz.', example: 'El canto del coro emocionó al público.', minLevel: 1 },
    { word: 'PIANO', category: 'MUSIC', difficulty: 'easy', definition: 'Instrumento musical de cuerda y teclado.', example: 'Toca el piano con gran delicadeza.', minLevel: 2 },
    { word: 'RITMO', category: 'MUSIC', difficulty: 'easy', definition: 'Orden acompasado en la sucesión de sonidos.', example: 'La melodía tiene un ritmo muy alegre.', minLevel: 3 },
  ],
  GEOGRAPHY: [
    { word: 'ISLA', category: 'GEOGRAPHY', difficulty: 'easy', definition: 'Porción de tierra rodeada de agua.', example: 'La isla tropical tiene playas de arena blanca.', minLevel: 1 },
    { word: 'PLAYA', category: 'GEOGRAPHY', difficulty: 'easy', definition: 'Ribera del mar formada por arena.', example: 'Caminaron descalzos por la playa.', minLevel: 2 },
    { word: 'CIUDAD', category: 'GEOGRAPHY', difficulty: 'easy', definition: 'Población grande y urbanizada.', example: 'La ciudad tiene edificios históricos.', minLevel: 3 },
  ]
};

export const WORD_DATABASE_FR: Record<string, WordEntry[]> = {
  ANIMALS: [
    { word: 'CHAT', category: 'ANIMALS', difficulty: 'easy', definition: 'Petit mammifère félin domestique.', example: 'Le chat ronronne au soleil.', minLevel: 1 },
    { word: 'CHIEN', category: 'ANIMALS', difficulty: 'easy', definition: 'Fidèle compagnon canin domestique.', example: 'Le chien joue dans le parc.', minLevel: 1 },
    { word: 'LION', category: 'ANIMALS', difficulty: 'easy', definition: 'Grand félin majestueux de la savane.', example: 'Le lion rugit fièrement.', minLevel: 1 },
    { word: 'OURS', category: 'ANIMALS', difficulty: 'easy', definition: 'Grand mammifère à fourrure épaisse.', example: 'L’ours pêche dans la rivière.', minLevel: 1 },
    { word: 'LOUP', category: 'ANIMALS', difficulty: 'easy', definition: 'Carnivore sauvage vivant en meute.', example: 'Le loup hurle à la lune.', minLevel: 1 },
    { word: 'TIGRE', category: 'ANIMALS', difficulty: 'easy', definition: 'Grand félin à rayures noires.', example: 'Le tigre avance sans bruit.', minLevel: 2 },
    { word: 'AIGLE', category: 'ANIMALS', difficulty: 'easy', definition: 'Grand oiseau rapace au vol puissant.', example: 'L’aigle plane au-dessus des cimes.', minLevel: 3 },
  ],
  OCEAN: [
    { word: 'MER', category: 'OCEAN', difficulty: 'easy', definition: 'Vaste étendue d’eau salée.', example: 'La mer est calme ce matin.', minLevel: 1 },
    { word: 'POISSON', category: 'OCEAN', difficulty: 'easy', definition: 'Animal aquatique muni de nageoires.', example: 'Le poisson nage entre les coraux.', minLevel: 1 },
    { word: 'CORAIL', category: 'OCEAN', difficulty: 'easy', definition: 'Invertébré marin formant des récifs.', example: 'Le récif de corail abrite mille couleurs.', minLevel: 2 },
    { word: 'BALEINE', category: 'OCEAN', difficulty: 'easy', definition: 'Grand mammifère marin océanique.', example: 'La baleine surgit des vagues.', minLevel: 3 },
  ],
  SPACE: [
    { word: 'SOLEIL', category: 'SPACE', difficulty: 'easy', definition: 'Étoile centrale de notre système.', example: 'Le soleil réchauffe la Terre.', minLevel: 1 },
    { word: 'LUNE', category: 'SPACE', difficulty: 'easy', definition: 'Satellite naturel de la Terre.', example: 'La lune éclaire la nuit claire.', minLevel: 1 },
    { word: 'ETOILE', category: 'SPACE', difficulty: 'easy', definition: 'Corps céleste brillant dans l’espace.', example: 'Une étoile filante traverse le ciel.', minLevel: 2 },
    { word: 'MARS', category: 'SPACE', difficulty: 'easy', definition: 'La planète rouge du système solaire.', example: 'Des sondes explorent Mars.', minLevel: 2 },
  ],
  FRUITS: [
    { word: 'POMME', category: 'FRUITS', difficulty: 'easy', definition: 'Fruit croquant et juteux.', example: 'Une pomme rouge bien sucrée.', minLevel: 1 },
    { word: 'BANANE', category: 'FRUITS', difficulty: 'easy', definition: 'Fruit allongé à la peau jaune.', example: 'Une banane mûre et nourrissante.', minLevel: 2 },
    { word: 'ORANGE', category: 'FRUITS', difficulty: 'easy', definition: 'Agrume juteux riche en vitamines.', example: 'Un délicieux jus d’orange pressé.', minLevel: 3 },
    { word: 'FRAISE', category: 'FRUITS', difficulty: 'easy', definition: 'Petit fruit rouge parfumé.', example: 'Des fraises cueillies dans le jardin.', minLevel: 3 },
  ],
  NATURE: [
    { word: 'ARBRE', category: 'NATURE', difficulty: 'easy', definition: 'Grande plante à tronc ligneux.', example: 'Le grand chêne donne de l’ombre.', minLevel: 1 },
    { word: 'FLEUR', category: 'NATURE', difficulty: 'easy', definition: 'Partie colorée et parfumée d’une plante.', example: 'La fleur éclot au printemps.', minLevel: 1 },
    { word: 'FORET', category: 'NATURE', difficulty: 'easy', definition: 'Vaste étendue boisée.', example: 'Une promenade apaisante en forêt.', minLevel: 2 },
    { word: 'RIVIERE', category: 'NATURE', difficulty: 'easy', definition: 'Cours d’eau naturel sinueux.', example: 'La rivière serpente dans la vallée.', minLevel: 3 },
  ],
  FOOD: [
    { word: 'PAIN', category: 'FOOD', difficulty: 'easy', definition: 'Aliment de base cuit au four.', example: 'Une baguette de pain croustillante.', minLevel: 1 },
    { word: 'FROMAGE', category: 'FOOD', difficulty: 'easy', definition: 'Produit laitier savoureux.', example: 'Un bon fromage affiné.', minLevel: 2 },
    { word: 'SOUPE', category: 'FOOD', difficulty: 'easy', definition: 'Plat chaud à base de bouillon.', example: 'Une soupe de légumes réconfortante.', minLevel: 2 },
  ],
  WEATHER: [
    { word: 'PLUIE', category: 'WEATHER', difficulty: 'easy', definition: 'Gouttes d’eau tombant des nuages.', example: 'Une douce pluie d’été.', minLevel: 1 },
    { word: 'NEIGE', category: 'WEATHER', difficulty: 'easy', definition: 'Cristaux de glace blancs et légers.', example: 'La neige recouvre le village.', minLevel: 1 },
    { word: 'VENT', category: 'WEATHER', difficulty: 'easy', definition: 'Mouvement d’air atmosphérique.', example: 'Le vent souffle sur les collines.', minLevel: 2 },
  ],
  SPORTS: [
    { word: 'BALLON', category: 'SPORTS', difficulty: 'easy', definition: 'Balle sphérique de sport.', example: 'Il contrôle le ballon avec aisance.', minLevel: 1 },
    { word: 'NAGER', category: 'SPORTS', difficulty: 'easy', definition: 'Se déplacer dans l’eau.', example: 'Nager chaque matin pour s’entraîner.', minLevel: 2 },
    { word: 'TENNIS', category: 'SPORTS', difficulty: 'easy', definition: 'Sport de raquette populaire.', example: 'Un match de tennis passionnant.', minLevel: 3 },
  ],
  MUSIC: [
    { word: 'CHANT', category: 'MUSIC', difficulty: 'easy', definition: 'Art de moduler des sons vocaux.', example: 'Le chant mélodieux des oiseaux.', minLevel: 1 },
    { word: 'PIANO', category: 'MUSIC', difficulty: 'easy', definition: 'Instrument à clavier et à cordes.', example: 'Jouer du piano avec émotion.', minLevel: 2 },
  ],
  GEOGRAPHY: [
    { word: 'ILE', category: 'GEOGRAPHY', difficulty: 'easy', definition: 'Terre entourée d’eau de tous côtés.', example: 'Une île paradisiaque bordée de palmiers.', minLevel: 1 },
    { word: 'VILLE', category: 'GEOGRAPHY', difficulty: 'easy', definition: 'Grand centre urbain habité.', example: 'Paris est une ville magnifique.', minLevel: 2 },
  ]
};

export const WORD_DATABASE_DE: Record<string, WordEntry[]> = {
  ANIMALS: [
    { word: 'KATZE', category: 'ANIMALS', difficulty: 'easy', definition: 'Beliebtes, geschmeidiges Haustier.', example: 'Die Katze schnurrt zufrieden am Fenster.', minLevel: 1 },
    { word: 'HUND', category: 'ANIMALS', difficulty: 'easy', definition: 'Der treueste tierische Freund des Menschen.', example: 'Der Hund bellt fröhlich im Garten.', minLevel: 1 },
    { word: 'LOEWE', category: 'ANIMALS', difficulty: 'easy', definition: 'Majestätische Großkatze der Savanne.', example: 'Der Löwe wacht über sein Rudel.', minLevel: 1 },
    { word: 'BAER', category: 'ANIMALS', difficulty: 'easy', definition: 'Großes Säugetier mit dickem Fell.', example: 'Der Bär fängt Fische im klaren Fluss.', minLevel: 1 },
    { word: 'WOLF', category: 'ANIMALS', difficulty: 'easy', definition: 'Wildes Rudeltier der Wälder.', example: 'Der Wolf heult im Mondschein.', minLevel: 1 },
    { word: 'TIGER', category: 'ANIMALS', difficulty: 'easy', definition: 'Gestreifte Großkatze des Dschungels.', example: 'Der Tiger schleicht lautlos durch das Gras.', minLevel: 2 },
    { word: 'ADLER', category: 'ANIMALS', difficulty: 'easy', definition: 'Großer Greifvogel mit weitem Blick.', example: 'Der Adler kreist hoch über den Bergen.', minLevel: 3 },
  ],
  OCEAN: [
    { word: 'MEER', category: 'OCEAN', difficulty: 'easy', definition: 'Große Salzwassermasse der Erde.', example: 'Das blaue Meer glitzert in der Sonne.', minLevel: 1 },
    { word: 'FISCH', category: 'OCEAN', difficulty: 'easy', definition: 'Im Wasser lebendes Wirbeltier mit Flossen.', example: 'Bunte Fische schwimmen im Riff.', minLevel: 1 },
    { word: 'KORALLE', category: 'OCEAN', difficulty: 'easy', definition: 'Meereslebewesen, die Riffe bilden.', example: 'Das Korallenriff schützt viele Meeresbewohner.', minLevel: 2 },
    { word: 'WAL', category: 'OCEAN', difficulty: 'easy', definition: 'Riesiges Meeressäugetier.', example: 'Der Wal taucht in die Tiefe ab.', minLevel: 3 },
  ],
  SPACE: [
    { word: 'SONNE', category: 'SPACE', difficulty: 'easy', definition: 'Das Zentrum unseres Sonnensystems.', example: 'Die Sonne spendet Licht und Wärme.', minLevel: 1 },
    { word: 'MOND', category: 'SPACE', difficulty: 'easy', definition: 'Natürlicher Begleiter der Erde.', example: 'Der Vollmond leuchtet am Nachthimmel.', minLevel: 1 },
    { word: 'STERN', category: 'SPACE', difficulty: 'easy', definition: 'Leuchtender Himmelskörper im Kosmos.', example: 'Ein funkelnder Stern weist den Weg.', minLevel: 2 },
    { word: 'PLANET', category: 'SPACE', difficulty: 'easy', definition: 'Himmelskörper auf einer Umlaufbahn.', example: 'Die Erde ist ein faszinierender Planet.', minLevel: 3 },
  ],
  FRUITS: [
    { word: 'APFEL', category: 'FRUITS', difficulty: 'easy', definition: 'Knackige, saftige Frucht.', example: 'Ein frischer roter Apfel schmeckt köstlich.', minLevel: 1 },
    { word: 'BANANE', category: 'FRUITS', difficulty: 'easy', definition: 'Süße Frucht mit gelber Schale.', example: 'Eine reife Banane liefert viel Energie.', minLevel: 2 },
    { word: 'ORANGE', category: 'FRUITS', difficulty: 'easy', definition: 'Saftige Zitrusfrucht voller Vitamine.', example: 'Frisch gepresster Orangensaft zum Frühstück.', minLevel: 3 },
  ],
  NATURE: [
    { word: 'BAUM', category: 'NATURE', difficulty: 'easy', definition: 'Holzige Pflanze mit Stamm und Krone.', example: 'Ein alter Baum spendet kühlen Schatten.', minLevel: 1 },
    { word: 'WALD', category: 'NATURE', difficulty: 'easy', definition: 'Großes Gebiet dicht bewachsen mit Bäumen.', example: 'Im dichten Wald zwitschern Vögel.', minLevel: 1 },
    { word: 'BERG', category: 'NATURE', difficulty: 'easy', definition: 'Hohe natürliche Erhebung der Erde.', example: 'Vom Berg hat man eine herrliche Aussicht.', minLevel: 2 },
    { word: 'BLUME', category: 'NATURE', difficulty: 'easy', definition: 'Bunte Blüte einer Pflanze.', example: 'Bunte Blumen blühen auf der Wiese.', minLevel: 2 },
  ],
  FOOD: [
    { word: 'BROT', category: 'FOOD', difficulty: 'easy', definition: 'Grundnahrungsmittel aus Mehl und Wasser.', example: 'Frisches Brot mit knuspriger Kruste.', minLevel: 1 },
    { word: 'KAESE', category: 'FOOD', difficulty: 'easy', definition: 'Milchprodukt mit herzhaftem Aroma.', example: 'Würziger Käse passt gut zum Abendessen.', minLevel: 2 },
    { word: 'SUPPE', category: 'FOOD', difficulty: 'easy', definition: 'Warmes, flüssiges Gericht.', example: 'Eine heiße Suppe wärmt an kalten Tagen.', minLevel: 2 },
  ],
  WEATHER: [
    { word: 'REGEN', category: 'WEATHER', difficulty: 'easy', definition: 'Flüssiger Niederschlag aus Wolken.', example: 'Der milde Frühlingsregen tut der Natur gut.', minLevel: 1 },
    { word: 'SCHNEE', category: 'WEATHER', difficulty: 'easy', definition: 'Weiß gefrorene Eiskristalle.', example: 'Weißer Schnee bedeckt die Dächer.', minLevel: 1 },
    { word: 'WIND', category: 'WEATHER', difficulty: 'easy', definition: 'Natürliche Luftbewegung.', example: 'Ein frischer Wind weht durch die Bäume.', minLevel: 2 },
  ],
  SPORTS: [
    { word: 'BALL', category: 'SPORTS', difficulty: 'easy', definition: 'Rundes Spielgerät für viele Sportarten.', example: 'Er wirft den Ball zielsicher ins Tor.', minLevel: 1 },
    { word: 'LAUFEN', category: 'SPORTS', difficulty: 'easy', definition: 'Schnelle Fortbewegung zu Fuß.', example: 'Joggen und Laufen hält fit.', minLevel: 2 },
  ],
  MUSIC: [
    { word: 'LIED', category: 'MUSIC', difficulty: 'easy', definition: 'Gesungenes musikalisches Werk.', example: 'Ein wunderschönes Lied erklang im Saal.', minLevel: 1 },
    { word: 'KLAVIER', category: 'MUSIC', difficulty: 'easy', definition: 'Großes Tasteninstrument mit Saiten.', example: 'Sie spielt klassische Stücke am Klavier.', minLevel: 2 },
  ],
  GEOGRAPHY: [
    { word: 'INSEL', category: 'GEOGRAPHY', difficulty: 'easy', definition: 'Vollständig von Wasser umgebenes Land.', example: 'Eine kleine grüne Insel im Ozean.', minLevel: 1 },
    { word: 'STADT', category: 'GEOGRAPHY', difficulty: 'easy', definition: 'Große, dicht besiedelte Ortschaft.', example: 'Die historische Stadt hat viele Sehenswürdigkeiten.', minLevel: 2 },
  ]
};

export const WORD_DATABASE_PT: Record<string, WordEntry[]> = {
  ANIMALS: [
    { word: 'GATO', category: 'ANIMALS', difficulty: 'easy', definition: 'Pequeno mamífero felino de estimação.', example: 'O gato dorme tranquilamente ao sol.', minLevel: 1 },
    { word: 'CACHORRO', category: 'ANIMALS', difficulty: 'easy', definition: 'O amigo mais fiel do ser humano.', example: 'O cachorro abana o rabo de alegria.', minLevel: 1 },
    { word: 'LEAO', category: 'ANIMALS', difficulty: 'easy', definition: 'O rei majestoso da savana.', example: 'O leão ruge ao amanhecer.', minLevel: 1 },
    { word: 'URSO', category: 'ANIMALS', difficulty: 'easy', definition: 'Grande mamífero com pelos densos.', example: 'O urso pesca no rio calmo.', minLevel: 1 },
    { word: 'LOBO', category: 'ANIMALS', difficulty: 'easy', definition: 'Canídeo selvagem que vive em alcateias.', example: 'O lobo uiva sob a lua cheia.', minLevel: 1 },
    { word: 'TIGRE', category: 'ANIMALS', difficulty: 'easy', definition: 'Grande felino de pelagem listrada.', example: 'O tigre caminha pela floresta.', minLevel: 2 },
  ],
  OCEAN: [
    { word: 'PEIXE', category: 'OCEAN', difficulty: 'easy', definition: 'Animal vertebrado que vive na água.', example: 'Peixes coloridos nadam no recife.', minLevel: 1 },
    { word: 'BALEIA', category: 'OCEAN', difficulty: 'easy', definition: 'Enorme mamífero aquático dos oceanos.', example: 'A baleia salta sobre as ondas.', minLevel: 2 },
    { word: 'TUBARAO', category: 'OCEAN', difficulty: 'easy', definition: 'Peixe predador cartilaginoso dos mares.', example: 'O tubarão nada velozmente.', minLevel: 2 },
  ],
  SPACE: [
    { word: 'SOL', category: 'SPACE', difficulty: 'easy', definition: 'Estrela central do nosso sistema solar.', example: 'O sol aquece a terra.', minLevel: 1 },
    { word: 'LUA', category: 'SPACE', difficulty: 'easy', definition: 'Satélite natural que ilumina a noite.', example: 'A lua cheia brilha no céu límpido.', minLevel: 1 },
    { word: 'ESTRELA', category: 'SPACE', difficulty: 'easy', definition: 'Corpo celeste com luz própria.', example: 'Uma estrela brilhante no horizonte.', minLevel: 2 },
  ],
  FRUITS: [
    { word: 'MACA', category: 'FRUITS', difficulty: 'easy', definition: 'Fruta redonda e crocante.', example: 'Uma maçã fresca para o lanche.', minLevel: 1 },
    { word: 'BANANA', category: 'FRUITS', difficulty: 'easy', definition: 'Fruta alongada de casca amarela.', example: 'A banana é doce e nutritiva.', minLevel: 1 },
    { word: 'LARANJA', category: 'FRUITS', difficulty: 'easy', definition: 'Cítrico rico em vitamina C.', example: 'Suco de laranja natural.', minLevel: 2 },
  ],
  NATURE: [
    { word: 'ARVORE', category: 'NATURE', difficulty: 'easy', definition: 'Planta de tronco lenhoso e copa frondosa.', example: 'A grande árvore oferece sombra fresca.', minLevel: 1 },
    { word: 'RIO', category: 'NATURE', difficulty: 'easy', definition: 'Curso de água natural e corrente.', example: 'O rio corre calmo pelo vale.', minLevel: 1 },
    { word: 'FLOR', category: 'NATURE', difficulty: 'easy', definition: 'Estrutura colorida e perfumada da planta.', example: 'Flores belas no jardim da primavera.', minLevel: 2 },
  ],
  FOOD: [
    { word: 'PAO', category: 'FOOD', difficulty: 'easy', definition: 'Alimento básico feito de farinha e água.', example: 'Pão quentinho acabado de assar.', minLevel: 1 },
    { word: 'QUEIJO', category: 'FOOD', difficulty: 'easy', definition: 'Derivado do leite saboroso e nutritivo.', example: 'Fatias de queijo para o café.', minLevel: 1 },
  ],
  WEATHER: [
    { word: 'CHUVA', category: 'WEATHER', difficulty: 'easy', definition: 'Precipitação líquida que cai das nuvens.', example: 'A chuva suave rega a terra.', minLevel: 1 },
    { word: 'VENTO', category: 'WEATHER', difficulty: 'easy', definition: 'Ar em movimento na atmosfera.', example: 'O vento sopra leve entre as folhas.', minLevel: 1 },
  ]
};

export const WORD_DATABASE_ID: Record<string, WordEntry[]> = {
  ANIMALS: [
    { word: 'KUCING', category: 'ANIMALS', difficulty: 'easy', definition: 'Hewan peliharaan lucu berbulu lembut.', example: 'Kucing manis tidur di sofa.', minLevel: 1 },
    { word: 'ANJING', category: 'ANIMALS', difficulty: 'easy', definition: 'Sahabat setia manusia yang cerdas.', example: 'Anjing melompat gembira di halaman.', minLevel: 1 },
    { word: 'SINGA', category: 'ANIMALS', difficulty: 'easy', definition: 'Raja rimba yang gagah perkasa.', example: 'Singa mengaum saat fajar tiba.', minLevel: 1 },
    { word: 'HARIMAU', category: 'ANIMALS', difficulty: 'easy', definition: 'Kucing besar bergaris loreng.', example: 'Harimau berjalan anggun di hutan.', minLevel: 1 },
    { word: 'BERUANG', category: 'ANIMALS', difficulty: 'easy', definition: 'Hewan mamalia bertubuh besar berbulu tebal.', example: 'Beruang menangkap ikan di sungai.', minLevel: 2 },
  ],
  OCEAN: [
    { word: 'IKAN', category: 'OCEAN', difficulty: 'easy', definition: 'Hewan air yang bernapas dengan insang.', example: 'Ikan hias berenang di karang laut.', minLevel: 1 },
    { word: 'PAUS', category: 'OCEAN', difficulty: 'easy', definition: 'Mamalia laut raksasa yang ramah.', example: 'Paus melompat tinggi di laut luas.', minLevel: 2 },
    { word: 'HIU', category: 'OCEAN', difficulty: 'easy', definition: 'Predator laut yang berenang cepat.', example: 'Hiu menjelajah samudra biru.', minLevel: 2 },
  ],
  SPACE: [
    { word: 'MATAHARI', category: 'SPACE', difficulty: 'easy', definition: 'Bintang pusat tata surya pemberi terang.', example: 'Matahari bersinar cerah pagi ini.', minLevel: 1 },
    { word: 'BULAN', category: 'SPACE', difficulty: 'easy', definition: 'Satelit alami yang menerangi malam.', example: 'Bulan purnama bersinar indah di langit.', minLevel: 1 },
    { word: 'BINTANG', category: 'SPACE', difficulty: 'easy', definition: 'Benda langit yang memancarkan cahaya.', example: 'Ribuan bintang bertaburan di malam hari.', minLevel: 2 },
  ],
  FRUITS: [
    { word: 'APEL', category: 'FRUITS', difficulty: 'easy', definition: 'Buah manis dan renyah berwarna merah atau hijau.', example: 'Makan apel segar setiap hari.', minLevel: 1 },
    { word: 'PISANG', category: 'FRUITS', difficulty: 'easy', definition: 'Buah manis berkulit kuning.', example: 'Pisang matang terasa manis lezat.', minLevel: 1 },
    { word: 'JERUK', category: 'FRUITS', difficulty: 'easy', definition: 'Buah berair kaya akan vitamin C.', example: 'Jus jeruk dingin sangat menyegarkan.', minLevel: 2 },
  ],
  NATURE: [
    { word: 'POHON', category: 'NATURE', difficulty: 'easy', definition: 'Tumbuhan berkayu dengan daun lebat.', example: 'Pohon rindang meneduhkan taman.', minLevel: 1 },
    { word: 'SUNGAI', category: 'NATURE', difficulty: 'easy', definition: 'Aliran air alami yang jernih.', example: 'Air sungai mengalir menuju danau.', minLevel: 1 },
    { word: 'BUNGA', category: 'NATURE', difficulty: 'easy', definition: 'Bagian tanaman yang mekar cantik dan harum.', example: 'Bunga melati mekar di kebun.', minLevel: 1 },
  ],
  FOOD: [
    { word: 'ROTI', category: 'FOOD', difficulty: 'easy', definition: 'Makanan lezat berbahan dasar tepung gandum.', example: 'Roti panggang hangat untuk sarapan.', minLevel: 1 },
    { word: 'NASI', category: 'FOOD', difficulty: 'easy', definition: 'Makanan pokok sumber karbohidrat.', example: 'Nasi hangat di meja makan.', minLevel: 1 },
  ],
  WEATHER: [
    { word: 'HUJAN', category: 'WEATHER', difficulty: 'easy', definition: 'Titik air yang turun dari langit.', example: 'Hujan gerimis menyejukkan udara sore.', minLevel: 1 },
    { word: 'ANGIN', category: 'WEATHER', difficulty: 'easy', definition: 'Udara yang bergerak alami.', example: 'Angin sepoi-sepoi bertiup di pantai.', minLevel: 1 },
  ]
};

export const WORD_DATABASE_JA: Record<string, WordEntry[]> = {
  ANIMALS: [
    { word: 'NEKO', category: 'ANIMALS', difficulty: 'easy', definition: '猫 (ねこ) - 穏やかで愛らしい家庭の友。', example: 'ひなたぼっこをする可愛い猫。', minLevel: 1 },
    { word: 'INU', category: 'ANIMALS', difficulty: 'easy', definition: '犬 (いぬ) - 忠実で賢い人間の親友。', example: '元気に走る人懐っこい犬。', minLevel: 1 },
    { word: 'TORA', category: 'ANIMALS', difficulty: 'easy', definition: '虎 (とら) - 勇敢で力強い森の王者。', example: '密林を堂々と歩く虎。', minLevel: 1 },
    { word: 'KUMA', category: 'ANIMALS', difficulty: 'easy', definition: '熊 (くま) - 大きな体と厚い毛皮を持つ動物。', example: '川で魚を捕まえる熊。', minLevel: 1 },
    { word: 'SHIKA', category: 'ANIMALS', difficulty: 'easy', definition: '鹿 (しか) - 美しい角を持つ優しい動物。', example: '森の小道を歩く穏やかな鹿。', minLevel: 2 },
  ],
  OCEAN: [
    { word: 'SAKANA', category: 'OCEAN', difficulty: 'easy', definition: '魚 (さかな) - 水の中を泳ぐ生き物。', example: '綺麗な海を泳ぐカラフルな魚。', minLevel: 1 },
    { word: 'KUJIRA', category: 'OCEAN', difficulty: 'easy', definition: '鯨 (くじら) - 雄大な海の巨大哺乳類。', example: '大海原に潮を吹く鯨。', minLevel: 2 },
  ],
  SPACE: [
    { word: 'TAIYOU', category: 'SPACE', difficulty: 'easy', definition: '太陽 (たいよう) - 世界を照らす輝く星。', example: '朝の光を放つ輝く太陽。', minLevel: 1 },
    { word: 'TSUKI', category: 'SPACE', difficulty: 'easy', definition: '月 (つき) - 夜空を優しく照らす衛星。', example: '夜空に浮かぶ丸い満月。', minLevel: 1 },
    { word: 'HOSHI', category: 'SPACE', difficulty: 'easy', definition: '星 (ほし) - 宇宙できらめく天体。', example: '夜空にきらきら光る星。', minLevel: 1 },
  ],
  FRUITS: [
    { word: 'RINGO', category: 'FRUITS', difficulty: 'easy', definition: '林檎 (りんご) - 甘酸っぱく美味しい果物。', example: '真っ赤でみずみずしい林檎。', minLevel: 1 },
    { word: 'MIKAN', category: 'FRUITS', difficulty: 'easy', definition: '蜜柑 (みかん) - 冬に美味しい柑橘果物。', example: '甘くてジューシーな温州蜜柑。', minLevel: 1 },
  ],
  NATURE: [
    { word: 'YAMA', category: 'NATURE', difficulty: 'easy', definition: '山 (やま) - 高くそびえる美しい自然。', example: '雪化粧をした雄大な山。', minLevel: 1 },
    { word: 'KAWA', category: 'NATURE', difficulty: 'easy', definition: '川 (かわ) - 清らかに流れる水の道。', example: 'さらさらと流れる清流の川。', minLevel: 1 },
    { word: 'HANA', category: 'NATURE', difficulty: 'easy', definition: '花 (はな) - 美しく色づく植物の命。', example: '春風に揺れる桜の花。', minLevel: 1 },
  ],
  WEATHER: [
    { word: 'AME', category: 'WEATHER', difficulty: 'easy', definition: '雨 (あめ) - 大地を潤す天の恵み。', example: '静かに降る優しい恵みの雨。', minLevel: 1 },
    { word: 'YUKI', category: 'WEATHER', difficulty: 'easy', definition: '雪 (ゆき) - 白く美しい結晶の舞い。', example: '一面を白く染める新雪。', minLevel: 1 },
    { word: 'KAZE', category: 'WEATHER', difficulty: 'easy', definition: '風 (かぜ) - 空気を動かす自然の息吹。', example: '心地よく吹き抜ける涼風。', minLevel: 1 },
  ]
};

export const WORD_DATABASE_KO: Record<string, WordEntry[]> = {
  ANIMALS: [
    { word: 'GOYANGI', category: 'ANIMALS', difficulty: 'easy', definition: '고양이 - 귀엽고 사랑스러운 반려 동물.', example: '햇살 아래 낮잠 자는 귀여운 고양이.', minLevel: 1 },
    { word: 'GANGI', category: 'ANIMALS', difficulty: 'easy', definition: '강아지 - 충성스럽고 활기찬 인간의 친구.', example: '꼬리를 흔들며 반기는 강아지.', minLevel: 1 },
    { word: 'SAJA', category: 'ANIMALS', difficulty: 'easy', definition: '사자 - 초원의 용맹한 백수의 왕.', example: '새벽을 가르는 사자의 포효.', minLevel: 1 },
    { word: 'GOM', category: 'ANIMALS', difficulty: 'easy', definition: '곰 - 큰 몸집에 따뜻한 털을 가진 동물.', example: '강에서 물고기를 잡는 곰.', minLevel: 1 },
    { word: 'HORANGI', category: 'ANIMALS', difficulty: 'easy', definition: '호랑이 - 한국을 대표하는 용맹한 줄무늬 맹수.', example: '눈 덮인 산을 오르는 호랑이.', minLevel: 2 },
  ],
  OCEAN: [
    { word: 'MULGOGI', category: 'OCEAN', difficulty: 'easy', definition: '물고기 - 바다와 강을 헤엄치는 동물.', example: '산호초 사이로 헤엄치는 물고기.', minLevel: 1 },
    { word: 'BADA', category: 'OCEAN', difficulty: 'easy', definition: '바다 - 넓고 푸른 물의 세상.', example: '푸른 파도가 넘실대는 바다.', minLevel: 1 },
  ],
  SPACE: [
    { word: 'TAEYANG', category: 'SPACE', difficulty: 'easy', definition: '태양 - 지구를 밝히고 따뜻하게 하는 별.', example: '아침을 비추는 눈부신 태양.', minLevel: 1 },
    { word: 'DAL', category: 'SPACE', difficulty: 'easy', definition: '달 - 밤하늘을 환하게 밝혀주는 천체.', example: '은은하게 빛나는 둥근 보름달.', minLevel: 1 },
    { word: 'BYEOL', category: 'SPACE', difficulty: 'easy', definition: '별 - 어두운 밤하늘에 반짝이는 보석.', example: '반짝반짝 빛나는 밤하늘의 별.', minLevel: 1 },
  ],
  FRUITS: [
    { word: 'SAGWA', category: 'FRUITS', difficulty: 'easy', definition: '사과 - 아삭하고 달콤한 인기 과일.', example: '빨갛게 잘 익은 싱싱한 사과.', minLevel: 1 },
    { word: 'PODO', category: 'FRUITS', difficulty: 'easy', definition: '포도 - 송이송이 달콤한 보랏빛 과일.', example: '달콤한 과즙이 가득한 포도.', minLevel: 1 },
  ],
  NATURE: [
    { word: 'NAMU', category: 'NATURE', difficulty: 'easy', definition: '나무 - 푸른 잎과 튼튼한 줄기를 가진 식물.', example: '시원한 그늘을 만들어 주는 큰 나무.', minLevel: 1 },
    { word: 'GANG', category: 'NATURE', difficulty: 'easy', definition: '강 - 유유히 흐르는 맑은 물줄기.', example: '들판을 지나 바다로 흐르는 강.', minLevel: 1 },
    { word: 'KKOT', category: 'NATURE', difficulty: 'easy', definition: '꽃 - 봄에 활짝 피어나는 향기로운 존재.', example: '봄바람에 흔들리는 예쁜 꽃.', minLevel: 1 },
  ],
  WEATHER: [
    { word: 'BI', category: 'WEATHER', difficulty: 'easy', definition: '비 - 하늘에서 촉촉하게 내리는 물방울.', example: '대지를 적셔주는 고마운 단비.', minLevel: 1 },
    { word: 'NUN', category: 'WEATHER', difficulty: 'easy', definition: '눈 - 하얗고 아름답게 내리는 얼음 결정.', example: '온 세상을 하얗게 덮은 하얀 눈.', minLevel: 1 },
    { word: 'BARAM', category: 'WEATHER', difficulty: 'easy', definition: '바람 - 시원하게 불어오는 공기의 흐름.', example: '더위를 잊게 해주는 시원한 바람.', minLevel: 1 },
  ]
};

export const WORD_DATABASE_HI: Record<string, WordEntry[]> = {
  ANIMALS: [
    { word: 'BILLI', category: 'ANIMALS', difficulty: 'easy', definition: 'बिल्ली - एक प्यारी और फुर्तीली घरेलू साथी।', example: 'धूप में बैठी प्यारी बिल्ली।', minLevel: 1 },
    { word: 'KUTTA', category: 'ANIMALS', difficulty: 'easy', definition: 'कुत्ता - इंसान का सबसे वफादार और सच्चा मित्र।', example: 'गेंद के पीछे भागता वफादार कुत्ता।', minLevel: 1 },
    { word: 'SHER', category: 'ANIMALS', difficulty: 'easy', definition: 'शेर - जंगल का साहसी और शक्तिशाली राजा।', example: 'सवेरे दहाड़ता हुआ जंगल का शेर।', minLevel: 1 },
    { word: 'HATHI', category: 'ANIMALS', difficulty: 'easy', definition: 'हाथी - लंबी सूंड वाला विशालकाय समझदार जानवर।', example: 'शांत स्वभाव वाला विशाल हाथी।', minLevel: 1 },
    { word: 'BHALU', category: 'ANIMALS', difficulty: 'easy', definition: 'भालू - घने बालों वाला बड़ा स्तनपायी जीव।', example: 'नदी किनारे टहलता हुआ भूरा भालू।', minLevel: 2 },
  ],
  OCEAN: [
    { word: 'MACHLI', category: 'OCEAN', difficulty: 'easy', definition: 'मछली - जल में तैरने वाला सुंदर जीव।', example: 'साफ पानी में तैरती रंगीन मछली।', minLevel: 1 },
    { word: 'SAMUNDAR', category: 'OCEAN', difficulty: 'easy', definition: 'समुंदर - विशाल और गहरा जल का भंडार।', example: 'नीले समुंदर की उठती लहरें।', minLevel: 2 },
  ],
  SPACE: [
    { word: 'SURAJ', category: 'SPACE', difficulty: 'easy', definition: 'सूरज - दिन को रोशन करने वाला ऊर्जावान तारा।', example: 'सुबह की पहली किरण बिखेरता सूरज।', minLevel: 1 },
    { word: 'CHAND', category: 'SPACE', difficulty: 'easy', definition: 'चाँद - रात को शीतल चाँदनी बिखेरने वाला उपग्रह।', example: 'आसमान में चमकता पूरा चाँद।', minLevel: 1 },
    { word: 'TARA', category: 'SPACE', difficulty: 'easy', definition: 'तारा - रात के अंधेरे में टिमटिमाता आकाशीय पिंड।', example: 'चमकता हुआ ध्रुव तारा।', minLevel: 1 },
  ],
  FRUITS: [
    { word: 'SEB', category: 'FRUITS', difficulty: 'easy', definition: 'सेब - मीठा और रसीला स्वास्थ्यवर्धक फल।', example: 'रोजाना एक ताजा सेब खाना अच्छा होता है।', minLevel: 1 },
    { word: 'KELA', category: 'FRUITS', difficulty: 'easy', definition: 'केला - ऊर्जा से भरपूर पीले छिलके वाला फल।', example: 'मीठा और पौष्टिक पका हुआ केला।', minLevel: 1 },
    { word: 'AAM', category: 'FRUITS', difficulty: 'easy', definition: 'आम - फलों का स्वादिष्ट और रसीला राजा।', example: 'गर्मियों में रसीले आम का स्वाद।', minLevel: 1 },
  ],
  NATURE: [
    { word: 'PED', category: 'NATURE', difficulty: 'easy', definition: 'पेड़ - छाया और फल देने वाला वृक्ष।', example: 'हरा-भरा छायादार बड़ा पेड़।', minLevel: 1 },
    { word: 'NADI', category: 'NATURE', difficulty: 'easy', definition: 'नदी - पहाड़ों से बहती हुई स्वच्छ जलधारा।', example: 'कल-कल बहती पवित्र नदी।', minLevel: 1 },
    { word: 'PHOOL', category: 'NATURE', difficulty: 'easy', definition: 'फूल - सुंदर रंग और मनमोहक खुशबू वाला पुष्प।', example: 'बगीचे में महकता हुआ गुलाब का फूल।', minLevel: 1 },
  ],
  FOOD: [
    { word: 'ROTI', category: 'FOOD', difficulty: 'easy', definition: 'रोटी - आटे से बनी गरम-गरम भारतीय ब्रेड।', example: 'थाली में रखी गरमा-गरम फूली रोटी।', minLevel: 1 },
    { word: 'CHAWAL', category: 'FOOD', difficulty: 'easy', definition: 'चावल - स्वादिष्ट और पौष्टिक मुख्य भोजन।', example: 'दाल के साथ स्वादिष्ट चावल।', minLevel: 1 },
  ],
  WEATHER: [
    { word: 'BARISH', category: 'WEATHER', difficulty: 'easy', definition: 'बारिश - आसमान से गिरती हुई सुहानी बूँदें।', example: 'सावन की रिमझिम सुहानी बारिश।', minLevel: 1 },
    { word: 'HAWA', category: 'WEATHER', difficulty: 'easy', definition: 'हवा - जीवनदायिनी ठंडी वायु।', example: 'शाम को चलती हुई शीतल मंद हवा।', minLevel: 1 },
  ]
};

// Comprehensive multilingual word database dispatcher
export function getWordDatabase(lang: LanguageCode = 'en'): Record<string, WordEntry[]> {
  switch (lang) {
    case 'es':
      return { ...WORD_DATABASE_EN, ...WORD_DATABASE_ES };
    case 'fr':
      return { ...WORD_DATABASE_EN, ...WORD_DATABASE_FR };
    case 'de':
      return { ...WORD_DATABASE_EN, ...WORD_DATABASE_DE };
    case 'pt':
      return { ...WORD_DATABASE_EN, ...WORD_DATABASE_PT };
    case 'id':
      return { ...WORD_DATABASE_EN, ...WORD_DATABASE_ID };
    case 'ja':
      return { ...WORD_DATABASE_EN, ...WORD_DATABASE_JA };
    case 'ko':
      return { ...WORD_DATABASE_EN, ...WORD_DATABASE_KO };
    case 'hi':
      return { ...WORD_DATABASE_EN, ...WORD_DATABASE_HI };
    case 'en':
    default:
      return WORD_DATABASE_EN;
  }
}

// Backward-compatible export
export const WORD_DATABASE = WORD_DATABASE_EN;

export const THEME_FALLBACKS: Record<string, string[]> = {
  VEGETABLES: ['CARROT', 'POTATO', 'TOMATO', 'ONION', 'BROCCOLI', 'SPINACH', 'PEPPER', 'LETTUCE', 'CUCUMBER', 'GARLIC', 'RADISH', 'PUMPKIN'],
  TECHNOLOGY: ['COMPUTER', 'SOFTWARE', 'HARDWARE', 'INTERNET', 'NETWORK', 'ALGORITHM', 'DATABASE', 'SERVER', 'ROUTER', 'BATTERY', 'SCREEN', 'KEYBOARD'],
  PROFESSIONS: ['DOCTOR', 'TEACHER', 'ENGINEER', 'ARTIST', 'PILOT', 'CHEF', 'NURSE', 'WRITER', 'LAWYER', 'SCIENTIST', 'ARCHITECT', 'FIREFIGHTER'],
  HUMAN_BODY: ['HEART', 'BRAIN', 'LUNGS', 'BONES', 'MUSCLE', 'STOMACH', 'BLOOD', 'SKIN', 'KIDNEY', 'LIVER', 'SKELETON', 'NEURON'],
  CAMPING: ['TENT', 'LANTERN', 'CAMPFIRE', 'COMPASS', 'BACKPACK', 'CANTEEN', 'SLEEPING', 'FLASHLIGHT', 'TRAIL', 'MATCHES', 'HAMMOCK'],
  KITCHEN: ['KNIFE', 'SPOON', 'FORK', 'PLATE', 'PAN', 'OVEN', 'BLENDER', 'KETTLE', 'TOASTER', 'BOWL', 'WHISK', 'FRIDGE'],
  GARDEN: ['FLOWER', 'SHOVEL', 'HOSE', 'SEEDS', 'PLANT', 'SOIL', 'FERTILIZER', 'RAKE', 'PRUNER', 'SPROUT', 'WATERING', 'BLOOM'],
  EMOTIONS: ['HAPPY', 'JOYFUL', 'SERENE', 'CURIOUS', 'BRAVE', 'HOPEFUL', 'CALM', 'PROUD', 'EXCITED', 'PEACEFUL', 'GRATEFUL', 'VIBRANT'],
  COLORS_SHAPES: ['CIRCLE', 'SQUARE', 'TRIANGLE', 'DIAMOND', 'VIOLET', 'CRIMSON', 'GOLDEN', 'EMERALD', 'SAPPHIRE', 'INDIGO', 'AMBER', 'SCARLET'],
  ASTRONOMY: ['COSMOS', 'PULSAR', 'QUASAR', 'ECLIPSE', 'SUPERNOVA', 'SOLSTICE', 'EQUINOX', 'METEOR', 'CORONA', 'ZENITH', 'NADIR', 'AURORA'],
  CHEMISTRY: ['OXYGEN', 'HYDROGEN', 'CARBON', 'NITROGEN', 'HELIUM', 'SODIUM', 'ACID', 'BASE', 'REACTION', 'CATALYST', 'SOLUTION', 'VALENCE'],
  PHYSICS: ['FORCE', 'MASS', 'MOTION', 'VELOCITY', 'ENERGY', 'VECTOR', 'INERTIA', 'OPTICS', 'WAVELENGTH', 'FRICTION', 'THERMAL', 'PHOTON'],
  TRAVEL: ['PASSPORT', 'LUGGAGE', 'AIRPORT', 'FLIGHT', 'JOURNEY', 'TICKET', 'EXPLORE', 'VOYAGE', 'CRUISE', 'HOTEL', 'RESORT', 'HORIZON'],
  HISTORY: ['CASTLE', 'EMPIRE', 'KNIGHT', 'DYNASTY', 'PHARAOH', 'ANCIENT', 'MONARCH', 'TEMPLE', 'MONUMENT', 'LEGEND', 'HERITAGE', 'CHRONICLE']
};

export function getAllCategories(): string[] {
  const mainCats = Object.keys(WORD_DATABASE_EN);
  const fallbackCats = Object.keys(THEME_FALLBACKS);
  return Array.from(new Set([...mainCats, ...fallbackCats]));
}

