import { Item } from '../classes/Environment/Item';
import { NPC } from '../classes/Environment/NPC';
import { Prop } from '../classes/Environment/Prop';
import { SphinxPosition } from '../classes/Player/GameState';
import { Player } from '../classes/Player/Player';
import { hasActiveQuest, hasCompletedQuest, hasItem, hasJournalEntry, hasUsedItem } from '../utils/interactionUtils';
import { getSphinxHint, getSphinxOptions, getSphinxRiddle, handleSphinxAnswer } from '../utils/riddles';
import { openDialog } from '../utils/util';
import { makePotion } from './cutscene';
import { PropData } from './prop';
import { ItemType, JournalEntry, NPCType, PropType, QuestType } from './types';

export interface Dialog<T> {
  conditions?: {
    hasItem?: ItemType;
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
  onSelected?: (option: string, player: Player, target?: T) => void;
}

const sphinxRiddle: Dialog<NPC> = {
  messages: (player) => getSphinxRiddle(player.scene),
  options: (player) => getSphinxOptions(player.scene),
  onSelected: handleSphinxAnswer,
};

export const NPCDialogs: Record<NPCType, Dialog<NPC>[]> = {
  [NPCType.Inventor]: [
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
        'The clock tower is the heart of our town, but it’s been broken for ages. I’ve got a wrench, but you’ll need three special gears to fix it.',
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
      messages: ['The lock on that safe is no ordinary lock. It requires something special to open it.'],
      conditions: {
        journalEntry: JournalEntry.SafeDiscovered,
      },
    },
    {
      messages: [
        'Hmm a potion, I wonder what it does.',
        'The alchemist was no ordinary person and built magical safeguards against intruders.',
      ],
      conditions: {
        hasItem: ItemType.Potion,
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
      messages: ['Back again? You must answer another riddle to pass.'],
      conditions: {
        activeQuest: QuestType.FindPotionIngredients,
      },
      onCompleted: (player, target) => {
        player.scene.time.delayedCall(50, () => {
          player.message.setDialog<NPC>({ ...sphinxRiddle }, target);
        });
      },
    },
    {
      messages: ['You have returned. I am surprised you were able to find your way back.', 'Try again.'],
      conditions: {
        activeQuest: QuestType.SphinxRiddle,
        custom: (player) => player.gameState.data.sphinxFail,
      },
      onCompleted: (player, target) => {
        player.scene.time.delayedCall(50, () => {
          player.message.setDialog<NPC>({ ...sphinxRiddle }, target);
        });
      },
    },
    {
      ...sphinxRiddle,
      conditions: {
        activeQuest: QuestType.SphinxRiddle,
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

  // TODO: Should the clock tower be a different type than NPC?
  [NPCType.ClockTower]: [
    {
      messages: ['With two of the gears in place, the clocks hands are moving again.'],
      conditions: {
        journalEntry: JournalEntry.ClockSecondGear,
      },
    },
    {
      messages: [
        'Slowly, you align and tighten the second gear into place.',
        '[CREAKING NOISE]',
        'Now two of the hands of the clock are moving again.',
      ],
      conditions: {
        hasItem: ItemType.Gear2,
      },
      onCompleted: (player) => {
        player.inventory.removeItem(ItemType.Gear2);
        player.journal.addEntry(JournalEntry.ClockSecondGear);
      },
    },
    {
      messages: ['The clock is partially moving again, but it is still missing two gears.'],
      conditions: {
        journalEntry: JournalEntry.ClockFirstGear,
      },
    },
    {
      messages: [
        "This dusty clock tower hasn't told the correct time in many years. It appears to be missing some gears.",
        'Let’s see what happens when we add the first gear. You tighten the gear into place.',
        '[CREAKING NOISE]',
        'The clock tower is starting to partially move again. It looks like it’s missing two more gears.',
      ],
      conditions: {
        hasItem: ItemType.Gear1,
      },
      onCompleted: (player) => {
        player.inventory.removeItem(ItemType.Gear1);
        player.journal.addEntry(JournalEntry.ClockFirstGear);
      },
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
  [PropType.LabHatch]: [
    {
      messages: [
        'Let me see if I can open this hatch.',
        'Wow,tThe rusty key fits!',
        '[CREAKING NOISE]',
        'Alright, let’s see what is down there!',
      ],
      conditions: {
        hasItem: ItemType.Key,
      },
      onCompleted: (player, prop) => {
        prop?.destroy();
        console.log(prop);
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
      messages: [
        'How could I have missed this? The potion is called the "Keyless Exlixir".',
        'This must be the key to the safe.',
      ],
      conditions: {
        journalEntry: JournalEntry.SafeDiscovered,
      },
      onCompleted: (player) => {
        player.journal.addEntry(JournalEntry.ExtraPotionInformation);
      },
    },
    {
      messages: ['I should speak to the mysterious stranger about this lab and the potion I brewed.'],
      conditions: {
        hasItem: ItemType.Potion,
      },
    },
    {
      messages: [
        'With the alchemy set fixed, I should be able to recreate the experiment.',
        'I will need to find three ingredients according to this - Crimson Starbloom, Green Writhewood, and a Blue Plumed Frond.',
        'Maybe I can find them in the lab or the forest. The villagers will know more.',
      ],
      conditions: {
        journalEntry: JournalEntry.AlchemySetFixed,
      },
      onCompleted: (player) => {
        player.quests.addQuest({ id: QuestType.FindPotionIngredients, completed: false });
        player.gameState.updateData({
          mazeSolved: false,
          mazeSeed: player.gameState.data.mazeSeed + 1,
          sphinxPosition: SphinxPosition.Ground,
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
        'Now we have all of the ingredients.',
        'Now I should be able to recreate the experiment.',
        'According to the book...',
      ],
      conditions: {
        hasUsedItem: ItemType.HerbBlue,
      },
      onCompleted: makePotion,
    },
    {
      messages: ['The Blue Plumed Frond is last.'],
      conditions: {
        hasItem: ItemType.HerbBlue,
        hasUsedItem: ItemType.HerbRed,
      },
      onCompleted: (player, target) => {
        player.inventory.removeItem(ItemType.HerbBlue);
        player.quests.updateExistingQuest(QuestType.FindPotionIngredients, true);

        target?.setTexture('alchemy_blue');
        target?.particles?.setConfig({ ...PropData[PropType.AlchemySet].particles, tint: [0x0000aa], x: -5 }).start();
      },
    },
    {
      messages: ['The Crimson Starbloom comes next.'],
      conditions: {
        hasItem: ItemType.HerbRed,
        hasUsedItem: ItemType.HerbGreen,
      },
      onCompleted: (player, target) => {
        player.inventory.removeItem(ItemType.HerbRed);

        target?.setTexture('alchemy_red');
        target?.particles?.setConfig({ ...PropData[PropType.AlchemySet].particles, tint: [0xaa0000], x: -20 }).start();
      },
    },
    {
      messages: ['The Green Writhewood goes in first.'],
      conditions: {
        hasItem: ItemType.HerbGreen,
      },
      onCompleted: (player, target) => {
        player.inventory.removeItem(ItemType.HerbGreen);

        target?.setTexture('alchemy_green');
        target?.particles?.setConfig({ ...PropData[PropType.AlchemySet].particles, tint: [0x00aa00], x: -35 }).start();
      },
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
        const scene = player.scene;

        openDialog(scene, 'PipesDialog', { gamepadVisible: scene.gamepad.visible });
      },
    },
    {
      messages: ['I shouldn’t touch this without knowing what it does.'],
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
        custom: (player) => !hasItem(player.inventory.inventory, ItemType.HerbRed),
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
      messages: ['You pour the potion into the safe keyhole.', '[CLUNK]', 'The safe clicks open.', 'Huh, what’s that?'],
      conditions: {
        journalEntry: JournalEntry.ExtraPotionInformation,
      },
      onCompleted: (player, target) => {
        player.inventory.removeItem(ItemType.Potion);

        const scene = player.scene;
        const gear = new Item(player.scene, ItemType.Gear2, player);
        scene.interactiveObjects.add(gear);

        if (!target) return;

        gear.disabled = true;
        gear.setPosition(target.x, target.y + 20);

        scene.tweens.add({
          targets: gear,
          x: target.x - 10,
          y: target.y + 120,
          duration: 1000,
          onComplete: () => {
            gear.disabled = false;
          },
          ease: 'Bounce.easeOut',
        });
      },
    },
    {
      messages: [
        'A sturdy looking safe was hidden behind the picture.',
        'It looks like it requires a special key to open.',
      ],
      conditions: {
        journalEntry: JournalEntry.SafeDiscovered,
      },
    },
    {
      messages: ['An abstract picture of blocks.', 'Wait a moment, something is behind this picture', '[CREAK]'],
      onCompleted: (player) => {
        player.journal.addEntry(JournalEntry.SafeDiscovered);
      },
      conditions: {
        hasItem: ItemType.Potion,
      },
    },
    {
      messages: ['An abstract picture of blocks.'],
    },
  ],
  [PropType.MansionHole]: [
    {
      messages: ['Literally a hole in the wall.'],
    },
  ],
};

export function getDialog<T>(dialogs: Dialog<T>[], player: Player, target: T): Dialog<T> | undefined {
  for (const dialog of dialogs) {
    const { conditions } = dialog;

    const results = [];

    if (conditions?.hasItem !== undefined) results.push(hasItem(player.inventory.inventory, conditions.hasItem));
    if (conditions?.hasUsedItem !== undefined)
      results.push(hasUsedItem(player.inventory.inventory, conditions.hasUsedItem));
    if (conditions?.completedQuest !== undefined)
      results.push(hasCompletedQuest(player.quests.quests, conditions.completedQuest));
    if (conditions?.activeQuest !== undefined)
      results.push(hasActiveQuest(player.quests.quests, conditions.activeQuest));
    if (conditions?.journalEntry !== undefined)
      results.push(hasJournalEntry(player.journal.journal, conditions.journalEntry));
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
