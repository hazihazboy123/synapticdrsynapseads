#!/usr/bin/env node
/**
 * Meme & Image Validator v4 - BRAIN ROT EDITION 🧠💀
 *
 * WHAT'S NEW:
 * - Reddit video memes (r/MemeVideos, r/shitposting, r/whenthe, etc.)
 * - 2024-2025 viral meme database (not that 2018 crusty shit)
 * - Better search queries using ACTUAL meme names
 * - Categorized by emotion for medical education content
 *
 * Usage:
 *   node meme-validator-v4.js --config configs/hyperkalemia-memes.json
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ============================================
// API KEYS
// ============================================
const TENOR_API_KEY = process.env.TENOR_API_KEY || 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ';
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || 'dc6zaTOxFJmzC';

// ============================================
// ANIMATIONS
// ============================================
const ANIMATIONS = {
  entrances: ['slideDown', 'slideUp', 'slideLeft', 'slideRight', 'slam', 'spin', 'bounce', 'zoom', 'fade'],
  exits: ['fall', 'slideOut', 'shrink', 'spin', 'fade', 'zoom']
};

// ============================================
// REDDIT MEME SUBREDDITS - THE GOOD SHIT
// ============================================
const MEME_SUBREDDITS = [
  'MemeVideos',
  'shitposting',
  'whenthe',
  'okbuddyretard',
  'memes',
  'dankmemes',
  'me_irl',
  'perfectlycutscreams',
  'AbruptChaos',
  'fixedbytheduet',
  'MoldyMemes',
  'comedyheaven',
];

// ============================================
// 🔥 2024-2025 BRAIN ROT MEME DATABASE 🔥
// Organized by EMOTION for medical content
// ============================================
const BRAIN_ROT_MEMES = {

  // ===== PANIC / STRESS / OH SHIT =====
  PANIC: [
    { name: 'Jordan Peele Sweating', query: 'jordan peele sweating', tags: ['panic', 'nervous', 'stress'] },
    { name: 'This Is Fine Dog', query: 'this is fine dog fire', tags: ['panic', 'denial', 'fire'] },
    { name: 'Panik Kalm Panik', query: 'panik kalm panik', tags: ['panic', 'stress', 'cycle'] },
    { name: 'Internal Screaming', query: 'internal screaming', tags: ['panic', 'stress', 'hidden'] },
    { name: 'Chuckles Im In Danger', query: 'chuckles im in danger ralph simpsons', tags: ['danger', 'nervous'] },
    { name: 'Sweating Towel Guy', query: 'sweating towel guy nervous', tags: ['nervous', 'stress'] },
    { name: 'Pedro Pascal Crying', query: 'pedro pascal crying laughing', tags: ['panic', 'emotional', 'breakdown'] },
    { name: 'Mr Incredible Uncanny', query: 'mr incredible becoming uncanny', tags: ['panic', 'horror', 'escalation'] },
    { name: 'Sad Hamster', query: 'sad hamster staring', tags: ['panic', 'sad', 'stare'] },
    { name: 'Cat Crying Thumbs Up', query: 'crying cat thumbs up', tags: ['panic', 'cope', 'sad'] },
    { name: 'Nikocado Crying', query: 'nikocado avocado crying', tags: ['panic', 'breakdown', 'dramatic'] },
    { name: 'Walter White Falling', query: 'walter white falling breaking bad', tags: ['panic', 'collapse', 'despair'] },
    { name: 'Its Joever', query: 'its joever its so over', tags: ['panic', 'doomer', 'despair'] },
    { name: 'Anxious Dog', query: 'anxious dog ptsd flashback', tags: ['panic', 'flashback', 'trauma'] },
    { name: 'He Cant Keep Getting Away', query: 'jesse pinkman he cant keep getting away with it', tags: ['panic', 'frustration'] },
    { name: 'Mark Zuckerberg Nervous', query: 'mark zuckerberg drinking water nervous', tags: ['panic', 'nervous', 'robot'] },
    { name: 'Stressed Cat', query: 'stressed cat wide eyes', tags: ['panic', 'cat', 'stress'] },
    { name: 'Turkish Soldier Crying', query: 'turkish soldier crying salute', tags: ['panic', 'emotional', 'salute'] },
  ],

  // ===== DEATH / RIP / GONE =====
  DEATH: [
    { name: 'Coffin Dance', query: 'coffin dance astronomia', tags: ['death', 'funeral', 'dance'] },
    { name: 'Skeleton Waiting', query: 'skeleton waiting computer', tags: ['death', 'waiting', 'bones'] },
    { name: 'Grim Reaper Knocking', query: 'grim reaper door knock', tags: ['death', 'danger'] },
    { name: 'To Be Continued JoJo', query: 'to be continued jojo roundabout', tags: ['death', 'cliffhanger'] },
    { name: 'Wasted GTA', query: 'wasted gta death', tags: ['death', 'game over'] },
    { name: 'Ight Imma Head Out', query: 'ight imma head out spongebob', tags: ['death', 'leaving', 'peace'] },
    { name: 'Guess Ill Die', query: 'guess ill die shrug', tags: ['death', 'acceptance', 'shrug'] },
    { name: 'So You Have Chosen Death', query: 'so you have chosen death gandalf', tags: ['death', 'threat'] },
    { name: 'I Dont Feel So Good', query: 'i dont feel so good spiderman snap', tags: ['death', 'fading', 'thanos'] },
    { name: 'Windows XP Shutdown', query: 'windows xp shutdown sound', tags: ['death', 'shutdown', 'nostalgia'] },
    { name: 'Flatline EKG', query: 'flatline ekg heart monitor death', tags: ['death', 'medical', 'beep'] },
    { name: 'Skull Emoji', query: 'skull emoji im dead', tags: ['death', 'laughing', 'dead'] },
    { name: 'He Is Already Dead', query: 'stop hes already dead simpsons', tags: ['death', 'overkill'] },
    { name: 'Thanos Inevitable', query: 'thanos i am inevitable snap', tags: ['death', 'inevitable', 'snap'] },
    { name: 'See You Space Cowboy', query: 'see you space cowboy bebop', tags: ['death', 'farewell', 'anime'] },
    { name: 'Omae Wa Mou', query: 'omae wa mou shindeiru nani', tags: ['death', 'anime', 'already dead'] },
  ],

  // ===== CHAOS / UNHINGED / WILD =====
  CHAOS: [
    { name: 'Elmo Fire', query: 'elmo fire chaos rise', tags: ['chaos', 'fire', 'elmo'] },
    { name: 'Cat Vibing', query: 'cat vibing ievan polkka', tags: ['chaos', 'cat', 'music'] },
    { name: 'Confused Screaming', query: 'confused screaming', tags: ['chaos', 'panic'] },
    { name: 'Chipi Chipi Chapa Chapa', query: 'chipi chipi chapa chapa cat', tags: ['chaos', 'cat', 'dance', 'brainrot'] },
    { name: 'Happy Happy Happy Cat', query: 'happy happy happy cat', tags: ['chaos', 'cat', 'happy', 'brainrot'] },
    { name: 'Maxwell Spinning Cat', query: 'maxwell spinning cat', tags: ['chaos', 'cat', 'spin'] },
    { name: 'Skibidi Toilet', query: 'skibidi toilet', tags: ['chaos', 'brainrot', 'cursed'] },
    { name: 'Polish Cow', query: 'polish cow dancing', tags: ['chaos', 'cow', 'dance', 'polish'] },
    { name: 'Subway Surfers', query: 'subway surfers gameplay', tags: ['chaos', 'adhd', 'background'] },
    { name: 'Among Us Emergency', query: 'among us emergency meeting', tags: ['chaos', 'sus', 'meeting'] },
    { name: 'Metal Pipe Falling', query: 'metal pipe falling sound effect', tags: ['chaos', 'loud', 'pipe'] },
    { name: 'Taco Bell Sound', query: 'taco bell bong sound effect', tags: ['chaos', 'sound', 'tacobell'] },
    { name: 'Vine Boom', query: 'vine boom sound effect', tags: ['chaos', 'sound', 'boom'] },
    { name: 'Air Horn MLG', query: 'air horn mlg sound effect', tags: ['chaos', 'sound', 'horn'] },
    { name: 'Harlem Shake', query: 'harlem shake', tags: ['chaos', 'dance', 'classic'] },
    { name: 'Dog Zoomies', query: 'dog zoomies running crazy', tags: ['chaos', 'dog', 'energy'] },
    { name: 'Shooting Stars', query: 'shooting stars meme', tags: ['chaos', 'flying', 'space'] },
    { name: 'Wide Putin', query: 'wide putin walking song', tags: ['chaos', 'wide', 'walking'] },
    { name: 'Quandale Dingle', query: 'quandale dingle', tags: ['chaos', 'brainrot', 'cursed'] },
    { name: 'Low Taper Fade', query: 'low taper fade brainrot', tags: ['chaos', 'brainrot', 'fade'] },
  ],

  // ===== SHOCK / SURPRISE / WHAT =====
  SHOCK: [
    { name: 'Surprised Pikachu', query: 'surprised pikachu face', tags: ['shock', 'surprised'] },
    { name: 'Confused Math Lady', query: 'confused math lady calculating', tags: ['shock', 'confused', 'math'] },
    { name: 'Nick Young Question Marks', query: 'nick young question marks confused', tags: ['shock', 'confused'] },
    { name: 'The Rock Eyebrow', query: 'the rock eyebrow raise sus', tags: ['shock', 'sus', 'eyebrow'] },
    { name: 'John Cena Are You Sure', query: 'john cena are you sure about that', tags: ['shock', 'doubt'] },
    { name: 'Ayo What', query: 'ayo pause what', tags: ['shock', 'sus', 'pause'] },
    { name: 'Caught in 4K', query: 'caught in 4k camera', tags: ['shock', 'caught', 'exposed'] },
    { name: 'Erm What The Sigma', query: 'erm what the sigma', tags: ['shock', 'brainrot', 'sigma'] },
    { name: 'Bro What', query: 'bro what reaction', tags: ['shock', 'disbelief'] },
    { name: 'Nah Bruh', query: 'nah bruh reaction', tags: ['shock', 'disbelief', 'bruh'] },
    { name: 'Real', query: 'real meme reaction', tags: ['shock', 'real', 'true'] },
    { name: 'No Way', query: 'no way meme reaction', tags: ['shock', 'disbelief'] },
    { name: 'Goofy Ahh', query: 'goofy ahh sound effect', tags: ['shock', 'brainrot', 'goofy'] },
    { name: 'Emotional Damage', query: 'emotional damage steven he', tags: ['shock', 'damage', 'asian'] },
    { name: 'Homelander Stare', query: 'homelander staring', tags: ['shock', 'stare', 'menacing'] },
    { name: 'Patrick Bateman Stare', query: 'patrick bateman american psycho stare', tags: ['shock', 'stare', 'sigma'] },
    { name: 'Gus Fring', query: 'gus fring stare breaking bad', tags: ['shock', 'stare', 'threat'] },
  ],

  // ===== ROAST / BURN / L =====
  ROAST: [
    { name: 'Batman Slapping Robin', query: 'batman slapping robin', tags: ['roast', 'slap'] },
    { name: 'Oof Roblox', query: 'oof roblox death sound', tags: ['roast', 'oof', 'damage'] },
    { name: 'Flex Tape Damage', query: 'thats a lot of damage flex tape', tags: ['roast', 'damage'] },
    { name: 'L + Ratio', query: 'l ratio twitter', tags: ['roast', 'L', 'ratio'] },
    { name: 'Didn\'t Ask', query: 'who asked didnt ask', tags: ['roast', 'didnt ask'] },
    { name: 'Cope', query: 'cope seethe mald', tags: ['roast', 'cope', 'seethe'] },
    { name: 'Skill Issue', query: 'skill issue', tags: ['roast', 'skill', 'issue'] },
    { name: 'Nah Id Win', query: 'nah id win gojo', tags: ['roast', 'confidence', 'anime'] },
    { name: 'Gigachad', query: 'gigachad yes meme', tags: ['roast', 'chad', 'sigma'] },
    { name: 'Average Fan vs Enjoyer', query: 'average fan vs average enjoyer', tags: ['roast', 'comparison'] },
    { name: 'Clown Applying Makeup', query: 'clown applying makeup', tags: ['roast', 'clown', 'stages'] },
    { name: 'You Fell Off', query: 'you fell off ratio', tags: ['roast', 'fell off'] },
    { name: 'Shame Bell', query: 'shame bell game of thrones', tags: ['roast', 'shame'] },
    { name: 'Get Real', query: 'get real meme', tags: ['roast', 'real'] },
    { name: 'Bro Think He', query: 'bro think he carti', tags: ['roast', 'bruh', 'think'] },
  ],

  // ===== VICTORY / W / CELEBRATION =====
  CELEBRATION: [
    { name: 'Success Kid', query: 'success kid fist', tags: ['win', 'success'] },
    { name: 'Leonardo Pointing', query: 'leonardo dicaprio pointing', tags: ['win', 'pointing', 'recognition'] },
    { name: 'Victory Royale', query: 'victory royale fortnite', tags: ['win', 'fortnite'] },
    { name: 'Lets Go', query: 'lets gooo meme', tags: ['win', 'hype', 'celebration'] },
    { name: 'Were So Back', query: 'were so back meme', tags: ['win', 'comeback', 'back'] },
    { name: 'Griddy Dance', query: 'griddy dance celebration', tags: ['win', 'dance', 'sports'] },
    { name: 'Zyzz Pose', query: 'zyzz pose dancing', tags: ['win', 'sigma', 'gym'] },
    { name: 'He Is Him', query: 'he is him meme', tags: ['win', 'goat', 'respect'] },
    { name: 'Based Department', query: 'based department calling', tags: ['win', 'based', 'phone'] },
    { name: 'King Shit', query: 'king shit crown', tags: ['win', 'king', 'respect'] },
    { name: 'W', query: 'w meme massive W', tags: ['win', 'W'] },
    { name: 'Goated', query: 'goated with the sauce', tags: ['win', 'goat'] },
    { name: 'Slay', query: 'slay queen meme', tags: ['win', 'slay'] },
    { name: 'Bussin', query: 'bussin fr fr', tags: ['win', 'bussin', 'good'] },
    { name: 'Mr Incredible Canny', query: 'mr incredible becoming canny', tags: ['win', 'upgrade', 'happy'] },
    { name: 'This Is Real', query: 'this is real celebration', tags: ['win', 'real', 'hype'] },
  ],

  // ===== TEACHING / SMART / LEARNING =====
  TEACHING: [
    { name: 'Galaxy Brain', query: 'galaxy brain expanding', tags: ['smart', 'brain', 'expand'] },
    { name: 'Big Brain Time', query: 'yeah its big brain time', tags: ['smart', 'brain'] },
    { name: 'Actually Nerd', query: 'actually pushing glasses nerd', tags: ['smart', 'correction'] },
    { name: 'The More You Know', query: 'the more you know nbc rainbow', tags: ['smart', 'learning'] },
    { name: 'Real Shit', query: 'sleeping drake real shit woke', tags: ['smart', 'woke', 'attention'] },
    { name: 'Write That Down', query: 'write that down patrick star', tags: ['smart', 'notes', 'important'] },
    { name: 'Listen Here', query: 'listen here you little shit', tags: ['teaching', 'angry', 'explain'] },
    { name: 'No No Hes Got A Point', query: 'no no hes got a point kronk', tags: ['smart', 'valid', 'point'] },
    { name: 'Noted', query: 'noted meme kowalski', tags: ['smart', 'noted', 'penguin'] },
    { name: 'Task Failed Successfully', query: 'task failed successfully', tags: ['smart', 'ironic', 'windows'] },
    { name: 'Trust Me Bro', query: 'source trust me bro', tags: ['teaching', 'source', 'ironic'] },
    { name: 'Science', query: 'yeah science bitch jesse', tags: ['smart', 'science', 'breaking bad'] },
    { name: 'In This Essay', query: 'in this essay i will', tags: ['teaching', 'essay', 'explain'] },
  ],

  // ===== SAD / DEPRESSED / FEELS =====
  SADNESS: [
    { name: 'Crying Jordan', query: 'crying michael jordan face', tags: ['sad', 'crying', 'sports'] },
    { name: 'Sad Pablo Escobar', query: 'sad pablo escobar waiting alone', tags: ['sad', 'lonely', 'waiting'] },
    { name: 'Sad Cat', query: 'sad cat crying tears', tags: ['sad', 'cat', 'tears'] },
    { name: 'Sad Hamster', query: 'sad hamster staring tiktok', tags: ['sad', 'hamster', 'stare'] },
    { name: 'Cat Crying Thumbs Up', query: 'crying cat thumbs up okay', tags: ['sad', 'cat', 'cope'] },
    { name: 'Its Enough Slices', query: 'its enough slices for today cat', tags: ['sad', 'tired', 'cat'] },
    { name: 'Why Are We Here', query: 'why are we still here just to suffer', tags: ['sad', 'suffer', 'metal gear'] },
    { name: 'Rain On Window', query: 'sad rain window anime', tags: ['sad', 'rain', 'aesthetic'] },
    { name: 'Guts Theme', query: 'guts theme sad berserk', tags: ['sad', 'anime', 'pain'] },
    { name: 'Kanye Sad', query: 'kanye west sad interview', tags: ['sad', 'kanye'] },
    { name: 'Naruto Sad', query: 'naruto swing sad', tags: ['sad', 'anime', 'lonely'] },
    { name: 'Nobody Loves Me', query: 'nobody loves me meme', tags: ['sad', 'lonely'] },
    { name: 'Depression Nap', query: 'depression nap sleeping', tags: ['sad', 'sleep', 'tired'] },
  ],

  // ===== SUS / SUSSY / SUSSY BAKA =====
  SUS: [
    { name: 'Among Us', query: 'among us sus', tags: ['sus', 'amogus', 'imposter'] },
    { name: 'Rock Eyebrow', query: 'the rock eyebrow raise', tags: ['sus', 'eyebrow', 'doubt'] },
    { name: 'Ayo Pause', query: 'ayo pause sus', tags: ['sus', 'pause', 'wait'] },
    { name: 'Caught in 4K', query: 'caught in 4k', tags: ['sus', 'caught', 'exposed'] },
    { name: 'Sussy Baka', query: 'sussy baka', tags: ['sus', 'brainrot'] },
    { name: 'Emergency Meeting', query: 'among us emergency meeting', tags: ['sus', 'meeting', 'amogus'] },
    { name: 'Red Sus', query: 'red sus among us', tags: ['sus', 'red', 'amogus'] },
    { name: 'Spongebob Police', query: 'fbi open up spongebob', tags: ['sus', 'fbi', 'caught'] },
    { name: 'Down Bad', query: 'down bad astronomically', tags: ['sus', 'down bad', 'horny'] },
    { name: 'Bro', query: 'bro what meme sus', tags: ['sus', 'bro', 'disbelief'] },
  ],

  // ===== MEDICAL SPECIFIC =====
  MEDICAL: [
    { name: 'Flatline', query: 'flatline ekg heart monitor', tags: ['medical', 'death', 'ekg'] },
    { name: 'Defibrillator', query: 'defibrillator shock clear', tags: ['medical', 'shock', 'save'] },
    { name: 'Surgery', query: 'surgery operation doctor', tags: ['medical', 'surgery'] },
    { name: 'Doctor Confused', query: 'doctor confused meme', tags: ['medical', 'confused'] },
    { name: 'Nurse Facepalm', query: 'nurse facepalm hospital', tags: ['medical', 'facepalm'] },
    { name: 'House MD', query: 'house md its not lupus', tags: ['medical', 'house', 'lupus'] },
    { name: 'Scrubs JD', query: 'scrubs jd daydream', tags: ['medical', 'scrubs', 'dream'] },
    { name: 'Greys Anatomy', query: 'greys anatomy dramatic', tags: ['medical', 'drama'] },
    { name: 'ER Running', query: 'er emergency room running', tags: ['medical', 'emergency', 'running'] },
    { name: 'IV Bag', query: 'iv drip hospital', tags: ['medical', 'iv', 'treatment'] },
    { name: 'Pills Dropping', query: 'pills dropping pharmacy', tags: ['medical', 'pills', 'drugs'] },
    { name: 'Blood Pressure', query: 'blood pressure cuff nervous', tags: ['medical', 'bp', 'nervous'] },
    { name: 'Ambulance', query: 'ambulance lights emergency', tags: ['medical', 'ambulance', 'emergency'] },
    { name: 'Code Blue', query: 'code blue hospital emergency', tags: ['medical', 'code', 'emergency'] },
  ],

  // ===== IRONY / SARCASM =====
  IRONY: [
    { name: 'Sure Jan', query: 'sure jan brady bunch', tags: ['irony', 'doubt', 'sarcasm'] },
    { name: 'Press X Doubt', query: 'press x to doubt la noire', tags: ['irony', 'doubt'] },
    { name: 'SpongeBob Rainbow', query: 'spongebob imagination rainbow', tags: ['irony', 'imagination'] },
    { name: 'Oh Really Owl', query: 'oh really owl sarcasm', tags: ['irony', 'sarcasm'] },
    { name: 'Oh No Anyway', query: 'oh no anyway jeremy clarkson', tags: ['irony', 'dont care'] },
    { name: 'First Time', query: 'first time james franco hanging', tags: ['irony', 'experienced'] },
    { name: 'I Sleep Real Shit', query: 'i sleep real shit drake', tags: ['irony', 'selective'] },
    { name: 'Understandable', query: 'understandable have a great day', tags: ['irony', 'accept'] },
    { name: 'Interesting', query: 'interesting meme kid', tags: ['irony', 'dont care'] },
    { name: 'Cool Story Bro', query: 'cool story bro', tags: ['irony', 'dont care'] },
    { name: 'Nobody Cares', query: 'see nobody cares jurassic park', tags: ['irony', 'dont care'] },
    { name: 'That Sign Wont Stop Me', query: 'that sign wont stop me because i cant read', tags: ['irony', 'ignore'] },
    { name: 'Me Omw', query: 'me omw to on my way meme', tags: ['irony', 'going'] },
    { name: 'Corporate Wants', query: 'corporate wants you to find the difference', tags: ['irony', 'same'] },
  ],

  // ===== DARK HUMOR / EDGY =====
  DARK_HUMOR: [
    { name: 'Disaster Girl', query: 'disaster girl smiling fire', tags: ['dark', 'fire', 'evil'] },
    { name: 'Oof Size Large', query: 'oof size large critical', tags: ['dark', 'damage'] },
    { name: 'Well That Escalated', query: 'well that escalated quickly', tags: ['dark', 'sudden'] },
    { name: 'Wholesome Award', query: 'reddit wholesome award dark', tags: ['dark', 'reddit', 'ironic'] },
    { name: 'Haha Im In Danger', query: 'haha im in danger ralph', tags: ['dark', 'danger'] },
    { name: 'Jokes On You', query: 'jokes on you im into that', tags: ['dark', 'masochist'] },
    { name: 'Satan Biggest Fan', query: 'satan im your biggest fan', tags: ['dark', 'satan', 'evil'] },
    { name: 'Maybe I Am Monster', query: 'maybe i am a monster', tags: ['dark', 'monster'] },
    { name: 'I Missed The Part', query: 'i missed the part where thats my problem spiderman', tags: ['dark', 'dont care'] },
    { name: 'They Had Us First Half', query: 'they had us in the first half not gonna lie', tags: ['dark', 'twist'] },
  ],

  // ===== SIGMA / BASED / GIGACHAD =====
  SIGMA: [
    { name: 'Gigachad', query: 'gigachad yes', tags: ['sigma', 'chad', 'based'] },
    { name: 'Patrick Bateman', query: 'patrick bateman american psycho sigma', tags: ['sigma', 'psycho', 'stare'] },
    { name: 'Homelander', query: 'homelander smile clap', tags: ['sigma', 'psycho', 'clap'] },
    { name: 'Ryan Gosling', query: 'ryan gosling literally me', tags: ['sigma', 'literally me'] },
    { name: 'Zyzz', query: 'zyzz dancing pose', tags: ['sigma', 'gym', 'aesthetic'] },
    { name: 'Thomas Shelby', query: 'thomas shelby peaky blinders smoking', tags: ['sigma', 'smoke', 'cool'] },
    { name: 'Gojo', query: 'gojo satoru nah id win', tags: ['sigma', 'anime', 'confident'] },
    { name: 'Vergil', query: 'vergil chair devil may cry', tags: ['sigma', 'chair', 'motivated'] },
    { name: 'Jetstream Sam', query: 'jetstream sam metal gear rising', tags: ['sigma', 'grin', 'game'] },
    { name: 'Senator Armstrong', query: 'senator armstrong nanomachines son', tags: ['sigma', 'strong', 'based'] },
    { name: 'Saul Goodman', query: 'saul goodman 3d rotating', tags: ['sigma', '3d', 'lawyer'] },
    { name: 'Walter White', query: 'walter white heisenberg', tags: ['sigma', 'cook', 'breaking bad'] },
    { name: 'Drive Scorpion', query: 'drive ryan gosling scorpion jacket', tags: ['sigma', 'drive', 'literally me'] },
  ],

  // ===== ANIME / WEEB =====
  ANIME: [
    { name: 'JoJo To Be Continued', query: 'to be continued jojo', tags: ['anime', 'jojo', 'cliffhanger'] },
    { name: 'Omae Wa Mou', query: 'omae wa mou shindeiru nani', tags: ['anime', 'death'] },
    { name: 'Ultra Instinct', query: 'ultra instinct goku', tags: ['anime', 'power', 'dbz'] },
    { name: 'One Punch', query: 'one punch man ok', tags: ['anime', 'ok', 'bored'] },
    { name: 'Demon Slayer', query: 'demon slayer breathing', tags: ['anime', 'breathing', 'power'] },
    { name: 'Naruto Run', query: 'naruto run area 51', tags: ['anime', 'run', 'meme'] },
    { name: 'Attack On Titan', query: 'attack on titan eren scream', tags: ['anime', 'scream', 'titan'] },
    { name: 'Death Note', query: 'death note writing', tags: ['anime', 'write', 'death'] },
    { name: 'Gojo Domain', query: 'gojo domain expansion', tags: ['anime', 'domain', 'power'] },
    { name: 'Chainsaw Man Dance', query: 'chainsaw man ending dance', tags: ['anime', 'dance', 'ending'] },
  ],

  // ===== ANIMALS =====
  ANIMALS: [
    { name: 'Doge', query: 'doge shiba inu wow', tags: ['animal', 'dog', 'wow'] },
    { name: 'Cheems', query: 'cheems bonk doge', tags: ['animal', 'dog', 'bonk'] },
    { name: 'Bonk', query: 'bonk go to horny jail', tags: ['animal', 'dog', 'bonk'] },
    { name: 'Cat Vibing', query: 'cat vibing music', tags: ['animal', 'cat', 'vibe'] },
    { name: 'Beluga Cat', query: 'beluga cat polite', tags: ['animal', 'cat', 'polite'] },
    { name: 'Bingus', query: 'bingus cat', tags: ['animal', 'cat', 'cursed'] },
    { name: 'Floppa', query: 'big floppa caracal', tags: ['animal', 'cat', 'big'] },
    { name: 'Crying Cat', query: 'crying cat sad', tags: ['animal', 'cat', 'sad'] },
    { name: 'Monke', query: 'return to monke reject modernity', tags: ['animal', 'monkey', 'monke'] },
    { name: 'Dramatic Chipmunk', query: 'dramatic chipmunk turn', tags: ['animal', 'dramatic', 'stare'] },
    { name: 'Surprised Cat', query: 'surprised cat face', tags: ['animal', 'cat', 'shock'] },
    { name: 'Cat Stare', query: 'cat staring camera', tags: ['animal', 'cat', 'stare'] },
    { name: 'Angry Cat', query: 'angry cat hissing', tags: ['animal', 'cat', 'angry'] },
  ],
};

// ============================================
// CONTEXT-TO-QUERY MAPPING (UPGRADED)
// ============================================
const CONTEXT_PATTERNS = {
  medical: {
    'flatline|asystole|cardiac arrest|heart stop': ['flatline ekg death', 'coffin dance', 'code blue'],
    'potassium|hyperkalemia|K\\+|electrolyte': ['its joever', 'mr incredible uncanny', 'this is fine'],
    'dialysis|kidney|renal': ['dialysis machine', 'sad hamster stare', 'crying cat'],
    'ekg|ecg|qrs|t-wave|rhythm': ['heartbeat rhythm', 'flatline', 'mr incredible uncanny'],
    'calcium gluconate|iv push|medication': ['defibrillator shock', 'were so back', 'mr incredible canny'],
    'insulin|glucose|blood sugar': ['insulin injection', 'diabetes', 'task failed successfully'],
    'death|dying|critical|fatal': ['coffin dance', 'its joever', 'grim reaper'],
    'opioid|overdose|narcan|naloxone': ['walter white falling', 'he cant keep getting away', 'code blue'],
    'blood pressure|hypotension|shock': ['windows xp shutdown', 'flatline', 'mr incredible uncanny'],
    'breathing|respiratory|airway': ['this is fine fire', 'panik kalm panik', 'internal screaming'],
  },

  emotional: {
    'panic|nervous|anxious|stress|worried': 'PANIC',
    'death|dying|fatal|flatline|rip|dead': 'DEATH',
    'chaos|crazy|wild|insane|spinning|unhinged': 'CHAOS',
    'shock|surprise|what|wtf|huh': 'SHOCK',
    'roast|burn|shame|wrong|fail|L': 'ROAST',
    'celebration|victory|correct|yes|win|W': 'CELEBRATION',
    'teaching|explain|actually|learn|smart': 'TEACHING',
    'sad|cry|disappointed|unfortunate|depressed': 'SADNESS',
    'sus|suspicious|sussy|caught': 'SUS',
    'irony|sarcastic|meanwhile|but wait': 'IRONY',
    'dark humor|morbid|twisted|oof|edgy': 'DARK_HUMOR',
    'sigma|based|gigachad|alpha': 'SIGMA',
  },

  phrases: {
    'this is fine': 'this is fine dog fire',
    'sweet summer child': 'oh no anyway jeremy clarkson',
    'jazz|improvising': 'jazz hands music crazy',
    'bouncer|security|protect': 'gigachad bouncer security',
    'tick tock|time running out|countdown': 'among us emergency meeting timer',
    'washing machine|spin cycle': 'maxwell spinning cat',
    'bahamas|vacation|paradise|beach': 'spongebob imagination rainbow vacation',
    'cheesecake factory|menu|wide': 'wide putin walking',
    'cruise|boat|ship': 'coffin dance titanic',
    'flatline': 'coffin dance astronomia flatline',
    'banana peel': 'wasted gta death',
    'dead|dying': 'coffin dance its joever',
    'wrong answer|incorrect': 'emotional damage steven he',
    'correct answer|right': 'lets gooo were so back',
    'brain cells dying': 'mr incredible uncanny stages',
  }
};

// ============================================
// HTTP HELPERS
// ============================================
function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers
      },
      timeout: 15000
    };

    const req = protocol.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return httpGet(res.headers.location, headers).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ============================================
// IMAGE/VIDEO SOURCES
// ============================================

// TENOR - GIFs (use gif format - mp4 URLs are often restricted)
async function searchTenor(query, limit = 10) {
  try {
    const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=${limit}&media_filter=gif&contentfilter=medium`;
    const { data } = await httpGet(url);
    return (data.results || []).map(r => ({
      source: 'tenor',
      type: 'gif',
      id: r.id,
      title: r.content_description || query,
      url: r.media_formats?.gif?.url || r.media_formats?.mediumgif?.url,
      preview: r.media_formats?.tinygif?.url || r.media_formats?.nanogif?.url || r.media_formats?.gif?.url,
      query: query,
      hasAudio: false,
    })).filter(r => r.url && r.preview);
  } catch (e) {
    console.log(`     ⚠️ Tenor error: ${e.message}`);
    return [];
  }
}

// GIPHY - GIFs
async function searchGiphy(query, limit = 8) {
  try {
    const url = `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(query)}&api_key=${GIPHY_API_KEY}&limit=${limit}&rating=pg-13`;
    const { data } = await httpGet(url);
    return (data.data || []).map(g => ({
      source: 'giphy',
      type: 'gif',
      id: g.id,
      title: g.title || query,
      url: g.images?.original?.mp4 || g.images?.original?.url,
      preview: g.images?.fixed_height_small?.url,
      query: query,
      hasAudio: false,
    })).filter(r => r.url);
  } catch (e) {
    console.log(`     ⚠️ Giphy error: ${e.message}`);
    return [];
  }
}

// REDDIT - Video Memes (THE NEW HOTNESS)
async function searchReddit(subreddit, limit = 10) {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit * 2}`;
    const { data } = await httpGet(url);

    const posts = data?.data?.children || [];
    const results = [];

    for (const post of posts) {
      const p = post.data;

      // Skip non-media posts
      if (p.is_self || p.over_18) continue;

      // Get video URL
      let videoUrl = null;
      let previewUrl = null;
      let hasAudio = false;

      // Reddit hosted video
      if (p.is_video && p.media?.reddit_video?.fallback_url) {
        videoUrl = p.media.reddit_video.fallback_url;
        hasAudio = p.media.reddit_video.has_audio || false;
        previewUrl = p.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&');
      }
      // External video (gfycat, imgur, etc)
      else if (p.url?.includes('.gif') || p.url?.includes('.mp4')) {
        videoUrl = p.url;
        previewUrl = p.thumbnail !== 'default' ? p.thumbnail : null;
      }
      // Imgur gifv
      else if (p.url?.includes('imgur.com') && p.url?.includes('.gifv')) {
        videoUrl = p.url.replace('.gifv', '.mp4');
        previewUrl = p.thumbnail;
      }

      if (videoUrl) {
        results.push({
          source: 'reddit',
          type: 'video',
          id: p.id,
          title: p.title?.substring(0, 80) || 'Reddit video',
          url: videoUrl,
          preview: previewUrl?.replace(/&amp;/g, '&'),
          subreddit: subreddit,
          upvotes: p.ups,
          query: subreddit,
          hasAudio: hasAudio,
          permalink: `https://reddit.com${p.permalink}`,
        });
      }

      if (results.length >= limit) break;
    }

    return results;
  } catch (e) {
    console.log(`     ⚠️ Reddit r/${subreddit} error: ${e.message}`);
    return [];
  }
}

// Reddit search by keyword
async function searchRedditByKeyword(query, limit = 8) {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&type=link&sort=relevance&limit=${limit * 2}`;
    const { data } = await httpGet(url);

    const posts = data?.data?.children || [];
    const results = [];

    for (const post of posts) {
      const p = post.data;
      if (p.is_self || p.over_18) continue;

      let videoUrl = null;
      let previewUrl = null;

      if (p.is_video && p.media?.reddit_video?.fallback_url) {
        videoUrl = p.media.reddit_video.fallback_url;
        previewUrl = p.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&');
      } else if (p.url?.match(/\.(gif|mp4|gifv)$/i)) {
        videoUrl = p.url.replace('.gifv', '.mp4');
        previewUrl = p.thumbnail;
      }

      if (videoUrl) {
        results.push({
          source: 'reddit',
          type: 'video',
          id: p.id,
          title: p.title?.substring(0, 80) || query,
          url: videoUrl,
          preview: previewUrl?.replace(/&amp;/g, '&'),
          subreddit: p.subreddit,
          upvotes: p.ups,
          query: query,
          hasAudio: p.media?.reddit_video?.has_audio || false,
        });
      }

      if (results.length >= limit) break;
    }

    return results;
  } catch (e) {
    console.log(`     ⚠️ Reddit search error: ${e.message}`);
    return [];
  }
}

// Imgflip templates
async function searchImgflip(query, limit = 5) {
  try {
    const { data } = await httpGet('https://api.imgflip.com/get_memes');
    const memes = data?.data?.memes || [];
    const queryLower = query.toLowerCase();

    const relevant = memes.filter(m =>
      m.name.toLowerCase().includes(queryLower) ||
      queryLower.split(' ').some(word => word.length > 3 && m.name.toLowerCase().includes(word))
    );

    return relevant.slice(0, limit).map(m => ({
      source: 'imgflip',
      type: 'template',
      id: m.id,
      title: m.name,
      url: m.url,
      preview: m.url,
      query: query,
      hasAudio: false,
    }));
  } catch (e) {
    return [];
  }
}

// ============================================
// SMART QUERY GENERATOR (UPGRADED)
// Now prioritizes agent-provided search queries
// ============================================
function generateSmartQueries(item) {
  const { context, emotion, suggestedMemes = [], searchQueries = [], backupSearches = [], name } = item;
  const contextLower = (context || '').toLowerCase();
  const queries = new Set();

  // 1. AGENT-PROVIDED SEARCH QUERIES (highest priority - from meme-analyst-agent)
  if (searchQueries.length > 0) {
    searchQueries.forEach(q => queries.add(q.toLowerCase()));
  }

  // 2. Agent suggested exact meme names
  suggestedMemes.forEach(meme => queries.add(meme.toLowerCase()));

  // 3. Agent backup searches
  if (backupSearches.length > 0) {
    backupSearches.forEach(q => queries.add(q.toLowerCase()));
  }

  // If agent provided queries, use those primarily
  if (searchQueries.length > 0 || suggestedMemes.length > 0) {
    // Add just a couple random ones for variety
    if (emotion && BRAIN_ROT_MEMES[emotion]) {
      const categoryMemes = BRAIN_ROT_MEMES[emotion];
      const shuffled = categoryMemes.sort(() => 0.5 - Math.random());
      shuffled.slice(0, 2).forEach(meme => queries.add(meme.query));
    }
    return [...queries].slice(0, 15);
  }

  // FALLBACK: Original logic if no agent queries provided
  // 4. Emotion-based memes from database
  if (emotion && BRAIN_ROT_MEMES[emotion]) {
    const categoryMemes = BRAIN_ROT_MEMES[emotion];
    const shuffled = categoryMemes.sort(() => 0.5 - Math.random());
    shuffled.slice(0, 6).forEach(meme => queries.add(meme.query));
  }

  // 5. Context pattern matching
  for (const [pattern, searchPatterns] of Object.entries(CONTEXT_PATTERNS.medical)) {
    if (new RegExp(pattern, 'i').test(contextLower)) {
      searchPatterns.forEach(q => queries.add(q));
    }
  }

  // 6. Phrase matching
  for (const [phrase, searchQuery] of Object.entries(CONTEXT_PATTERNS.phrases)) {
    if (new RegExp(phrase, 'i').test(contextLower)) {
      queries.add(searchQuery);
    }
  }

  // 7. Add some CHAOS for brain rot variety
  const chaosTerms = BRAIN_ROT_MEMES.CHAOS.sort(() => 0.5 - Math.random()).slice(0, 2);
  chaosTerms.forEach(m => queries.add(m.query));

  // 8. Add sigma/based content for that gen alpha energy
  const sigmaTerms = BRAIN_ROT_MEMES.SIGMA.sort(() => 0.5 - Math.random()).slice(0, 2);
  sigmaTerms.forEach(m => queries.add(m.query));

  return [...queries].slice(0, 15);
}

// ============================================
// MAIN SEARCH ORCHESTRATOR
// ============================================
async function searchAllSources(item) {
  const { context, emotion, timestamp, name } = item;
  const queries = generateSmartQueries(item);

  console.log(`\n  🔍 ${name} @ ${timestamp}s [${emotion || 'no emotion'}]`);
  console.log(`     "${(context || '').substring(0, 60)}${(context || '').length > 60 ? '...' : ''}"`);
  console.log(`     Queries: ${queries.slice(0, 5).join(', ')}...`);

  const allResults = [];

  // 1. REDDIT - Meme subreddits (THE GOOD SHIT)
  console.log('     🔴 Searching Reddit...');
  const redditSubs = ['MemeVideos', 'shitposting', 'whenthe', 'perfectlycutscreams'];
  for (const sub of redditSubs.slice(0, 3)) {
    const results = await searchReddit(sub, 4);
    allResults.push(...results);
    await new Promise(r => setTimeout(r, 200));
  }

  // 2. Reddit keyword search for specific memes
  for (const query of queries.slice(0, 3)) {
    const results = await searchRedditByKeyword(query, 3);
    allResults.push(...results);
    await new Promise(r => setTimeout(r, 200));
  }

  // 3. TENOR & GIPHY
  console.log('     🎭 Searching Tenor/Giphy...');
  for (const query of queries.slice(0, 8)) {
    const [tenorResults, giphyResults] = await Promise.all([
      searchTenor(query, 5),
      searchGiphy(query, 4),
    ]);
    allResults.push(...tenorResults, ...giphyResults);
    await new Promise(r => setTimeout(r, 100));
  }

  // 4. Imgflip templates
  console.log('     📝 Searching templates...');
  for (const query of queries.slice(0, 3)) {
    const imgflipResults = await searchImgflip(query, 3);
    allResults.push(...imgflipResults);
  }

  // Dedupe by URL
  const seen = new Set();
  const uniqueResults = allResults.filter(r => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  // Sort: Reddit first (they have video), then by whether has audio
  uniqueResults.sort((a, b) => {
    if (a.source === 'reddit' && b.source !== 'reddit') return -1;
    if (b.source === 'reddit' && a.source !== 'reddit') return 1;
    if (a.hasAudio && !b.hasAudio) return -1;
    if (b.hasAudio && !a.hasAudio) return 1;
    return 0;
  });

  console.log(`     ✅ Found ${uniqueResults.length} unique options (${uniqueResults.filter(r => r.source === 'reddit').length} from Reddit)`);

  return uniqueResults;
}

// ============================================
// HTML GENERATOR - BRAIN ROT EDITION V4
// ============================================
function generateHTML(sections, config = {}) {
  const title = config.videoName || 'Meme Validator v4';

  const sectionsHTML = sections.map((section, sectionIdx) => {
    const sectionNum = sectionIdx + 1;

    // Group by source
    const reddit = section.results.filter(r => r.source === 'reddit');
    const tenor = section.results.filter(r => r.source === 'tenor');
    const giphy = section.results.filter(r => r.source === 'giphy');
    const templates = section.results.filter(r => r.source === 'imgflip');

    const renderCategory = (items, catName, emoji, catCode, isVideo = false) => {
      if (items.length === 0) return '';

      const itemsHTML = items.map((item, idx) => {
        const itemNum = idx + 1;
        const badges = [];
        if (item.hasAudio) badges.push('🔊');
        if (item.upvotes) badges.push(`⬆️${item.upvotes > 1000 ? Math.floor(item.upvotes/1000) + 'k' : item.upvotes}`);

        return `
          <div class="result-card ${isVideo ? 'video-card' : ''}"
               data-section="${sectionNum}"
               data-cat="${catCode}"
               data-item="${itemNum}"
               data-url="${item.url}"
               data-title="${(item.title || '').replace(/"/g, '&quot;')}"
               data-source="${item.source}"
               data-has-audio="${item.hasAudio || false}"
               onclick="selectResult(${sectionNum}, '${catCode}', ${itemNum}, this)">
            <div class="result-number">${itemNum}</div>
            ${badges.length > 0 ? `<div class="badges">${badges.join(' ')}</div>` : ''}
            <div class="result-preview">
              ${isVideo ? `
                <video src="${item.preview || item.url}" muted loop playsinline
                  onmouseover="this.play()" onmouseout="this.pause();this.currentTime=0;"
                  onerror="this.parentElement.innerHTML='<img src=\\'${item.preview || ''}\\' />'" />
              ` : `
                <img src="${item.preview || item.url}"
                   alt="${item.title || ''}"
                   loading="lazy"
                   onerror="this.parentElement.innerHTML='<div class=\\'error\\'>❌</div>'" />
              `}
            </div>
            <div class="result-info">
              <span class="source-badge ${item.source}">${item.source}${item.subreddit ? ' r/' + item.subreddit : ''}</span>
              <span class="result-title" title="${item.title || ''}">${(item.title || '').substring(0, 40)}${(item.title || '').length > 40 ? '...' : ''}</span>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="category">
          <h4>${emoji} ${catName} <span class="cat-code">(${catCode})</span> <span class="cat-count">${items.length}</span></h4>
          <div class="results-row">${itemsHTML}</div>
        </div>
      `;
    };

    return `
      <div class="search-section" id="section-${sectionNum}">
        <div class="section-header">
          <div class="section-num">${sectionNum}</div>
          <div class="section-info">
            <h2>${section.name || 'Untitled'}</h2>
            <div class="meta-row">
              <span class="timestamp">⏱️ ${section.timestamp}s</span>
              ${section.emotion ? `<span class="emotion emotion-${(section.emotion || '').toLowerCase()}">${section.emotion}</span>` : ''}
            </div>
            <p class="context">"${(section.context || '').substring(0, 100)}${(section.context || '').length > 100 ? '...' : ''}"</p>
          </div>
          <div class="selection-panel" id="panel-${sectionNum}">
            <div class="sel-preview" id="preview-${sectionNum}">
              <div class="empty-preview">Click to select</div>
            </div>
            <div class="sel-controls">
              <select class="anim-select" id="entrance-${sectionNum}" title="Entrance">
                ${ANIMATIONS.entrances.map(a => `<option value="${a}">${a}</option>`).join('')}
              </select>
              <select class="anim-select" id="exit-${sectionNum}" title="Exit">
                ${ANIMATIONS.exits.map(a => `<option value="${a}">${a}</option>`).join('')}
              </select>
              <input type="number" class="duration-input" id="duration-${sectionNum}" value="45" min="20" max="120" title="Frames" />
            </div>
          </div>
        </div>
        ${renderCategory(reddit, 'Reddit Videos 🔥', '🔴', 'R', true)}
        ${renderCategory(tenor, 'Tenor', '🎭', 'T', false)}
        ${renderCategory(giphy, 'Giphy', '🎬', 'G', false)}
        ${renderCategory(templates, 'Templates', '📝', 'I', false)}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Meme Validator v4 🧠💀</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #050508;
      --bg-card: #0d0d12;
      --bg-hover: #15151d;
      --purple: #8b5cf6;
      --pink: #ec4899;
      --green: #10b981;
      --red: #ef4444;
      --orange: #f97316;
      --yellow: #fbbf24;
      --cyan: #06b6d4;
      --text: #e5e5e5;
      --text-muted: #6b7280;
      --border: #1f1f2e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Outfit', sans-serif;
      background: var(--bg-dark);
      color: var(--text);
      min-height: 100vh;
      padding: 20px;
      padding-bottom: 220px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
      border-radius: 16px;
      border: 1px solid var(--border);
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 900;
      background: linear-gradient(135deg, var(--purple), var(--pink), var(--cyan));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .subtitle { color: var(--text-muted); font-family: 'Space Mono', monospace; font-size: 0.85rem; }
    .search-section {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
      border: 2px solid var(--border);
      transition: all 0.3s ease;
    }
    .search-section.selected {
      border-color: var(--green);
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.15);
    }
    .section-header {
      display: grid;
      grid-template-columns: 60px 1fr 380px;
      gap: 20px;
      align-items: start;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }
    @media (max-width: 900px) {
      .section-header { grid-template-columns: 50px 1fr; }
      .selection-panel { grid-column: span 2; }
    }
    .section-num {
      font-size: 2.5rem;
      font-weight: 900;
      color: var(--purple);
      font-family: 'Space Mono', monospace;
      text-align: center;
    }
    .section-info h2 { font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; color: #fff; }
    .meta-row { display: flex; gap: 10px; margin-bottom: 10px; }
    .timestamp, .emotion {
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 600;
      font-family: 'Space Mono', monospace;
    }
    .timestamp { background: rgba(16, 185, 129, 0.15); color: var(--green); }
    .emotion { background: rgba(236, 72, 153, 0.15); color: var(--pink); }
    .emotion-panic { background: rgba(239, 68, 68, 0.2); color: var(--red); }
    .emotion-death { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }
    .emotion-chaos { background: rgba(249, 115, 22, 0.2); color: var(--orange); }
    .emotion-celebration { background: rgba(16, 185, 129, 0.2); color: var(--green); }
    .emotion-shock { background: rgba(251, 191, 11, 0.2); color: var(--yellow); }
    .context {
      font-style: italic;
      color: var(--text-muted);
      font-size: 0.9rem;
      border-left: 3px solid var(--purple);
      padding-left: 12px;
    }
    .selection-panel {
      background: var(--bg-dark);
      border-radius: 12px;
      padding: 12px;
      border: 1px solid var(--border);
    }
    .sel-preview {
      height: 200px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 10px;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sel-preview img, .sel-preview video { max-width: 100%; max-height: 100%; object-fit: contain; }
    .empty-preview { color: var(--text-muted); font-size: 0.8rem; }
    .sel-controls { display: flex; gap: 6px; }
    .anim-select, .duration-input {
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-family: 'Space Mono', monospace;
    }
    .duration-input { max-width: 60px; text-align: center; }
    .category { margin-bottom: 16px; }
    .category h4 {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cat-code { font-family: 'Space Mono', monospace; font-size: 0.7rem; color: var(--purple); }
    .cat-count { background: var(--bg-dark); padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; }
    .results-row {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding: 8px 4px;
      scrollbar-width: thin;
      scrollbar-color: var(--purple) var(--bg-dark);
    }
    .results-row::-webkit-scrollbar { height: 6px; }
    .results-row::-webkit-scrollbar-track { background: var(--bg-dark); border-radius: 3px; }
    .results-row::-webkit-scrollbar-thumb { background: var(--purple); border-radius: 3px; }
    .result-card {
      flex: 0 0 220px;
      background: var(--bg-dark);
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid transparent;
      position: relative;
    }
    .result-card.video-card { border-color: rgba(239, 68, 68, 0.3); }
    .result-card:hover {
      transform: translateY(-4px);
      border-color: var(--purple);
      box-shadow: 0 8px 20px rgba(139, 92, 246, 0.2);
    }
    .result-card.selected {
      border-color: var(--green);
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.3);
    }
    .result-card.selected .result-number { background: var(--green); border-color: var(--green); }
    .result-number {
      position: absolute;
      top: 8px;
      left: 8px;
      background: var(--bg-dark);
      color: #fff;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      border: 2px solid var(--purple);
      z-index: 5;
      font-family: 'Space Mono', monospace;
    }
    .badges {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.8);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      z-index: 5;
    }
    .result-preview {
      height: 160px;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .result-preview img, .result-preview video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .result-card:hover .result-preview img,
    .result-card:hover .result-preview video { transform: scale(1.1); }
    .error { color: var(--text-muted); font-size: 1.5rem; }
    .result-info { padding: 10px; }
    .source-badge {
      font-size: 0.65rem;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 700;
      text-transform: uppercase;
      display: inline-block;
      margin-bottom: 4px;
      font-family: 'Space Mono', monospace;
    }
    .source-badge.tenor { background: #1DA1F2; color: #fff; }
    .source-badge.giphy { background: #00FF99; color: #000; }
    .source-badge.reddit { background: #FF4500; color: #fff; }
    .source-badge.imgflip { background: var(--yellow); color: #000; }
    .result-title { font-size: 0.8rem; color: var(--text-muted); display: block; line-height: 1.3; }
    .bottom-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, var(--bg-dark) 80%, transparent);
      padding: 30px 20px 20px;
      z-index: 100;
    }
    .panel-inner {
      max-width: 1400px;
      margin: 0 auto;
      background: var(--bg-card);
      border-radius: 16px;
      padding: 20px;
      border: 1px solid var(--border);
    }
    .panel-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .quick-input {
      flex: 1;
      min-width: 300px;
      background: var(--bg-dark);
      border: 2px solid var(--border);
      border-radius: 10px;
      padding: 12px 16px;
      color: var(--text);
      font-size: 1rem;
      font-family: 'Space Mono', monospace;
    }
    .quick-input:focus { outline: none; border-color: var(--purple); }
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.9rem;
      font-family: 'Outfit', sans-serif;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn:hover { transform: translateY(-2px); }
    .btn-apply { background: var(--purple); color: #fff; }
    .btn-copy { background: var(--cyan); color: #000; }
    .btn-export { background: var(--green); color: #000; }
    .btn-clear { background: var(--red); color: #fff; }
    .progress-bar { display: flex; gap: 4px; margin-top: 12px; align-items: center; }
    .progress-dot {
      width: 24px;
      height: 8px;
      background: var(--border);
      border-radius: 4px;
      transition: all 0.2s ease;
    }
    .progress-dot.done { background: var(--green); }
    .progress-count {
      margin-left: 10px;
      font-family: 'Space Mono', monospace;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .help-text {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 10px;
      font-family: 'Space Mono', monospace;
    }
    .toast {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      background: var(--green);
      color: #000;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      transition: transform 0.3s ease;
      z-index: 200;
    }
    .toast.show { transform: translateX(-50%) translateY(0); }
    .toast.error { background: var(--red); color: #fff; }
    .modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      z-index: 300;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal.show { display: flex; }
    .modal-content {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 24px;
      max-width: 900px;
      width: 100%;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .modal-header h2 { font-size: 1.3rem; }
    .modal-close { background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }
    .code-output {
      flex: 1;
      background: var(--bg-dark);
      border-radius: 10px;
      padding: 16px;
      overflow: auto;
      font-family: 'Space Mono', monospace;
      font-size: 0.8rem;
      white-space: pre-wrap;
      color: var(--cyan);
    }
    .modal-actions { display: flex; gap: 12px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧠💀 Meme Validator v4</h1>
    <p class="subtitle">Reddit Videos • 2024 Brain Rot • ${title}</p>
  </div>
  ${sectionsHTML}
  <div class="bottom-panel">
    <div class="panel-inner">
      <div class="panel-row">
        <input type="text" class="quick-input" id="quickInput" placeholder="Quick select: 1-R-3, 2-T-1, 3-G-2 (section-category-item)" />
        <button class="btn btn-apply" onclick="applyQuickInput()">⚡ Apply</button>
        <button class="btn btn-clear" onclick="clearAll()">🗑️ Clear</button>
        <button class="btn btn-copy" onclick="showExportModal()">📋 Copy Code</button>
        <button class="btn btn-export" onclick="exportJSON()">💾 Export</button>
      </div>
      <div class="progress-bar" id="progressBar">
        ${sections.map((_, i) => `<div class="progress-dot" data-section="${i + 1}"></div>`).join('')}
        <span class="progress-count" id="progressCount">0/${sections.length}</span>
      </div>
      <p class="help-text">Categories: R=Reddit, T=Tenor, G=Giphy, I=Imgflip • Example: "1-R-2, 2-T-5"</p>
    </div>
  </div>
  <div class="toast" id="toast"></div>
  <div class="modal" id="exportModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>📦 Remotion Code</h2>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <pre class="code-output" id="codeOutput"></pre>
      <div class="modal-actions">
        <button class="btn btn-copy" onclick="copyCode()">📋 Copy to Clipboard</button>
        <button class="btn btn-clear" onclick="closeModal()">Close</button>
      </div>
    </div>
  </div>
  <script>
    const selections = {};
    const total = ${sections.length};
    const PLAYBACK_RATE = 2.0;
    const sectionData = ${JSON.stringify(sections.map(s => ({
      name: s.name,
      timestamp: s.timestamp,
      context: s.context,
      emotion: s.emotion,
      results: s.results
    })))};
    const catMap = {
      'R': 'R', 'REDDIT': 'R',
      'T': 'T', 'TENOR': 'T',
      'G': 'G', 'GIPHY': 'G',
      'I': 'I', 'IMGFLIP': 'I', 'TEMPLATE': 'I',
    };
    function selectResult(section, cat, item, el) {
      document.querySelectorAll('#section-' + section + ' .result-card').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
      document.getElementById('section-' + section).classList.add('selected');
      const url = el.dataset.url;
      const title = el.dataset.title;
      const source = el.dataset.source;
      const hasAudio = el.dataset.hasAudio === 'true';
      const preview = document.getElementById('preview-' + section);
      if (source === 'reddit' || url.endsWith('.mp4')) {
        preview.innerHTML = '<video src="' + url + '" muted loop autoplay playsinline style="max-width:100%;max-height:100%;"></video>';
      } else {
        preview.innerHTML = '<img src="' + url + '" alt="' + title + '">';
      }
      const entrance = document.getElementById('entrance-' + section).value;
      const exit = document.getElementById('exit-' + section).value;
      const duration = parseInt(document.getElementById('duration-' + section).value) || 45;
      selections[section] = {
        cat, item, url, title, source, hasAudio,
        name: sectionData[section - 1].name,
        timestamp: sectionData[section - 1].timestamp,
        emotion: sectionData[section - 1].emotion,
        entrance, exit, duration
      };
      updateProgress();
      toast('Section ' + section + ': ' + cat + '-' + item + ' ✓' + (hasAudio ? ' 🔊' : ''));
    }
    function applyQuickInput() {
      const val = document.getElementById('quickInput').value;
      const parts = val.split(',').map(s => s.trim()).filter(s => s);
      let applied = 0;
      for (const part of parts) {
        const match = part.match(/(\\d+)-(\\w+)-(\\d+)/i);
        if (match) {
          const [_, sec, catCode, num] = match;
          const section = parseInt(sec);
          const item = parseInt(num);
          const cat = catMap[catCode.toUpperCase()];
          if (cat) {
            const card = document.querySelector(
              '.result-card[data-section="' + section + '"][data-cat="' + cat + '"][data-item="' + item + '"]'
            );
            if (card) {
              selectResult(section, cat, item, card);
              applied++;
            }
          }
        }
      }
      toast('Applied ' + applied + ' selections');
    }
    function clearAll() {
      Object.keys(selections).forEach(k => delete selections[k]);
      document.querySelectorAll('.result-card').forEach(c => c.classList.remove('selected'));
      document.querySelectorAll('.search-section').forEach(s => s.classList.remove('selected'));
      document.querySelectorAll('.sel-preview').forEach(el => {
        el.innerHTML = '<div class="empty-preview">Click to select</div>';
      });
      updateProgress();
      toast('Cleared all');
    }
    function updateProgress() {
      const count = Object.keys(selections).length;
      document.getElementById('progressCount').textContent = count + '/' + total;
      document.querySelectorAll('.progress-dot').forEach(d => {
        d.classList.toggle('done', !!selections[d.dataset.section]);
      });
    }
    function generateRemotionCode() {
      const sorted = Object.entries(selections).sort(([a], [b]) => parseInt(a) - parseInt(b));
      return sorted.map(([sec, s]) => {
        s.entrance = document.getElementById('entrance-' + sec).value;
        s.exit = document.getElementById('exit-' + sec).value;
        s.duration = parseInt(document.getElementById('duration-' + sec).value) || 45;
        const isVideo = s.source === 'reddit' || s.url.endsWith('.mp4');
        const imagePath = isVideo ? s.url : s.url;
        return \`{/* \${sec}. \${s.name} (\${s.timestamp}s) - \${s.emotion} \${s.hasAudio ? '🔊' : ''} */}
<AnimatedMemeOverlay
  \${isVideo ? 'videoSrc' : 'imagePath'}="\${imagePath}"
  timestamp={\${s.timestamp}}
  durationInFrames={\${s.duration}}
  position="center"
  scale={0.7}
  playbackRate={PLAYBACK_RATE}
  entrance="\${s.entrance}"
  exit="\${s.exit}"
/>\`;
      }).join('\\n\\n');
    }
    function showExportModal() {
      const count = Object.keys(selections).length;
      if (count === 0) {
        toast('No selections to export', true);
        return;
      }
      const code = generateRemotionCode();
      document.getElementById('codeOutput').textContent = code;
      document.getElementById('exportModal').classList.add('show');
    }
    function closeModal() {
      document.getElementById('exportModal').classList.remove('show');
    }
    async function copyCode() {
      const code = generateRemotionCode();
      try {
        await navigator.clipboard.writeText(code);
        toast('Copied to clipboard!');
        closeModal();
      } catch (e) {
        toast('Failed to copy', true);
      }
    }
    function exportJSON() {
      const count = Object.keys(selections).length;
      if (count === 0) {
        toast('No selections to export', true);
        return;
      }
      const sorted = Object.entries(selections)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([sec, s]) => ({
          section: parseInt(sec),
          name: s.name,
          timestamp: s.timestamp,
          emotion: s.emotion,
          url: s.url,
          title: s.title,
          source: s.source,
          hasAudio: s.hasAudio,
          entrance: document.getElementById('entrance-' + sec).value,
          exit: document.getElementById('exit-' + sec).value,
          duration: parseInt(document.getElementById('duration-' + sec).value) || 45
        }));
      const output = {
        videoName: '${title}',
        playbackRate: PLAYBACK_RATE,
        selections: sorted,
        remotionCode: generateRemotionCode()
      };
      const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '${title.replace(/[^a-z0-9]/gi, '-')}-memes-' + Date.now() + '.json';
      a.click();
      URL.revokeObjectURL(url);
      toast('Exported ' + sorted.length + ' selections');
    }
    function toast(msg, isError = false) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.className = 'toast show' + (isError ? ' error' : '');
      setTimeout(() => t.classList.remove('show'), 2000);
    }
    document.getElementById('quickInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') applyQuickInput();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.getElementById('exportModal').classList.contains('show')) {
        copyCode();
      }
    });
    document.getElementById('exportModal').addEventListener('click', e => {
      if (e.target.id === 'exportModal') closeModal();
    });
  </script>
</body>
</html>`;
}

// ============================================
// MAIN
// ============================================
async function processConfig(configPath) {
  console.log('📂 Loading config:', configPath);
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const sections = [];
  const total = config.searches.length;

  for (let i = 0; i < total; i++) {
    const item = config.searches[i];
    console.log(`\n[${i + 1}/${total}]`);
    const results = await searchAllSources(item);
    sections.push({ ...item, results });
    await new Promise(r => setTimeout(r, 500));
  }

  return { sections, config };
}

async function main() {
  const args = process.argv.slice(2);

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🧠💀 MEME & IMAGE VALIDATOR v4 - BRAIN ROT EDITION          ║
║  Reddit Videos • 2024 Viral Memes • Maximum Chaos            ║
╚══════════════════════════════════════════════════════════════╝
`);

  if (args.includes('--config')) {
    const idx = args.indexOf('--config');
    const configPath = path.resolve(args[idx + 1]);

    const { sections, config } = await processConfig(configPath);

    const html = generateHTML(sections, config);
    const outputPath = path.join(process.cwd(), 'meme-validator-preview.html');
    fs.writeFileSync(outputPath, html);

    const redditCount = sections.reduce((a, s) => a + s.results.filter(r => r.source === 'reddit').length, 0);
    const totalCount = sections.reduce((a, s) => a + s.results.length, 0);

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  ✅ DONE!                                                    ║
╠══════════════════════════════════════════════════════════════╣
║  Output: ${outputPath.substring(0, 50).padEnd(50)}║
║  Sections: ${sections.length.toString().padEnd(48)}║
║  Total options: ${totalCount.toString().padEnd(43)}║
║  Reddit videos: ${redditCount.toString().padEnd(43)}║
╚══════════════════════════════════════════════════════════════╝
`);

    // Open in browser
    const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${openCmd} "${outputPath}"`);

  } else {
    console.log(`
Usage:
  node meme-validator-v4.js --config path/to/config.json

Config format:
{
  "videoName": "Hyperkalemia Ad",
  "searches": [
    {
      "name": "Hook - Flatline",
      "timestamp": 1.486,
      "context": "This man's heart is about to FLATLINE",
      "emotion": "PANIC",
      "suggestedMemes": ["coffin dance", "its joever"]
    }
  ]
}

Features:
  🔴 Reddit video memes (r/MemeVideos, r/shitposting, etc.)
  🎭 Tenor & Giphy GIFs
  📝 Imgflip templates
  🧠 2024-2025 brain rot meme database
  🔥 Updated search queries for viral content
  🎬 Ready-to-paste Remotion components
    `);
  }
}

main().catch(console.error);
