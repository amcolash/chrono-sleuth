import { Item } from '../classes/Environment/Item';
import { NPC } from '../classes/Environment/NPC';
import { Prop } from '../classes/Environment/Prop';
import { Player } from '../classes/Player/Player';
import { hasActiveQuest, hasCompletedQuest, hasItem, hasJournalEntry, hasUsedItem } from '../utils/interactionUtils';
import { getSphinxAnswer, getSphinxHint, getSphinxOptions, getSphinxRiddle } from '../utils/riddles';
import { fadeIn, fadeOut } from '../utils/util';
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

export const NPCDialogs: Record<NPCType, Dialog<NPC>[]> = {
  [NPCType.Inventor]: [
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
      messages: (player) => getSphinxRiddle(player.scene),
      options: (player) => getSphinxOptions(player.scene),
      conditions: {
        activeQuest: QuestType.SphinxRiddle,
      },
      onSelected: (option, player, npc) => {
        const answer = getSphinxAnswer(player.scene);
        if (option === answer) {
          player.message.setDialog<NPC>(
            {
              messages: [`That is correct. Well done, you may pass.`],
              onCompleted: (player) => {
                player.quests.updateExistingQuest(QuestType.SphinxRiddle, true);
                player.journal.addEntry(JournalEntry.SphinxRiddleSolved);
              },
            },
            npc
          );
        } else if (option === 'I don’t know') {
          player.message.setDialog<NPC>({ messages: ['Come back when you have an answer for me.'] }, npc);
        } else {
          // TODO: Add back talking points so we can hide dialog in a different system that is reset
          player.message.setDialog<NPC>({ messages: ['That is not correct. Do not return.'] }, npc);
        }
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
};

export const PropDialogs: { [key in ItemType]?: Dialog<Prop>[] } = {
  [PropType.LabHatch]: [
    {
      messages: ['Let me see if I can open this hatch.'],
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
        'With the alchemy set fixed, I should be able to recreate the experiment.',
        'I will need to find three ingredients according to this.',
        'I need to find a red herb, a green herb, and a blue herb.',
      ],
      conditions: {
        journalEntry: JournalEntry.AlchemySetFixed,
      },
      onCompleted: (player) => {
        const scene = player.scene;
        scene.interactiveObjects.add(new Item(scene, ItemType.HerbRed, player));
        scene.interactiveObjects.add(new Item(scene, ItemType.HerbGreen, player));
        scene.interactiveObjects.add(new Item(scene, ItemType.HerbBlue, player));
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
        'This book contains notes about an ancient alchemy experiement.',
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
      onCompleted: (player, target) => {
        const scene = player.scene;

        player.inventory.removeItem(ItemType.HerbBlue);
        player.active = false;

        fadeOut(scene, 500, () => {
          scene.time.delayedCall(700, () => {
            target?.setTexture('alchemy_full');
            target?.particles
              ?.setConfig({ ...PropData[PropType.AlchemySet].particles, tint: [0x660077], x: 30 })
              .start();

            fadeIn(scene, 1500, () => {
              player.message.setDialog<Prop>(
                {
                  messages: [
                    'I have created the potion mentioned in the old journal.',
                    'I should bring it to the mysterious stranger to see if they know how to use it.',
                  ],
                  onCompleted: (player, target) => {
                    player.inventory.addItem({ type: ItemType.Potion, used: false });
                    target?.setTexture('alchemy_empty');

                    player.active = true;
                  },
                },
                target,
                'player_portrait'
              );
            });
          });
        });
      },
    },
    {
      messages: ['The Blue Plumed Frond is last.'],
      conditions: {
        hasItem: ItemType.HerbBlue,
        hasUsedItem: ItemType.HerbRed,
      },
      onCompleted: (player, target) => {
        player.inventory.removeItem(ItemType.HerbBlue);
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
      messages: ['Maybe the book has more information about using the alchemy set.'],
      conditions: {
        journalEntry: JournalEntry.AlchemySetFixed,
      },
    },
    {
      messages: [
        'This alchemy set looks like the one in the book.',
        'If I can figure out how the set connects together, I might be able to recreate the experiment.',
      ],
      conditions: {
        activeQuest: QuestType.ExploreLab,
      },
      onCompleted: (player) => {
        const scene = player.scene;

        scene.gamepad.setVisible(false);
        scene.scene.pause();
        scene.scene.launch('PipesDialog', { player });
      },
    },
    {
      messages: ['I shouldn’t touch this without knowing what it does.'],
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