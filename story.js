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
  passHint: "i just wanted to request that you witness era nova with me",
  passHintAfter: 1, // wrong tries before the hint shows under the dots
  hiddenPassword: ["hyacinth", "hyacinths"], // Photos › Hidden has its own password
  hiddenHint: "his favourite flowers",
  // lock screen: "library" draws a library; or use an image, e.g. "images/lock.jpg"
  lockWallpaper: "images/lock_library.jpg",
  homeWallpaper: "images/lock_library.jpg", // "library" (drawn), an image path, or "gradient"
  wallpaper: ["#12308f", "#5b2bb8", "#d93a4a"],
  sound: true,
  ambience: true,
  showProgress: true,

  warning:
    "This story deals with suicide, depression and grief. Please look after yourself while you read, and stop whenever you need to.",
  resources:
    "If you or someone near you is struggling: France 3114 (24/7) · UK &amp; Ireland Samaritans 116 123 · US call or text 988 · elsewhere: findahelpline.com",
  intro:
    "Saturday, 07:51. The beach at Aedes is almost empty. Half out of the sand by the lifeguard hut, a phone keeps lighting up, buzzing, lighting up again.<br><br>You pick it up.",

  /* ------------------------------------------------------------ people */
  contacts: {
    dei: { name: "Dei 🍯", full: "Mydeimos", fav: true, notes: "bday 7 jun<br>fav flowers: hyacinths<br>do NOT call him princess in public" },
    cas: { name: "Castorice", fav: true },
    hya: { name: "Hyacine", fav: true },
    agl: { name: "Aglaea", fav: true },
    anx: { name: "Anaxa (prof)" },
    aven: { name: "Aven" },
    cip: { name: "Cipher 🍸" },
  },

  weather: {
    place: "Aedes", temp: 9, cond: "Overcast", hi: 12, lo: 6,
    note: "Cloudy all morning. Wind gusts up to 38 km/h near the coast.",
    hourly: [["Now", "☁️", 9], ["09", "☁️", 9], ["10", "🌦️", 10], ["11", "🌦️", 11], ["12", "☁️", 12], ["13", "☁️", 12], ["14", "🌥️", 11]],
  },

  /* ------------------------------------------------------------ lock screen (newest first) */
  lockNotifs: [
    { app: "mail", title: "Aglaea", text: "<b>call me</b><br>Phai, I woke up with a bad feeling and I can’t shake it…", time: "2026-11-21 07:38" },
    { app: "messages", title: "Castorice", text: "Phai, please pick up.", time: "2026-11-21 07:06" },
    { app: "phone", title: "Missed Call", text: "Castorice", time: "2026-11-21 07:05" },
    { app: "phone", title: "Missed Calls", text: "Hyacine (2)", time: "2026-11-21 06:41" },
    { app: "messages", title: "Hyacine", text: "two years exactly today huh. call me", time: "2026-11-21 06:16", more: 2 },
  ],

  /* ------------------------------------------------------------ messages
     ["~","YYYY-MM-DD HH:MM"] divider · ["me",…] Phainon · ["them",…] the other person
     [contactId,…] who's talking in a group · 3rd item {photo:{scene,emoji,src}} sends a picture */
  threads: [
    {
      id: "dei", with: ["dei"], pinned: true, clue: true, receipt: "Delivered", draft: "im sorry",
      msgs: [
        ["~", "2023-12-02 16:20"],
        ["me", "your highness"],
        ["me", "", { photo: { scene: "bun", emoji: "🍞" } }],
        ["me", "it’s literally you"],
        ["me", "look at the eyebrows"],
        ["them", "That’s the one I shaped this morning."],
        ["me", "so you admit it’s you"],
        ["them", "I admit nothing."],
        ["me", "i’m eating it"],
        ["them", "Don’t."],
        ["~", "2024-01-09 18:47"],
        ["them", "I’m outside."],
        ["them", "It’s cold."],
        ["me", "coming!!"],
        ["them", "You said that ten minutes ago, HKS."],
        ["me", "i’m finding socks your highness, have patience"],
        ["~", "2024-02-03 08:12"],
        ["them", "Morning class. Breakfast is on the counter."],
        ["me", "wait"],
        ["me", "GOLDEN HONEYCAKES??"],
        ["me", "you made these?? for me??"],
        ["them", "Eat them warm."],
        ["me", "already ate two cold"],
        ["them", "Unbelievable."],
        ["me", "say i’m your favourite person"],
        ["them", "Eat. Them. Warm."],
        ["~", "2024-03-18 23:58"],
        ["me", "can i come over"],
        ["me", "i miss you"],
        ["them", "You saw me four hours ago."],
        ["me", "and?"],
        ["them", "When you talk like that it’s almost"],
        ["me", "almost what"],
        ["them", "Nothing. The door’s open."],
        ["~", "2024-04-21 16:12"],
        ["them", "", { photo: { src: "images/c_dog.jpg" } }],
        ["them", "The dog likes you more than me."],
        ["me", "everyone likes me more than you"],
        ["them", "HKS."],
        ["~", "2024-06-07 00:01"],
        ["me", "happy birthday princess 👑"],
        ["them", "No."],
        ["me", "PRINCESS"],
        ["them", "HKS."],
        ["me", "i made you golden honeycakes. they’re bad. you have to eat them anyway"],
        ["them", "…What time."],
        ["~", "2024-09-12 15:40"],
        ["me", "when do you finish class"],
        ["them", "5. Why."],
        ["me", "drinks w cas and hya!! i’ll wait outside your class"],
        ["them", "Fine."],
        ["them", "Hyacine says she’s doing my face. I didn’t agree to that."],
        ["me", "you kind of did"],
        ["~", "2024-10-15 21:03"],
        ["them", "The old library in Kremnos is reopening in the spring."],
        ["them", "You said you wanted to see it."],
        ["me", "you’d let me into your sacred library??"],
        ["them", "If you come, I’ll show you around."],
        ["me", "careful your highness that sounds like a date"],
        ["them", "Forget it."],
        ["me", "nooo i’m coming. i’m coming"],
        ["~", "2024-11-20 09:03"],
        ["them", "About yesterday."],
        ["them", "I shouldn’t have pushed."],
        ["me", "don’t. it’s not on you"],
        ["me", "i’m sorry. i can’t do this", { edited: "i’m sorry. can i come over?" }],
        ["them", "Phainon."],
        ["them", "Talk to me."],
        ["them", "I know you didn’t mean what you said."],
        ["them", "It doesn’t have to be like this."],
        ["~", "2024-11-21 21:52"],
        ["them", "So that’s your answer."],
        ["them", "Very well."],
        ["~", "2025-03-14 19:30"],
        ["me", "went to hya’s today. ica sat by the door the whole time like she was waiting for you"],
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
      id: "grp", name: "ica’s aunties 🐈", with: ["cas", "hya"], clue: true,
      msgs: [
        ["~", "2024-09-13 01:20"],
        ["hya", "", { photo: { src: "images/c_carry.jpg" } }],
        ["hya", "mydei carried him to the car because he “couldn’t feel his feet”"],
        ["cas", "I have so many photos of this."],
        ["me", "i was INJURED"],
        ["hya", "you were drunk"],
        ["~", "2026-04-12 13:10"],
        ["hya", "who stole my umbrella"],
        ["me", "borrowed"],
        ["hya", "in FEBRUARY"],
        ["cas", "Phai, you also have my book."],
        ["me", "i’m basically a library at this point"],
        ["~", "2026-09-12 19:05"],
        ["cas", "", { photo: { src: "images/c_cas_oven.jpg" } }],
        ["cas", "It’s rising!!"],
        ["me", "proud of you"],
        ["hya", "save me a slice"],
        ["~", "2026-09-26 22:40"],
        ["me", "update: i won trivia night. alone. carried the whole team"],
        ["cas", "You were the whole team."],
        ["me", "and i CARRIED it"],
        ["hya", "proud of u ig 🙄"],
        ["me", "say it properly"],
        ["hya", "no"],
        ["~", "2026-10-24 15:30"],
        ["hya", "", { photo: { src: "images/c_hya_toys.jpg" } }],
        ["hya", "buying ica a toy she’ll ignore"],
        ["cas", "She’ll sleep in the box."],
        ["~", "2026-10-31 19:02"],
        ["hya", "", { photo: { src: "images/ica.jpg" } }],
        ["hya", "ica’s costume this year"],
        ["me", "SHE’S A PUMPKIN"],
        ["cas", "She looks so angry. I love her."],
        ["~", "2026-11-15 16:44"],
        ["me", "", { photo: { src: "images/c_attempt3.jpg" } }],
        ["me", "honeycakes attempt #3"],
        ["hya", "PHAINON"],
        ["cas", "Oh no."],
        ["me", "it’s abstract"],
        ["~", "2026-11-20 18:41"],
        ["me", "returned hya’s umbrella AND cas’s book"],
        ["me", "i’m a functioning adult now"],
        ["hya", "who are you and what have you done with phai"],
        ["cas", "Proud of you 🥹"],
      ],
    },
    {
      id: "cas", with: ["cas"], unread: 1, clue: true,
      msgs: [
        ["~", "2024-09-12 13:02"],
        ["them", "Are we still on for later?"],
        ["me", "5 at cipher’s!! i’m bringing mydei"],
        ["them", "Mydei? At a bar?"],
        ["me", "he said yes cas. HE SAID YES"],
        ["me", "he’s so pretty i might actually die"],
        ["them", "Please don’t die before the drinks."],
        ["~", "2024-11-19 22:41"],
        ["me", "cas i messed up"],
        ["me", "like really messed up"],
        ["them", "What happened?"],
        ["me", "i said something awful to mydei"],
        ["me", "he didn’t even get mad. he just looked at me"],
        ["me", "it was going too well anyway. it was never going to last"],
        ["them", "Where are you?"],
        ["me", "walking"],
        ["them", "I’m coming. Send me your location."],
        ["~", "2024-11-20 16:18"],
        ["them", "Did you sleep at all?"],
        ["me", "a bit"],
        ["them", "Talk to him. You know he’d listen."],
        ["me", "that’s the problem. he’d forgive me"],
        ["me", "and then i’d just do it again"],
        ["them", "You don’t know that."],
        ["me", "i kind of do"],
        ["me", "better to end it now than when it’s worse"],
        ["them", "Phai, that’s not fair. To him or to you."],
        ["me", "it’s fine. really"],
        ["me", "anyway how was your exam!!"],
        ["~", "2024-11-22 10:05"],
        ["them", "I called Aglaea. I’m sorry. I didn’t know what else to do."],
        ["me", "nah it’s ok. going to hers for a few days"],
        ["them", "Good. Text me when you get there?"],
        ["~", "2024-12-09 12:30"],
        ["them", "Haven’t seen you on campus in a while."],
        ["them", "Anaxa asked about you after class. He looked almost worried."],
        ["me", "anaxa?? worried?? impossible"],
        ["me", "i’m good! just catching up on sleep"],
        ["~", "2025-01-15 11:20"],
        ["them", "Hya told you?"],
        ["me", "yeah"],
        ["me", "it’s good for him honestly. kremnos is home"],
        ["them", "He’s not leaving because he wants to."],
        ["me", "cas"],
        ["them", "Sorry. I’ll drop it."],
        ["~", "2025-10-03 18:44"],
        ["me", "drink tonight?"],
        ["them", "Yes! Cipher’s at 8?"],
        ["~", "2026-11-08 20:15"],
        ["them", "You’ve been quiet this week. Everything okay?"],
        ["me", "yes!! just swamped"],
        ["me", "did you go to the cat cafe. i need pics"],
        ["them", "I did. Sending them. You’re sure you’re okay?"],
        ["me", "cas i am thriving"],
        ["~", "2026-11-18 19:02"],
        ["them", "Hya says you cancelled on her again."],
        ["me", "i KNOW i’m the worst"],
        ["me", "making it up to everyone this weekend. promise"],
        ["them", "Dinner Sunday then. I’ll send an invite so you can’t forget."],
        ["me", "yes chef"],
        ["~", "2026-11-20 23:48"],
        ["me", "thank you for always checking on me cas"],
        ["~", "2026-11-21 07:06"],
        ["them", "Phai, please pick up."],
      ],
    },
    {
      id: "hya", with: ["hya"], unread: 3, clue: true,
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
        ["~", "2024-09-12 18:31"],
        ["me", "hyacine what did you do to him"],
        ["them", "heh. a little eyeliner. a little gloss"],
        ["them", "he has such a pretty face honestly it was easy"],
        ["me", "i can’t look at him directly"],
        ["me", "would it be weird if i just picked him up and left"],
        ["them", "he will punch you"],
        ["me", "worth it"],
        ["~", "2024-10-15 21:20"],
        ["me", "hya"],
        ["me", "he invited me to kremnos. to see his library. in SPRING"],
        ["me", "that’s like. months from now. he’s making plans with me months from now"],
        ["them", "that’s called a relationship babe"],
        ["me", "don’t say that word"],
        ["~", "2024-10-19 23:58"],
        ["them", "", { photo: { src: "images/c_bus_asleep.jpg" } }],
        ["them", "look at you two 🙄"],
        ["me", "delete that"],
        ["them", "no"],
        ["~", "2024-10-27 01:14"],
        ["me", "hya are you up"],
        ["them", "always. what’s wrong"],
        ["me", "mydei asked what we are"],
        ["me", "like. what we ARE are"],
        ["them", "and??"],
        ["me", "i made a joke"],
        ["them", "phai."],
        ["me", "i know i know"],
        ["me", "if i say it then it’s real. and then it can be taken away"],
        ["them", "or you could just. not lose it"],
        ["me", "you don’t know that"],
        ["~", "2024-11-19 22:36"],
        ["me", "hya can you go check on mydei"],
        ["me", "i said something really bad"],
        ["them", "what did you do"],
        ["me", "told him he doesn’t mean anything to me"],
        ["them", "PHAINON"],
        ["me", "i know"],
        ["me", "please just make sure he’s ok"],
        ["them", "omw. go home"],
        ["~", "2024-11-20 11:40"],
        ["them", "i saw him"],
        ["them", "he asked if YOU were ok"],
        ["me", "of course he did"],
        ["them", "you can still fix this"],
        ["me", "it’s better like this. he deserves someone who won’t do that to him"],
        ["them", "stop deciding things for him"],
        ["them", "i’m under yours in 10. we’re going for a walk"],
        ["~", "2025-01-14 21:08"],
        ["them", "mydei’s leaving. end of the month. back to kremnos"],
        ["them", "he asked me not to tell you. i’m telling you anyway"],
        ["me", "good for him. he deserves a fresh start"],
        ["them", "and you?"],
        ["me", "i’m fine hya! busy!"],
        ["~", "2026-09-21 12:47"],
        ["them", "don’t be mad"],
        ["them", "mydei opened a bakery in kremnos"],
        ["them", "it’s called golden honeycake 😭"],
        ["me", "of course it is"],
        ["me", "that’s amazing. he always wanted that"],
        ["them", "are you ok?"],
        ["me", "hya i’m so happy for him!!"],
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
        ["me", "thank you hya. for everything"],
        ["~", "2026-11-21 06:14"],
        ["them", "phai?? what’s that about"],
        ["them", "are you ok?"],
        ["~", "2026-11-21 06:16"],
        ["them", "two years exactly today huh. call me"],
      ],
    },
    {
      id: "aven", with: ["aven"],
      msgs: [
        ["~", "2024-11-25 14:02"],
        ["them", "are you coming to the group meeting"],
        ["them", "phainon the presentation is thursday"],
        ["~", "2024-11-27 22:40"],
        ["them", "", { photo: { src: "images/c_aven.jpg" } }],
        ["them", "this is us doing YOUR half btw"],
        ["~", "2024-12-04 09:15"],
        ["them", "hey. cas told me some stuff"],
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
      id: "cip", with: ["cip"],
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
      id: "agl", with: ["agl"], clue: true,
      msgs: [
        ["~", "2024-10-02 16:58"],
        ["them", "What time does your train get in?"],
        ["me", "5:30!!"],
        ["them", "I’ll pick you up."],
        ["~", "2024-11-22 11:14"],
        ["them", "Castorice called me."],
        ["them", "Come home for a few days. You don’t have to explain anything."],
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
      ],
    },
  ],

  /* ------------------------------------------------------------ phone */
  calls: [
    { who: "cas", kind: "missed", time: "2026-11-21 07:05" },
    { who: "hya", kind: "missed", time: "2026-11-21 06:41" },
    { who: "hya", kind: "missed", time: "2026-11-21 06:20" },
    { who: "cas", kind: "in", time: "2026-11-08 20:40", len: "14 minutes" },
    { who: "agl", kind: "missed", time: "2026-10-14 09:58" },
    { who: "dei", kind: "out", time: "2024-11-21 21:30", len: "11 minutes" },
  ],
  voicemails: [
    { id: "vcas", who: "cas", time: "2026-11-21 07:05", len: "0:09", text: "Phai, it’s me. Can you call me back? I just want to hear you’re okay." },
    { id: "v2", who: "dei", time: "2024-12-01 19:20", len: "0:14", clue: true, text: "It’s me. I’m not angry. Answer me once and I won’t ask again." },
    { id: "vagl", who: "agl", time: "2024-11-22 11:02", len: "0:19", heard: true, text: "Phai, it’s Aglaea. Castorice called me. I’m not going to ask you anything. Come home for a few days." },
    { id: "v1", who: "dei", time: "2024-11-22 00:47", len: "0:22", clue: true, text: "Phainon. I said very well. It isn’t. …Call me back." },
  ],

  /* ------------------------------------------------------------ deleted messages
     Messages › Filters › Recently Deleted. Gets a badge once `badgeAfter` is seen. */
  deletedMsgs: {
    badgeAfter: "v:v2",
    items: [
      { who: "dei", text: "i’m coming tomorrow", time: "2026-11-20 17:55", deleted: "2026-11-20 17:58" },
      { who: "hya", text: "hya can i come over tonight", time: "2026-11-20 19:40", deleted: "2026-11-20 19:41" },
      { who: "dei", text: "hi your highness", time: "2025-11-21 21:50", deleted: "2025-11-21 21:51" },
    ],
  },

  /* ------------------------------------------------------------ mail */
  mails: [
    { id: "agl", from: "Aglaea", time: "2026-11-21 07:38", unread: true, subj: "call me",
      body: "Phai,\n\nI woke up with a bad feeling and I can’t shake it. You don’t have to say anything. Just call me, or send one word.\n\nThe house is yours. It always was.\n\n— A" },
    { id: "parcel", from: "Okhema Post", time: "2026-11-20 20:15", unread: true, clue: true, subj: "Your parcel has been delivered",
      body: "Good news! Your parcel has been delivered.\n\nFrom: M., Kremnos\nLeft at: front door\nDelivered: Friday 20 November, 20:15\n\nTracking KR-2026-11-1847" },
    { id: "aed", from: "Amphoreus Rail", time: "2026-11-20 18:07", clue: true, subj: "Your e-ticket · Okhema Central → Aedes",
      body: "Booking AED-2093\n\nFriday 20 November 2026\nOkhema Central 21:40 → Aedes 22:44\nSingle · 1 adult · Coach 3\n\nShow this e-ticket on board." },
    { id: "ord", from: "Golden Honeycake", time: "2026-11-20 18:04", clue: true, subj: "Your order has been cancelled",
      body: "Hi,\n\nYour order #0031 (pickup Saturday 21 November, 12:00) has been cancelled.\n\nWe hope to see you another time.\n\nGolden Honeycake · Kremnos" },
    { id: "ref", from: "Amphoreus Rail", time: "2026-11-20 18:02", clue: true, subj: "Refund confirmed · KRM-4417",
      body: "Your booking KRM-4417 has been cancelled.\n\nOkhema Central 08:10 → Kremnos 11:52\nSaturday 21 November 2026\n\nA refund of €38.40 will reach your original payment method within 5 working days." },
    { id: "hna", from: "Golden Honeycake", time: "2026-11-19 07:00", clue: true, subj: "this weekend at golden honeycake",
      body: "Morning from Kremnos.\n\nThis weekend:\n· Golden honeycakes (always)\n· Fig stew, Saturday lunch\n· Saturday 21st only: honey suncakes, the Aedes way\n\nDon’t ask about the suncakes.\n\nOpen 7–14. We sell out by 11.\n— M.\n\n\nYou’re receiving this because you signed up at goldenhoneycake.kr · Unsubscribe" },
    { id: "ship", from: "Okhema Post", time: "2026-11-18 11:30", subj: "A parcel is on its way to you",
      body: "A parcel is on its way.\n\nFrom: M., Kremnos\nEstimated delivery: Friday 20 November\n\nTracking KR-2026-11-1847" },
    { id: "krm", from: "Amphoreus Rail", time: "2026-11-14 09:12", clue: true, subj: "Booking confirmed · Okhema Central → Kremnos",
      body: "Thanks for booking with Amphoreus Rail.\n\nBooking KRM-4417\nSaturday 21 November 2026\nOkhema Central 08:10 → Kremnos 11:52\nOpen return · 1 adult · Coach 6, seat 41" },
    { id: "gym", from: "Okhema Fitness", time: "2026-11-13 10:31", subj: "Your membership has been cancelled",
      body: "Hi Phainon,\n\nYour membership has been cancelled as requested. You can still use the gym until the end of the month.\n\nThe Okhema Fitness team" },
    { id: "trv", from: "Cipher’s", time: "2026-09-27 10:00", subj: "Trivia night results 🏆",
      body: "Congrats to team “Greatest Works” (1 member??) for taking first place on Friday.\n\nYour prize: one free round. Please bring friends next time." },
    { id: "shs", from: "Student Health Service", time: "2024-11-28 08:02", clue: true, subj: "Appointment cancelled",
      body: "Your appointment on Thursday 28 November at 10:30 has been cancelled at your request.\n\nTo rebook, reply to this email or call reception." },
    { id: "anx", from: "Anaxa (prof)", time: "2024-11-27 17:44", clue: true, subj: "Re: essay",
      body: "Phainon,\n\nThree missed seminars, and an essay with only your name on it. Even your worst work usually has more words than that.\n\nDeadline moved to the 12th. Don’t make me regret it.\n\nThe health centre has slots on Thursday, so I booked you one. You can cancel it. I’ll know if you do.\n\n— A." },
  ],

  /* ------------------------------------------------------------ notes */
  notes: [
    { id: "dei", title: "for mydei", time: "2026-11-21 02:47", clue: true,
      lock: ["golden honeycakes", "golden honeycake", "honeycakes", "honeycake"], hint: "his favourite food",
      body: `dei,

i’ve started this like nine times so i’m just going to write it.

the fight wasn’t about the word. you asked what we were and i made a joke, because if i said it out loud it was real, and every real thing i’ve had ends up taken away. so i broke it myself first. at least then it was my fault.

you didn’t do anything wrong. you left breakfast on the counter, you waited outside in the cold, you told me to come see your library like it was nothing. i kept waiting for you to figure out i wasn’t worth all that. you never did, so i made it happen for you.

i got your newsletter. honey suncakes, saturday only, don’t ask. i know why. i bought a ticket. i ordered the honeycakes. i cancelled the honeycakes. i ordered them again. i’ve cancelled them four times now, which is embarrassing even for me.

tonight i cancelled the ticket too. not because of you. because part of me is still sure that if i get close to something good it’s gone the second i touch it.

i came to aedes instead. i don’t really know why. it’s where i go when i can’t think.

everyone thinks i’m fine. i’m really good at fine. cas believed it. hya never did. i should have called her back.

i don’t know what i’m doing tomorrow. i don’t know if i’ll send this.

but if i don’t say it now i never will. i love you. i had it the whole time.

eat them warm, your highness.

— phai` },
    { id: "todo", title: "this week", time: "2026-11-20 23:41", clue: true,
      check: [[1, "cancel gym"], [1, "return hya’s umbrella"], [1, "return cas’s book"], [1, "give hya her key back"], [1, "reply to cas about sunday"], [0, "train snacks"]],
      body: "<s>kremnos 08:10, platform 4</s>" },
    { id: "groc", title: "groceries", time: "2026-11-15 11:02", clue: true,
      check: [[1, "eggs"], [1, "flour"], [1, "butter"], [1, "honey (the GOOD one)"], [0, "milk"]],
      body: "golden honeycakes attempt #4. if this one fails i’m buying them" },
    { id: "cas", title: "cas bday ideas", time: "2026-09-02 14:30",
      body: "– the blue scarf she looked at for 10 min and didn’t buy\n– new book by the chapter nine guy\n– NOT flowers (she says they die too fast lol)" },
    { id: "wifi", title: "aglaea wifi", time: "2026-09-03 10:15", body: "network: Okhema-Gold\npassword: she changed it again. ask her" },
    { id: "read", title: "dei’s reading list", time: "2024-10-16 22:20",
      check: [[1, "the one with the lion on the cover"], [1, "the poetry one he says he doesn’t like (he does)"], [0, "kremnos history vol 1 (“it’s not boring” – it is)"], [0, "kremnos history vol 2"]],
      body: "for when he shows me the library" },
    { id: "bday", title: "dei bday 7/6", time: "2024-06-01 21:10", clue: true,
      check: [[1, "hyacinths (his favourite!! NOT roses, he’ll judge)"], [1, "golden honeycakes (practise first)"], [0, "don’t tell hya the flowers are named after her"]],
      body: "" },
    { id: "honey", title: "golden honeycakes (his)", time: "2024-02-03 09:01",
      body: "DO NOT tell him i wrote this down\n\n– honey, a lot. “more than that.”\n– he wouldn’t tell me the rest. said “come over and watch”" },
  ],

  /* ------------------------------------------------------------ photos (your images live in images/) */
  photos: [
    { id: "hyac", time: "2024-06-07 10:12", src: "images/p_hyacinths.jpg", place: "Okhema", caption: "his favourites", clue: true },
    { id: "cip", time: "2025-10-03 22:40", src: "images/p_cipher.jpg", place: "Cipher’s, Okhema", caption: "" },
    { id: "agld", time: "2026-09-03 20:30", src: "images/p_aglaea_dinner.jpg", place: "Aedes", caption: "aglaea made too much again" },
    { id: "lib7", time: "2026-09-21 12:55", scene: "shot", shot: ["goldenhoneycake.kremnos", "<b>Golden Honeycake</b>", "now open 🍯 the royal choice", "honeycakes · fig stew · rye", "♡ 214"], place: "Screenshot", caption: "", clue: true },
    { id: "casd", time: "2026-10-11 20:10", src: "images/p_cas_dinner.jpg", place: "Castorice’s, Okhema", caption: "cas’s sunday dinners" },
    { id: "anx", time: "2026-10-20 10:15", src: "images/p_anaxa.jpg", place: "Okhema University", caption: "anaxa caught me taking this" },
    { id: "ica", time: "2026-10-25 08:03", src: "images/ica.jpg", place: "Hyacine’s, Okhema", caption: "ica. full of love. full of food." },
    { id: "att4", time: "2026-11-15 16:40", src: "images/p_attempt4.jpg", place: "Okhema", caption: "attempt #4. edible if you don’t look", clue: true },
    { id: "bus", time: "2026-11-17 07:04", src: "images/p_bus.jpg", place: "Okhema", caption: "7am bus. thriving" },
    { id: "train", time: "2026-11-20 21:52", src: "images/p_train.jpg", place: "Between Okhema and Aedes", caption: "", clue: true },
    { id: "scat", time: "2026-11-20 22:05", src: "images/p_station_cat.jpg", place: "Aedes station", caption: "" },
    { id: "bch1", time: "2026-11-20 22:31", src: "images/p_beach1.jpg", place: "Aedes Beach", caption: "", clue: true },
    { id: "bch2", time: "2026-11-20 22:58", src: "images/p_beach2.jpg", place: "Aedes Beach", caption: "" },
  ],
  hidden: [
    { id: "h1", time: "2023-12-14 19:20", src: "images/h_cookies.jpg", place: "Mydei’s flat", caption: "he let me help. i was not allowed to help", clue: true },
    { id: "h2", time: "2024-02-03 08:20", src: "images/h_breakfast.jpg", place: "Okhema", caption: "breakfast on the counter" },
    { id: "h3", time: "2024-03-02 17:45", src: "images/h_groceries.jpg", place: "Okhema", caption: "wouldn’t let me carry anything" },
    { id: "h4", time: "2024-04-14 15:10", src: "images/h_hair.jpg", place: "Okhema", caption: "", clue: true },
    { id: "h5", time: "2024-05-21 19:02", src: "images/h_gym.jpg", place: "Okhema Fitness", caption: "lost to him again. rematch tuesday" },
    { id: "h6", time: "2024-08-04 16:40", src: "images/h_ica_mydei.jpg", place: "Hyacine’s, Okhema", caption: "ica only sleeps on HIM" },
    { id: "h7", time: "2024-09-16 10:05", src: "images/h_lecture.jpg", place: "Okhema University", caption: "front row like a nerd" },
    { id: "h8", time: "2024-09-28 17:30", src: "images/h_heart.jpg", place: "Aedes Beach", caption: "he says it’s a lion. it’s a heart", clue: true },
  ],
  deleted: [
    { id: "d1", time: "2026-11-20 18:03", scene: "shot", shot: ["Amphoreus Rail · e-ticket", "<b>KRM-4417</b>", "Okhema Central → Kremnos", "Sat 21 Nov · 08:10", "Coach 6 · Seat 41", "▚▞▚▞▚▞▚▞"], place: "Screenshot", caption: "", clue: true },
  ],
  memoryTitle: "Together · 2024", // Photos › For You memory, appears once Hidden is opened

  /* ------------------------------------------------------------ calendar */
  calendar: [
    { id: "k1", title: "Kremnos 🚆", start: "2026-11-21 08:10", end: "2026-11-21 11:52", where: "Okhema Central · platform 4", notes: "bring the honeycakes", clue: true },
    { id: "din", title: "Dinner · Castorice", start: "2026-11-22 19:30", end: "2026-11-22 21:30", where: "Castorice’s", notes: "Invitation from Castorice · you accepted on Fri 20 Nov at 23:48" },
    { id: "chk", title: "coffee w hya (for real this time)", start: "2026-11-25 18:00", end: "2026-11-25 19:00", notes: "moved from 11 Nov\nmoved from 18 Nov" },
    { id: "bday", title: "Dei’s birthday", start: "2024-06-07", allDay: true, repeat: "yearly", notes: "", clue: true },
  ],

  /* ------------------------------------------------------------ voice memos */
  memos: [
    { id: "m4", title: "hi", time: "2026-11-19 23:10", len: "0:24", bed: "room", clue: true,
      text: "(clears throat) Okay. Hi. Hi Dei, it’s me. …No, that’s stupid, obviously it’s me. Hi your highness. (laughs) Okay, that’s worse. I’m just gonna come to the bakery. That’s normal. People do that. (long pause) Okay." },
    { id: "m3", title: "song idea??", time: "2026-08-02 01:14", len: "0:18", bed: "room",
      text: "(humming, guitar slightly out of tune) …nope. Nope, that’s just the theme song from that show. Forget it." },
    { id: "m2", title: "anaxa lecture 4", time: "2024-11-12 10:02", len: "52:10", bed: "room",
      text: "…and if anyone cites that textbook again I will personally fail the entire row. (laughter) Phainon, stop laughing. You’re the worst offender." },
    { id: "m1", title: "dei’s birthday 🎂", time: "2024-06-07 20:52", len: "0:54", bed: "kitchen", clue: true,
      text: "Phai: Say it. Mydei: No. Phai: Say they’re good. Mydei: They’re… edible. Phai: Your highness, that’s the nicest thing you’ve ever said to me. Mydei: Turn that off, HKS. (Phainon laughing) Mydei: …Phainon. Phai: Hm? Mydei: Nothing. Turn it off." },
  ],

  /* ------------------------------------------------------------ safari (behind a Screen Time limit) */
  safari: {
    code: "0607",
    hint: "Hyacine would know.",
    tabs: [
      { id: "bakery", title: "Golden Honeycake · Kremnos", url: "goldenhoneycake.kr", clue: true, bg: "#f6efe3",
        html: `<div style="background:#f6efe3;color:#2b2118;min-height:100%;font-family:Georgia,'Times New Roman',serif;padding-bottom:30px">
  <div style="display:flex;justify-content:flex-end;padding:10px 16px 0;font-family:-apple-system,sans-serif;font-size:14px"><button onclick="acct()" style="color:#8a5a1c;font-weight:600">My orders</button></div>
  <div style="padding:16px 22px 20px;text-align:center;border-bottom:1px solid #e2d5bf">
    <div style="font-size:11px;letter-spacing:3px;color:#a0784a">KREMNOS · EST. 2026</div>
    <div style="font-size:34px;margin-top:8px">Golden Honeycake</div>
    <div style="font-size:14px;color:#7a6650;margin-top:4px;font-style:italic">the royal choice</div>
  </div>
  <div style="margin:18px 16px;padding:18px;border-radius:14px;background:#2b2118;color:#f6efe3">
    <div style="font-size:11px;letter-spacing:2px;color:#e8b04a;font-family:-apple-system,sans-serif">SATURDAY 21 NOV ONLY</div>
    <div style="font-size:24px;margin-top:6px">Honey suncakes, the Aedes way</div>
    <div style="font-size:15px;opacity:.85;margin-top:4px">Don’t ask.</div>
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
    There’s a shelf of books by the window. Take one, bring it back when you’re done.
  </div>
  <div style="padding:22px 22px 0;font-size:14px;color:#7a6650;font-family:-apple-system,sans-serif">Tue–Sun · 07:00–14:00 · closed Mondays<br>4 Gate Street, Kremnos</div>
</div>` },
      { id: "rail", title: "Manage booking · Amphoreus Rail", url: "amphoreus-rail.com/manage", bg: "#0d3b66", light: false,
        html: `<div style="background:#fff;color:#111;min-height:100%;font-family:-apple-system,sans-serif">
  <div style="background:#0d3b66;color:#fff;padding:16px 18px;font-weight:700;font-size:17px">Amphoreus Rail</div>
  <div style="padding:20px 18px">
    <div style="font-size:13px;color:#666">Booking reference</div>
    <div style="font-size:24px;font-weight:700;margin:2px 0 14px">KRM-4417</div>
    <div style="display:inline-block;background:#fde8e8;color:#b42318;font-weight:600;font-size:13px;padding:4px 10px;border-radius:20px">Cancelled</div>
    <div style="margin-top:18px;padding:14px;border:1px solid #e3e3e3;border-radius:12px;line-height:1.6"><b>Okhema Central 08:10 → Kremnos 11:52</b><br>Saturday 21 November 2026<br>Coach 6 · Seat 41</div>
    <div style="margin-top:14px;color:#444;font-size:14px">Refund requested on 20 Nov at 18:02.</div>
  </div>
</div>` },
    ],
    history: [
      { time: "2026-11-21 02:21", title: "Golden Honeycake · Kremnos", url: "goldenhoneycake.kr" },
      { time: "2026-11-20 18:04", title: "Golden Honeycake · My orders", url: "goldenhoneycake.kr/orders" },
      { time: "2026-11-20 18:01", title: "Manage booking · Amphoreus Rail", url: "amphoreus-rail.com/manage" },
      { time: "2026-11-19 23:02", title: "is it ok to visit your ex at work", url: "Search" },
      { time: "2026-11-15 10:40", title: "golden honeycake recipe", url: "Search" },
      { time: "2026-11-14 09:05", title: "okhema to kremnos train saturday", url: "Search" },
      { time: "2026-11-09 01:30", title: "how to stop thinking about him", url: "Search" },
      { time: "2026-10-28 16:20", title: "how much to feed an obese cat", url: "Search" },
      { time: "2026-10-12 23:44", title: "what do you call your ex situationship", url: "Search" },
      { time: "2026-10-09 22:24", title: "screen time limit one website", url: "Search" },
      { time: "2026-09-21 12:50", title: "Golden Honeycake · Kremnos", url: "goldenhoneycake.kr" },
      { time: "2024-11-28 07:40", title: "Student Health Service · cancel an appointment", url: "okhema-uni.edu/health" },
    ],
    // "My orders": Forgot password → a code arrives in Mail
    account: {
      email: "phainon.greatestworks@okhemamail.com",
      code: "482913",
      orders: [
        { id: "#0031", date: "2026-11-14 09:20", items: "6 × golden honeycakes · pickup Sat 21 Nov, 12:00", status: "Cancelled 20 Nov, 18:04" },
        { id: "#0024", date: "2026-10-30 23:51", items: "6 × golden honeycakes · delivery", status: "Cancelled 31 Oct, 00:03" },
        { id: "#0017", date: "2026-10-07 22:10", items: "6 × golden honeycakes · delivery", status: "Cancelled 7 Oct, 22:14" },
        { id: "#0009", date: "2026-09-21 13:02", items: "6 × golden honeycakes · delivery", status: "Cancelled 21 Sep, 13:05" },
      ],
    },
  },

  /* ------------------------------------------------------------ other apps */
  wallet: [
    { id: "w1", title: "Amphoreus Rail", sub: "Okhema Central → Aedes", detail: "Fri 20 Nov · 21:40 → 22:44<br>Single · Coach 3<br><b>Used</b>", color: ["#0d3b66", "#1f5f99"] },
    { id: "w2", title: "Amphoreus Rail", sub: "Okhema Central → Kremnos", detail: "Sat 21 Nov · 08:10 → 11:52<br>Coach 6 · Seat 41<br><b>Cancelled</b>", color: ["#3b3f48", "#5a5f6a"], clue: true },
    { id: "w3", title: "Golden Honeycake", sub: "Gift card · €30.00", detail: "From Aglaea:<br>“for when you go. — A”<br><br>Balance €30.00 · never used", color: ["#b07a2a", "#e3b04f"], clue: true },
    { id: "w4", title: "Cipher’s", sub: "Loyalty card · 9 / 10", detail: "One more stamp for a free drink.<br>Tab: €47", color: ["#2a1a3a", "#5a2a6a"] },
  ],
  reminders: [
    { text: "call hya back", due: "2026-11-21 09:00", done: false, clue: true },
    { text: "pay cipher’s tab", due: "2026-11-22 12:00", done: false },
    { text: "return cas’s book", due: "2026-11-20 18:00", done: true },
    { text: "water the plant (it’s alive??)", due: "2026-11-23 10:00", done: false },
  ],
  // Find My · People. Positions are places on the map: okhema, okhemaStation, aedes, aedesBeach, kremnos, train1, train2
  findmy: [
    { who: "hya", steps: [["start", "okhema", "Home · Okhema"], ["g3", "okhema", "Phainon’s flat · Okhema"], ["g4", "okhemaStation", "Okhema Central"], ["fin", "train1", "On a train to Aedes"]] },
    { who: "cas", steps: [["start", "okhema", "Home · Okhema"], ["g4", "okhemaStation", "Okhema Central"], ["fin", "train1", "On a train to Aedes"]] },
    { who: "agl", steps: [["start", "aedes", "Home · Aedes"], ["a2", "aedesWalk", "Walking · Aedes"], ["fin", "aedesBeach", "Aedes Beach"]] },
    { who: "dei", note: "still sharing", clue: true, steps: [["start", "kremnos", "Golden Honeycake · Kremnos"], ["d4", "train2", "On a train"]] },
  ],
  maps: [
    { icon: "🏖️", title: "Aedes Beach", sub: "Yesterday · walked from Aedes station" },
    { icon: "🍯", title: "Golden Honeycake", sub: "Bakery · 4 Gate Street, Kremnos" },
    { icon: "📚", title: "Kremnos Old Library", sub: "Library · Kremnos" },
    { icon: "🏠", title: "Aglaea", sub: "Home · Aedes · 5 min walk" },
  ],
  music: [
    { title: "dei’s cooking playlist", sub: "Playlist · made by Dei · Dei added a song 3 days ago", color: ["#e8b04a", "#7a4a1f"] },
    { title: "trivia night hype", sub: "Playlist · Phainon", color: ["#3a5ba0", "#16213e"] },
  ],
  alarms: [
    { id: "train", time: "07:55", label: "train!!", repeat: "Never", on: true },
    { id: "wk", time: "07:15", label: "Alarm", repeat: "Weekdays", on: false },
  ],

  /* ------------------------------------------------------------ live events */
  events: [
    { id: "cas-l", after: "start", delay: 7000, thread: "cas", msgs: [["them", "You sent me that at midnight and now you won’t pick up."]] },
    { id: "cas-u", after: "unlock", delay: 3500, thread: "cas", msgs: [["them", "I’m not angry. I just need to know you’re okay."]] },
    { id: "g1", after: "cas-u", delay: 45000, thread: "grp", msgs: [
      ["hya", "cas he’s not picking up for me either"],
      ["cas", "He sent me a weird text at midnight."],
      ["hya", "me too"],
      ["hya", "i don’t like this"],
      ["cas", "Me neither."] ] },
    { id: "g2", after: "g1", delay: 60000, thread: "grp", msgs: [
      ["hya", "i’m going to his place"],
      ["cas", "Text me when you’re there."] ] },
    { id: "alarm", at: "07:55", alarm: "train" },
    { id: "g3", after: "g2", delay: 30000, seen: "e:parcel", thread: "grp", msgs: [
      ["hya", "ok i used his spare key. he’s not here"],
      ["hya", "his bed’s made?? he never makes his bed"],
      ["hya", "and there’s a parcel on the doormat. from kremnos"],
      ["cas", "From Mydei?"],
      ["hya", "i’m opening it"],
      ["hya", "", { photo: { scene: "book", emoji: "📚" } }],
      ["hya", "a book. and a key"],
      ["hya", "", { photo: { scene: "shot", shot: ["", "<i>The library has no locks.</i>", "<i>The bakery does.</i>", "", "— M"] } }],
      ["cas", "Oh."],
      ["cas", "Didn’t he say he was going to Aglaea’s?"],
      ["hya", "yeah"],
      ["cas", "I’m calling her."] ] },
    { id: "a1", after: "g3", delay: 40000, thread: "agl", msgs: [
      ["them", "Castorice just called me."],
      ["them", "You told Hyacine you were coming to me. You never told me anything."],
      ["them", "Phai, where are you?"] ] },
    { id: "cal", at: "08:10", notif: { app: "calendar", title: "Kremnos 🚆", text: "Now · Okhema Central · platform 4" } },
    { id: "a2", after: "a1", delay: 60000, thread: "agl", msgs: [
      ["them", "Find My says your phone is at the beach."],
      ["them", "That’s five minutes from my house. I’m going down now."] ] },
    { id: "g4", after: "a2", delay: 25000, thread: "grp", msgs: [
      ["cas", "Aglaea says his phone is at Aedes beach."],
      ["hya", "AEDES??"],
      ["hya", "why didn’t he just go to hers"],
      ["cas", "I’m getting the next train."],
      ["hya", "me too"] ] },
    { id: "d1", after: "g3", delay: 30000, seen: "t:dei", any: "e:krm,e:ref,e:ord,e:aed,e:hna,s:bakery,s:orders,n:todo,n:groc,p:train,p:bch1,p:d1", thread: "grp", msgs: [
      ["hya", "i called mydei"],
      ["cas", "Hya…"],
      ["hya", "i know. he should know"] ] },
    { id: "d2", after: "d1", delay: 6000, receipt: { thread: "dei", text: "Read" } },
    { id: "d3", after: "d2", delay: 3000, typing: { thread: "dei", ms: 7000 } },
    { id: "d4", after: "d3", delay: 9000, call: {
      who: "dei", ring: 30000, flag: "deicall",
      talk: ["(wind. waves.)", "Phainon?", "Hyacine called me. I saw your messages.", "HKS, say something.", "…", "Who is this?", "Is he there? Is he with you?", "Okay. Okay. Don’t go anywhere. I’m calling Aglaea."],
      vm: "Phainon. It’s me. Hyacine called. I saw your messages. Call me back. Please. I’m getting on a train." } },
    { id: "d5a", after: "d4", delay: 4000, flag: "deicall=answered", thread: "dei", msgs: [
      ["them", "Who has his phone."],
      ["them", "Please answer me."],
      ["them", "I’m on a train. I’ll be in Aedes by two."] ] },
    { id: "d5b", after: "d4", delay: 4000, flag: "deicall=missed", thread: "dei", msgs: [
      ["them", "Pick up."],
      ["them", "Phainon, please."],
      ["them", "I’m on a train. I’ll be in Aedes by two."] ] },
    { id: "g5", after: "d4", delay: 26000, thread: "grp", msgs: [
      ["cas", "Mydei just called me. He’s on a train."],
      ["hya", "ok"],
      ["cas", "Does Phai still write everything in his notes app?"],
      ["hya", "always. why"],
      ["cas", "I don’t know. Nothing."] ] },
    { id: "fin", after: "a2,g5", delay: 8000, seen: "n:dei", thread: "agl", finale: true, msgs: [
      ["them", "I’m on the beach."],
      ["them", "There’s someone by the lifeguard hut holding a phone."],
      ["them", "Is that you?"] ] },
  ],

  /* ------------------------------------------------------------ finale (open endings) */
  finale: {
    idle: 360000,
    lastText: "I’m on my way.",
    replies: {
      agl: { text: "This isn’t Phainon. I found his phone in the sand this morning. I’m the one by the lifeguard hut. I’ll wait for you.", end: "agl" },
      dei: { text: "This isn’t Phainon. I found his phone on the beach in Aedes. I’m so sorry. I’ll stay with it until someone comes.", end: "dei", answer: ["Stay there.", "Please."] },
    },
    endings: {
      agl: {
        title: "She sees you.",
        text: "A woman in a long coat is walking across the sand toward you. She doesn’t run.<br><br>Aglaea looks at the phone in your hand for a long moment. Then she takes your arm, and the two of you start walking the beach, calling his name.<br><br>By noon Castorice and Hyacine are there too, Hyacine still in her slippers. They split up. Nobody says the thing they’re all thinking.<br><br>Just after two, a man with strawberry-blond hair steps off the train with a key in his pocket and starts asking everyone on the beach if they’ve seen a guy with white hair.<br><br>You don’t find out how it ends. You leave them the phone and keep looking.",
      },
      dei: {
        title: "Read.",
        text: "For two years every message from this phone said Read, and he never answered one. He’d said he wouldn’t ask again, and he didn’t.<br><br>Now he’s asking you to stay, so you stay.<br><br>Aglaea finds you first, then the others. Mydei gets there in the afternoon, apron still on under his coat. You give him the phone and tell him there’s a note for him. You tell him the hint. He types the password without stopping to think about it.<br><br>He reads it standing up. Then he puts the phone in his pocket, next to the key, and says, “He’s here somewhere. We’re finding him.”",
      },
      dark: {
        title: "1%",
        text: "You don’t answer anyone. The screen dims in your hand.<br><br>It lights up one last time. <b>Dei 🍯:</b> I’m on my way.<br><br>Then the battery dies.<br><br>Up the beach, voices. Someone is calling his name, and then someone else, further off.<br><br>You stand up with the dead phone in your hand and walk toward them.",
      },
    },
  },
};
