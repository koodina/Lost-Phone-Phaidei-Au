/* =====================================================================
   STORY FILE: everything the reader can find lives here.
   You never need to touch script.js to change the story.

   DATES: always "YYYY-MM-DD HH:MM" (24 h). The game turns them into
   "Today 07:06", "Yesterday", "Tue 19 Nov 2024 at 23:14" etc. by itself.
   HTML (<b>, <i>, <br>, <s>) is allowed in text.

   IDs: every item has a short id. The engine records what the reader has
   opened as  t:<thread>  n:<note>  e:<mail>  p:<photo>  m:<memo>
   v:<voicemail>  c:<calendar event>  s:<safari tab> / s:history.
   Items with  clue:true  count towards the "discovered" counter.

   PHOTOS: put your pictures in an  images/  folder next to index.html and
   give the photo  src:"images/whatever.jpg". Without src, `scene` draws a
   placeholder (see SCENES in script.js) with the optional `emoji` on top.
   ===================================================================== */
const STORY = {
  owner: "Phainon",
  start: "2026-11-21 07:51",
  speed: 1,
  battery: 12,
  signal: 1,
  network: "4G",
  passcode: "2691",
  passHint: "Hint : I just wanted to request that you witness era nova with me",
  passHintAfter: 1, // wrong tries before the hint shows under the dots
  hiddenPassword: ["hyacinth", "hyacinths"], // Photos › Hidden has its own password
  hiddenHint: "his favourite flowers",

  lockWallpaper: "images/forgetmenots.jpg",
  homeWallpaper: "images/forgetmenots.jpg", //
  wallpaper: ["#12308f", "#5b2bb8", "#d93a4a"],
  sound: true,
  ambience: true,
  showProgress: true,

  warning:
    "This story deals with sensitive topics. Please look after yourself while you read.",
  intro:
    "Saturday, 07:51. The beach at Aedes is almost empty. Half out of the sand by the lifeguard hut, a phone keeps lighting up, buzzing, lighting up again.<br><br>You pick it up.",

  /* ------------------------------------------------------------ people */
  contacts: {
    dei: {
      name: "Dei 🍯",
      full: "Mydeimos",
      fav: true,
      notes:
        "bday 7 jun<br>fav flowers: hyacinths<br>do NOT call him princess in public",
    },
    cas: { name: "Castorice", fav: true, notes: "purple fujo" },
    hya: { name: "Hyacine", fav: true },
    agl: { name: "Aglaea", fav: true },
    anx: { name: "Anaxa (prof)" },
    aven: { name: "Aven" },
    cip: { name: "Cipher 🍸" },
  },

  weather: {
    place: "Aedes",
    temp: 9,
    cond: "Overcast",
    hi: 12,
    lo: 6,
    note: "Cloudy all morning. Wind gusts up to 38 km/h near the coast.",
    hourly: [
      ["Now", "☁️", 9],
      ["09", "☁️", 9],
      ["10", "🌦️", 10],
      ["11", "🌦️", 11],
      ["12", "☁️", 12],
      ["13", "☁️", 12],
      ["14", "🌥️", 11],
    ],
  },

  /* ------------------------------------------------------------ lock screen (newest first) */
  lockNotifs: [
    {
      app: "messages",
      title: "Aglaea",
      text: "Call me. I woke up with a bad feeling and I can’t shake it…",
      time: "2026-11-21 07:38",
    },
    {
      app: "phone",
      title: "Missed Call",
      text: "Castorice",
      time: "2026-11-21 07:50",
    },
    {
      app: "phone",
      title: "Missed Calls",
      text: "Hyacine (2)",
      time: "2026-11-21 07:45",
    },
    {
      app: "messages",
      title: "Hyacine",
      text: "two years exactly today huh. call me",
      time: "2026-11-21 07:42",
      more: 2,
    },
  ],

  /* ------------------------------------------------------------ messages
             ["~","YYYY-MM-DD HH:MM"] divider · ["me",…] Phainon · ["them",…] the other person
             [contactId,…] who's talking in a group · 3rd item {photo:{scene,emoji,src}} sends a picture */
  threads: [
    {
      id: "dei",
      with: ["dei"],
      pinned: true,
      clue: true,
      receipt: "Delivered",
      draft: "I love you.",
      msgs: [
        ["~", "2023-12-02 16:20"],
        ["me", "mydeiii"],
        ["me", "look who I just met"],
        ["me", "", { photo: { src: "images/cat.jpg" } }],
        ["me", "it’s literally you"],
        ["me", "such a terrifying sight grrr"],
        ["them", "HKS"],
        ["them", "Leave the cat alone"],
        ["me", "so you admit it’s you"],
        ["them", "I admit nothing."],
        ["me", "it's so cute I could eat it"],
        ["them", "???"],
        ["them", "What is wrong with you"],
        ["them", "Stay away from it"],
        ["me", "nuh uh"],
        ["~", "2024-01-09 18:47"],
        ["them", "I’m outside your apartment."],
        ["them", "It’s cold"],
        ["me", "coming!!"],
        ["them", "You said that ten minutes ago HKS"],
        ["me", "i’m finding socks your highness, have patience"],
        ["~", "2024-02-03 08:12"],
        ["me", ":(( woke up alone"],
        ["me", "honeycakes omggg"],
        ["me", "omg you're the best dei"],
        ["them", "Eat them warm"],
        ["me", "already ate two cold"],
        ["them", "Unbelievable"],
        ["~", "2024-03-18 23:58"],
        ["me", "can i come over tonightt"],
        ["me", "i miss you"],
        ["them", "You saw me four hours ago"],
        ["me", "and?"],
        ["them", "When you talk like that it’s almost"],
        ["me", "almost what"],
        ["them", "Nothing. The door’s open."],
        ["~", "2024-04-21 16:12"],
        ["them", "", { photo: { src: "images/c_dog.jpg" } }],
        ["them", "The dog likes you more than me."],
        ["me", "everyone likes me more than you"],
        ["them", "HKS"],
        ["~", "2024-06-07 00:01"],
        ["me", "happy birthday princess"],
        ["them", "No"],
        ["me", "PRINCESS"],
        ["them", "HKS."],
        ["me", "i made you golden honeycakes"],
        ["me", "well i tried"],
        ["me", "idk if they're edible but hey they're golden ig"],
        ["me", "some charocal honeycakes too"],
        ["them", "Can't wait to try them"],
        ["them", "I'll teach you how to make them properly next time"],
        ["~", "2024-09-12 15:40"],
        ["me", "when do you finish class"],
        ["them", "5. Why."],
        ["me", "drinks w cas and hyacine!! i’ll wait outside your class"],
        ["them", "Okay"],
        ["~", "2024-10-15 21:03"],
        ["them", "The old library in Kremnos is reopening in the spring"],
        ["them", "You said you wanted to see it"],
        ["me", "you’d let me into your sacred library??"],
        ["them", "If you come, I’ll show you around"],
        ["me", "careful your highness that sounds like a date"],
        ["them", "Forget it"],
        ["me", "nooo i’m coming. i’m coming"],

        ["~", "2024-11-20 09:03"],
        ["them", "About yesterday"],
        ["them", "I shouldn’t have pushed"],
        ["me", "don’t. it’s not on you"],
        ["me", "I'm sorry"],
        [
          "me",
          "I’m sorry. I can’t do this",
          { edited: "i’m sorry. can I come over?" },
        ],

        ["~", "2024-11-21 20:14"],

        ["them", "Phainon"],
        ["them", "Can we talk"],
        ["them", "I know you didn’t mean what you said"],
        ["them", "You're scared. Of this. Whatever this is"],
        ["them", "It doesn’t have to be this way"],

        ["me", "I'll call give me a few minutes"],

        ["~", "2024-11-21 21:52"],
        ["them", "So that’s your answer."],
        ["them", "Very well."],

        ["~", "2025-03-14 19:30"],
        [
          "me",
          "went to hya’s today. ica sat by the door the whole time like she was waiting for you",
        ],
        ["~", "2025-06-07 00:03"],
        ["me", "happy birthday your highness. sorry. i know"],
        ["~", "2025-11-21 21:52"],
        ["me", "one year. hope kremnos is treating you well"],
        ["~", "2026-06-07 08:15"],
        ["me", "happy birthday"],
        ["~", "2026-11-21 02:10"],
        ["me", "two years."],
        ["me", "i’m sorry i never said it"],
        ["me", "you were never the problem"],
      ],
    },
    {
      id: "grp",
      name: "ica’s aunties 🐈",
      with: ["cas", "hya"],
      clue: true,
      msgs: [
        ["~", "2024-09-13 01:20"],
        ["hya", "", { photo: { src: "images/c_carry.jpg" } }],
        [
          "hya",
          "mydei carried him to the car because he “couldn’t feel his feet”",
        ],
        ["cas", "I have so many photos of this"],
        ["me", "i was INJURED"],
        ["hya", "you were drunk"],
        ["~", "2026-04-12 13:10"],
        ["hya", "who stole my umbrella"],
        ["me", "borrowed"],
        ["hya", "in FEBRUARY"],
        ["cas", "Phainon, you also have my book."],
        ["me", "I’m basically a library at this point"],
        ["~", "2026-09-12 19:05"],
        ["cas", "", { photo: { src: "images/c_cas_oven.jpg" } }],
        ["cas", "It’s rising!!"],
        ["me", "proud of you"],
        ["hya", "save me a slice"],
        ["~", "2026-09-26 22:40"],
        ["me", "update: i won trivia night! carried the whole team"],
        ["cas", "You were the whole team."],
        ["me", "and i CARRIED it"],
        ["hya", "proud of u ig 🙄"],
        ["me", "say it properly"],
        ["hya", "no"],
        ["~", "2026-10-24 15:30"],
        ["hya", "", { photo: { src: "images/c_hya_toys.jpg" } }],
        ["hya", "buying ica a toy she’ll ignore"],
        ["cas", "She’ll just sleep in the box"],
        ["~", "2026-10-31 19:02"],
        ["hya", "", { photo: { src: "images/ica.jpg" } }],
        ["hya", "I think she's mad at me"],
        ["me", "she wants me"],
        ["cas", "She looks so angry. I love her."],
        ["~", "2026-11-15 16:44"],
        ["me", "", { photo: { src: "images/c_attempt3.jpg" } }],
        ["me", "honeycakes attempt #3"],
        ["hya", "PHAINON"],
        ["cas", "Oh no"],
        ["me", "it’s abstract art you don't get it"],
        ["~", "2026-11-20 18:41"],
        ["me", "returned hya’s umbrella AND cas’s book"],
        ["me", "i’m a functioning adult now"],
        ["hya", "who are you and what have you done with phai"],
        ["cas", "Proud of you 🥹"],
      ],
    },
    {
      id: "cas",
      with: ["cas"],
      unread: 1,
      clue: true,
      msgs: [
        ["~", "2024-09-12 13:02"],
        ["them", "Are we still on for later?"],
        ["me", "5 at cipher’s!! I’m bringing mydei"],
        ["them", "Mydei? At a bar?"],
        ["me", "I can be very convincing what can I say"],
        ["~", "2024-09-12 21:52"],
        ["me", "he’s so pretty I might actually die"],
        ["me", "who allowed him to look so good with eyeliner"],
        ["them", "Please don’t die before the drinks"],
        ["~", "2024-11-19 22:41"],
        ["me", "cas I messed up"],
        ["me", "like really messed up"],
        ["them", "Phainon??"],
        ["them", "What happened?"],
        ["me", "I said something awful to mydei"],
        ["me", "worst is he didn't even get mad"],
        ["me", "it was going too well anyway. it was never going to last"],
        ["them", "Where are you?"],
        ["me", "walking"],
        ["them", "I’m coming. Send me your location"],
        ["~", "2024-11-20 16:18"],
        ["them", "Did you sleep at all?"],
        ["me", "a bit"],
        ["them", "Talk to him. You know he’d listen"],
        ["me", "that’s exactly the problem. he’d forgive me"],
        ["me", "he would understand, he always does"],
        ["me", "and then i’d just do it again"],
        ["them", "You don’t know that"],
        ["me", "I kind of do"],
        ["me", "I know he can't be okay with all of this"],
        ["me", "better end it now before it gets worse"],
        ["them", "Phai, that’s not fair. To him or to you."],
        ["me", "it’s fine. really"],
        ["me", "anyway how was your exam!!"],
        ["~", "2024-11-22 10:05"],
        ["them", "I called Aglaea. I’m sorry. I didn’t know what else to do."],
        ["me", "nah it’s ok. going to hers for a few days"],
        ["them", "Good. Text me when you get there?"],
        ["~", "2024-11-23 09:34"],
        ["me", "at aglaeas. thanks for checking on me cas"],
        ["them", "Of course"],
        [
          "them",
          "Please remember we can help you Phainon we're here. Mydei can be here too.",
        ],
        ["me", "I can't ask that of him"],
        ["me", "it's okay"],
        ["me", "this is for the best"],

        ["~", "2024-12-09 12:30"],
        ["them", "Haven’t seen you on campus in a while."],
        ["them", "Anaxa asked about you after class."],
        ["them", "He looked almost worried."],
        ["me", "anaxa?? worried?? impossible"],
        ["me", "i’m good! just catching up on sleep"],
        ["~", "2025-01-15 11:20"],
        ["them", "Hyacine told you?"],
        ["me", "yeah"],
        ["me", "it’s good for him honestly. kremnos is home"],
        ["them", "He’s not leaving because he wants to"],
        ["them", "He's not pleased with this and you know that"],
        ["me", "cas"],
        ["them", "Sorry. I’ll drop it."],
        ["~", "2025-10-03 18:44"],
        ["me", "drink tonight?"],
        ["them", "Yes! Cipher’s at 8?"],
        ["~", "2026-05-12 14:15"],
        [
          "them",
          "Saw you at the library today but you left before I could say hi",
        ],
        ["them", "Wanna get a coffee later ? We're catching up with tribbie"],
        ["me", "I have a deadline tomorrow"],
        ["me", "another time maybe"],
        ["~", "2026-11-08 20:15"],
        ["them", "You’ve been quiet this week. Everything okay?"],
        ["me", "yes!! just swamped"],
        ["me", "did you go to the cat cafe. i need pics"],
        ["them", "I did. Sending them. You’re sure you’re okay?"],
        ["me", "cas i am thriving"],
        ["~", "2026-11-18 19:02"],
        ["them", "Hya says you cancelled on her again"],
        ["me", "im soryy!!"],
        ["me", "making it up to everyone this weekend. promise"],
        [
          "them",
          "Dinner Sunday then? I’ll send an invite so you can’t forget!",
        ],
        ["me", "yes chef"],
        ["~", "2026-11-20 23:48"],
        ["me", "thank you for always checking on me cas"],
      ],
    },
    {
      id: "hya",
      with: ["hya"],
      unread: 3,
      clue: true,
      msgs: [
        ["~", "2024-08-04 14:22"],
        ["me", "your fat fuck is hissing at me"],
        ["them", "stop calling ica fat fuck"],
        ["them", "she’s full of love"],
        ["me", "full of food"],
        ["them", "i’ll ban you from my apartment"],
        ["them", "cat food’s on top of the fridge"],
        ["them", "feed her while i get there"],
        ["me", "i’m not going near her. mydei can do it"],
        ["them", "girl fuck you"],
        ["~", "2024-09-12 16:55"],
        ["me", "we still on for tonight??"],
        ["them", "yess!! you’re in for a surprise"],
        ["me", "i’m scared"],
        ["them", "you'll see"],
        ["~", "2024-09-12 18:31"],
        ["me", "hyacine what did you do to him"],
        ["them", "heh you know a little eyeliner here a little gloss there"],
        ["them", "he has such a pretty face honestly it was easy"],
        ["me", "hes so gorgeous I can't stand it"],
        ["me", "i'm going to die"],
        ["me", "oh my god hyacine"],
        ["me", "I need him so badly"],
        ["me", "would it be weird if i just picked him up and left"],
        ["them", "he will punch you"],
        ["me", "even better #tbh"],
        ["~", "2024-10-15 21:20"],
        ["me", "hya"],
        ["me", "he invited me to kremnos. to see his library in SPRING"],
        [
          "me",
          "that’s like. months from now. he’s making plans with me months from now",
        ],
        ["them", "that’s called a relationship babe"],
        ["me", "don’t say that word"],
        ["~", "2024-10-19 23:58"],
        ["them", "", { photo: { src: "images/c_bus_asleep.jpg" } }],
        ["them", "look at you two 🙄"],
        ["me", "delete that"],
        ["them", "no"],
        ["~", "2024-10-27 01:14"],
        ["me", "hya are you up"],
        ["them", "yeah what’s up?"],
        ["me", "mydei asked what we are"],
        ["me", "like. what we ARE are"],
        ["them", "and??"],
        ["me", "i made a joke"],
        ["them", "phainon."],
        ["me", "i know i know"],
        ["me", "if i say it then it’s real. and then it can be taken away"],
        ["them", "or you could just. not lose it"],
        ["me", "you don’t know that"],
        ["them", "you don't either, stop sabotaging yourself"],

        ["~", "2024-11-19 22:36"],
        ["me", "hyacine can you go check on mydei"],
        ["me", "i said something really bad"],
        ["them", "what did you do"],
        ["me", "told him he means nothing to me"],
        ["me", "i didn’t mean it. i just wanted to hurt him"],
        ["me", "make him hate me"],
        ["them", "PHAINON"],
        ["me", "i know"],
        ["me", "please just make sure he’s ok"],
        ["them", "omw. go home"],

        ["~", "2024-11-20 11:40"],
        ["them", "i saw him"],
        ["them", "he asked if YOU were ok"],
        ["me", "of course he did"],

        ["them", "you can still fix this"],
        [
          "me",
          "it’s better like this. he deserves someone who won’t do that to him",
        ],
        ["me", "I know he's not okay with this"],
        ["me", "he can't be okay with this"],
        ["me", "i know he longs for this to mean something "],
        ["me", "but i can't allow it to mean something hyacine i can't "],
        ["them", "stop deciding things for him"],
        ["them", "i’m under yours in 10. we’re going for a walk"],

        ["~", "2024-11-21 22:05"],
        ["me", "we called today"],
        ["me", "i couldn't face him so I said we could call"],
        ["me", "god hyacine I spat such rotten words at him"],
        ["me", "I'm so awful"],

        ["them", "you don't mean any of it"],
        ["them", "i'm calling you"],

        ["~", "2025-01-14 21:08"],

        ["them", "mydei’s leaving. end of the month. back to kremnos"],
        ["them", "he asked me not to tell you i’m telling you anyway"],
        ["me", "good for him. he deserves a fresh start"],
        ["them", "and you?"],
        ["me", "i’m fine hya! busy!"],

        ["~", "2025-05-18 21:08"],
        ["them", "phainon, this can't keep going, i know you're not okay"],
        ["them", "you need to talk to someone. please"],
        [
          "me",
          "i’m fine. really hyacine i'm serious. just been busy with grad stuff",
        ],

        ["them", "if you say so"],
        ["them", "coffee tomorrow w cas?"],
        ["them", "idc about any excuse. you're making it"],
        ["me", "i’ll be there!!"],

        ["~", "2026-09-21 12:47"],
        ["them", "mydei opened a bakery in kremnos"],
        ["them", "it’s called golden honeycake 😭"],
        ["me", "of course it is"],
        ["me", "that’s amazing. he always wanted that"],
        ["them", "are you ok?"],
        ["me", "hya i’m so happy for him!!"],
        ["me", "it was always a dream of his"],

        ["~", "2026-10-09 22:30"],
        ["me", "i put a screen time limit on safari"],
        ["me", "so i stop checking his bakery’s menu every hour like a freak"],
        ["them", "proud of you"],
        ["them", "wait what’s the code"],
        ["me", "…"],
        ["them", "it’s his birthday isn’t it"],
        ["me", "it’s a very secure date"],
        ["them", "PHAINON"],

        ["~", "2026-11-11 18:20"],
        ["them", "you cancelled on me AGAIN"],
        ["them", "are you sleeping ok?"],
        ["me", "i’m fine!! work is insane. next week i swear"],
        ["them", "you said that last week 🙄"],
        ["me", "and i meant it both times"],

        ["~", "2026-11-20 18:20"],
        ["me", "left your spare key in your mailbox btw"],
        ["them", "why?? keep it"],
        ["me", "i always forget i have it lol. visiting aglaea this weekend"],
        ["them", "omg finally. tell her hi from me"],
        ["~", "2026-11-20 23:52"],
        ["me", "thank you hyacinth, for everything"],
        ["~", "2026-11-21 07:42"],
        ["them", "phai?? what’s that about"],
        ["them", "are you ok?"],
        ["them", "two years exactly today huh. call me"],
      ],
    },
    {
      id: "aven",
      with: ["aven"],
      msgs: [
        ["~", "2024-11-25 14:02"],
        ["them", "are you coming to the group meeting"],
        ["them", "phainon the presentation is thursday"],
        ["~", "2024-11-27 22:40"],
        ["them", "", { photo: { src: "images/c_aven.jpg" } }],
        ["them", "this is us doing YOUR half btw"],
        ["~", "2024-12-04 09:15"],
        ["them", "hey. hyacine told me some stuff"],
        ["them", "sorry for being a dick about it. hope you’re ok"],
        ["~", "2024-12-12 18:30"],
        ["me", "no you were right to be mad. i owe you a drink"],
        ["~", "2025-03-07 17:02"],
        ["them", "you still owe me that drink"],
        ["me", "cipher’s friday?? my treat"],
        ["them", "deal"],
      ],
    },
    {
      id: "cip",
      with: ["cip"],
      msgs: [
        ["~", "2026-09-26 23:40"],
        ["them", "TEAM OF ONE."],
        ["them", "you’re banned from trivia"],
        ["me", "you can’t ban greatness"],
        ["~", "2026-11-19 20:10"],
        ["them", "your tab is at 47 btw"],
        ["them", "pay me or i’m telling aglaea"],
        ["me", "this weekend i promise!!"],
      ],
    },
    {
      id: "agl",
      with: ["agl"],
      clue: true,
      msgs: [
        ["~", "2024-10-02 16:58"],
        ["them", "What time does your train get in?"],
        ["me", "5:30!!"],
        ["them", "I’ll pick you up."],
        ["~", "2024-11-22 11:14"],
        ["them", "Castorice called me."],
        [
          "them",
          "Come home for a few days. You don’t have to explain anything.",
        ],
        ["me", "can i come tonight"],
        ["them", "The door is open."],
        ["~", "2026-09-04 09:30"],
        ["them", "It was good to have you. Come back before winter."],
        ["me", "i will!! promise"],
        ["~", "2026-10-14 10:02"],
        ["them", "When are you visiting? It’s been a while."],
        ["me", "sorry, lots going on"],
        ["me", "soon?"],
        ["them", "This house is always open to you."],

        ["~", "2026-11-21 07:38"],
        ["them", "Call me. I woke up with a bad feeling and I can’t shake it…"],
      ],
    },
  ],

  /* ------------------------------------------------------------ phone */
  calls: [
    { who: "cas", kind: "missed", time: "2026-11-21 07:50" },
    { who: "hya", kind: "missed", time: "2026-11-21 07:45" },
    { who: "hya", kind: "missed", time: "2026-11-21 07:43" },
    { who: "cas", kind: "in", time: "2026-11-08 20:40", len: "14 minutes" },
    { who: "agl", kind: "missed", time: "2026-10-14 09:58" },
    { who: "dei", kind: "out", time: "2024-11-21 20:31", len: "11 minutes" },
  ],
  voicemails: [
    {
      id: "vcas",
      who: "cas",
      time: "2026-11-21 07:50",
      len: "0:09",
      text: "Phainon, can you call me back? I just want to hear you’re okay. Please.",
    },
    {
      id: "v2",
      who: "dei",
      time: "2024-12-01 19:20",
      len: "0:14",
      clue: true,
      text: "Phainon, I’m not angry. Answer me once and I won’t ask again.",
    },
    {
      id: "vagl",
      who: "agl",
      time: "2024-11-22 11:02",
      len: "0:19",
      heard: true,
      text: "Phai, it’s Aglaea. Castorice called me. I’m not going to ask you anything. Come home for a few days.",
    },
    {
      id: "v1",
      who: "dei",
      time: "2024-11-22 00:47",
      len: "0:22",
      clue: true,
      text: "Phainon. I know I said very well. It isn't. Please call me. It doesn't have to come to this.",
    },
  ],

  /* ------------------------------------------------------------ deleted messages
             Messages › Filters › Recently Deleted. Gets a badge once `badgeAfter` is seen. */
  deletedMsgs: {
    badgeAfter: "v:v2",
    items: [
      {
        who: "dei",
        text: "I’m coming tomorrow",
        time: "2026-11-20 17:55",
        deleted: "2026-11-20 17:58",
      },
      {
        who: "dei",
        text: "would you give me a chance again",
        time: "2026-11-20 17:56",
        deleted: "2026-11-20 17:59",
      },
      {
        who: "hya",
        text: "hya can i come over tonight",
        time: "2026-11-20 19:40",
        deleted: "2026-11-20 19:41",
      },
      {
        who: "dei",
        text: "I miss you so badly",
        time: "2025-11-21 21:50",
        deleted: "2025-11-21 21:51",
      },
    ],
  },

  /* ------------------------------------------------------------ mail */
  mails: [
    {
      id: "parcel",
      from: "Okhema Post",
      time: "2026-11-20 20:15",
      unread: true,
      clue: true,
      subj: "Your parcel has been delivered",
      body: "Good news! Your parcel has been delivered.\n\nFrom: M, Kremnos\nLeft at: front door\nDelivered: Friday 20 November, 20:15\n\nTracking KR-2026-11-1847",
    },
    {
      id: "aed",
      from: "Amphoreus Rail",
      time: "2026-11-20 18:07",
      clue: true,
      subj: "Your e-ticket · Okhema Central → Aedes",
      body: "Booking AED-2093\n\nFriday 20 November 2026\nOkhema Central 21:40 → Aedes 22:44\nSingle · 1 adult · Coach 3\n\nShow this e-ticket on board.",
    },
    {
      id: "ord",
      from: "Golden Honeycake",
      time: "2026-11-20 18:04",
      clue: true,
      subj: "Your order has been cancelled",
      body: "Hi,\n\nYour order #0038 (pickup Saturday 21 November, 12:00) has been cancelled.\n\nWe hope to see you another time.\n\nGolden Honeycake · Kremnos",
    },
    {
      id: "ref",
      from: "Amphoreus Rail",
      time: "2026-11-20 18:02",
      clue: true,
      subj: "Refund confirmed · KRM-4417",
      body: "Your booking KRM-4417 has been cancelled.\n\nOkhema Central 08:10 → Kremnos 11:52\nSaturday 21 November 2026\n\nA refund of €38.40 will reach your original payment method within 5 working days.",
    },
    {
      id: "hna",
      from: "Golden Honeycake",
      time: "2026-11-19 07:00",
      clue: true,
      subj: "this weekend at golden honeycake",
      body: "Morning from Kremnos.\n\nThis weekend:\n· Golden honeycakes (always)\n· Fig stew, Saturday lunch\n· Saturday 21st only: honey suncakes, the Aedes way\n\nDon’t ask about the suncakes.\n\nOpen 7–14. We sell out by 11.\n— M.\n\n\nYou’re receiving this because you signed up at goldenhoneycake.kr · Unsubscribe",
    },
    {
      id: "ship",
      from: "Okhema Post",
      time: "2026-11-18 11:30",
      subj: "A parcel is on its way to you",
      body: "A parcel is on its way.\n\nFrom: M, Kremnos\nEstimated delivery: Friday 20 November\n\nTracking KR-2026-11-1847",
    },
    {
      id: "krm",
      from: "Amphoreus Rail",
      time: "2026-11-14 09:12",
      clue: true,
      subj: "Booking confirmed · Okhema Central → Kremnos",
      body: "Thanks for booking with Amphoreus Rail.\n\nBooking KRM-4417\nSaturday 21 November 2026\nOkhema Central 08:10 → Kremnos 11:52\nOpen return · 1 adult · Coach 6, seat 41",
    },
    {
      id: "gym",
      from: "Okhema Fitness",
      time: "2026-11-13 10:31",
      subj: "Your membership has been cancelled",
      body: "Hi Phainon,\n\nYour membership has been cancelled as requested. You can still use the gym until the end of the month.\n\nThe Okhema Fitness team",
    },
    {
      id: "trv",
      from: "Cipher’s",
      time: "2026-09-27 10:00",
      subj: "Trivia night results 🏆",
      body: "Congrats to team “Deliverer” (1 member??) for taking first place on Friday.\n\nYour prize: one free round. Please bring friends next time.",
    },
    {
      id: "shs",
      from: "Student Health Service",
      time: "2024-11-28 08:02",
      clue: true,
      subj: "Appointment cancelled",
      body: "Your appointment on Thursday 28 November at 10:30 has been cancelled at your request.\n\nTo rebook, reply to this email or call reception.",
    },
    {
      id: "anx",
      from: "Anaxa (prof)",
      time: "2024-11-27 17:44",
      clue: true,
      subj: "Re: essay",
      body: "Phainon,\n\nThree missed seminars, and an essay with only your name on it. Even your worst work usually has more words than that.\n\nDeadline moved to the 12th. Don’t make me regret it.\n\nThe health centre has slots on Thursday, so I booked you one. You can cancel it, I’ll know if you do.\n\n— A.",
    },
  ],

  /* ------------------------------------------------------------ notes */
  notes: [
    {
      id: "dei",
      title: "for mydei",
      time: "2026-11-21 02:47",
      clue: true,
      lock: [
        "golden honeycakes",
        "golden honeycake",
        "honeycakes",
        "honeycake",
      ],
      hint: "his favourite food",
      body: `dei,
  
  I’ve started this like nine times so i’m just going to write it.
  
  the fight wasn’t about the word. you asked what we were and i made a joke, because if i said it out loud it was real, and every real thing i’ve had ends up taken away. so i broke it myself first. at least then it was my fault. sounds stupid when i write it out but at the time it made sense in my head.
  
  you didn’t do anything wrong. you left breakfast on the counter, you waited outside in the cold, you told me to come see your library like it was nothing. you just let me exist by your side like I was allowed to. I kept waiting for you to figure out I wasn’t worth all that. kept waiting for the day you'd realize this wasn't what you wanted and leave. you never did, so I made it happen for you.
  
  I got your newsletter. honey suncakes on saturday? hah.. the aedes elysiae way. that’s my mom’s recipe you had me give you for my birthday. I read it standing in the kitchen and I had to sit down. I bought a ticket and ordered the suncakes. I cancelled them. I ordered them again. I've cancelled them three times now, which is embarrassing even for me. i hope they don't suspend my account for bot behavior
  
  tonight I cancelled the ticket too. not because of you. I'm a coward. I'm scared to see the life you've built for yourself without me. I don't want to see it. no that’s not true, I want to see all of it. of course i'm happy for you. I just can't stand the possibility there's not a place for me in it. that you don't want me in it. and if I don’t go I never have to find out.
  
  hyacine says I decide things for people. she’s right. she’s always right it’s annoying.
  
  I came to aedes instead. I don’t really know why. It’s where I go when I can’t think. the place where it all started. where I lost everything. where I gained something for the first time again. the sea is really loud tonight. you’d hate it.
  
  I don’t know what I’m doing tomorrow. I don’t know if I’ll send this.
  
  but if I don’t say it now I never will. i love you. I had it the whole time I just didn’t know how to keep it. I don’t know if I can. but I want to try. I want to be with you. I want and want and want and I'm bad at wanting.
  
  
  — Phainon`,
    },
    {
      id: "todo",
      title: "this week",
      time: "2026-11-20 23:41",
      clue: true,
      check: [
        [1, "cancel gym"],
        [1, "return hya’s umbrella"],
        [1, "return cas’s book"],
        [1, "give hya her key back"],
        [1, "reply to cas about sunday"],
        [1, "pay tab at cipher’s"],
        [0, "train snacks"],
      ],
      body: "<s>kremnos 08:10, platform 4</s>",
    },
    {
      id: "groc",
      title: "groceries",
      time: "2026-11-17 11:02",
      clue: true,
      check: [
        [1, "eggs"],
        [1, "flour"],
        [1, "butter"],
        [1, "honey (the GOOD one)"],
        [0, "milk"],
      ],
      body: "golden honeycakes attempt #4. if this one fails i’m buying them",
    },
    {
      id: "cas",
      title: "cas bday ideas",
      time: "2026-09-02 14:30",
      body: "– the blue scarf she looked at for 10 min and didn’t buy\n– last tome of that one red blue yaoi she reads\n– the grapefruit parfum she likes",
    },
    {
      id: "wifi",
      title: "aglaea wifi",
      time: "2026-09-03 10:15",
      body: "network: Okhema-Gold\n password: she changed it again?? ask her",
    },
    {
      id: "bday",
      title: "dei bday 7/6",
      time: "2024-06-01 21:10",
      clue: true,
      check: [
        [1, "hyacinths (his favourite!! NOT roses, he’ll judge)"],
        [0, "golden honeycakes (practise first)"],
        [0, "go to the cat cafe he likes"],
      ],
      body: "<strong>DON'T</strong> walk near a kfc. bad luck.",
    },
  ],

  /* ------------------------------------------------------------ photos (your images live in images/) */
  photos: [
    {
      id: "hyac",
      time: "2024-06-07 10:12",
      src: "images/p_hyacinths.jpg",
      place: "Okhema",
      caption: "his favourites",
      clue: true,
    },
    {
      id: "cof",
      time: "2024-08-13 10:12",
      src: "images/fallencof.jpg",
      place: "Okhema",
      caption: "",
      clue: true,
    },
    {
      id: "cinth",
      time: "2025-04-23 22:40",
      src: "images/hyac.jpg",
      place: "Okhema",
      caption: "grad fucking us over",
    },
    {
      id: "cip",
      time: "2025-07-03 22:40",
      src: "images/p_cipher.jpg",
      place: "Cipher’s, Okhema",
      caption: "",
    },
    {
      id: "casd",
      time: "2025-10-11 20:10",
      src: "images/p_cas_dinner.jpg",
      place: "Castorice’s, Okhema",
      caption: "cas’s sunday dinners",
    },
    {
      id: "agld",
      time: "2026-09-03 20:30",
      src: "images/p_aglaea_dinner.jpg",
      place: "Aedes",
      caption: "aglaea made too much again",
    },
    {
      id: "anx",
      time: "2024-10-20 10:15",
      src: "images/p_anaxa.jpg",
      place: "Okhema University",
      caption: "prof anaxa called me out after this",
    },
    {
      id: "att4",
      time: "2026-11-17 16:40",
      src: "images/p_attempt4.jpg",
      place: "Okhema",
      caption: "attempt #4. edible if you don’t look",
      clue: true,
    },
    {
      id: "bus",
      time: "2026-11-17 07:04",
      src: "images/p_bus.jpg",
      place: "Okhema",
      caption: "7am bus",
    },
    {
      id: "train",
      time: "2026-11-20 21:52",
      src: "images/p_train.jpg",
      place: "Between Okhema and Aedes",
      caption: "",
      clue: true,
    },
    {
      id: "scat",
      time: "2026-11-20 22:05",
      src: "images/p_station_cat.jpg",
      place: "Aedes station",
      caption: "he came up to me and sat on my lap after. i think he likes me",
    },
    {
      id: "bch1",
      time: "2026-11-20 22:31",
      src: "images/p_beach1.jpg",
      place: "Aedes Beach",
      caption: "",
      clue: true,
    },
  ],
  hidden: [
    {
      id: "h1",
      time: "2023-12-14 19:20",
      src: "images/h_cookies.jpg",
      place: "Mydei’s flat",
      caption: "i was not allowed to help",
      clue: true,
    },
    {
      id: "h2",
      time: "2024-02-03 08:20",
      src: "images/h_breakfast.jpg",
      place: "Okhema",
      caption: "breakfast on the counter",
    },
    {
      id: "h3",
      time: "2024-03-02 17:45",
      src: "images/h_groceries.jpg",
      place: "Okhema",
      caption: "he's cooking again",
    },
    {
      id: "h4",
      time: "2024-04-14 15:10",
      src: "images/h_hair.jpg",
      place: "Okhema",
      caption: "",
      clue: true,
    },
    {
      id: "h5",
      time: "2024-05-21 19:02",
      src: "images/h_gym.jpg",
      place: "Okhema Fitness",
      caption: "23/22 in his favor, i'm winnig the next",
    },
    {
      id: "h6",
      time: "2024-08-04 16:40",
      src: "images/h_ica_mydei.jpg",
      place: "Hyacine’s, Okhema",
      caption: "ica likes him better ",
    },
    {
      id: "h7",
      time: "2024-08-11 23:15",
      src: "images/mydeionbed.jpg",
      place: "Okhema",
      caption: "he fell asleep on my bed",
    },
    {
      id: "h8",
      time: "2024-09-22 17:30",
      src: "images/onshoulders.jpg",
      place: "Okhema",
      caption:
        "i gave him a ride on my shoulders. he said it was stupid but he liked it",
      clue: true,
    },
    {
      id: "h9",
      time: "2024-09-28 17:30",
      src: "images/h_heart.jpg",
      place: "Aedes Beach",
      caption:
        "i made a heart in the sand for him. he said it was stupid but he liked it",
      clue: true,
    },
  ],

  deleted: [
    {
      id: "d1",
      time: "2026-11-20 18:03",
      scene: "shot",
      shot: [
        "Amphoreus Rail · e-ticket",
        "<b>KRM-4417</b>",
        "Okhema Central → Kremnos",
        "Sat 21 Nov · 08:10",
        "Coach 6 · Seat 41",
        "▚▞▚▞▚▞▚▞",
      ],
      place: "Screenshot",
      caption: "",
      clue: true,
    },
  ],
  memoryTitle: "Together · 2024", // Photos › For You memory, appears once Hidden is opened

  /* ------------------------------------------------------------ calendar */
  calendar: [
    {
      id: "k1",
      title: "Kremnos 🚆",
      start: "2026-11-21 08:10",
      end: "2026-11-21 11:52",
      where: "Okhema Central · platform 4",
      notes: "bring the honeycakes",
      clue: true,
    },
    {
      id: "din",
      title: "Dinner · Castorice",
      start: "2026-11-22 19:30",
      end: "2026-11-22 21:30",
      where: "Castorice’s",
      notes: "Invitation from Castorice · you accepted on Fri 20 Nov at 23:48",
    },
    {
      id: "chk",
      title: "coffee w hya (for real this time)",
      start: "2026-11-25 18:00",
      end: "2026-11-25 19:00",
      notes: "moved from 11 Nov\nmoved from 18 Nov",
    },
    {
      id: "bday",
      title: "Dei’s birthday",
      start: "2024-06-07",
      allDay: true,
      repeat: "yearly",
      notes: "",
      clue: true,
    },
  ],

  /* ------------------------------------------------------------ voice memos */
  memos: [
    {
      id: "m4",
      title: "order",
      time: "2026-11-19 23:10",
      len: "0:11",
      bed: "room",
      clue: true,
      text: "Hi, can I get six golden honeycakes. (pause) Six is a lot. Four. Can I get four— (sighs) Okay.",
    },

    {
      id: "m3",
      title: "song??",
      time: "2026-08-02 01:14",
      len: "0:18",
      bed: "room",
      text: "(humming, guitar slightly out of tune) ...Yeah this shit is hard.",
    },
    {
      id: "m2",
      title: "anaxa lecture 4",
      time: "2024-11-12 10:02",
      len: "52:10",
      bed: "room",
      text: "…and if anyone cites that textbook again I will personally fail the entire row. (laughter) Phainon, stop laughing. You’re the worst offender.",
    },
    {
      id: "m1",
      title: "dei’s birthday 🎂",
      time: "2024-06-07 20:52",
      len: "0:54",
      bed: "kitchen",
      clue: true,
      text: "Phainon: Say it. Mydei: No. Phainon: Say they’re good. Mydei: They’re… edible. Phainon : Your highness, that’s the nicest thing you’ve ever said to me. Mydei: Turn that off, HKS. (Phainon laughing) Mydei: …Phainon. Phainon: Hm? Mydei: Nothing. Turn it off.",
    },
  ],

  /* ------------------------------------------------------------ safari (behind a Screen Time limit) */
  safari: {
    code: "0607",
    hint: "Hyacine would know.",
    tabs: [
      {
        id: "bakery",
        title: "Golden Honeycake · Kremnos",
        url: "goldenhoneycake.kr",
        clue: true,
        bg: "#f6efe3",
        html: `<div style="background:#f6efe3;color:#2b2118;min-height:100%;font-family:Georgia,'Times New Roman',serif;padding-bottom:30px">
          <div style="display:flex;justify-content:flex-end;padding:10px 16px 0;font-family:-apple-system,sans-serif;font-size:14px"><button onclick="acct()" style="color:#8a5a1c;font-weight:600">My orders</button></div>
          <div style="padding:16px 22px 20px;text-align:center;border-bottom:1px solid #e2d5bf">
            <div style="font-size:11px;letter-spacing:3px;color:#a0784a">KREMNOS · EST. 2026</div>
            <div style="font-size:34px;margin-top:8px">Golden Honeycake</div>
            <div style="font-size:14px;color:#7a6650;margin-top:4px;font-style:italic">the royal choice</div>
          </div>
          <div style="margin:18px 16px;padding:18px;border-radius:14px;background:#2b2118;color:#f6efe3">
            <div style="font-size:11px;letter-spacing:2px;color:#e8b04a;font-family:-apple-system,sans-serif">THIS SATURDAY ONLY · 21 NOVEMBER</div>
            <div style="font-size:24px;margin-top:6px">Honey suncakes, the Aedes Elysiae way</div>
          </div>
          <div style="padding:6px 22px">
            <div style="font-size:11px;letter-spacing:2px;color:#a0784a;font-family:-apple-system,sans-serif;margin-bottom:6px">EVERY DAY</div>
            <div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px dotted #cdbb9c"><span>Golden honeycakes</span><span>2.50</span></div>
            <div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px dotted #cdbb9c"><span>Rye &amp; fig loaf</span><span>6.00</span></div>
            <div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px dotted #cdbb9c"><span>Fig stew (Saturdays)</span><span>8.00</span></div>
            <div style="display:flex;justify-content:space-between;padding:9px 0 2px"><span>The Serious Bun</span><span>1.80</span></div>
            <div style="font-size:13px;color:#7a6650;font-style:italic">it has eyebrows. you’ll see.</div>
          </div>
          <div style="padding:22px 22px 0;font-size:15px;line-height:1.55">
            <div style="font-size:11px;letter-spacing:2px;color:#a0784a;font-family:-apple-system,sans-serif;margin-bottom:6px">A LIBRARY WITH NO LOCKS</div>
            There’s a shelf of books by the window, and a few tables where you can sit and read while you wait for your order. We have a selection of novels, poetry, and local history. Please don’t take the books home; they’re for everyone to enjoy.
          </div>
          <div style="padding:22px 22px 0;font-size:14px;color:#7a6650;font-family:-apple-system,sans-serif">Tue–Sun · 07:00–14:00 · closed Mondays<br>4 Gate Street, Kremnos</div>
        </div>`,
      },
      {
        id: "rail",
        title: "Manage booking · Amphoreus Rail",
        url: "amphoreus-rail.com/manage",
        bg: "#0d3b66",
        light: false,
        html: `<div style="background:#fff;color:#111;min-height:100%;font-family:-apple-system,sans-serif">
          <div style="background:#0d3b66;color:#fff;padding:16px 18px;font-weight:700;font-size:17px">Amphoreus Rail</div>
          <div style="padding:20px 18px">
            <div style="font-size:13px;color:#666">Booking reference</div>
            <div style="font-size:24px;font-weight:700;margin:2px 0 14px">KRM-4417</div>
            <div style="display:inline-block;background:#fde8e8;color:#b42318;font-weight:600;font-size:13px;padding:4px 10px;border-radius:20px">Cancelled</div>
            <div style="margin-top:18px;padding:14px;border:1px solid #e3e3e3;border-radius:12px;line-height:1.6"><b>Okhema Central 08:10 → Kremnos 11:52</b><br>Saturday 21 November 2026<br>Coach 6 · Seat 41</div>
            <div style="margin-top:14px;color:#444;font-size:14px">Refund requested on 20 Nov at 18:02.</div>
          </div>
        </div>`,
      },
      {
        id: "lib",
        title: "Kremnos Old Library",
        url: "kremnoslibrary.kr",
        bg: "#1f2a24",
        html: `<div style="background:#f3f1ea;color:#1f2a24;min-height:100%;font-family:Georgia,'Times New Roman',serif;padding-bottom:30px">
          <div style="background:#1f2a24;color:#e9e4d4;display:flex;justify-content:space-between;align-items:center;padding:14px 16px;font-family:-apple-system,sans-serif;font-size:14px"><b style="letter-spacing:1px">KREMNOS OLD LIBRARY</b><button onclick="libAcct()" style="color:#d9c07a;font-weight:600">My account</button></div>
          <div style="padding:26px 22px 8px">
            <div style="font-size:11px;letter-spacing:3px;color:#7d8a6f;font-family:-apple-system,sans-serif">REOPENED SPRING 2025</div>
            <div style="font-size:30px;margin-top:8px;line-height:1.15">We're open again</div>
            <div style="font-size:15px;color:#55604c;margin-top:12px;line-height:1.5">Borrow, read, and stay as long as you'd like! Kremnos library welcoms you. <br>Holds placed online are kept at the front desk for 7 days.</div>
          </div>
          <div style="padding:16px 22px 0;font-size:14px;color:#55604c;font-family:-apple-system,sans-serif">Tue–Sun · 09:00–19:00 · Mon 12:00–19:00<br>1 Archive Square, Kremnos</div>
        </div>`,
      },
    ],
    history: [
      {
        time: "2026-11-21 02:21",
        title: "Golden Honeycake · Kremnos",
        url: "goldenhoneycake.kr",
      },
      {
        time: "2026-11-20 18:04",
        title: "Golden Honeycake · My orders",
        url: "goldenhoneycake.kr/orders",
      },
      {
        time: "2026-11-20 18:01",
        title: "Manage booking · Amphoreus Rail",
        url: "amphoreus-rail.com/manage",
      },
      {
        time: "2026-11-19 02:42",
        title: "is it ok to visit your ex at work",
        url: "Search",
      },
      {
        time: "2026-11-19 02:13",
        title: "kremnos old library reopening",
        url: "Search",
      },
      {
        time: "2026-11-15 10:40",
        title: "golden honeycake recipe",
        url: "Search",
      },
      {
        time: "2026-11-14 09:05",
        title: "okhema to kremnos train saturday",
        url: "Search",
      },
      {
        time: "2026-11-09 01:30",
        title: "how to stop thinking about him",
        url: "Search",
      },
      {
        time: "2026-10-12 23:44",
        title: "A Home Far Away · Manga",
        url: "Comix.to",
      },
      {
        time: "2026-10-09 22:24",
        title: "how to stop ahoge from growing",
        url: "Search",
      },
      {
        time: "2026-09-21 12:50",
        title: "Golden Honeycake · Kremnos",
        url: "goldenhoneycake.kr",
      },
      {
        time: "2026-06-14 07:40",
        title: "how much to feed an obese cat",
        url: "Search",
      },
      {
        time: "2026-06-07 03:40",
        title: "flower delivery kremnos",
        url: "Search",
      },
      {
        time: "2025-05-13 13:45",
        title: "Han Jisung / Lee Minho fanfiction",
        url: "archiveofourown.org",
      },
      {
        time: "2025-04-28 16:20",
        title: "Gojo Satoru / Getou Suguru fanfiction",
        url: "archiveofourown.org",
      },
      {
        time: "2025-04-28 16:20",
        title: "is it rude to ask your professor for a 3rd extension",
        url: "Search",
      },
    ],
    // Library "My account": needs the card number from the library card in Wallet
    library: {
      card: "2410 1506",
      name: "Phainon",
      since: "2024-10-15",
      holds: [
        {
          title: "Kremnoan Language Basics",
          sub: "with audio · beginner",
          placed: "2026-11-14 09:25",
          status: "Ready for pickup",
          until: "Mon 23 Nov 2026",
        },
      ],
    },
    // "My orders": Forgot password → a code arrives in Mail
    account: {
      email: "phainon.deliverer@okhemamail.com",
      code: "482913",
      orders: [
        {
          id: "#0038",
          date: "2026-11-20 17:37",
          items: "6 × suncakes · pickup Sat 21 Nov, 12:00",
          status: "Cancelled 20 Nov, 18:04",
        },
        {
          id: "#0037",
          date: "2026-11-20 17:03",
          items: "6 × suncakes · pickup Sat 21 Nov, 12:00",
          status: "Cancelled 20 Nov, 17:13",
        },
        {
          id: "#0031",
          date: "2026-11-20 16:50",
          items: "6 × suncakes · pickup Sat 21 Nov, 12:00",
          status: "Cancelled 20 Nov, 16:59",
        },
        {
          id: "#0024",
          date: "2026-10-30 23:51",
          items: "6 × golden honeycakes · delivery",
          status: "Cancelled 31 Oct, 00:03",
        },
        {
          id: "#0017",
          date: "2026-10-07 22:10",
          items: "6 × golden honeycakes · delivery",
          status: "Cancelled 7 Oct, 22:14",
        },
        {
          id: "#0009",
          date: "2026-09-21 13:02",
          items: "6 × golden honeycakes · delivery",
          status: "Cancelled 21 Sep, 13:05",
        },
      ],
    },
  },

  /* ------------------------------------------------------------ other apps */
  wallet: [
    // a card with tx: shows "Latest Transactions" on its page (newest first). amount: "-" spent, "+" refund
    {
      id: "w0",
      title: "Okhema Bank",
      sub: "Debit · •••• 8203",
      color: ["#1c1c1e", "#3a3a3c"],
      clue: true,
      tx: [
        {
          time: "2026-11-20 22:51",
          who: "Aedes Station",
          what: "Vending machine",
          amount: "-2.50",
        },
        {
          time: "2026-11-20 21:33",
          who: "Amphoreus Rail",
          what: "Okhema Central → Aedes",
          amount: "-14.20",
        },
        {
          time: "2026-11-20 20:47",
          who: "Cipher’s",
          what: "Okhema · tab",
          amount: "-47.00",
        },
        {
          time: "2026-11-20 18:05",
          who: "Golden Honeycake",
          what: "Refund · order #0038",
          amount: "+15.00",
        },
        {
          time: "2026-11-20 18:02",
          who: "Amphoreus Rail",
          what: "Refund · KRM-4417",
          amount: "+38.40",
        },
        {
          time: "2026-11-20 17:37",
          who: "Golden Honeycake",
          what: "Order #0038 · Kremnos",
          amount: "-15.00",
        },
        {
          time: "2026-11-20 17:14",
          who: "Golden Honeycake",
          what: "Refund · order #0037",
          amount: "+15.00",
        },
        {
          time: "2026-11-20 17:03",
          who: "Golden Honeycake",
          what: "Order #0037 · Kremnos",
          amount: "-15.00",
        },
        {
          time: "2026-11-20 17:00",
          who: "Golden Honeycake",
          what: "Refund · order #0031",
          amount: "+15.00",
        },
        {
          time: "2026-11-20 16:50",
          who: "Golden Honeycake",
          what: "Order #0031 · Kremnos",
          amount: "-15.00",
        },
        {
          time: "2026-11-19 13:05",
          who: "Okhema University",
          what: "Canteen",
          amount: "-4.80",
        },
        {
          time: "2026-11-18 19:12",
          who: "Okhema Market",
          what: "Groceries",
          amount: "-23.14",
        },
        {
          time: "2026-11-14 09:12",
          who: "Amphoreus Rail",
          what: "Okhema Central → Kremnos",
          amount: "-38.40",
        },
        {
          time: "2026-11-13 10:31",
          who: "Okhema Fitness",
          what: "Membership · final month",
          amount: "-29.00",
        },
      ],
    },
    {
      id: "w1",
      title: "Amphoreus Rail",
      sub: "Okhema Central → Aedes",
      detail: "Fri 20 Nov · 21:40 → 22:44<br>Single · Coach 3<br><b>Used</b>",
      color: ["#0d3b66", "#1f5f99"],
    },
    {
      id: "w2",
      title: "Amphoreus Rail",
      sub: "Okhema Central → Kremnos",
      detail:
        "Sat 21 Nov · 08:10 → 11:52<br>Coach 6 · Seat 41<br><b>Cancelled</b>",
      color: ["#3b3f48", "#5a5f6a"],
      clue: true,
    },
    {
      id: "w3",
      title: "Golden Honeycake",
      sub: "Gift card · €30.00",
      detail:
        "From Aglaea:<br>“for when you go. — A”<br><br>Balance €30.00 · never used",
      color: ["#b07a2a", "#e3b04f"],
      clue: true,
    },
    {
      id: "w5",
      title: "Kremnos Old Library",
      sub: "Library card",
      detail:
        "Phainon<br>Member since 15 Oct 2024<br><br>Card no. <b>2410 1506</b>",
      color: ["#1f2a24", "#3d5245"],
      clue: true,
    },
    {
      id: "w4",
      title: "Cipher’s",
      sub: "Loyalty card · 10 / 10",
      detail: "Free drink unlocked 🍸<br>Tab: €0.00 · paid Fri 20 Nov",
      color: ["#2a1a3a", "#5a2a6a"],
    },
  ],
  reminders: [
    { text: "call hya back", due: "2026-11-21 09:00", done: false, clue: true },
    { text: "pay cipher’s tab", due: "2026-11-20 19:00", done: true },
    { text: "return cas’s book", due: "2026-11-20 18:00", done: true },
    {
      text: "water the plant (it’s alive??)",
      due: "2026-11-25 10:00",
      done: false,
    },
  ],
  // Find My · People. Positions are places on the map: okhema, okhemaStation, aedes, aedesBeach, kremnos, train1, train2
  findmy: [
    {
      who: "agl",
      steps: [
        ["start", "aedes", "Home · Aedes"],
        ["a2", "aedesWalk", "Walking · Aedes"],
        ["fin", "aedesBeach", "Aedes Beach"],
      ],
    },
  ],
  maps: [
    {
      icon: "🏖️",
      title: "Aedes Beach",
      sub: "Yesterday · walked from Aedes station",
    },
    {
      icon: "🍯",
      title: "Golden Honeycake",
      sub: "Bakery · 4 Gate Street, Kremnos",
    },
    { icon: "📚", title: "Kremnos Old Library", sub: "Library · Kremnos" },
    { icon: "🏠", title: "Aglaea", sub: "Home · Aedes · 5 min walk" },
  ],
  music: [
    {
      title: "mydei’s cooking playlist",
      sub: "Playlist · made by Dei · Dei added a song 2 years ago",
      color: ["#e8b04a", "#7a4a1f"],
    },
    {
      title: "trivia night hype",
      sub: "Playlist · Phainon",
      color: ["#3a5ba0", "#16213e"],
    },
  ],
  alarms: [
    { id: "train", time: "07:55", label: "train!", repeat: "Never", on: true },
    { id: "wk", time: "07:00", label: "Work", repeat: "Weekdays", on: false },
  ],

  /* ------------------------------------------------------------ live events */
  events: [
    {
      id: "cas-l",
      after: "start",
      delay: 7000,
      thread: "cas",
      msgs: [
        ["them", "Phainon??"],
        ["them", "You sent that text at midnight and aren’t answering"],
        ["them", "Are you okay?"],
      ],
    },
    {
      id: "cas-u",
      after: "unlock",
      delay: 3500, //
      thread: "cas",
      msgs: [["them", "Please answer me I just want to know you’re okay"]],
    },
    {
      id: "g1",
      after: "cas-u",
      delay: 45000,
      thread: "grp",
      msgs: [
        ["hya", "cas can you reach phainon?"],
        ["hya", "he’s not picking up my calls"],
        ["cas", "Me neither"],
        ["cas", "He sent me a weird text at midnight"],
        ["hya", "me too"],
        ["hya", "he didn't answer since"],
        ["hya", "i don’t like this"],
        ["cas", "I'm worried"],
      ],
    },
    {
      id: "g2",
      after: "g1",
      delay: 60000,
      thread: "grp",
      msgs: [
        ["hya", "okay okay"],
        ["hya", "i’m going to his place"],
        ["cas", "Text me when you’re there"],
      ],
    },
    { id: "alarm", at: "07:55", alarm: "train" },
    {
      id: "g3",
      after: "g2",
      delay: 30000,
      seen: "e:parcel",
      thread: "grp",
      msgs: [
        ["hya", "ok i used his spare key. he’s not here"],
        ["hya", "his bed’s made?? he never makes his bed"],
        ["hya", "there was a parcel on the doormat"],
        ["hya", "from kremnos"],
        ["cas", "From Mydei???"],
        ["hya", "i’m opening it"],
        ["hya", "", { photo: { src: "images/key.jpg" } }],
        ["hya", "a key??"],
        ["cas", "Oh"],

        ["cas", "Wait didn’t Phainon say he was going to Aglaea’s?"],
        ["hya", "yeah right he said he'd visit this weekend"],
        ["hya", "thought it'd be for tomorrow but maybe he went today"],
        ["cas", "I’m calling her."],
      ],
    },
    {
      id: "a1",
      after: "g3",
      delay: 40000,
      thread: "agl",
      msgs: [
        ["them", "Castorice just called me"],
        [
          "them",
          "You told Hyacine you were coming to visit. You never told me anything.",
        ],
        ["them", "Phainon, where are you?"],
      ],
    },
    {
      id: "cal",
      at: "08:10",
      notif: {
        app: "calendar",
        title: "Kremnos 🚆",
        text: "Now · Okhema Central · platform 4",
      },
    },
    {
      id: "a2",
      after: "a1",
      delay: 60000,
      thread: "agl",
      msgs: [
        ["them", "Find My says your phone is at the beach"],
        ["them", "I’m going down now"],
      ],
    },
    {
      id: "g4",
      after: "a2",
      delay: 25000,
      thread: "grp",
      msgs: [
        ["cas", "Aglaea says his phone is at Aedes beach"],
        ["hya", "the beach?? this early?? what's he up to"],
        ["hya", "why didn’t he just go to hers"],
        ["cas", "She says find my shows it’s been there since last night"],
        ["hya", "since LAST NIGHT??"],
        ["cas", "I have a bad feeling about this hyacine"],
        ["hya", "fuck me too"],
      ],
    },
    {
      id: "d1",
      after: "g3",
      delay: 30000,
      seen: "t:dei",
      any: "e:krm,e:ref,e:ord,e:aed,e:hna,s:bakery,s:orders,n:todo,n:groc,p:train,p:bch1,p:d1",
      thread: "grp",
      msgs: [
        ["hya", "I called mydei"],
        ["cas", "Hya…"],
        ["hya", "felt like I had to"],
        ["hya", "I don't know what to do"],
      ],
    },
    {
      id: "d2",
      after: "d1",
      delay: 6000,
      receipt: { thread: "dei", text: "Read" },
    },
    { id: "d3", after: "d2", delay: 3000, typing: { thread: "dei", ms: 7000 } },
    {
      id: "d4",
      after: "d3",
      delay: 9000,
      call: {
        who: "dei",
        ring: 30000,
        flag: "deicall",
        talk: [
          "(wind. waves.)",
          "Phainon?",
          "Phainon, where are you?",
          "Hyacine called me, I'm taking the next train to Aedes.",
          "HKS, say something. Please.",
          "…",
          "Who is this?",
          "Is he with you?",
          "Okay. Okay. Don’t go anywhere. I’m calling Aglaea.",
        ],
        vm: "Phainon. Hyacine called. I saw your messages. Call me back. Please. I’m getting on a train.",
      },
    },
    {
      id: "d5a",
      after: "d4",
      delay: 4000,
      flag: "deicall=answered",
      thread: "dei",
      msgs: [
        ["them", "I called aglaea she's on her way to the beach"],
        ["them", "Please stay there"],
      ],
    },
    {
      id: "d5b",
      after: "d4",
      delay: 4000,
      flag: "deicall=missed",
      thread: "dei",
      msgs: [
        ["them", "Pick up"],
        ["them", "Phainon please."],
        ["them", "I’m on a train I’ll be in Aedes by two"],
      ],
    },
    {
      id: "g5",
      after: "d4",
      delay: 26000,
      thread: "grp",
      msgs: [
        ["cas", "Mydei just called me, hes on a train to Aedes"],
        ["hya", "ok"],
        ["cas", "Does Phai still write everything in his notes app?"],
        ["hya", "i think so why"],
        ["cas", "I don’t know maybe there's something"],
      ],
    },
    {
      id: "g6",
      after: "g5",
      delay: 26000,
      thread: "grp",
      msgs: [
        ["hya", "next train is leaving in 10"],
        ["cas", "I'll meet you at the station"],
      ],
    },
    {
      id: "fin",
      after: "a2,g5",
      delay: 8000,
      seen: "n:dei",
      thread: "agl",
      finale: true,
      msgs: [
        ["them", "I’m on the beach"],
        ["them", "There’s someone by the lifeguard hut holding a phone"],
        ["them", "Is that you?"],
      ],
    },
  ],

  /* ------------------------------------------------------------ finale (open endings) */
  finale: {
    idle: 360000,
    lastText: "I’m on my way.",
    replies: {
      agl: {
        text: "This isn’t Phainon. I found his phone in the sand this morning. I’m the one by the lifeguard hut. I’ll wait for you.",
        end: "agl",
      },
      dei: {
        text: "This isn’t Phainon. I found his phone on the beach. I’m sorry. I’ll stay with it until someone comes.",
        end: "dei",
        answer: ["Stay there.", "Please."],
      },
    },
    endings: {
      agl: {
        title: "She sees you.",
        text: "A woman in a long coat is coming down the beach toward you. She isn’t running, but she’s walking too fast for the sand, and the wind keeps blowing her golden curls across her face. She doesn’t push them back.<br><br>She stops in front of you and looks at the phone in your hand, then at you. “Where was it?” You point at the lifeguard hut. She nods. She doesn’t ask you to leave, so you don’t. You walk the length of the beach together. She calls his name, and you check behind the beach huts and the rocks by the jetty, even though you’re not sure what you’re looking for.<br><br>Castorice and Hyacine get there before noon. Hyacine is still in her slippers, soaked through by now. Castorice hugs Aglaea for a long time without saying anything.<br><br>Just after two, a man with strawberry-blond hair comes down from the station almost running, coat open, and starts stopping strangers. Have you seen a guy, tall, white hair, he would’ve been here last night. Most people shake their heads.<br><br>You give the phone to Aglaea. She holds it with both hands.<br><br>You never find out how it ends. On the way back to the road, you catch yourself looking twice at everyone on the beach.",
      },
      dei: {
        title: "Read.",
        text: "For two years, every message this phone sent him stayed on Delivered. This morning it changed to Read.<br><br>He asked you to stay, so you stay. You sit on the steps of the lifeguard hut with the phone in your lap and watch the battery drop one percent at a time.<br><br>Aglaea finds you first. Then Castorice and Hyacine, out of breath, Hyacine in her slippers. Nobody asks who you are.<br><br>Mydei gets there a little after two. His apron is still on under his coat, flour on one sleeve. He doesn’t say hello to anyone. He just holds out his hand, and you put the phone in it.<br><br>“There’s a note,” you tell him. “For you.”<br><br> He doesn't stop to think as he unlocks the phone. You watch his face while he reads. He reads it twice. Once he laughs, short and surprised, and then he has to look at the sea for a while before he can finish.<br><br>Hyacine takes the key from the parcel out of her pocket and presses it into his hand. She doesn’t say anything.<br><br>Mydei closes his fingers around it. He puts the phone in his coat and turns to the others.<br><br>“He’s here somewhere,” he says. “We’re finding him.”",
      },
      dark: {
        title: "1%",
        text: "You don’t answer anyone. You sit there with the phone face-up on your knee while it buzzes, and goes quiet, and buzzes again.<br><br>At 1% the screen dims by itself.<br><br>It lights up one last time. <b>Dei 🍯:</b> I’m on my way<br><br>Then it goes black and stays black. You press the side button a few times anyway.<br><br>The wind has picked up. Further up the beach, a woman is calling a name. A minute later a second voice joins in, further off, then a third.<br><br>You put the dead phone in your pocket, get up, and walk toward them.",
      },
    },
  },
};
