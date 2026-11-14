const fs = require('fs');
const path = require('path');

const enCategories = {
  ANIMALS: [
    { word: 'CAT', definition: 'A small domesticated feline companion with soft fur.', example: 'The playful cat purred in the warm sunshine.' },
    { word: 'DOG', definition: 'A loyal four-legged canine known as human best friend.', example: 'The dog wagged its tail with joy.' },
    { word: 'LION', definition: 'A large wild cat native to the African savanna.', example: 'The lion roared across the open savanna.' },
    { word: 'BEAR', definition: 'A heavy wild mammal with thick fur and sharp claws.', example: 'The brown bear caught salmon in the river.' },
    { word: 'WOLF', definition: 'A wild carnivorous mammal of the dog family living in packs.', example: 'The wolf pack howled under the full moon.' },
    { word: 'DEER', definition: 'A gentle hoofed grazing animal with antlers in males.', example: 'A gentle deer grazed quietly near the forest edge.' },
    { word: 'FOX', definition: 'A clever small carnivorous mammal with a bushy tail.', example: 'The clever fox darted across the snowy meadow.' },
    { word: 'TIGER', definition: 'A large cat species with orange fur and black stripes.', example: 'The magnificent tiger moved silently through the jungle.' },
    { word: 'HORSE', definition: 'A large domesticated mammal with hooves and a flowing mane.', example: 'The wild horse galloped freely across the plains.' },
    { word: 'ZEBRA', definition: 'An African wild horse with black-and-white stripes.', example: 'A herd of zebras gathered near the waterhole.' },
    { word: 'PANDA', definition: 'A large black-and-white bear native to bamboo forests.', example: 'The giant panda munched on fresh bamboo shoots.' },
    { word: 'GIRAFFE', definition: 'The tallest living terrestrial animal with a long neck.', example: 'The giraffe easily reached tender leaves at the treetop.' },
    { word: 'ELEPHANT', definition: 'A very large mammal with a flexible trunk and ivory tusks.', example: 'The elephant sprayed refreshing water with its trunk.' },
    { word: 'DOLPHIN', definition: 'An intelligent marine mammal known for playful acrobatics.', example: 'A pod of dolphins leaped gracefully beside the boat.' },
    { word: 'KANGAROO', definition: 'An Australian marsupial that hops on strong hind legs.', example: 'The kangaroo carried its joey in its pouch.' },
    { word: 'CHEETAH', definition: 'The fastest land animal on Earth.', example: 'The cheetah sprinted across the grassland.' },
    { word: 'PENGUIN', definition: 'A flightless aquatic bird living in cool ocean waters.', example: 'The emperor penguin waddled across the ice.' },
    { word: 'CHAMELEON', definition: 'A specialized lizard able to shift its skin colors.', example: 'The chameleon blended seamlessly into foliage.' },
    { word: 'FLAMINGO', definition: 'A tall wading bird with distinctive pink plumage.', example: 'The flamingo stood gracefully on a single slender leg.' },
    { word: 'RABBIT', definition: 'A small mammal with long ears that hops swiftly.', example: 'The rabbit nibbled fresh clover in the garden.' },
    { word: 'MONKEY', definition: 'A nimble tree-dwelling primate with a long tail.', example: 'The curious monkey swung from branch to branch.' },
    { word: 'CAMEL', definition: 'A desert mammal adapted to travel across hot sands.', example: 'The camel walked steadily across the golden dunes.' },
    { word: 'OTTER', definition: 'A playful semi-aquatic mammal living by clean rivers.', example: 'The otter floated on its back in the river.' },
    { word: 'BADGER', definition: 'A burrowing animal with distinctive black and white head stripes.', example: 'The badger dug a cozy den beneath tree roots.' },
    { word: 'BEAVER', definition: 'A semi-aquatic mammal known for building dams in rivers.', example: 'The beaver swam across the pond with a small log.' },
    { word: 'KOALA', definition: 'An Australian marsupial that rests in eucalyptus branches.', example: 'The sleepy koala hugged the branch securely.' },
    { word: 'JAGUAR', definition: 'A powerful spotted feline native to tropical forests.', example: 'The jaguar rested silently near the jungle river.' },
    { word: 'LEOPARD', definition: 'A graceful big cat known for climbing high trees.', example: 'The leopard perched calmly upon a high branch.' },
    { word: 'WALRUS', definition: 'A large Arctic marine mammal with prominent long tusks.', example: 'The walrus rested on the floating sheet of ice.' },
    { word: 'MOOSE', definition: 'A large forest deer with broad flat palmate antlers.', example: 'The majestic moose stood quietly in the marshland.' }
  ],

  BIRDS: [
    { word: 'EAGLE', definition: 'A large bird of prey with keen eyesight and broad wings.', example: 'The eagle soared high above the rugged mountain peaks.' },
    { word: 'HAWK', definition: 'A diurnal bird of prey with sharp curved talons.', example: 'The hawk circled patiently in the morning sky.' },
    { word: 'FALCON', definition: 'A fast-flying bird of prey with pointed wings.', example: 'The falcon dived with astonishing precision.' },
    { word: 'ROBIN', definition: 'A friendly songbird with a cheerful reddish breast.', example: 'The robin chirped merrily on the garden fence.' },
    { word: 'SWAN', definition: 'A graceful waterbird with a long curving neck and white plumage.', example: 'A white swan glided peacefully across the lake.' },
    { word: 'DUCK', definition: 'A swimming waterbird with a broad bill and webbed feet.', example: 'The mother duck led her ducklings along the pond.' },
    { word: 'GOOSE', definition: 'A large waterbird that flies in V-shaped flocks.', example: 'A flock of geese flew south for the autumn.' },
    { word: 'PARROT', definition: 'A colorful bird known for intelligence and mimicking sounds.', example: 'The vibrant parrot whistled cheerful tunes.' },
    { word: 'OWL', definition: 'A nocturnal bird of prey with large forward-facing eyes.', example: 'The wise owl watched quietly from the oak tree.' },
    { word: 'CRANE', definition: 'A tall wading bird with long slender legs and bill.', example: 'A pair of cranes danced gracefully by the wetland.' },
    { word: 'HERON', definition: 'A long-legged freshwater bird that hunts fish patiently.', example: 'The patient heron stood motionless in the shallow water.' },
    { word: 'DOVE', definition: 'A gentle bird recognized worldwide as a symbol of peace.', example: 'The white dove fluttered gently onto the garden roof.' },
    { word: 'SPARROW', definition: 'A small brown-and-grey songbird found everywhere.', example: 'A friendly sparrow pecked seeds on the stone pathway.' },
    { word: 'PEACOCK', definition: 'A male peafowl celebrated for its radiant iridescent tail.', example: 'The proud peacock displayed its iridescent feathers.' },
    { word: 'SEAGULL', definition: 'A coastal seabird that glides along shoreline winds.', example: 'The seagull called out while soaring over the waves.' },
    { word: 'PELICAN', definition: 'A coastal bird with a large throat pouch for scooping fish.', example: 'The pelican scooped fish from the crest of the wave.' },
    { word: 'CANARY', definition: 'A small bright yellow songbird with sweet melody.', example: 'The canary sang a delightful morning song.' },
    { word: 'RAVEN', definition: 'A large glossy black bird renowned for clever intelligence.', example: 'The raven perched on the high rocky ledge.' },
    { word: 'CROW', definition: 'A common black bird famous for clever problem-solving.', example: 'The crow observed the field from a wooden post.' },
    { word: 'FINCH', definition: 'A small seed-eating bird with a stout conical bill.', example: 'A colorful finch landed on the flower feeder.' }
  ],

  OCEAN: [
    { word: 'FISH', definition: 'A limbless cold-blooded vertebrate living in water.', example: 'Colorful fish darted through the coral reef.' },
    { word: 'CRAB', definition: 'A crustacean with a broad shell and stalked eyes.', example: 'The crab scuttled sideways across the sandy shore.' },
    { word: 'WHALE', definition: 'A massive warm-blooded marine mammal.', example: 'The humpback whale breached with a dramatic splash.' },
    { word: 'SEAL', definition: 'A semi-aquatic marine mammal with sleek flippers.', example: 'The seal basked warmly on the sunny rocky outcrop.' },
    { word: 'SHARK', definition: 'A predatory marine fish with a cartilaginous skeleton.', example: 'The sleek shark glided smoothly through deep waters.' },
    { word: 'CORAL', definition: 'Marine invertebrates that build large underwater calcified reefs.', example: 'The vibrant coral provided shelter for countless creatures.' },
    { word: 'OCTOPUS', definition: 'A soft-bodied eight-limbed mollusc renowned for intelligence.', example: 'The octopus squeezed through a narrow undersea crevice.' },
    { word: 'LOBSTER', definition: 'A large marine crustacean with formidable pincers.', example: 'The lobster walked along the sea floor.' },
    { word: 'JELLYFISH', definition: 'A free-swimming marine animal with a gelatinous bell.', example: 'The translucent jellyfish floated in the gentle current.' },
    { word: 'STARFISH', definition: 'A star-shaped echinoderm that clings to sea floor surfaces.', example: 'A bright orange starfish clung to the tidal pool rock.' },
    { word: 'TURTLE', definition: 'A marine reptile with a protective shell and flippers.', example: 'The sea turtle traveled thousands of miles across open ocean.' },
    { word: 'SHRIMP', definition: 'A small free-swimming marine crustacean.', example: 'Tiny shrimp darted among the coastal sea grass.' },
    { word: 'CLAM', definition: 'A marine bivalve mollusk with a hinged shell.', example: 'The clam buried itself deep in the clean sand.' },
    { word: 'OYSTER', definition: 'A bivalve ocean mollusk capable of producing pearls.', example: 'The diver found a pearl inside the oyster shell.' },
    { word: 'SALMON', definition: 'A silvery fish famous for migrating upstream to spawn.', example: 'The salmon leaped up the rushing river waterfall.' },
    { word: 'TROUT', definition: 'A prized freshwater game fish with speckled skin.', example: 'The spotted trout rested in the cool mountain pool.' },
    { word: 'TUNA', definition: 'A large predatory fish capable of extraordinary swimming speed.', example: 'A school of tuna raced through the open ocean.' },
    { word: 'SQUID', definition: 'A fast-swimming cephalopod with eight arms and two tentacles.', example: 'The squid propelled itself through the dark water.' }
  ],

  NATURE: [
    { word: 'TREE', definition: 'A woody perennial plant with an elongated trunk and branches.', example: 'The ancient oak tree offered cool soothing shade.' },
    { word: 'RIVER', definition: 'A natural flowing watercourse heading toward a lake or sea.', example: 'The clear river meandered peacefully through the valley.' },
    { word: 'LAKE', definition: 'A large body of water surrounded by land.', example: 'The calm lake reflected the morning sunrise.' },
    { word: 'MOUNTAIN', definition: 'A large natural elevation of Earth rising abruptly.', example: 'Snow capped the jagged peaks of the majestic mountain.' },
    { word: 'FOREST', definition: 'A large area dominated by tall trees and dense undergrowth.', example: 'Birds sang melodic tunes inside the pine forest.' },
    { word: 'FLOWER', definition: 'The seed-bearing blossom of a plant with colorful petals.', example: 'Wildflowers bloomed across the sunlit hillside.' },
    { word: 'VALLEY', definition: 'A low fertile area between hills or mountains.', example: 'A lush green valley stretched as far as the eye could see.' },
    { word: 'DESERT', definition: 'A dry landscape where little rain occurs and sand dunes shift.', example: 'Warm breezes rippled the vast desert sands.' },
    { word: 'MEADOW', definition: 'A peaceful grassy field dotted with wildflowers.', example: 'Butterflies fluttered over the grassy meadow.' },
    { word: 'STREAM', definition: 'A small, narrow river of clear running water.', example: 'The babbling stream cooled the summer morning.' },
    { word: 'CANYON', definition: 'A deep ravine carved out by a natural river.', example: 'The canyon glowed red in the setting sun.' },
    { word: 'CLIFF', definition: 'A steep, high rock face overlooking land or sea.', example: 'Waves crashed gently against the rocky cliff.' },
    { word: 'CAVE', definition: 'A natural subterranean hollow chamber in rock.', example: 'The explorers discovered crystal formations in the cave.' },
    { word: 'VOLCANO', definition: 'A mountain with a crater through which lava erupts.', example: 'Steam rose gently from the dormant volcano.' },
    { word: 'GLACIER', definition: 'A massive slow-moving river of ancient ice.', example: 'The blue glacier descended toward the fjord.' },
    { word: 'JUNGLE', definition: 'A dense tropical forest teeming with wildlife.', example: 'Vibrant birds flew through the dense green jungle.' },
    { word: 'ISLAND', definition: 'A piece of land entirely bordered by water.', example: 'The tropical island featured white sandy shores.' },
    { word: 'BEACH', definition: 'A sandy or pebbly shore beside the ocean.', example: 'We walked along the warm beach at low tide.' },
    { word: 'REEF', definition: 'A ridge of jagged rock or coral near the water surface.', example: 'The coral reef teemed with colorful marine life.' },
    { word: 'SHORE', definition: 'The land along the edge of a sea, lake, or river.', example: 'Gentle waves lapped against the peaceful shore.' },
    { word: 'GROVE', definition: 'A small wood or orchard of graceful trees.', example: 'An olive grove grew upon the sunny hillside.' },
    { word: 'LEAF', definition: 'A flattened green outgrowth from a plant stem.', example: 'A golden autumn leaf drifted down from the tree.' },
    { word: 'BRANCH', definition: 'A woody arm extending from the tree trunk.', example: 'A songbird sat happily on the sturdy branch.' },
    { word: 'ROOT', definition: 'The underground anchor part of a plant that absorbs water.', example: 'The deep roots drew nourishment from rich soil.' },
    { word: 'SEED', definition: 'The unit of reproduction of a flowering plant.', example: 'The tiny seed sprouted into a healthy green plant.' },
    { word: 'STONE', definition: 'A small piece of hard mineral rock.', example: 'He skipped a smooth stone across the lake surface.' },
    { word: 'ROCK', definition: 'The solid mineral material forming Earth crust.', example: 'We sat upon the warm rock to watch the sunset.' },
    { word: 'GRASS', definition: 'Green vegetation consisting of short blades.', example: 'Dewdrops sparkled on the morning lawn grass.' },
    { word: 'MOSS', definition: 'A tiny green plant growing in velvet cushions.', example: 'Soft green moss coated the forest boulders.' }
  ],

  WEATHER: [
    { word: 'RAIN', definition: 'Liquid precipitation falling from clouds.', example: 'Gentle spring rain nourished the flower gardens.' },
    { word: 'SNOW', definition: 'Atmospheric water vapor frozen into light ice flakes.', example: 'Fresh white snow blanketed the mountain village.' },
    { word: 'WIND', definition: 'The natural perceptible flow of moving air.', example: 'A refreshing breeze spun the colorful pinwheel.' },
    { word: 'STORM', definition: 'A violent atmospheric disturbance with wind and rain.', example: 'The summer storm cooled the warm afternoon.' },
    { word: 'CLOUD', definition: 'A visible mass of condensed water vapor in the sky.', example: 'Fluffy white clouds drifted across the blue sky.' },
    { word: 'FOG', definition: 'A thick cloud of water droplets near the ground.', example: 'Morning fog rolled quietly through the valley.' },
    { word: 'HAIL', definition: 'Pellets of frozen rain falling in showers.', example: 'Hail tapped rhythmically against the windowpane.' },
    { word: 'FROST', definition: 'A deposit of delicate ice crystals on cold surfaces.', example: 'Delicate white frost coated the winter leaves.' },
    { word: 'BREEZE', definition: 'A light, gentle, and refreshing wind.', example: 'A gentle coastal breeze rustled the palm trees.' },
    { word: 'SUNSHINE', definition: 'The direct warmth and radiant light of the sun.', example: 'Bright sunshine illuminated the breakfast table.' },
    { word: 'THUNDER', definition: 'A loud rumbling noise heard after lightning strikes.', example: 'Distant thunder rumbled across the summer sky.' },
    { word: 'LIGHTNING', definition: 'A sudden bright electrical flash in the clouds.', example: 'Lightning lit up the distant evening horizon.' },
    { word: 'SHADOW', definition: 'A dark area produced by a body blocking light.', example: 'The tall oak tree cast a comforting long shadow.' },
    { word: 'DRIZZLE', definition: 'Light rain falling in very fine droplets.', example: 'A peaceful drizzle fell softly onto the garden.' },
    { word: 'MIST', definition: 'A cloud of tiny water droplets suspended in the air.', example: 'The morning mist hovered over the mountain lake.' }
  ],

  FOOD: [
    { word: 'BREAD', definition: 'A staple baked food made of flour and water.', example: 'The aroma of warm bread filled the kitchen.' },
    { word: 'CHEESE', definition: 'A delicious food made from pressed milk curds.', example: 'Mild cheddar cheese topped the warm toast.' },
    { word: 'PIZZA', definition: 'A baked flatbread topped with cheese and tomato sauce.', example: 'We shared a hot oven-baked pizza for dinner.' },
    { word: 'PASTA', definition: 'Dough extruded into shapes and cooked in boiling water.', example: 'She tossed fresh pasta with homemade basil sauce.' },
    { word: 'SALAD', definition: 'A cold dish of crisp vegetables and fresh greens.', example: 'A fresh garden salad was served with olive oil.' },
    { word: 'SOUP', definition: 'A nutritious liquid dish cooked with fresh vegetables.', example: 'A bowl of warm vegetable soup was delicious.' },
    { word: 'BURGER', definition: 'A savory cooked patty served in a sliced bread bun.', example: 'He enjoyed a wholesome veggie burger with fries.' },
    { word: 'RICE', definition: 'The grains of a cereal plant widely eaten as staple food.', example: 'Fluffy steamed jasmine rice accompanied the meal.' },
    { word: 'HONEY', definition: 'A sweet golden liquid made by bees from flower nectar.', example: 'She drizzled sweet honey over her warm porridge.' },
    { word: 'BUTTER', definition: 'A rich dairy food made by churning fresh cream.', example: 'He spread creamy butter onto the warm hot roll.' },
    { word: 'CREAM', definition: 'The rich fatty portion of milk that rises to the top.', example: 'Whipped cream topped the fresh strawberries.' },
    { word: 'SAUCE', definition: 'A thick savory liquid served with food to add flavor.', example: 'The savory tomato sauce simmered on the stove.' },
    { word: 'PANCAKE', definition: 'A flat cake of thin batter fried on a hot griddle.', example: 'Stacking warm pancakes with maple syrup is a treat.' },
    { word: 'WAFFLE', definition: 'A crisp batter cake cooked in a patterned iron.', example: 'Golden waffles were served with fresh blueberries.' },
    { word: 'TOAST', definition: 'Sliced bread browned and crisped by heating.', example: 'Crispy warm toast with berry jam for breakfast.' },
    { word: 'SANDWICH', definition: 'Two slices of bread with filling between them.', example: 'A hearty picnic sandwich packed with vegetables.' },
    { word: 'NOODLE', definition: 'A strip of pasta dough cooked in boiling broth.', example: 'A steaming bowl of homemade vegetable noodles.' },
    { word: 'PIE', definition: 'A baked dish with pastry crust and sweet fruit filling.', example: 'Fresh baked apple pie cooled on the windowsill.' },
    { word: 'CAKE', definition: 'A sweet baked dessert made of flour, eggs, and sugar.', example: 'We celebrated with a festive chocolate cake.' },
    { word: 'COOKIE', definition: 'A small sweet baked biscuit treat.', example: 'Crisp oatmeal cookies baked to golden perfection.' },
    { word: 'MUFFIN', definition: 'A small domed spongy baked quick bread.', example: 'A warm blueberry muffin fresh from the oven.' },
    { word: 'BAGEL', definition: 'A dense ring-shaped bread roll boiled then baked.', example: 'A toasted sesame bagel spread with cream cheese.' }
  ],

  FRUITS: [
    { word: 'APPLE', definition: 'A round fruit with crisp flesh and red or green skin.', example: 'A crisp sweet apple was her afternoon snack.' },
    { word: 'BANANA', definition: 'A curved yellow tropical fruit with sweet flesh.', example: 'Ripe yellow bananas are rich in potassium.' },
    { word: 'ORANGE', definition: 'A round citrus fruit known for sweet nutritious juice.', example: 'Fresh orange juice is full of natural vitamin C.' },
    { word: 'GRAPE', definition: 'A small sweet berry growing in clusters on vines.', example: 'Juicy purple grapes fresh from the vineyard.' },
    { word: 'MANGO', definition: 'A tropical stone fruit with sweet orange pulp.', example: 'The ripe mango tasted sweet and aromatic.' },
    { word: 'PEACH', definition: 'A juicy fruit with velvety skin and sweet yellow flesh.', example: 'A fragrant summer peach fresh from the orchard.' },
    { word: 'CHERRY', definition: 'A small round red stone fruit.', example: 'Bright red cherries sat atop the dessert.' },
    { word: 'LEMON', definition: 'A yellow citrus fruit with tart acidic juice.', example: 'A slice of fresh lemon flavored the cold water.' },
    { word: 'BERRY', definition: 'A small juicy fleshy fruit without a stone.', example: 'Wild berries ripened along the forest path.' },
    { word: 'PAPAYA', definition: 'A tropical fruit with orange flesh and sweet flavor.', example: 'Sweet papaya sliced for a breakfast fruit bowl.' },
    { word: 'PLUM', definition: 'A juicy stone fruit with smooth purple or red skin.', example: 'A sweet ripe plum plucked from the tree branch.' },
    { word: 'PEAR', definition: 'A sweet juicy fruit tapering toward the stem.', example: 'A sweet green pear soft and ready to eat.' },
    { word: 'MELON', definition: 'A large sweet fruit with thick rind and juicy flesh.', example: 'Chilled sweet melon slices on a warm day.' },
    { word: 'LIME', definition: 'A small green citrus fruit with zesty flavor.', example: 'Fresh lime added zest to the cold drink.' },
    { word: 'FIG', definition: 'A soft sweet Mediterranean fruit with small seeds.', example: 'Sweet fresh figs harvested in the late summer.' },
    { word: 'KIWI', definition: 'A small fruit with fuzzy brown skin and green pulp.', example: 'Slices of bright kiwi garnished the fruit salad.' },
    { word: 'APRICOT', definition: 'A small golden stone fruit resembling a peach.', example: 'Sun-ripened apricots smelled wonderfully sweet.' }
  ],

  VEGETABLES: [
    { word: 'CARROT', definition: 'A tapering orange root vegetable rich in nutrients.', example: 'Crunchy sweet carrots picked fresh from the garden.' },
    { word: 'POTATO', definition: 'A starchy edible tuber vegetable.', example: 'Baked potatoes served with fresh garden herbs.' },
    { word: 'TOMATO', definition: 'A glossy red fruit commonly eaten as a vegetable.', example: 'Ripe red tomatoes sliced for the sandwich.' },
    { word: 'ONION', definition: 'A layered bulb vegetable with pungent flavor.', example: 'Caramelized sweet onions topped the savory dish.' },
    { word: 'GARLIC', definition: 'A strong-smelling pungent bulb used in cooking.', example: 'A clove of crushed garlic infused the olive oil.' },
    { word: 'SPINACH', definition: 'An edible dark green leafy vegetable plant.', example: 'Fresh tender spinach tossed into the salad.' },
    { word: 'PEPPER', definition: 'A hollow sweet or spicy vegetable pod.', example: 'Colorful bell peppers roasted over open flame.' },
    { word: 'GINGER', definition: 'A hot fragrant aromatic root spice.', example: 'Fresh grated ginger brewed into warming tea.' },
    { word: 'CORN', definition: 'Golden grain kernels growing on a large cob.', example: 'Sweet roasted corn brushed with melted butter.' },
    { word: 'PEAS', definition: 'Small spherical green seeds growing in pods.', example: 'Sweet green peas popped from their fresh pods.' },
    { word: 'BEANS', definition: 'Edible seeds or pods of climbing garden plants.', example: 'Steamed green beans seasoned with sea salt.' },
    { word: 'RADISH', definition: 'A crisp pungent small edible root vegetable.', example: 'Thinly sliced red radishes added fresh crunch.' },
    { word: 'PUMPKIN', definition: 'A large round orange winter squash.', example: 'A bright orange pumpkin sat on the autumn porch.' },
    { word: 'CUCUMBER', definition: 'A long green vegetable with watery crisp flesh.', example: 'Cool cucumber slices served in the summer salad.' },
    { word: 'LETTUCE', definition: 'A leafy green plant forming the basis of salads.', example: 'Crisp green lettuce leaves washed for lunch.' },
    { word: 'BROCCOLI', definition: 'A green vegetable with dense flowering heads.', example: 'Steamed broccoli florets are rich in vitamins.' },
    { word: 'CABBAGE', definition: 'A vegetable with thick green or purple leaves in a head.', example: 'Crisp shredded cabbage dressed for coleslaw.' }
  ],

  HOUSE: [
    { word: 'DOOR', definition: 'A movable barrier securing an entrance to a room.', example: 'The wooden front door swung open welcoming guests.' },
    { word: 'WINDOW', definition: 'An opening in a wall fitted with glass.', example: 'Sunlight poured warmly through the bedroom window.' },
    { word: 'ROOF', definition: 'The protective upper covering of a building.', example: 'Rain pattered softly on the sloping roof.' },
    { word: 'WALL', definition: 'A continuous upright brick or stone structure.', example: 'Framed pictures hung neatly upon the living room wall.' },
    { word: 'FLOOR', definition: 'The lower surface of a room on which one walks.', example: 'Polished wooden floors gleamed in the sunlight.' },
    { word: 'ROOM', definition: 'An enclosed space partitioned within a building.', example: 'The reading room was quiet and peaceful.' },
    { word: 'TABLE', definition: 'A piece of furniture with a flat top and sturdy legs.', example: 'The family gathered around the wooden dining table.' },
    { word: 'CHAIR', definition: 'A separate seat for one person with a back rest.', example: 'A comfortable armchair sat beside the bookshelf.' },
    { word: 'DESK', definition: 'A piece of furniture with a flat surface for study.', example: 'A tidy study desk with books and study lamp.' },
    { word: 'LAMP', definition: 'A device for giving artificial light.', example: 'The desk lamp cast a warm cozy pool of light.' },
    { word: 'BED', definition: 'A piece of furniture used for sleeping and resting.', example: 'A warm bed with soft fluffy blankets.' },
    { word: 'CLOCK', definition: 'An instrument used to measure and display time.', example: 'The grandfather clock ticked steadily in the hall.' },
    { word: 'MIRROR', definition: 'A reflective surface showing a clear visual image.', example: 'The antique mirror hung gracefully in the foyer.' },
    { word: 'CARPET', definition: 'A floor covering made of thick woven fabric.', example: 'A soft woolen carpet warmed the wooden floor.' },
    { word: 'SOFA', definition: 'A comfortable upholstered long seat with back.', example: 'The living room sofa was soft and relaxing.' },
    { word: 'STAIRS', definition: 'A set of steps leading from one floor to another.', example: 'The wooden stairs led gently up to the attic.' },
    { word: 'BLANKET', definition: 'A large piece of woolen fabric used for warmth.', example: 'A cozy knitted blanket kept the evening warm.' },
    { word: 'PILLOW', definition: 'A cushion used to support the head when sleeping.', example: 'He rested his head on the soft feather pillow.' },
    { word: 'CURTAIN', definition: 'A piece of hanging cloth used to cover a window.', example: 'She drew open the curtains to greet the morning.' },
    { word: 'CLOSET', definition: 'A cupboard or small room for storing clothes.', example: 'Winter coats hung neatly inside the cedar closet.' },
    { word: 'SHELF', definition: 'A flat horizontal board used for holding books.', example: 'Books stood upright along the wooden shelf.' },
    { word: 'GATE', definition: 'A hinged barrier used to close an opening in a fence.', example: 'The white garden gate clicked shut gently.' }
  ],

  KITCHEN: [
    { word: 'SPOON', definition: 'An eating utensil with a small shallow oval bowl.', example: 'She stirred the honey with a silver spoon.' },
    { word: 'FORK', definition: 'An eating utensil with prongs for picking up food.', example: 'He set the fork neatly beside the napkin.' },
    { word: 'KNIFE', definition: 'An instrument with a sharp blade for cutting food.', example: 'A sharp chef knife sliced the fresh vegetables.' },
    { word: 'PLATE', definition: 'A flat shallow dish from which food is eaten.', example: 'A ceramic dinner plate placed upon the table.' },
    { word: 'BOWL', definition: 'A round hollow container used for soup or cereal.', example: 'A deep porcelain bowl filled with warm soup.' },
    { word: 'CUP', definition: 'A small bowl-shaped container for hot beverages.', example: 'A steaming cup of herbal tea in the afternoon.' },
    { word: 'GLASS', definition: 'A drinking container made of transparent glass.', example: 'A tall glass of cool sparkling water.' },
    { word: 'OVEN', definition: 'An enclosed compartment for baking and roasting.', example: 'The pie baked to golden perfection in the oven.' },
    { word: 'STOVE', definition: 'An apparatus for cooking food by heating pots.', example: 'The kettle whistled cheerily on the hot stove.' },
    { word: 'PAN', definition: 'A shallow metal container used for frying.', example: 'Vegetables sizzled in the cast iron pan.' },
    { word: 'POT', definition: 'A deep round container used for boiling food.', example: 'A large soup pot simmered quietly on low heat.' },
    { word: 'KETTLE', definition: 'A metal vessel with a spout for boiling water.', example: 'The copper kettle steamed as tea was poured.' },
    { word: 'TOASTER', definition: 'An electrical appliance for browning slices of bread.', example: 'Warm toast popped up from the toaster.' },
    { word: 'BLENDER', definition: 'An electric kitchen appliance for pureeing food.', example: 'The blender whipped fresh fruit into a smoothie.' },
    { word: 'APRON', definition: 'A protective garment worn over front of clothes.', example: 'She tied her clean kitchen apron before baking.' },
    { word: 'SUGAR', definition: 'A sweet crystalline substance obtained from cane.', example: 'A spoonful of sugar dissolved into the coffee.' },
    { word: 'FLOUR', definition: 'Powder obtained by grinding wheat grains.', example: 'White flour dusted the wooden cutting board.' },
    { word: 'SALT', definition: 'A white crystalline substance giving savory seasoning.', example: 'A pinch of sea salt brought out all the flavors.' },
    { word: 'WHISK', definition: 'A kitchen utensil used for beating eggs or cream.', example: 'He used a wire whisk to whip the eggs fluffy.' },
    { word: 'DISH', definition: 'A shallow flat-bottomed container for food.', example: 'A delicate serving dish laden with treats.' },
    { word: 'MUG', definition: 'A large cup with a handle used for hot beverages.', example: 'A ceramic mug of rich hot cocoa.' },
    { word: 'TRAY', definition: 'A flat shallow container with raised rim for carrying.', example: 'Tea and biscuits were carried on a wooden tray.' }
  ],

  CLOTHING: [
    { word: 'SHIRT', definition: 'A garment for the upper body with collar and sleeves.', example: 'He wore a crisp white cotton shirt.' },
    { word: 'PANTS', definition: 'An outer garment covering the body from waist down.', example: 'Comfortable denim pants for weekend walks.' },
    { word: 'DRESS', definition: 'A one-piece garment for women and girls.', example: 'A colorful summer dress fluttering in the breeze.' },
    { word: 'JACKET', definition: 'A short coat with sleeves and front fastening.', example: 'He zipped up his warm fleece jacket.' },
    { word: 'COAT', definition: 'An outer garment with sleeves worn outdoors for warmth.', example: 'A heavy wool coat shielded against the winter cold.' },
    { word: 'HAT', definition: 'A shaped covering for the head with protective brim.', example: 'A wide sun hat protected her eyes from glare.' },
    { word: 'SHOE', definition: 'A fitted outer covering for the human foot.', example: 'Comfortable walking shoes laced for the hike.' },
    { word: 'BOOT', definition: 'A sturdy shoe covering the foot and ankle.', example: 'Waterproof leather boots kept his feet dry.' },
    { word: 'SOCK', definition: 'A knitted garment worn on the foot inside shoes.', example: 'Warm woolen socks on a chilly winter evening.' },
    { word: 'GLOVE', definition: 'A covering for the hand with separate fingers.', example: 'Leather gloves kept her hands warm in the snow.' },
    { word: 'SCARF', definition: 'A strip of fabric worn around the neck for warmth.', example: 'A cozy knitted scarf wrapped around his neck.' },
    { word: 'BELT', definition: 'A strip of leather worn around the waist.', example: 'A sturdy leather belt with a brass buckle.' },
    { word: 'SUIT', definition: 'A set of clothes made of the same fabric.', example: 'A tailored formal suit worn for the ceremony.' },
    { word: 'CAP', definition: 'A close-fitting hat often with a front visor.', example: 'A baseball cap shaded his eyes at the game.' },
    { word: 'TIE', definition: 'A strip of cloth tied around the neck under collar.', example: 'A silk tie neatly knotting the formal shirt.' },
    { word: 'PURSE', definition: 'A small bag used for carrying personal items.', example: 'A small shoulder purse holding keys and wallet.' },
    { word: 'VEST', definition: 'A sleeveless garment worn over a shirt.', example: 'A warm quilted vest worn on autumn mornings.' },
    { word: 'SKIRT', definition: 'A garment fastened around the waist hanging down.', example: 'A pleated wool skirt swinging gently as she walked.' },
    { word: 'ROBE', definition: 'A loose flowing garment worn before dressing.', example: 'A soft terrycloth robe after a warm bath.' },
    { word: 'CLOAK', definition: 'A sleeveless outdoor overgarment hanging loose.', example: 'A warm traveling cloak against the mountain wind.' }
  ],

  TRAVEL: [
    { word: 'TRAIN', definition: 'A series of railway carriages moved by an engine.', example: 'The high-speed train sped smoothly across the country.' },
    { word: 'SHIP', definition: 'A large ocean-going sea vessel.', example: 'The stately ship sailed into the calm harbor.' },
    { word: 'BOAT', definition: 'A small vessel for travelling on water.', example: 'A wooden row boat bobbed beside the dock.' },
    { word: 'PLANE', definition: 'A powered flying vehicle with fixed wings.', example: 'The silver passenger plane soared above the clouds.' },
    { word: 'BICYCLE', definition: 'A two-wheeled vehicle steered with handlebars.', example: 'He pedaled his bicycle along the scenic path.' },
    { word: 'CANOE', definition: 'A narrow light boat pointed at both ends.', example: 'They paddled the wooden canoe along the calm river.' },
    { word: 'TRUCK', definition: 'A large motor vehicle for transporting goods.', example: 'The delivery truck arrived early in the morning.' },
    { word: 'TICKET', definition: 'A printed pass giving the holder right to travel.', example: 'She held her boarding ticket ready at the gate.' },
    { word: 'JOURNEY', definition: 'An act of travelling from one place to another.', example: 'Their exciting journey took them across continents.' },
    { word: 'TRAVEL', definition: 'To make a journey across different regions.', example: 'They loved to travel and explore new cultures.' },
    { word: 'VOYAGE', definition: 'A long journey involving travel by sea or in space.', example: 'The historic voyage across the uncharted ocean.' },
    { word: 'HARBOR', definition: 'A sheltered port where ships can moor safely.', example: 'Fishing boats rested safely inside the harbor.' },
    { word: 'STATION', definition: 'A stopping place on a railway line where passengers board.', example: 'Commuters gathered on the platform at the station.' },
    { word: 'BRIDGE', definition: 'A structure carrying a pathway over river or valley.', example: 'The stone bridge crossed over the rushing river.' },
    { word: 'TUNNEL', definition: 'An underground passage dug through a mountain.', example: 'The railway tunnel passed directly under the hill.' },
    { word: 'ANCHOR', definition: 'A heavy metal device cast into sea to moor a vessel.', example: 'The crew dropped anchor in the peaceful bay.' },
    { word: 'SAIL', definition: 'A piece of fabric spread to catch the wind.', example: 'White canvas sails billowed in the fresh sea wind.' },
    { word: 'COMPASS', definition: 'An instrument with magnetic needle showing north.', example: 'The hiking compass pointed true to the north.' },
    { word: 'MAP', definition: 'A visual diagrammatic representation of an area.', example: 'They unfolded the paper trail map on the table.' },
    { word: 'TRAIL', definition: 'A marked pathway through woodland or mountains.', example: 'A shaded nature trail wound up the hillside.' }
  ],

  MUSIC: [
    { word: 'SONG', definition: 'A short musical composition with words and melody.', example: 'A melodic song played softly on the radio.' },
    { word: 'DRUM', definition: 'A percussion instrument struck with sticks or hands.', example: 'The rhythmic drum beat set a lively pace.' },
    { word: 'PIANO', definition: 'A keyboard instrument striking strings with hammers.', example: 'Classical melodies flowed from the grand piano.' },
    { word: 'GUITAR', definition: 'A stringed instrument played with fingers or pick.', example: 'Acoustic guitar chords resonated around the campfire.' },
    { word: 'FLUTE', definition: 'A wind instrument producing a clear sweet tone.', example: 'The silvery notes of the flute filled the hall.' },
    { word: 'VIOLIN', definition: 'A four-stringed wooden instrument played with a bow.', example: 'The violin solo was expressive and moving.' },
    { word: 'HARP', definition: 'A musical instrument with strings plucked by fingers.', example: 'Gentle harp music drifted through the garden.' },
    { word: 'TRUMPET', definition: 'A brass musical instrument with a bright piercing tone.', example: 'The trumpet sounded the triumphant fanfare.' },
    { word: 'HORN', definition: 'A brass instrument with coiled tube and flared bell.', example: 'The warm tone of the French horn filled the hall.' },
    { word: 'CHORD', definition: 'A group of musical notes played together.', example: 'He strummed a rich major chord on the strings.' },
    { word: 'RHYTHM', definition: 'A strong regular repeated pattern of sound.', example: 'The catchy dance rhythm kept everyone swaying.' },
    { word: 'BEAT', definition: 'The main rhythmic unit in music or poetry.', example: 'Tap your feet to the steady acoustic beat.' },
    { word: 'MELODY', definition: 'A sequence of musical notes that is satisfying.', example: 'A hauntingly beautiful melody lingered in memory.' },
    { word: 'TUNE', definition: 'A melody or piece of music easily hummed.', example: 'He whistled a cheerful tune on his walk home.' },
    { word: 'BELL', definition: 'A hollow metal cup that sounds a musical tone.', example: 'Church bells rang out across the green valley.' },
    { word: 'CHIME', definition: 'A bell or metal bar producing a musical ringing sound.', example: 'Wind chimes sang gently on the sunny porch.' }
  ],

  SPORTS: [
    { word: 'BALL', definition: 'A spherical object used in games and sports.', example: 'He kicked the ball toward the open goal.' },
    { word: 'GOAL', definition: 'The target posts or net into which the ball is put.', example: 'The striker scored a goal in the final minute.' },
    { word: 'SWIM', definition: 'To propel the body through water with arms and legs.', example: 'She trained every morning to swim laps.' },
    { word: 'RUN', definition: 'To move at a speed faster than walking.', example: 'The runners started briskly from the line.' },
    { word: 'TENNIS', definition: 'A racket sport played over a net on a court.', example: 'A lively tennis match on the grass court.' },
    { word: 'SOCCER', definition: 'A game played by two teams of eleven with round ball.', example: 'Children played soccer in the neighborhood park.' },
    { word: 'TRACK', definition: 'A prepared course or path for running races.', example: 'Athletes warmed up along the red running track.' },
    { word: 'RACE', definition: 'A competition between runners or vehicles for speed.', example: 'He crossed the finish line to win the race.' },
    { word: 'JUMP', definition: 'To push oneself off a surface into the air.', example: 'The high jumper cleared the bar with ease.' },
    { word: 'SKATE', definition: 'To glide across ice or pavement on blades or wheels.', example: 'They loved to skate on the frozen winter pond.' },
    { word: 'SURF', definition: 'To ride a wave toward shore standing on a board.', example: 'He caught a magnificent ocean wave to surf.' },
    { word: 'CLIMB', definition: 'To ascend a steep rock face or mountain.', example: 'Experienced hikers loved to climb the granite peak.' },
    { word: 'MATCH', definition: 'A contest in which people or teams compete.', example: 'A friendly championship match between schools.' },
    { word: 'SCORE', definition: 'The number of points or goals achieved in a game.', example: 'The final game score was tied at the buzzer.' },
    { word: 'TEAM', definition: 'A group of players forming one side in a game.', example: 'The team worked together to achieve victory.' },
    { word: 'TROPHY', definition: 'A cup or decorative object awarded as prize for victory.', example: 'The proud champions lifted the golden trophy.' }
  ],

  SPACE: [
    { word: 'SUN', definition: 'The radiant star around which planet Earth orbits.', example: 'Warm sun rays warmed the peaceful morning earth.' },
    { word: 'MOON', definition: 'The natural satellite orbiting our planet Earth.', example: 'The luminous full moon shone over the ocean.' },
    { word: 'STAR', definition: 'A luminous celestial sphere of glowing plasma.', example: 'A brilliant star guided ancient sailors at night.' },
    { word: 'ORBIT', definition: 'The curved path of a celestial body around a star.', example: 'The satellite completed its orbit around Earth.' },
    { word: 'COMET', definition: 'An icy celestial body that displays a glowing tail.', example: 'The comet streaked across the midnight heavens.' },
    { word: 'PLANET', definition: 'A large celestial body in orbit around a star.', example: 'Earth is our beautiful blue planet in space.' },
    { word: 'ROCKET', definition: 'A vehicle propelled into space by rocket engines.', example: 'The space rocket lifted off toward the station.' },
    { word: 'GALAXY', definition: 'A massive system of billions of stars and planets.', example: 'The spiral galaxy spans thousands of light years.' },
    { word: 'NEBULA', definition: 'An interstellar cloud of glowing gas and cosmic dust.', example: 'Stars are born inside the colorful nebula.' },
    { word: 'METEOR', definition: 'A streak of light produced by space rock entering air.', example: 'We made a wish upon a falling meteor.' },
    { word: 'ECLIPSE', definition: 'An obscuring of the light from one celestial body.', example: 'The solar eclipse cast a twilight over the land.' },
    { word: 'COSMOS', definition: 'The universe seen as a well-ordered whole.', example: 'Astronomers gaze out into the boundless cosmos.' },
    { word: 'CRATER', definition: 'A large bowl-shaped cavity on a planet surface.', example: 'The lunar surface is marked with ancient craters.' },
    { word: 'AURORA', definition: 'A natural light display in the northern or southern sky.', example: 'The emerald aurora danced in the Arctic sky.' },
    { word: 'ASTEROID', definition: 'A small rocky body orbiting the sun in space.', example: 'Telescopes tracked the trajectory of the asteroid.' },
    { word: 'SATELLITE', definition: 'An artificial body placed in orbit around earth.', example: 'Communication satellites orbit thousands of miles up.' }
  ],

  COLORS_SHAPES: [
    { word: 'CIRCLE', definition: 'A round plane figure whose boundary is equidistant.', example: 'Children held hands to form a circle.' },
    { word: 'SQUARE', definition: 'A plane figure with four equal sides and right angles.', example: 'A square wooden chessboard on the table.' },
    { word: 'TRIANGLE', definition: 'A plane figure with three straight sides and angles.', example: 'The roof had a neat triangular shape.' },
    { word: 'DIAMOND', definition: 'A figure with four equal sides shaped like rhombus.', example: 'The kite fluttered like a diamond in the sky.' },
    { word: 'OVAL', definition: 'Having a rounded and slightly elongated outline.', example: 'The dining table had an elegant oval shape.' },
    { word: 'YELLOW', definition: 'The color of lemons and bright sunshine.', example: 'A field of bright yellow sunflowers.' },
    { word: 'PURPLE', definition: 'A color intermediate between red and blue.', example: 'Fragrant purple lavender bloomed in summer.' },
    { word: 'GREEN', definition: 'The color of living grass and growing leaves.', example: 'Lush green moss carpeted the woodland floor.' },
    { word: 'BLUE', definition: 'The color of a clear cloudless sky and calm sea.', example: 'The sparkling blue ocean stretched forever.' },
    { word: 'BROWN', definition: 'The color of rich earth, wood, and tree bark.', example: 'A sturdy brown wooden bench in the park.' },
    { word: 'WHITE', definition: 'The color of pure fresh snow and clean chalk.', example: 'Fluffy white clouds drifted in the breeze.' },
    { word: 'SILVER', definition: 'A precious shiny grayish-white metallic color.', example: 'A polished silver antique pocket watch.' },
    { word: 'GOLDEN', definition: 'Having the warm radiant yellow color of gold.', example: 'Golden rays of sunlight warmed the room.' },
    { word: 'BRONZE', definition: 'A warm yellowish-brown metallic alloy color.', example: 'A handsome bronze statue stood in the plaza.' },
    { word: 'SCARLET', definition: 'A brilliant bright red color with orange tint.', example: 'A scarlet cardinal bird perched on the snowy bush.' },
    { word: 'VIOLET', definition: 'A bluish-purple color of wild violets.', example: 'Delicate wild violet flowers in the grass.' },
    { word: 'AMBER', definition: 'A warm honey-yellow translucent color.', example: 'Warm amber lantern light lit the porch.' },
    { word: 'INDIGO', definition: 'A deep rich blue color between blue and violet.', example: 'The evening sky faded into deep indigo.' }
  ],

  EMOTIONS: [
    { word: 'HAPPY', definition: 'Feeling or showing pleasure and contentment.', example: 'A happy smile brightened her entire face.' },
    { word: 'SMILE', definition: 'A pleased or amused facial expression.', example: 'A warm smile welcomed every guest.' },
    { word: 'LAUGH', definition: 'To make spontaneous sounds expressing amusement.', example: 'Children laughed joyfully at the funny story.' },
    { word: 'BRAVE', definition: 'Ready to face danger or pain with courage.', example: 'The brave firefighter helped the family.' },
    { word: 'SMART', definition: 'Having or showing quick-witted intelligence.', example: 'A smart solution to a puzzling riddle.' },
    { word: 'KIND', definition: 'Having a friendly, generous, and considerate nature.', example: 'A kind word can brighten someone day.' },
    { word: 'CALM', definition: 'Not showing or feeling nervousness or agitation.', example: 'She remained calm and thoughtful throughout.' },
    { word: 'PEACE', definition: 'A state of tranquility and freedom from disturbance.', example: 'Peace and quiet settled over the lake.' },
    { word: 'HOPE', definition: 'A feeling of expectation and desire for good.', example: 'Hope shone brightly in their eyes.' },
    { word: 'JOY', definition: 'A feeling of great pleasure and happiness.', example: 'Laughter and joy filled the cheerful home.' },
    { word: 'BRIGHT', definition: 'Giving out or reflecting a lot of light.', example: 'A bright sunny morning full of energy.' },
    { word: 'WARM', definition: 'Having a comfortable moderate degree of heat.', example: 'A warm cup of cider on a cool evening.' },
    { word: 'GENTLE', definition: 'Having a mild, kind, or tender temperament.', example: 'A gentle spring breeze rustled the blossoms.' },
    { word: 'PROUD', definition: 'Feeling deep satisfaction from achievements.', example: 'He was proud of his hard work in class.' },
    { word: 'POLITE', definition: 'Having or showing good manners and respect.', example: 'A polite greeting was warmly returned.' },
    { word: 'HONEST', definition: 'Free of deceit and untruthfulness; sincere.', example: 'An honest answer is always respected.' },
    { word: 'CLEVER', definition: 'Quick to understand, learn, and devise ideas.', example: 'The clever pup solved the puzzle box.' },
    { word: 'PATIENT', definition: 'Able to accept delays or problems without annoyance.', example: 'She was patient and gentle while teaching.' }
  ],

  TOOLS: [
    { word: 'HAMMER', definition: 'A tool with heavy metal head used for driving nails.', example: 'He tapped the nail securely with the hammer.' },
    { word: 'NAIL', definition: 'A small metal spike with flat head driven into wood.', example: 'A sturdy iron nail fastened the boards.' },
    { word: 'SCREW', definition: 'A metal pin with threaded ridge driven by twisting.', example: 'Turn the brass screw until it is flush.' },
    { word: 'SAW', definition: 'A hand tool for cutting wood with toothed blade.', example: 'The carpenter saw made a clean cut.' },
    { word: 'WRENCH', definition: 'A tool used for gripping and turning nuts and bolts.', example: 'He tightened the water pipe with a wrench.' },
    { word: 'PLIERS', definition: 'Pincers with parallel flat jaws used for gripping.', example: 'Pliers held the small wire firmly in place.' },
    { word: 'DRILL', definition: 'A tool with a rotating cutting tip for making holes.', example: 'The electric drill made a neat small hole.' },
    { word: 'BRUSH', definition: 'An implement with bristles used for cleaning or painting.', example: 'A soft horsehair paint brush for the canvas.' },
    { word: 'PAINT', definition: 'A colored substance spread over a surface to dry.', example: 'Fresh blue paint dried on the garden gate.' },
    { word: 'CANVAS', definition: 'A strong unbleached cloth used for oil painting.', example: 'The artist painted a landscape upon the canvas.' },
    { word: 'RULER', definition: 'A straight strip of wood or plastic used to measure.', example: 'Use a clear plastic ruler to draw straight lines.' },
    { word: 'SCISSORS', definition: 'An instrument with two hinged blades for cutting.', example: 'She snipped the craft ribbon with sharp scissors.' },
    { word: 'NEEDLE', definition: 'A very fine slender piece of metal with an eye for thread.', example: 'The silver needle threaded with bright red yarn.' },
    { word: 'THREAD', definition: 'A long thin strand of cotton used in sewing.', example: 'A spool of strong blue cotton thread.' },
    { word: 'ROPE', definition: 'A length of strong cord made by twisting strands.', example: 'The sailor tied the boat securely with rope.' },
    { word: 'LADDER', definition: 'A structure consisting of two uprights and rungs.', example: 'He climbed the wooden ladder to paint the trim.' },
    { word: 'SHOVEL', definition: 'A tool with broad scoop for moving earth or snow.', example: 'She dug the garden flower bed with a shovel.' },
    { word: 'RAKE', definition: 'A tool with toothed bar for gathering fallen leaves.', example: 'He gathered dry autumn leaves with the rake.' }
  ],

  SCHOOL: [
    { word: 'BOOK', definition: 'A set of printed pages bound together with cover.', example: 'She read an inspiring adventure story book.' },
    { word: 'PAPER', definition: 'Material manufactured in thin sheets from wood pulp.', example: 'A crisp sheet of clean white drawing paper.' },
    { word: 'PENCIL', definition: 'An instrument for writing with a graphite core.', example: 'He sharpened his yellow pencil before the quiz.' },
    { word: 'PEN', definition: 'An instrument for writing or drawing with ink.', example: 'A smooth ballpoint pen with blue ink.' },
    { word: 'ERASER', definition: 'A piece of soft rubber used to rub out pencil marks.', example: 'She rubbed out the error cleanly with the eraser.' },
    { word: 'NOTEBOOK', definition: 'A book of blank or ruled pages for writing notes.', example: 'A spiral notebook filled with science notes.' },
    { word: 'DESK', definition: 'A piece of furniture for writing and study.', example: 'Every student had a tidy wooden desk in class.' },
    { word: 'CHALK', definition: 'A soft white limestone stick used for writing.', example: 'The teacher wrote neat notes on the board with chalk.' },
    { word: 'LESSON', definition: 'A period of learning or teaching on a subject.', example: 'Today science lesson was fascinating.' },
    { word: 'PUZZLE', definition: 'A game or problem designed to test ingenuity.', example: 'Solving a word puzzle is fun and rewarding.' },
    { word: 'STORY', definition: 'An account of imaginary or real events told to entertain.', example: 'Grandfather told a wonderful bedtime story.' },
    { word: 'POEM', definition: 'A piece of writing expressing thoughts in verse.', example: 'She recited a gentle spring poem for the class.' },
    { word: 'LETTER', definition: 'A character representing one or more speech sounds.', example: 'Trace the letter carefully upon the page.' },
    { word: 'NUMBER', definition: 'An arithmetical value used for counting.', example: 'Count the puzzle blocks number by number.' },
    { word: 'LIBRARY', definition: 'A building containing collections of books for reading.', example: 'The quiet town library was full of books.' },
    { word: 'FOLDER', definition: 'A folding cover for keeping loose papers together.', example: 'He filed his artwork neatly inside the green folder.' },
    { word: 'GLUE', definition: 'An adhesive substance used for sticking things together.', example: 'A glue stick fastened the paper craft neatly.' },
    { word: 'STUDY', definition: 'The devotion of time and thought to acquiring knowledge.', example: 'They met after class to study for the review.' }
  ],

  TIME: [
    { word: 'MORNING', definition: 'The early part of the day from sunrise to noon.', example: 'Birds sang sweetly in the fresh morning air.' },
    { word: 'EVENING', definition: 'The period of time at the end of day before night.', example: 'A peaceful evening walk as the sun went down.' },
    { word: 'NIGHT', definition: 'The period of darkness between sunset and sunrise.', example: 'Stars glittered brightly in the clear night sky.' },
    { word: 'NOON', definition: 'Twelve o clock in the middle of the day; midday.', example: 'The sun stood highest in the sky at noon.' },
    { word: 'DAWN', definition: 'The first appearance of light in the sky before sunrise.', example: 'The sky blushed pink and gold at dawn.' },
    { word: 'DUSK', definition: 'The darker stage of twilight in the evening.', example: 'Streetlights flickered on at dusk.' },
    { word: 'SPRING', definition: 'The season after winter when plants begin to grow.', example: 'Fragrant blossoms welcomed the arrival of spring.' },
    { word: 'SUMMER', definition: 'The warmest season of the year between spring and autumn.', example: 'Warm summer days spent outdoors swimming.' },
    { word: 'AUTUMN', definition: 'The season between summer and winter; fall.', example: 'Golden and crimson leaves fell in autumn.' },
    { word: 'WINTER', definition: 'The coldest season of the year with snow and ice.', example: 'Snowflakes drifted down in the quiet winter.' },
    { word: 'SEASON', definition: 'Each of the four divisions of the year.', example: 'Each season brings its own special beauty.' },
    { word: 'MONTH', definition: 'Each of the twelve named periods into which year is divided.', example: 'A new calendar month begins with fresh goals.' },
    { word: 'WEEK', definition: 'A period of seven consecutive days.', example: 'They planned a fun family trip for next week.' },
    { word: 'TODAY', definition: 'On or in the course of this present day.', example: 'Today is a wonderful day to learn new words.' },
    { word: 'MINUTE', definition: 'A period of time equal to sixty seconds.', example: 'Wait just a minute while the kettle boils.' },
    { word: 'SECOND', definition: 'The basic unit of time; one sixtieth of a minute.', example: 'Every second counts in the sprint race.' },
    { word: 'HOUR', definition: 'A period of time equal to sixty minutes.', example: 'An hour spent reading a favorite book.' },
    { word: 'SUNRISE', definition: 'The time in the morning when the sun appears.', example: 'They climbed the peak to watch the golden sunrise.' },
    { word: 'SUNSET', definition: 'The time in the evening when the sun disappears.', example: 'A magnificent sunset painted the western clouds.' }
  ]
};

// Read original wordDatabase.ts to preserve non-English DBs
const originalFile = fs.readFileSync('src/data/wordDatabase.ts', 'utf8');

// Build code for WORD_DATABASE_EN
let enDbCode = 'export const WORD_DATABASE_EN: Record<string, WordEntry[]> = {\n';
for (const cat of Object.keys(enCategories)) {
  enDbCode += `  ${cat}: [\n`;
  for (const item of enCategories[cat]) {
    const diff = item.word.length <= 4 ? 'easy' : item.word.length <= 6 ? 'medium' : 'hard';
    const minLvl = item.word.length <= 4 ? 1 : item.word.length <= 6 ? 5 : 15;
    enDbCode += `    { word: '${item.word}', category: '${cat}', difficulty: '${diff}', definition: ${JSON.stringify(item.definition)}, example: ${JSON.stringify(item.example)}, minLevel: ${minLvl} },\n`;
  }
  enDbCode += `  ],\n`;
}
enDbCode += '};\n\n';

// Extract the rest of the file from "export const WORD_DATABASE_ES"
const esIndex = originalFile.indexOf('export const WORD_DATABASE_ES');
const restOfFile = originalFile.substring(esIndex);

const newContent = `export interface WordEntry {
  word: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  definition: string;
  example: string;
  minLevel: number;
}

import { LanguageCode } from '../types';

${enDbCode}${restOfFile}`;

fs.writeFileSync('src/data/wordDatabase.ts', newContent, 'utf8');

let totalWords = 0;
for (const k in enCategories) totalWords += enCategories[k].length;
console.log(`✅ Successfully updated wordDatabase.ts with ${totalWords} 100% genuine English words across ${Object.keys(enCategories).length} categories! Zero brand names, zero person names.`);
