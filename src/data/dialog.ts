import { Item } from '../classes/Environment/Item';
import { NPC } from '../classes/Environment/NPC';
import { Prop } from '../classes/Environment/Prop';
import { Music } from '../classes/Music';
import { Player } from '../classes/Player/Player';
import { updateAnimation } from '../utils/animations';
import { addHerb, makePotion } from '../utils/cutscene';
import {
  getItem,
  hasActiveQuest,
  hasCompletedQuest,
  hasItem,
  hasJournalEntry,
  hasUnusedItem,
  hasUsedItem,
} from '../utils/interactionUtils';
import { isNighttime, setDaytime, setNighttime } from '../utils/lighting';
import { getSphinxHint, getSphinxOptions, getSphinxRiddle, handleSphinxAnswer } from '../utils/riddles';
import { xrayAlpha } from '../utils/shaders/xray';
import { fadeIn, fadeOut, openDialog } from '../utils/util';
import { ItemType, JournalEntry, NPCType, PropType, QuestType } from './types';

export interface Dialog<T> {
  conditions?: {
    hasItem?: ItemType;
    hasUnusedItem?: ItemType;
    hasUsedItem?: ItemType;
    completedQuest?: QuestType;
    activeQuest?: QuestType;
    journalEntry?: JournalEntry;
    custom?: (player: Player, target: T) => boolean;
    or?: boolean;
    invert?: boolean;
  };

  messages: string[] | ((player: Player) => string[]);
  options?: string[] | ((player: Player) => string[]);

  onCompleted?: (player: Player, target?: T) => void;
  onMessageShown?(player: Player, index: number, target?: T): void;
  onSelected?: (option: string, player: Player, target?: T) => void;
}

const sphinxRiddle = (): Dialog<NPC> => {
  return {
    messages: (player) => getSphinxRiddle(player.scene),
    options: (player) => getSphinxOptions(player.scene),
    onSelected: handleSphinxAnswer,
  };
};

export const PipesCompletionDialog: Dialog<Prop> = {
  messages: ['There. It looks like the alchemy set has been properly fit back together.'],
  onCompleted: (player) => {
    player.journal.addEntry(JournalEntry.AlchemySetFixed);
  },
};

export const NPCDialogs: Record<NPCType, Dialog<NPC>[]> = {
  [NPCType.Inventor]: [
    {
      messages: ['There is still one more gear missing.', 'Something tells me there is a great evil near the lake.'],
      conditions: {
        journalEntry: JournalEntry.ClockSecondGear,
      },
    },
    {
      messages: ['Ah, the second gear. You should take it to the clock tower.'],
      conditions: {
        hasItem: ItemType.Gear2,
      },
    },
    {
      messages: [
        'You found a secret safe in the mansion?',
        'Very interesting. There may be a hint about opening it nearby.',
      ],
      conditions: {
        journalEntry: JournalEntry.SafeDiscovered,
      },
    },
    {
      messages: [
        'Blue Plumed Frond? I have not heard of such a plant.',
        'The stranger may know. Many secrets lie under this town.',
      ],
      conditions: {
        activeQuest: QuestType.FindPotionIngredients,
      },
    },
    {
      messages: [
        'There are rumors of an abandoned mansion west of the town.',
        'Some say it is haunted and dark magic lurks within.',
      ],
      conditions: {
        activeQuest: QuestType.InvestigateTownWest,
      },
    },
    {
      messages: ['I see you found the first gear. You should talk to the mayor to learn more about the old clock.'],
      conditions: {
        hasItem: ItemType.Gear1,
      },
      onCompleted: (player) => {
        player.quests.updateExistingQuest(QuestType.ForestGear, true);
      },
    },
    {
      messages: (player) => getSphinxHint(player.scene, NPCType.Inventor),
      conditions: {
        activeQuest: QuestType.SphinxRiddle,
      },
    },
    {
      messages: ['Now that you have the wrench, you can fix the clock tower. You’ll need three gears to do it.'],
      conditions: {
        hasItem: ItemType.Wrench,
      },
    },
    {
      messages: [
        'The clock tower is the heart of our town, but it’s been broken for ages. I’ve got a wrench you can borrow, but you’ll need three special gears to fix it.',
        'You might find the others by helping the townsfolk.',
      ],
      onCompleted: (player) => {
        player.journal.addEntry(JournalEntry.FixTheClock);
        player.inventory.addItem({ type: ItemType.Wrench, used: false });
      },
    },
  ],
  [NPCType.Stranger]: [
    {
      messages: ['I am worried about the secrets hidden near the lake.', 'Long ago I saw a great evil lurking there.'],
      conditions: {
        journalEntry: JournalEntry.ClockSecondGear,
      },
    },
    {
      messages: ['Another gear? The mayor probably wants that put back in the clock tower.'],
      conditions: {
        hasItem: ItemType.Gear2,
      },
    },
    {
      messages: ['The lock on that safe is no ordinary lock. It requires something special to open it.'],
      conditions: {
        journalEntry: JournalEntry.SafeDiscovered,
        hasUnusedItem: ItemType.Potion,
      },
    },
    {
      messages: [
        'Hmm a potion, I wonder what it does.',
        'The alchemist was no ordinary person and built magical safeguards against intruders.',
      ],
      conditions: {
        hasUnusedItem: ItemType.Potion,
      },
    },
    {
      messages: ['Green Writhewood? Hm, there might be some near the forest or lake.'],
      conditions: {
        activeQuest: QuestType.FindPotionIngredients,
      },
    },
    {
      messages: [
        'You heard of the mansion to the west? It was abandoned many years ago.',
        'There is a rumor of an alchemy lab hidden somewhere nearby, but I have been searching for years and have found not even a single potion.',
      ],
      conditions: {
        activeQuest: QuestType.InvestigateTownWest,
      },
    },
    {
      messages: ['Now that you have the first gear, I would talk to the inventor.'],
      conditions: {
        hasItem: ItemType.Gear1,
      },
    },
    {
      messages: (player) => getSphinxHint(player.scene, NPCType.Stranger),
      conditions: {
        activeQuest: QuestType.SphinxRiddle,
      },
    },
    {
      messages: [
        'I’ve heard rumors of a gear hidden deep in the Enchanted Forest. Beware of the forest’s creatures and traps.',
        'One time I thought I saw an ancient being, but it ran away.',
      ],
      conditions: {
        hasItem: ItemType.Wrench,
      },
      onCompleted: (player) => {
        player.quests.addQuest({
          id: QuestType.ForestGear,
          completed: false,
        });
      },
    },
    {
      messages: ['Who am I?', 'Eventually, you will learn.'],
    },
  ],
  [NPCType.Sphinx]: [
    {
      messages: (player) => {
        if (player.gameState.data.sphinxFail)
          return ['You have returned. I am surprised you were able to find your way back.', 'Try again.'];

        if (hasActiveQuest(player, QuestType.FindPotionIngredients))
          return [
            'I see you are back again. You may find what you are looking for ahead, but must first answer my riddle.',
          ];

        return ['Ponder this riddle. Answer wisely.'];
      },
      conditions: {
        activeQuest: QuestType.SphinxRiddle,
        completedQuest: QuestType.SphinxRiddle,
        or: true,
      },
      onCompleted: (player, target) => {
        player.scene.time.delayedCall(50, () => {
          player.message.setDialog<NPC>(sphinxRiddle(), target);
        });
      },
    },
    {
      messages: [
        'Welcome, brave soul. To pass, you must answer my riddle. You may only answer once. If you are unsure, you may speak to the townsfolk. Choose wisely.',
      ],
      onCompleted: (player) => {
        player.quests.addQuest({ id: QuestType.SphinxRiddle, completed: false });
      },
    },
  ],
  [NPCType.Mayor]: [
    {
      messages: [
        'The clock is still missing a gear. It must be somewhere nearby.',
        'I’ve been hearing strange reports from the townsfolk. It’s as if time is slipping. Have you felt it?',
      ],
      conditions: {
        journalEntry: JournalEntry.ClockSecondGear,
      },
    },
    {
      messages: ['The second gear has been found? That’s incredible news!'],
      conditions: {
        completedQuest: QuestType.InvestigateTownWest,
      },
    },
    {
      messages: [
        'Herbs? I haven’t the faintest idea where to being looking. Start at the source - there are bound to be a few ingredients in the lab you found.',
      ],
      conditions: {
        activeQuest: QuestType.FindPotionIngredients,
      },
    },
    {
      messages: [
        'The minute hand on the clock is spinning again.',
        'It looks like it’s missing two more gears.',
        'The abandoned mansion west of the town might be a good place to look.',
      ],
      conditions: {
        journalEntry: JournalEntry.ClockFirstGear,
      },
      onCompleted: (player) => {
        player.quests.addQuest({ id: QuestType.InvestigateTownWest, completed: false });
      },
    },
    {
      messages: ['Did you go into the clock tower yet?'],
      conditions: {
        journalEntry: JournalEntry.MetTheMayor,
      },
    },
    {
      messages: [
        'Hello, traveler. I am the mayor of this town. The clock tower has been broken for years.',
        'Ah, I see you have found an old gear. Maybe it could be used to help fix the clock tower.',
      ],
      onCompleted: (player) => {
        player.journal.addEntry(JournalEntry.MetTheMayor);
      },
    },
  ],
  [NPCType.Innkeeper]: [
    {
      messages: [
        'Welcome to our humble inn. I hope you find peace here.',
        'We can set you up with a room if you need it.',
      ],
    },
  ],
  [NPCType.Baker]: [
    {
      messages: ['Welcome! I bake the best bread in town.'],
    },
  ],
};

export const ItemDialogs: { [key in ItemType]?: Dialog<Item>[] } = {
  [ItemType.Gear1]: [
    {
      messages: ['Hmm, this gear looks like it belongs in the clock tower. I should ask the inventor about it.'],
    },
  ],
  [ItemType.Gear2]: [
    {
      messages: ['Finally! I found the second gear to the clock tower.', 'I should take this and put it back.'],
      onCompleted: (player) => {
        player.quests.updateExistingQuest(QuestType.InvestigateTownWest, true);
      },
    },
  ],
};

export const PropDialogs: { [key in PropType]?: Dialog<Prop>[] } = {
  [PropType.ClockTower]: [
    {
      messages: ['With two of the gears in place, the clocks hands are moving again.'],
      conditions: {
        journalEntry: JournalEntry.ClockSecondGear,
      },
    },
    {
      messages: [
        'Slowly, you align and tighten the second gear into place.',
        '[CLUNKING NOISE]',
        'Now two of the hands of the clock are moving again.',
      ],
      conditions: {
        hasItem: ItemType.Gear2,
      },
      onMessageShown: (player, index) => {
        if (index === 1) player.scene.sound.play('clunk');
      },
      onCompleted: (player) => {
        player.inventory.removeItem(ItemType.Gear2);
        player.journal.addEntry(JournalEntry.ClockSecondGear);
        setNighttime(player.scene, true);
      },
    },
    {
      messages: ['The clock is partially moving again, but it is still missing two gears.'],
      conditions: {
        journalEntry: JournalEntry.ClockFirstGear,
      },
      onCompleted: (player) => {
        setNighttime(player.scene, true);
      },
    },
    {
      messages: [
        "This dusty clock tower hasn't told the correct time in many years. It appears to be missing some gears.",
        'Let’s see what happens when we add the first gear. You tighten the gear into place.',
        '[CLUNKING NOISE]',
        'The clock tower is starting to partially move again. It looks like it’s missing two more gears.',
      ],
      conditions: {
        hasItem: ItemType.Gear1,
      },
      onMessageShown: (player, index) => {
        if (index === 2) player.scene.sound.play('clunk');
      },
      onCompleted: (player) => {
        player.inventory.removeItem(ItemType.Gear1);
        player.journal.addEntry(JournalEntry.ClockFirstGear);
      },
    },
  ],
  [PropType.Chest]: [
    {
      messages: ['The chest seems to be locked.', 'It appears to have many symbols above the latch.'],
      conditions: {
        custom: (player) => !hasItem(player, ItemType.Gear1) && getItem(player.scene, ItemType.Gear1) === undefined,
      },
      onCompleted: (player) => {
        openDialog(player.scene, 'MemoryDialog');
      },
    },
  ],
  [PropType.LabHatch]: [
    {
      messages: [
        'Let me see if I can open this hatch.',
        'Wow, the rusty key fits!',
        '[CREAKING NOISE]',
        'Alright, let’s see what is down there!',
      ],
      conditions: {
        hasItem: ItemType.Key,
      },
      onMessageShown: (player, index) => {
        if (index === 2) player.scene.sound.play('door');
      },
      onCompleted: (player, prop) => {
        prop?.destroy();
        player.inventory.removeItem(ItemType.Key);
        player.journal.addEntry(JournalEntry.AlchemyLabFound);
      },
    },

    {
      messages: ['The hatch is locked. I wonder if there is a key somewhere.'],
    },
  ],
  [PropType.LabBook]: [
    {
      messages: [],
      conditions: {
        journalEntry: JournalEntry.ClockSecondGear,
      },
    },
    {
      messages: ['I should retrace my steps to see if there is anything strange or new in the area.'],
      conditions: {
        custom: () => xrayAlpha > 0,
      },
    },
    {
      messages: [
        'How could I have missed this? The potion is called the "Elixir of Sight".',
        'This must be related to one of the gears in the clock tower.',
        'Well, bottoms up, I suppose!',
      ],
      conditions: {
        hasItem: ItemType.Potion,
        custom: () => xrayAlpha === 0,
      },
      onCompleted: (player) => {
        player.active = false;

        player.journal.addEntry(JournalEntry.ExtraPotionInformation);
        player.inventory.removeItem(ItemType.Potion);

        player.scene.time.delayedCall(3500, () => {
          player.message.setDialog(
            {
              messages: [
                'I feel... different.',
                'I should retrace my steps to see if there is anything strange or new in the area.',
              ],
              onCompleted: (player) => {
                player.active = true;
              },
            },
            player,
            'player_portrait'
          );
        });
      },
    },
    {
      messages: [
        'With the alchemy set fixed, I should be able to recreate the experiment.',
        'I will need to find three ingredients according to this - Crimson Starbloom, Green Writhewood, and a Blue Plumed Frond.',
        'Maybe I can find them in the lab or the forest. The villagers should know more.',
      ],
      conditions: {
        journalEntry: JournalEntry.AlchemySetFixed,
      },
      onCompleted: (player) => {
        player.quests.addQuest({ id: QuestType.FindPotionIngredients, completed: false });
        player.gameState.updateData({
          mazeSolved: false,
          mazeSeed: player.gameState.data.mazeSeed + 1,
          sphinxMoved: false,
        });
      },
    },
    {
      messages: ['Maybe I can find more information in the lab.'],
      conditions: {
        activeQuest: QuestType.ExploreLab,
      },
    },
    {
      messages: [
        'This lab journal contains notes about an ancient alchemy experiement.',
        'According to the notes, the experiment was a failure, and the alchemist disappeared.',
        'It does say that there might have been a problem with one of the ingredients.',
        'Maybe I can find more information in the lab.',
      ],
      onCompleted: (player) => {
        player.quests.addQuest({ id: QuestType.ExploreLab, completed: false });
      },
    },
  ],
  [PropType.AlchemySet]: [
    {
      messages: ['There’s nothing more that I can do here.'],
      conditions: {
        hasItem: ItemType.Potion,
      },
    },
    {
      messages: [
        'Now I have all of the ingredients.',
        'With these, I should be able to recreate the experiment.',
        'According to the book...',
      ],
      conditions: {
        hasUsedItem: ItemType.HerbBlue,
      },
      onCompleted: (player, target) => {
        makePotion(player, target);
      },
    },
    {
      messages: ['The Blue Plumed Frond is last.'],
      conditions: {
        hasItem: ItemType.HerbBlue,
        hasUsedItem: ItemType.HerbRed,
      },
      onCompleted: (player, target) => {
        addHerb(player, target, ItemType.HerbBlue);
        player.quests.updateExistingQuest(QuestType.FindPotionIngredients, true);
      },
    },
    {
      messages: ['The Crimson Starbloom comes next.'],
      conditions: {
        hasItem: ItemType.HerbRed,
        hasUsedItem: ItemType.HerbGreen,
      },
      onCompleted: (player, target) => addHerb(player, target, ItemType.HerbRed),
    },
    {
      messages: ['The Green Writhewood goes in first.'],
      conditions: {
        hasItem: ItemType.HerbGreen,
      },
      onCompleted: (player, target) => addHerb(player, target, ItemType.HerbGreen),
    },
    {
      messages: ['Maybe the journal has more information about using this alchemy set.'],
      conditions: {
        journalEntry: JournalEntry.AlchemySetFixed,
      },
    },
    {
      messages: [
        'This alchemy set looks like the one in the journal.',
        'If I can figure out how the set connects together, I might be able to recreate the experiment.',
      ],
      conditions: {
        activeQuest: QuestType.ExploreLab,
      },
      onCompleted: (player) => {
        openDialog(player.scene, 'PipesDialog');
      },
    },
    {
      messages: ['A series of pipes and tubes. I shouldn’t touch this without knowing what it does.'],
    },
  ],
  [PropType.LabBookshelf1]: [
    {
      messages: [
        '[Secrets of the Silver Transmutation]\n"Silver, the mirror of the soul, can be yielded from common materials. Begin with a lead base, cleanse it with the tears of a willow, and chant thrice under a new moon. Such processes, though fraught with danger, promise immense reward. Meticulous preparation of the material is crucial."',
        '"Among these pages lie safeguards against volatile spirits and the precise lunar phases essential for success. Here are protective circles and counter-spells to be used should spirits prove malevolent. This knowledge has been passed down and refined for safety."',
      ],
      conditions: {
        activeQuest: QuestType.ExploreLab,
      },
    },
  ],
  [PropType.LabBookshelf2]: [
    {
      messages: [
        '[Whispering Woods: A Compendium]\n"The sentient trees of Eldergrove are not myths; their trunks groan with ancient wisdom. To engage them, perform the Ritual of Leaves, using moonlit water and rare herbs, along with whispered incantations passed down by forest guardians."',
        '"Notes on the rare Blue Moonflower, whose petals glow ghostly and unlock forest languages, are also included. Its bloom is brief, and harvesting must be timed at midnight to retain its properties. The chapter concludes with a discussion on plant symbiosis with Eldertrees."',
      ],
      conditions: {
        activeQuest: QuestType.ExploreLab,
      },
    },
  ],
  [PropType.LabBookshelf3]: [
    {
      messages: [
        '[The Essence of Fire: Ignite and Control]\n"Mastering fire requires strength of will and profound respect for its power. Here, summoning circles and incantations to call forth fire spirits are detailed. Each summoning demands a tribute of phoenix ash. The endeavor is perilous, as spirits may lash out if provoked."',
        '"The tome also discusses methods to quell flames should they rise against the summoner. Included are the chant of suppression and a dousing mixture from elemental waters and frost-bitten herbs. These countermeasures are vital for maintaining control over summoned entities."',
      ],
      conditions: {
        activeQuest: QuestType.ExploreLab,
      },
    },
  ],
  [PropType.LabPotionShelf1]: [
    {
      messages: [
        'Nightshade, wolfsbane, starvine, frost ferns... No, those are not the right ingedients.',
        'Oh, a Crimson Starbloom! Yes, this should work!',
      ],
      conditions: {
        activeQuest: QuestType.FindPotionIngredients,
        custom: (player) => !hasItem(player, ItemType.HerbRed),
      },
      onCompleted(player) {
        player.inventory.addItem({ type: ItemType.HerbRed, used: false });
      },
    },
    {
      messages: [
        'Hm, this is an interesting collection. What’s this "Elixir of Luminescence"? Could light up some dark corners. And "Brew of Bravery"... might make me bold enough to face a dragon, or foolish enough to try. What about "Draught of the Depths"—sounds like it could show me treasures or drown me in visions. Better not risk it; these might just burn me to a crisp!',
      ],
      conditions: {
        activeQuest: QuestType.ExploreLab,
      },
    },
  ],
  [PropType.MansionPicture]: [
    {
      messages: [],
      conditions: {
        hasItem: ItemType.Gear2,
      },
    },
    {
      messages: [
        'A sturdy looking safe was hidden behind the picture.',
        'There are large rusty rings to the side, as if it they were meant to be moved.',
      ],
      conditions: {
        journalEntry: JournalEntry.SafeDiscovered,
      },
      onCompleted: (player) => {
        openDialog(player.scene, 'TumblerDialog');
      },
    },
    {
      messages: ['An abstract picture of blocks.', 'Wait a moment, something is behind this picture...', '[CREAK]'],
      onMessageShown: (player, index) => {
        if (index === 2) player.scene.sound.play('chest');
      },
      onCompleted: (player) => {
        player.journal.addEntry(JournalEntry.SafeDiscovered);
      },
      conditions: {
        hasUsedItem: ItemType.Potion,
      },
    },
    {
      messages: ['An abstract picture of blocks.'],
    },
  ],
  [PropType.MansionHole]: [
    {
      messages: ['Literally a hole in the wall.', "Huh, there is something here. It's a key!"],
      conditions: {
        hasItem: ItemType.Key,
        invert: true,
      },
      onCompleted: (player) => {
        player.inventory.addItem({ type: ItemType.Key, used: false });
      },
    },
    {
      messages: ['Literally a hole in the wall.'],
    },
  ],
  [PropType.Bed]: [
    {
      conditions: {
        custom: (player) => isNighttime(player.scene),
      },
      messages: ['What a long day. Time for some sleep before I continue my journey.'],
      onCompleted: (player) => {
        Music.stop();
        player.setActive(false);

        setDaytime(player.scene, false);

        player.scene.add
          .timeline([
            {
              at: 0,
              run: () =>
                fadeOut(player.scene, 500, () => {
                  player.setPosition(2660, player.y);
                  player.previousPosition.set(player.x + 1, player.y);
                  updateAnimation(player);
                }),
            },
            { at: 1000, sound: { key: 'lullaby', config: { volume: 0.5, rate: 0.85 } } },
            {
              at: 4000,
              run: () => {
                fadeIn(player.scene, 1000, () => {
                  player.message.setDialog(
                    {
                      messages: ['Ah, what a lovely rest. Time to get back to work!'],
                      onCompleted: (player) => player.setActive(true),
                    },
                    player,
                    'player_portrait'
                  );
                });
              },
            },
          ])
          .play();
      },
    },
    {
      messages: ['A comfortable bed.', 'I should rest here if I need to.'],
    },
  ],
};

export function getDialog<T>(dialogs: Dialog<T>[], player: Player, target: T): Dialog<T> | undefined {
  for (const dialog of dialogs) {
    const { conditions } = dialog;

    const results = [];

    if (conditions?.hasItem !== undefined) results.push(hasItem(player, conditions.hasItem));
    if (conditions?.hasUnusedItem !== undefined) results.push(hasUnusedItem(player, conditions.hasUnusedItem));
    if (conditions?.hasUsedItem !== undefined) results.push(hasUsedItem(player, conditions.hasUsedItem));
    if (conditions?.completedQuest !== undefined) results.push(hasCompletedQuest(player, conditions.completedQuest));
    if (conditions?.activeQuest !== undefined) results.push(hasActiveQuest(player, conditions.activeQuest));
    if (conditions?.journalEntry !== undefined) results.push(hasJournalEntry(player, conditions.journalEntry));
    if (conditions?.custom) results.push(conditions.custom(player, target));

    if (conditions?.invert) {
      if (conditions?.or) {
        if (results.some((result) => !result)) return dialog;
      } else if (results.every((result) => !result)) return dialog;

      return undefined;
    }

    if (conditions?.or) {
      if (results.some((result) => result)) return dialog;
    } else if (results.every((result) => result)) return dialog;
  }

  return undefined;
}
