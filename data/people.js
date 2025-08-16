const people = [
  // A
  {id:"abhimanyu", name:"Abhimanyu", role:"Prince/Princess", house:"Pandava", generation:"Next Gen",
   aliases:[], notes:"Son of Arjuna & Subhadra; husband of Uttara; father of Parikshit; prodigy slain at 16.",
   appearsIn:[8,12,17], relations:{father:["Arjuna"], mother:["Subhadra"], spouse:["Uttara"], children:["Parikshit"]}},

  {id:"adhiratha", name:"Adhiratha", role:"Other", house:"Other", generation:"Adults",
   aliases:[], notes:"Suta charioteer who adopted Karna with his wife Radha.",
   appearsIn:[5], relations:{spouse:["Radha"], children:["Karna"]}},

  {id:"agnivesha", name:"Agnivesha", role:"Sage", house:"Other", generation:"Ancestors",
   aliases:["Agniveśa"], notes:"Rishi & weapons master; teacher of Drona and Drupada.",
   appearsIn:[2], relations:{students:["Drona","Drupada"]}},

  {id:"akrura", name:"Akrura", role:"Warrior", house:"Yadava", generation:"Adults",
   aliases:[], notes:"Krishna’s uncle; Vrishni commander & advisor.",
   appearsIn:[7,10], relations:{kin:["Krishna","Balarama"]}},

  {id:"alambusha", name:"Alambusha", role:"Warrior", house:"Kaurava", generation:"Adults",
   aliases:["Alambuṣa"], notes:"Rakshasa fighting for Duryodhana; killed Iravan; slain by Ghatotkacha.",
   appearsIn:[16], relations:{siblings:["Baka"], killed:["by Ghatotkacha"]}},

  {id:"amba", name:"Amba", role:"Prince/Princess", house:"Other", generation:"Ancestors",
   aliases:[], notes:"Princess of Kashi; rejected by Bhishma/Shalva; reborn as Shikhandhi to end Bhishma.",
   appearsIn:[1], relations:{siblings:["Ambika","Ambalika"], rebirth:["Shikhandhi"], foe:["Bhishma"]}},

  {id:"ambalika", name:"Ambalika", role:"King/Queen", house:"Kuru", generation:"Ancestors",
   aliases:["Ambālikā"], notes:"Youngest Kashi princess; wife of Vichitravirya; mother of Pandu by Vyasa.",
   appearsIn:[1], relations:{spouse:["Vichitravirya"], children:["Pandu"], niyoga:["Vyasa"]}},

  {id:"ambika", name:"Ambika", role:"King/Queen", house:"Kuru", generation:"Ancestors",
   aliases:["Ambikā"], notes:"Kashi princess; wife of Vichitravirya; mother of Dhritarashtra by Vyasa.",
   appearsIn:[1], relations:{spouse:["Vichitravirya"], children:["Dhritarashtra"], niyoga:["Vyasa"]}},

  {id:"angaraparna", name:"Angaraparna", role:"Other", house:"Other", generation:"Adults",
   aliases:["Citraratha"], notes:"Gandharva chief who met the Pandavas after the lac house escape.",
   appearsIn:[4], relations:{}},

  {id:"arjuna", name:"Arjuna", role:"Prince/Princess", house:"Pandava", generation:"Next Gen",
   aliases:["Pārtha","Dhanañjaya","Savyasāchī","Vijaya","Kiritin","Jishnu","Phālguna"],
   notes:"Third Pandava; son of Indra & Kunti; Krishna’s friend; hero of the Gita.",
   appearsIn:[4,6,7,9,15], relations:{father:["Indra"], mother:["Kunti"], spouse:["Draupadi","Subhadra","Ulupi","Chitrangada"], children:["Abhimanyu","Iravan","Babruvahana"]}},

  {id:"ashvini", name:"Ashvini Kumaras", role:"Deity", house:"Other", generation:"Ancestors",
   aliases:["Aśvinī Kumāras"], notes:"Twin celestial physicians; fathers of Nakula & Sahadeva through Madri.",
   appearsIn:[2,4], relations:{children:["Nakula","Sahadeva"], mother:["Madri"]}},

  {id:"ashwatthama", name:"Ashwatthama", role:"Warrior", house:"Kaurava", generation:"Adults",
   aliases:["Aśvatthāmā"], notes:"Son of Drona & Kripi; linked to Shiva; committed the night massacre.",
   appearsIn:[11,18], relations:{father:["Drona"], mother:["Kripi"], foe:["Pandavas"]}},

  {id:"babruvahana", name:"Babruvahana", role:"Prince/Princess", house:"Other", generation:"Next Gen",
   aliases:["Babhruvāhana"], notes:"Son of Arjuna & Chitrangada; ruler of Manipur.",
   appearsIn:[13], relations:{father:["Arjuna"], mother:["Chitrangada"]}},

  {id:"bahlika", name:"Bahlika", role:"King/Queen", house:"Kuru", generation:"Ancestors",
   aliases:[], notes:"Younger brother of Shantanu; Kuru elder; slain by Bhima.",
   appearsIn:[3,14], relations:{brother:["Shantanu"]}},

  {id:"balarama", name:"Balarama", role:"Deity", house:"Yadava", generation:"Adults",
   aliases:["Baladeva","Rāma"], notes:"Elder brother of Krishna; revered as the Supreme’s eternal form.",
   appearsIn:[7,12], relations:{siblings:["Krishna"], parents:["Vasudeva","Rohini"]}},

  {id:"bharata", name:"Bharata", role:"King/Queen", house:"Other", generation:"Ancestors",
   aliases:[], notes:"Legendary emperor, son of Dushyanta & Shakuntala; namesake of Bhārata.",
   appearsIn:[1], relations:{parents:["Dushyanta","Shakuntala"]}},

  {id:"bhima", name:"Bhimasena", role:"Prince/Princess", house:"Pandava", generation:"Next Gen",
   aliases:["Bhīma"], notes:"Second Pandava; son of Vayu; immense strength.",
   appearsIn:[4,6,12,15], relations:{father:["Vayu"], mother:["Kunti"], spouse:["Draupadi","Hidimbi"], children:["Ghatotkacha"]}},

  {id:"bhishma", name:"Bhishma", role:"Warrior", house:"Kuru", generation:"Ancestors",
   aliases:["Bhīṣma","Devavrata"], notes:"Grandsire & regent; master of dharma; fell on a bed of arrows.",
   appearsIn:[1,2,12], relations:{father:["Shantanu"], mother:["Ganga"]}},

  {id:"chitrasena", name:"Chitrasena", role:"Other", house:"Other", generation:"Adults",
   aliases:[], notes:"Gandharva king; taught Arjuna; later captured Duryodhana.",
   appearsIn:[9,12], relations:{}},

  {id:"devaki", name:"Devaki", role:"King/Queen", house:"Yadava", generation:"Adults",
   aliases:["Devakī"], notes:"Mother of Krishna; wife of Vasudeva.",
   appearsIn:[7], relations:{spouse:["Vasudeva"], children:["Krishna","Balarama (via Rohini)"]}},

  {id:"dhaumya", name:"Dhaumya", role:"Sage", house:"Other", generation:"Adults",
   aliases:[], notes:"Priest and guide of the Pandavas.",
   appearsIn:[4,6], relations:{disciples:["Pandavas"]}},

  {id:"dhrishtadyumna", name:"Dhrishtadyumna", role:"Warrior", house:"Panchala", generation:"Next Gen",
   aliases:["Dhṛṣṭadyumna"], notes:"Son of Drupada born of fire; destined to slay Drona.",
   appearsIn:[6,15], relations:{father:["Drupada"], siblings:["Draupadi"], foe:["Drona"]}},

  {id:"dhrishtaketu", name:"Dhrishtaketu", role:"Warrior", house:"Chedi", generation:"Next Gen",
   aliases:["Dhṛṣṭaketu"], notes:"Chedi ally of the Pandavas; slain by Drona.",
   appearsIn:[15], relations:{father:["Shishupala (lineage)"]}},

  {id:"dhritarashtra", name:"Dhritarashtra", role:"King/Queen", house:"Kuru", generation:"Elders",
   aliases:["Dhṛtarāṣṭra"], notes:"Blind Kuru king; father of the Kauravas.",
   appearsIn:[1,3,12], relations:{father:["Vyasa"], mother:["Ambika"], spouse:["Gandhari"], children:["Duryodhana","Dushashana","Vikarna","Dushala","Yuyutsu"]}},

  {id:"draupadi", name:"Draupadi", role:"King/Queen", house:"Pandava", generation:"Adults",
   aliases:["Pāñcālī","Kṛṣṇā"], notes:"Daughter of Drupada; wife of the five Pandavas; exemplar of virtue.",
   appearsIn:[6,12], relations:{father:["Drupada"], spouse:["Yudhishthira","Bhima","Arjuna","Nakula","Sahadeva"]}},

  {id:"drona", name:"Drona", role:"Warrior", house:"Kaurava", generation:"Adults",
   aliases:["Droṇa","Dronacharya"], notes:"Kuru preceptor; pupil of Agnivesha & Parashurama; slain in war.",
   appearsIn:[2,11,15], relations:{spouse:["Kripi"], children:["Ashwatthama"], pupils:["Kauravas","Pandavas"]}},

  {id:"drupada", name:"Drupada", role:"King/Queen", house:"Panchala", generation:"Adults",
   aliases:["Yajñasena"], notes:"King of Panchala; father of Draupadi & Dhrishtadyumna; foe of Drona.",
   appearsIn:[2,6,11], relations:{children:["Draupadi","Dhrishtadyumna"], foe:["Drona"]}},

  {id:"durvasa", name:"Durvasa", role:"Sage", house:"Other", generation:"Adults",
   aliases:["Durvāsā"], notes:"Fiery rishi; granted Kunti the mantra to summon gods.",
   appearsIn:[2], relations:{boonTo:["Kunti"]}},

  {id:"duryodhana", name:"Duryodhana", role:"Prince/Princess", house:"Kaurava", generation:"Next Gen",
   aliases:[], notes:"Eldest Kaurava; rival of the Pandavas; slain by Bhima.",
   appearsIn:[3,12,15], relations:{father:["Dhritarashtra"], mother:["Gandhari"], siblings:["Dushashana","Vikarna","Dushala"], ally:["Karna","Shakuni"]}},

  {id:"dushasana", name:"Dushashana", role:"Prince/Princess", house:"Kaurava", generation:"Next Gen",
   aliases:["Duḥśāsana"], notes:"Duryodhana’s brother; offender of Draupadi; killed by Bhima.",
   appearsIn:[3,12,15], relations:{father:["Dhritarashtra"], mother:["Gandhari"], brother:["Duryodhana"]}},

  {id:"ekalavya", name:"Ekalavya", role:"Warrior", house:"Other", generation:"Next Gen",
   aliases:[], notes:"Nishada archer who self-trained honoring Drona; later killed by Krishna.",
   appearsIn:[5,10], relations:{mentor:["Drona (idol)"]}},

  // G
  {id:"gandhari", name:"Gandhari", role:"King/Queen", house:"Kaurava", generation:"Elders",
   aliases:["Gāndhārī"], notes:"Wife of Dhritarashtra; mother of the Kauravas; vowed self-blindfolding.",
   appearsIn:[3,12], relations:{spouse:["Dhritarashtra"], children:["Duryodhana","Dushashana","Vikarna","Dushala"]}},

  {id:"ganga", name:"Ganga", role:"Deity", house:"Other", generation:"Ancestors",
   aliases:["Gaṅgā"], notes:"River goddess; mother of Bhishma by Shantanu.",
   appearsIn:[1], relations:{spouse:["Shantanu"], children:["Bhishma"]}},

  {id:"ghatotkacha", name:"Ghatotkacha", role:"Warrior", house:"Pandava", generation:"Next Gen",
   aliases:["Ghaṭotkaca"], notes:"Son of Bhima & Hidimbi; Rakshasa hero; fell to Karna’s Shakti.",
   appearsIn:[12,15], relations:{father:["Bhima"], mother:["Hidimbi"]}},

  // I–J–K
  {id:"indra", name:"Indra", role:"Deity", house:"Other", generation:"Ancestors",
   aliases:["Śakra","Purandara"], notes:"King of the gods; father of Arjuna.",
   appearsIn:[4,9], relations:{children:["Arjuna"]}},

  {id:"jarasandha", name:"Jarasandha", role:"King/Queen", house:"Magadha", generation:"Adults",
   aliases:["Jarāsandha"], notes:"King of Magadha; foe of Krishna; slain by Bhima.",
   appearsIn:[9,12], relations:{foe:["Krishna","Bhima"]}},

  {id:"jayadratha", name:"Jayadratha", role:"King/Queen", house:"Sindhu", generation:"Adults",
   aliases:[], notes:"King of Sindhu; husband of Dushala; killed by Arjuna.",
   appearsIn:[12,16], relations:{spouse:["Dushala"], foe:["Arjuna"]}},

  {id:"kansa", name:"Kansa", role:"King/Queen", house:"Yadava", generation:"Adults",
   aliases:["Kaṁsa"], notes:"Usurper of Mathura; maternal uncle of Krishna; slain by Krishna.",
   appearsIn:[7], relations:{nephew:["Krishna"], foe:["Krishna"]}},

  {id:"karna", name:"Karna", role:"Warrior", house:"Kaurava", generation:"Adults",
   aliases:["Vasusena","Radheya","Vaikartana"], notes:"Eldest son of Kunti (by Surya); Duryodhana’s champion; slain by Arjuna.",
   appearsIn:[5,12,15], relations:{father:["Surya"], mother:["Kunti"], fosterParents:["Adhiratha","Radha"], ally:["Duryodhana"]}},

  {id:"kripa", name:"Kripa", role:"Warrior", house:"Kaurava", generation:"Adults",
   aliases:["Kṛpācārya"], notes:"Kuru teacher; survivor of the war; later preceptor to Parikshit.",
   appearsIn:[2,15,18], relations:{sibling:["Kripi"], nephew:["Ashwatthama"]}},

  {id:"krishna", name:"Krishna", role:"Deity", house:"Yadava", generation:"Adults",
   aliases:["Kṛṣṇa","Vāsudeva"], notes:"Supreme Lord (Vaishnava view); charioteer & guide of Arjuna; speaker of the Gita.",
   appearsIn:[4,6,7,12,15], relations:{father:["Vasudeva"], mother:["Devaki"], siblings:["Balarama","Subhadra"], cousin:["Pandavas"]}},

  {id:"kritavarma", name:"Kritavarma", role:"Warrior", house:"Yadava", generation:"Adults",
   aliases:["Kṛtavarmā"], notes:"Yadava chief; led Yadu army on Kaurava side; survived.",
   appearsIn:[12,15], relations:{ally:["Duryodhana"]}},

  {id:"kunti", name:"Kunti", role:"King/Queen", house:"Pandava", generation:"Elders",
   aliases:["Pritha","Kuntī"], notes:"Mother of the Pandavas; sister of Vasudeva; invoked gods by mantra.",
   appearsIn:[2,3,4,6], relations:{father:["Surasena (foster by Kuntibhoja)"], siblings:["Vasudeva"], children:["Yudhishthira","Bhima","Arjuna","Karna (pre-marital)"]}},

  {id:"kuru", name:"Kuru", role:"King/Queen", house:"Kuru", generation:"Ancestors",
   aliases:[], notes:"Eponymous founder of the Kuru line; Kurukshetra named for him.",
   appearsIn:[1], relations:{}},

  {id:"kubera", name:"Kubera", role:"Deity", house:"Other", generation:"Ancestors",
   aliases:["Vaiśravaṇa"], notes:"God of wealth; celestial treasurer.",
   appearsIn:[9], relations:{}},

  {id:"markandeya", name:"Markandeya", role:"Sage", house:"Other", generation:"Ancestors",
   aliases:["Mārkaṇḍeya"], notes:"Ancient rishi; storyteller to the Pandavas.",
   appearsIn:[6], relations:{}},

  // N
  {id:"nakula", name:"Nakula", role:"Prince/Princess", house:"Pandava", generation:"Next Gen",
   aliases:[], notes:"Fourth Pandava; son of the Ashvins & Madri; famed horseman.",
   appearsIn:[4,6,12], relations:{father:["Ashvins"], mother:["Madri"], spouse:["Draupadi","Karenumati"]}},

  {id:"narada", name:"Narada", role:"Sage", house:"Other", generation:"Ancestors",
   aliases:["Nārada"], notes:"Devarshi; traveling sage and devotee of Krishna.",
   appearsIn:[6,9], relations:{}},

  // P
  {id:"pandu", name:"Pandu", role:"King/Queen", house:"Kuru", generation:"Elders",
   aliases:["Pāṇḍu"], notes:"Father of the Pandavas; husband of Kunti & Madri; died under a curse.",
   appearsIn:[1,3,4], relations:{father:["Vyasa"], mother:["Ambalika"], spouse:["Kunti","Madri"], children:["Yudhishthira","Bhima","Arjuna","Nakula","Sahadeva"]}},

  {id:"parashara", name:"Parashara", role:"Sage", house:"Other", generation:"Ancestors",
   aliases:["Parāśara"], notes:"Grandson of Vasistha; father of Vyasa with Satyavati.",
   appearsIn:[1], relations:{spouse:["Satyavati"], children:["Vyasa"]}},

  {id:"parashurama", name:"Parashurama", role:"Sage", house:"Other", generation:"Ancestors",
   aliases:["Paraśurāma","Bhargava"], notes:"Warrior-sage; teacher of Bhishma, Drona, Karna.",
   appearsIn:[2,5], relations:{students:["Bhishma","Drona","Karna"]}},

  {id:"parikshit", name:"Parikshit", role:"King/Queen", house:"Pandava", generation:"Next Gen",
   aliases:["Parīkṣit"], notes:"Son of Abhimanyu & Uttara; heir to the Pandavas; hearer of the Bhagavata.",
   appearsIn:[18], relations:{father:["Abhimanyu"], mother:["Uttara"]}},

  // S
  {id:"sahadeva", name:"Sahadeva", role:"Prince/Princess", house:"Pandava", generation:"Next Gen",
   aliases:[], notes:"Fifth Pandava; twin of Nakula; noted for insight and counsel.",
   appearsIn:[4,6,12], relations:{father:["Ashvins"], mother:["Madri"], spouse:["Draupadi","Vijaya"]}},

  {id:"sanjaya", name:"Sanjaya", role:"Other", house:"Kuru", generation:"Adults",
   aliases:["Sañjaya"], notes:"Dhritarashtra’s charioteer; granted vision by Vyasa to narrate the war.",
   appearsIn:[12,15], relations:{mentor:["Vyasa"]}},

  {id:"satyaki", name:"Satyaki", role:"Warrior", house:"Yadava", generation:"Adults",
   aliases:["Yuyudhāna"], notes:"Vrishni hero; disciple of Arjuna; fought for the Pandavas.",
   appearsIn:[12,15], relations:{mentor:["Arjuna"]}},

  {id:"shakuni", name:"Shakuni", role:"King/Queen", house:"Gandhara", generation:"Adults",
   aliases:["Śakuni"], notes:"Prince of Gandhara; Duryodhana’s strategist and instigator.",
   appearsIn:[12], relations:{sister:["Gandhari"], ally:["Duryodhana"]}},

  {id:"shalva", name:"Shalva", role:"King/Queen", house:"Other", generation:"Adults",
   aliases:["Śālva"], notes:"King of Saubha; foe of Krishna; suitor of Amba; slain by Krishna.",
   appearsIn:[9], relations:{foe:["Krishna"], link:["Amba"]}},

  {id:"shalya", name:"Shalya", role:"King/Queen", house:"Madra", generation:"Adults",
   aliases:["Śalya"], notes:"King of Madra; Madri’s brother; fought for Kauravas; slain by Yudhishthira.",
   appearsIn:[12,15], relations:{sister:["Madri"], foe:["Yudhishthira"]}},

  {id:"shantanu", name:"Shantanu", role:"King/Queen", house:"Kuru", generation:"Ancestors",
   aliases:["Śantanu"], notes:"Kuru king; father of Bhishma by Ganga; later husband of Satyavati.",
   appearsIn:[1], relations:{spouse:["Ganga","Satyavati"], children:["Bhishma","Chitrangada","Vichitravirya"]}},

  {id:"shikhandhi", name:"Shikhandhi", role:"Warrior", house:"Panchala", generation:"Next Gen",
   aliases:["Śikhaṇḍī"], notes:"Reincarnation of Amba; enabled Arjuna to fell Bhishma.",
   appearsIn:[12,15], relations:{pastLife:["Amba"]}},

  {id:"shishupala", name:"Shishupala", role:"King/Queen", house:"Chedi", generation:"Adults",
   aliases:["Śiśupāla"], notes:"King of Chedi; inveterate foe of Krishna; slain at the Rajasuya.",
   appearsIn:[9,12], relations:{foe:["Krishna"]}},

  {id:"subhadra", name:"Subhadra", role:"Prince/Princess", house:"Yadava", generation:"Adults",
   aliases:[], notes:"Sister of Krishna; wife of Arjuna; mother of Abhimanyu.",
   appearsIn:[7,8], relations:{brothers:["Krishna","Balarama"], spouse:["Arjuna"], children:["Abhimanyu"]}},

  {id:"susharma", name:"Susharma", role:"King/Queen", house:"Trigarta", generation:"Adults",
   aliases:["Suśarma"], notes:"King of Trigarta; vowed to kill Arjuna; slain by him.",
   appearsIn:[15], relations:{foe:["Arjuna"]}},

  // U–V–Y
  {id:"ulupi", name:"Ulupi", role:"Prince/Princess", house:"Naga", generation:"Adults",
   aliases:["Ulūpī"], notes:"Naga princess; wife of Arjuna; mother of Iravan.",
   appearsIn:[10,13], relations:{spouse:["Arjuna"], children:["Iravan"]}},

  {id:"uttara", name:"Uttara", role:"Prince/Princess", house:"Matsya", generation:"Next Gen",
   aliases:[], notes:"Princess of Virata; wife of Abhimanyu; mother of Parikshit.",
   appearsIn:[8,18], relations:{spouse:["Abhimanyu"], children:["Parikshit"], father:["Virata"]}},

  {id:"vasudeva", name:"Vasudeva", role:"King/Queen", house:"Yadava", generation:"Adults",
   aliases:[], notes:"Father of Krishna; husband of Devaki and Rohini.",
   appearsIn:[7], relations:{spouse:["Devaki","Rohini"], children:["Krishna","Balarama (via Rohini)","Subhadra"]}},

  {id:"vidura", name:"Vidura", role:"Minister", house:"Kuru", generation:"Elders",
   aliases:[], notes:"Wise counselor; son of Vyasa & a maid; associated with Yama.",
   appearsIn:[1,3,12], relations:{father:["Vyasa"], mother:["Maidservant"], siblings:["Dhritarashtra","Pandu"]}},

  {id:"virata", name:"Virata", role:"King/Queen", house:"Matsya", generation:"Adults",
   aliases:[], notes:"King of Matsya; sheltered the Pandavas in their incognito year; slain by Drona.",
   appearsIn:[7,12,15], relations:{children:["Uttara"]}},

  {id:"vyasa", name:"Vyasa", role:"Sage", house:"Other", generation:"Ancestors",
   aliases:["Vyāsadeva","Krishna Dvaipayana"], notes:"Compiler of the Vedas; author of the Mahabharata; father of Dhritarashtra, Pandu, Vidura.",
   appearsIn:[1,3,12], relations:{mother:["Satyavati"], father:["Parashara"], children:["Dhritarashtra","Pandu","Vidura"]}},

  {id:"yadu", name:"Yadu", role:"King/Queen", house:"Yadava", generation:"Ancestors",
   aliases:[], notes:"Founder of the Yadu line from which Krishna appears.",
   appearsIn:[1], relations:{}},

  {id:"yudhishthira", name:"Yudhishthira", role:"Prince/Princess", house:"Pandava", generation:"Next Gen",
   aliases:["Dharmarāja","Ajātaśatru"], notes:"Eldest Pandava; son of Dharma & Kunti; exemplar of truth.",
   appearsIn:[4,6,12,15], relations:{father:["Dharma/Yama"], mother:["Kunti"], spouse:["Draupadi"]}}
];
