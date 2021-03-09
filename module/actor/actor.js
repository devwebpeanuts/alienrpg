import { yze } from '../YZEDiceRoller.js';
import {addSign} from '../utils.js';

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */

export class alienrpgActor extends Actor {
  /** @override */
  getRollData() {
    const data = super.getRollData();
    const shorthand = game.settings.get('alienrpg-improved-ui', 'macroShorthand');

    // Re-map all attributes onto the base roll data
    if (!!shorthand) {
      for (let [k, v] of Object.entries(data.attributes)) {
        if (!(k in data)) data[k] = v.value;
      }
      delete data.attributes;
    }
    if (!!shorthand) {
      for (let [k, v] of Object.entries(data.header)) {
        if (!(k in data)) data[k] = v.value;
      }
      delete data.header;
    }
    if (!!shorthand) {
      for (let [k, v] of Object.entries(data.general)) {
        if (!(k in data)) data[k] = v.value;
      }
      delete data.general;
    }
    if (this.data.type === 'character' || this.data.type === 'synthetic') {
      if (!!shorthand) {
        for (let [k, v] of Object.entries(data.skills)) {
          if (!(k in data)) data[k] = v.value;
        }
        delete data.skills;
      }
    }

    // Map all items data using their slugified names
    data.items = this.data.items.reduce((obj, i) => {
      let key = i.name.slugify({ strict: true });
      let itemData = duplicate(i.data);
      if (itemData.skill) {
        return;
      }
      if (!!shorthand && !!itemData.skill) {
        for (let [k, v] of Object.entries(itemData.attributes)) {
          if (!(k in itemData)) itemData[k] = v.value;
        }
        delete itemData['attributes'];
      }
      obj[key] = itemData;
      return obj;
    }, {});
    return data;
  }

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareBaseData() {
    super.prepareBaseData();

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    if (actorData.type === 'character') this._prepareCharacterData(actorData);
    else if (actorData.type === 'synthetic') this._prepareCharacterData(actorData);
    else if (actorData.type === 'vehicles') this._prepareVehicleData(data);
    else if (actorData.type === 'creature') this._prepareCreatureData(data);
    else if (actorData.type === 'territory') this._prepareTeritoryData(data);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    super.prepareDerivedData();
    const data = actorData.data;
    var attrMod = {
      str: 0,
      agl: 0,
      emp: 0,
      wit: 0,
      health: 0,
      stress: 0,
    };

    var sklMod = {
      heavyMach: 0,
      closeCbt: 0,
      stamina: 0,
      rangedCbt: 0,
      mobility: 0,
      piloting: 0,
      command: 0,
      manipulation: 0,
      medicalAid: 0,
      observation: 0,
      survival: 0,
      comtech: 0,
    };

    for (let [skey, Attrib] of Object.entries(actorData.items)) {
      if (Attrib.type === 'item') {
        if (Attrib.data.header.active) {
          let base = Attrib.data.modifiers.attributes;
          // console.log('🚀 ~ file: actor.js ~ line 104 ~ alienrpgActor ~ _prepareCharacterData ~ base', base);
          for (let [bkey, aAttrib] of Object.entries(base)) {
            switch (bkey) {
              case 'str':
                attrMod.str = attrMod.str += parseInt(aAttrib.value);
                break;
              case 'agl':
                attrMod.agl = attrMod.agl += parseInt(aAttrib.value);
                break;
              case 'emp':
                attrMod.emp = attrMod.emp += parseInt(aAttrib.value);
                break;
              case 'wit':
                attrMod.wit = attrMod.wit += parseInt(aAttrib.value);
                break;
              case 'health':
                attrMod.health = attrMod.health += parseInt(aAttrib.value);
                break;
              case 'stress':
                attrMod.stress = attrMod.stress += parseInt(aAttrib.value);
                break;

              default:
                break;
            }
          }

          let skillBase = Attrib.data.modifiers.skills;
          for (let [skey, sAttrib] of Object.entries(skillBase)) {
            switch (skey) {
              case 'heavyMach':
                sklMod.heavyMach = sklMod.heavyMach += parseInt(sAttrib.value);
                break;
              case 'closeCbt':
                sklMod.closeCbt = sklMod.closeCbt += parseInt(sAttrib.value);
                break;
              case 'stamina':
                sklMod.stamina = sklMod.stamina += parseInt(sAttrib.value);
                break;
              case 'rangedCbt':
                sklMod.rangedCbt = sklMod.rangedCbt += parseInt(sAttrib.value);
                break;
              case 'mobility':
                sklMod.mobility = sklMod.mobility += parseInt(sAttrib.value);
                break;
              case 'piloting':
                sklMod.piloting = sklMod.piloting += parseInt(sAttrib.value);
                break;
              case 'command':
                sklMod.command = sklMod.command += parseInt(sAttrib.value);
                break;
              case 'manipulation':
                sklMod.manipulation = sklMod.manipulation += parseInt(sAttrib.value);
                break;
              case 'medicalAid':
                sklMod.medicalAid = sklMod.medicalAid += parseInt(sAttrib.value);
                break;
              case 'observation':
                sklMod.observation = sklMod.observation += parseInt(sAttrib.value);
                break;
              case 'survival':
                sklMod.survival = sklMod.survival += parseInt(sAttrib.value);
                break;
              case 'comtech':
                sklMod.comtech = sklMod.comtech += parseInt(sAttrib.value);
                break;

              default:
                break;
            }
          }
        }
        setProperty(actorData, 'data.header.health.mod', (data.header.health.mod = parseInt(attrMod.health || 0)));
        if (actorData.type === 'character') {
          setProperty(actorData, 'data.header.stress.mod', (data.header.stress.mod = parseInt(attrMod.stress || 0)));
        }
      }

      if (Attrib.type === 'armor') {
        if (Attrib.data.header.active) {
          let base = Attrib.data.modifiers;
          for (let [bkey, vAttrib] of Object.entries(base)) {
            switch (bkey) {
              case 'agl':
                attrMod.agl = attrMod.agl += parseInt(vAttrib.value);
                break;
              case 'heavyMach':
                sklMod.heavyMach = sklMod.heavyMach += parseInt(vAttrib.value);
                break;
              case 'closeCbt':
                sklMod.closeCbt = sklMod.closeCbt += parseInt(vAttrib.value);
                break;
              case 'survival':
                sklMod.survival = sklMod.survival += parseInt(vAttrib.value);
                break;

              default:
                break;
            }
          }
        }
      }
    }

    for (let [a, abl] of Object.entries(data.attributes)) {
      let target = `data.attributes.${a}.mod`;
      let field = data.attributes[a].mod;
      let upData = parseInt(abl.value || 0) + parseInt(attrMod[a] || 0);
      setProperty(actorData, target, (field = upData));

      // abl.mod = parseInt(abl.value || 0) + parseInt(attrMod[a] || 0);
      abl.label = CONFIG.ALIENRPG.attributes[a];
    }

    for (let [s, skl] of Object.entries(data.skills)) {
      const conSkl = skl.ability;
      let target = `data.skills.${s}.mod`;
      let field = data.skills[s].mod;
      let upData = parseInt(skl.value || 0) + parseInt(actorData.data.attributes[conSkl].mod || 0) + parseInt(sklMod[s] || 0);
      setProperty(actorData, target, (field = upData));
      skl.label = CONFIG.ALIENRPG.skills[s];
    }
    // Loop through the items and update the actors AC
    let totalAc = 0;
    let totalWat = 0;
    let totalFood = 0;
    let totalAir = 0;
    let totalPower = 0;

    for (let i of actorData.items) {
      try {
        //  Update armor value fron items
        i.data.attributes.armorrating.value === true;
        if (i.data.header.active) {
          i.data.attributes.armorrating.value && i.data.header;
          i.data.attributes.armorrating.value = i.data.attributes.armorrating.value || 0;
          i.totalAc = parseInt(i.data.attributes.armorrating.value, 10);
          totalAc += i.totalAc;
        }
      } catch {}

      try {
        //  Update water value fron items
        i.data.attributes.water.value === true;
        if (i.data.header.active) {
          i.data.attributes.water.value = i.data.attributes.water.value || 0;
          i.totalWat = parseInt(i.data.attributes.water.value, 10);
          totalWat += i.totalWat;
        }
      } catch {}
      try {
        //  Update food value fron items
        i.data.attributes.food.value === true;
        if (i.data.header.active) {
          i.data.attributes.food.value = i.data.attributes.food.value || 0;
          i.totalFood = parseInt(i.data.attributes.food.value, 10);
          totalFood += i.totalFood;
        }
      } catch {}
      try {
        //  Update air value fron items
        i.data.attributes.airsupply.value === true;
        if (i.data.header.active) {
          i.data.attributes.airsupply.value = i.data.attributes.airsupply.value || 0;
          i.totalAir = parseInt(i.data.attributes.airsupply.value, 10);
          totalAir += i.totalAir;
        }
      } catch {}
      try {
        //  Update air value fron items
        i.data.attributes.power.value === true;
        if (i.data.header.active) {
          i.data.attributes.power.value = i.data.attributes.power.value || 0;
          i.totalPower = parseInt(i.data.attributes.power.value, 10);
          totalPower += i.totalPower;
        }
      } catch {}
    }

    setProperty(actorData, 'data.consumables.water.value', (data.consumables.water.value = totalWat));
    setProperty(actorData, 'data.consumables.food.value', (data.consumables.food.value = totalFood));
    setProperty(actorData, 'data.consumables.air.value', (data.consumables.air.value = totalAir));
    setProperty(actorData, 'data.consumables.power.value', (data.consumables.power.value = totalPower));
    setProperty(actorData, 'data.general.armor.value', (data.general.armor.value = totalAc));
    // actorData.data.general.armor.value = totalAc;

    // data.actor.data.general.radiation.calculatedMax = data.actor.data.general.radiation.max; // Update
    // this.actor.update({ 'general.radiation.calculatedMax': data.actor.data.general.radiation.max });
    setProperty(actorData, 'general.radiation.calculatedMax', (data.general.radiation.calculatedMax = data.general.radiation.max));

    // // data.actor.data.general.xp.calculatedMax = data.actor.data.general.xp.max; // Update
    // this.actor.update({ 'general.xp.calculatedMax': data.actor.data.general.xp.max });
    setProperty(actorData, 'general.xp.calculatedMax', (data.general.xp.calculatedMax = data.general.xp.max));

    // // data.actor.data.general.starving.calculatedMax = data.actor.data.general.starving.max; // Update
    // this.actor.update({ 'general.starving.calculatedMax': data.actor.data.general.starving.max });
    setProperty(actorData, 'general.starving.calculatedMax', (data.general.starving.calculatedMax = data.general.starving.max));

    // // data.actor.data.general.dehydrated.calculatedMax = data.actor.data.general.dehydrated.max; // Update
    // this.actor.update({ 'general.dehydrated.calculatedMax': data.actor.data.general.dehydrated.max });
    setProperty(actorData, 'general.dehydrated.calculatedMax', (data.general.dehydrated.calculatedMax = data.general.dehydrated.max));

    // // data.actor.data.general.exhausted.calculatedMax = data.actor.data.general.exhausted.max; // Update
    // this.actor.update({ 'general.exhausted.calculatedMax': data.actor.data.general.exhausted.max });
    setProperty(actorData, 'general.exhausted.calculatedMax', (data.general.exhausted.calculatedMax = data.general.exhausted.max));

    // // data.actor.data.general.freezing.calculatedMax = data.actor.data.general.freezing.max; // Update
    // this.actor.update({ 'general.freezing.calculatedMax': data.actor.data.general.freezing.max });
    setProperty(actorData, 'general.freezing.calculatedMax', (data.general.freezing.calculatedMax = data.general.freezing.max));

    // // data.actor.data.general.panic.calculatedMax = data.actor.data.general.panic.max; // Update
    // this.actor.update({ 'general.panic.calculatedMax': data.actor.data.general.panic.max });
    if (actorData.type === 'character') {
      setProperty(actorData, 'general.panic.calculatedMax', (data.general.panic.calculatedMax = data.general.panic.max));
    }
    // this.actor.update({ 'data.header.health.max': actorData.attributes.str.value });
    setProperty(actorData, 'header.health.max', (data.header.health.max = data.attributes.str.value));
  }

  _prepareVehicleData(data) {}
  _prepareCreatureData(actorData) {
    // super.prepareDerivedData();
    // console.log('🚀 ~ file: actor.js ~ line 268 ~ alienrpgActor ~ _prepareCreatureData ~ data', actorData);
    // // this.actor.update({ 'data.header.health.tmp': this.actor.data.data.header.health.value });
    // if (actorData.header.health.max === 0 || actorData.header.health.value > actorData.header.health.max) {
    //   // this.actor.update({ 'data.header.health.max': this.actor.data.data.header.health.value });
    //   setProperty(actorData, 'actorData.health.max', (actorData.header.health.max = actorData.header.health.value));
    // }
  }
  _prepareTeritoryData(data) {}

  _prepareTokenImg() {
    if (game.settings.get('alienrpg-improved-ui', 'defaultTokenSettings')) {
      if (this.data.token.img == 'icons/svg/mystery-man.svg' && this.data.token.img != this.img) {
        this.data.token.img = this.img;
      }
    }
  }

  static async checkAndEndPanic(actor) {
    if (actor.data.type != 'character') return;

    if (actor.data.data.general.panic.lastRoll > 0) {
      actor.update({ 'data.general.panic.lastRoll': 0 });

      actor.getActiveTokens().forEach((i) => {
        i.toggleEffect('icons/svg/terror.svg', { active: false, overlay: true });
      });

      ChatMessage.create({ speaker: { actor: actor.id }, content: 'Panic is over', type: CONST.CHAT_MESSAGE_TYPES.OTHER });
    }
  }

  static async causePanic(actor) {
    actor.update({ 'data.general.panic.value': actor.data.data.general.panic.value + 1 });

    actor.getActiveTokens().forEach((i) => {
      i.toggleEffect('icons/svg/terror.svg', { active: true, overlay: true });
    });
  }

  async rollAbility(actor, dataset) {
    // console.log("🚀 ~ file: actor.js ~ line 311 ~ alienrpgActor ~ rollAbility ~ actor", actor)
    let label = dataset.label;
    let r2Data = 0;
    let reRoll = false;
    let effectiveActorType = actor.data.type ;
    game.alienrpg.rollArr.sCount = 0;
    game.alienrpg.rollArr.multiPush = 0;

    let modifier=parseInt(dataset?.mod??0) +parseInt(dataset?.modifier??0);
    let stressMod=parseInt(dataset?.stressMod??0);
     
    // the dataset value is returned to the DOM so it should be set to 0 in case a future roll is made without the
    // modifier dialog.
      
      dataset.modifier=0;
      dataset.stressMod=0;
      
    if (dataset.roll) {
      let r1Data = parseInt(dataset.roll || 0) + parseInt(modifier);
      if (dataset.attr) {
        r1Data = parseInt(modifier);
      }
        
      reRoll = true;
      r2Data = 0;
        
      if (actor.data.type === 'character') {
        reRoll = false;
        r2Data = actor.getRollData().stress + parseInt(stressMod );
      } else
      if (actor.data.type === 'synthetic') {
          if (actor.data.data.header.synthstress){
            effectiveActorType='character'; // make rolls look human
            reRoll = false;
          }
      }

      let blind = false;
      if (dataset.spbutt === 'armor' && r1Data < 1) {
        return;
      } else if (dataset.spbutt === 'armor') {
        label = 'Armor';
        r2Data = 0;
        reRoll = true;
      }
      if (actor.data.token.disposition === -1) {
          blind = true;
      }
     
      yze.yzeRoll(effectiveActorType, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actor.id);
      game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
    } else {
      if (dataset.panicroll) {

        // Roll against the panic table and push the roll to the chat log.
        let chatMessage = '';
        const table = game.tables.getName('Panic Table');
        // let aStress = actor.getRollData().stress;

        let rollModifier = parseInt(modifier) + parseInt(stressMod) ;
          
        let aStress = 0;

        if (actor.data.type === 'synthetic') {
            if (!actor.data.data.header.synthstress) return;
            
          actor.data.data.header.stress = new Object({ mod: '0' });
          actor.data.data.general.panic = new Object({ lastRoll: '0', value: '0' });
          aStress = 0;
        } else aStress = actor.getRollData().stress + rollModifier + parseInt(actor.data.data.header.stress.mod);

        let modRoll = '1d6' + '+' + parseInt(aStress);
     //   console.warn('rolling stress', modRoll);
        const roll = new Roll(modRoll);
        const customResults = table.roll({ roll });
        let oldPanic = actor.data.data.general.panic.lastRoll;

        if (customResults.roll.total >= 7 && actor.data.data.general.panic.value === 0) {
          alienrpgActor.causePanic(actor);
        }

        chatMessage += '<div class="panic"><span>' + game.i18n.localize('ALIENRPG.PanicCondition') + '</span></div>';
        chatMessage += `<h4><i>${table.data.description}</i></h4>`;
        let mPanic = customResults.roll.total < actor.data.data.general.panic.lastRoll;

        let pCheck = oldPanic + 1;
        if (actor.data.data.general.panic.value && mPanic) {
          actor.update({ 'data.general.panic.lastRoll': pCheck });

          chatMessage +=
              `<div class="dice-roll">
                    <div class="dice-result"><div class="dice-formula">${modRoll}</div><div class="dice-total">${customResults.roll.total}</div></div>
                </div>
                <h3 class="panic-description more-panic">${game.i18n.localize('ALIENRPG.MorePanic')}!</h3>
                <div class="panic-description more-panic"><i>${game.i18n.localize('ALIENRPG.PCPanicLevel')} ${game.i18n.localize('ALIENRPG.Seepage104')}</i></div>
                <div class="panic-description">${this.morePanic(pCheck)}</div>
                <div class="panic"><span class="blink"><i class="fa fa-exclamation-triangle"></i></span><span class="blink">${game.i18n.localize('ALIENRPG.YouAreAtPanic')} ${game.i18n.localize('ALIENRPG.Level')} ${pCheck}</span><span class="blink"><i class="fa fa-exclamation-triangle"></i></span></div>`
        } else {
          if (actor.data.type === 'character') actor.update({ 'data.general.panic.lastRoll': customResults.roll.total });
          pCheck = customResults.roll.total;
          chatMessage += `<div class="dice-roll">
            <div class="dice-result"><div class="dice-formula">${modRoll}</div><div class="dice-total">${pCheck}</div></div>
          </div>`
          // chatMessage += game.i18n.localize(`ALIENRPG.${customResults.results[0].text}`);
          chatMessage += `<div class="panic-description">${this.morePanic(pCheck)}</div>`;
          if (customResults.roll.total >= 7) {
            chatMessage += `<div class="panic"><span class="blink"><i class="fa fa-exclamation-triangle"></i></span><span class="blink">${game.i18n.localize('ALIENRPG.YouAreAtPanic')} ${game.i18n.localize('ALIENRPG.Level')} ${pCheck}</span><span class="blink"><i class="fa fa-exclamation-triangle"></i></span></div>`;
          }
        }
        let trauma = customResults.roll.total >= 13 || pCheck >= 13;
        if (trauma) {
          chatMessage +=
            `<h3 class="panic-description more-panic">${game.i18n.localize('ALIENRPG.PermanantTrauma')}!</h3>
            <div class="panic-description more-panic"><i>${game.i18n.localize('ALIENRPG.TraumaRoll')} ${game.i18n.localize('ALIENRPG.Seepage106')}</i></div>`;
        }

        let rollMode = game.settings.get('core', 'rollMode');
        let whispertarget = [];

        if (rollMode == 'gmroll' || rollMode == 'blindroll') {
          whispertarget = game.users.entities.filter((u) => u.isGM).map((u) => u._id);
        } else if (rollMode == 'selfroll') {
          whispertarget = game.users.entities.filter((u) => u.isGM).map((u) => u._id);
          whispertarget.push(game.user._id);
        }

        let blind = false;
        if (rollMode == 'blindroll') {
          blind = true;
          if (!game.user.isGM) {
            function SelfMessage(content, sound) {
              let selftarget = [];
              selftarget.push(game.user._id);

              ChatMessage.create({ speaker: { actor: actor.id }, content, whisper: selftarget, type: CONST.CHAT_MESSAGE_TYPES.OTHER, sound, blind: false });
            }

            SelfMessage('<h2 style=" color: #f71403; font-weight: bold;" >' + game.i18n.localize('ALIENRPG.PanicCondition') + addSign(rollModifier).toString() + ' ???</h2>', CONFIG.sounds.dice);
          }
        }

        ChatMessage.create({
          speaker: {
            actor: actor.id,
          },

          content: chatMessage,
          whisper: whispertarget,
          roll: customResults.roll,
          type: CONST.CHAT_MESSAGE_TYPES.ROLL,
          sound: CONFIG.sounds.dice,
          blind,
        });
      }
    }
  }

  async rollAbilityMod(actor, dataset) {

      
 
          
           
      function myRenderTemplate(template){
               let confirmed = false;
               renderTemplate(template).then((dlg) => {
                     new Dialog({
                       title: game.i18n.localize('ALIENRPG.DialTitle1') + ' ' + dataset.label + ' ' + game.i18n.localize('ALIENRPG.DialTitle2'),
                       content: dlg,
                       buttons: {
                         one: {
                           icon: '<i class="fas fa-check"></i>',
                           label: game.i18n.localize('ALIENRPG.DialRoll'),
                           callback: () => (confirmed = true),
                         },
                         two: {
                           icon: '<i class="fas fa-times"></i>',
                           label: game.i18n.localize('ALIENRPG.DialCancel'),
                           callback: () => (confirmed = false),
                         },
                       },
                       default: 'one',
                       close: (html) => {
                         if (confirmed) {
                           let modifier = parseInt(html.find('[name=modifier]')[0]?.value);
                           let stressMod = html.find('[name=stressMod]')[0]?.value;
                           
                            if (stressMod == 'undefined') {stressMod=0;} else stressMod=parseInt(stressMod);
                            if (modifier == 'undefined') {modifier=0;} else modifier=parseInt(modifier);
                            if (isNaN(modifier)) modifier = 0;
                            if (isNaN(stressMod)) stressMod=0;
                                
                            dataset.modifier = modifier;
                            dataset.stressMod = stressMod;
                            actor.rollAbility(actor, dataset);
                         }
                       },
                     }).render(true);
                   });
               
           };
      
      
    if (dataset.roll) {

      // callpop upbox here to get any mods then use standard RollAbility()
   
     
        if (actor.data.type === 'character' && (dataset.spbutt != 'armor')){
            myRenderTemplate('systems/alienrpg-improved-ui/templates/dialog/roll-all-dialog.html');
        }
        else if (actor.data.type === 'synthetic') {
            myRenderTemplate('systems/alienrpg-improved-ui/templates/dialog/roll-base-dialog.html');
        } else
        {
            myRenderTemplate('systems/alienrpg-improved-ui/templates/dialog/roll-base-dialog.html');
        }
  
    } else if (dataset.panicroll) {
      // Roll against the panic table and push the roll to the chat log.
         myRenderTemplate('systems/alienrpg-improved-ui/templates/dialog/roll-stress-dialog.html');
    }
  }

  async nowRollItem(item, event) {
    if (item.type === 'weapon' || item.type === 'armor') {
      // Trigger the item roll
      return item.roll(false);
    }
  }

  async rollItemMod(item, event) {
    if (item.type === 'weapon') {
      // Trigger the item roll
      return item.roll(true);
    }
  }

  async stressChange(actor, dataset) {
    switch (dataset.pmbut) {
      case 'minusStress':
        actor.update({ 'data.header.stress.value': actor.data.data.header.stress.value - 1 });
        break;
      case 'plusStress':
        actor.update({ 'data.header.stress.value': actor.data.data.header.stress.value + 1 });
        break;
      case 'minusHealth':
        actor.update({ 'data.header.health.value': actor.data.data.header.health.value - 1 });
        break;
      case 'plusHealth':
        actor.update({ 'data.header.health.value': actor.data.data.header.health.value + 1 });
        break;

      default:
        break;
    }
  }

  async checkMarks(actor, event) {
    const field = $(event.currentTarget).siblings('input[type="hidden"]');
    const max = field.data('max') == undefined ? 4 : field.data('max');
    const statIsItemType = field.data('stat-type') == undefined ? false : field.data('stat-type'); // Get the current level and the array of levels
    const level = parseFloat(field.val());
    let newLevel = ''; // Toggle next level - forward on click, backwards on right

    if (event.type === 'click') {
      newLevel = Math.clamped(level + 1, 0, max);
    } else if (event.type === 'contextmenu') {
      newLevel = Math.clamped(level - 1, 0, max);
      if (field[0].name === 'data.general.panic.value') {
        alienrpgActor.checkAndEndPanic(actor);
      }
    } // Update the field value and save the form
    field.val(newLevel);
    return event;
  }

  async consumablesCheck(actor, consUme, label, consumables) {
    let r1Data = 0;
    let r2Data = 0;
    r2Data = actor.data.data.consumables[`${consUme}`].value;
    let reRoll = true;
    // let hostile = this.actor.data.data.type;
    let blind = false;

    if (actor.data.token.disposition === -1) {
      blind = true;
    }
    if (r2Data <= 0) {
      return ui.notifications.warn(game.i18n.localize('ALIENRPG.NoSupplys'));
    } else {
      yze.yzeRoll('supply', blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actor.id);
      if (game.alienrpg.rollArr.r2One) {
        let itemId = consumables.find(showme)[0].item;
        let itemVal = consumables.find(showme)[0][`${consUme}`];
        let mitem = actor.getOwnedItem(itemId);
        let field = '';
        switch (consUme) {
          case 'air':
            field = `data.attributes.airsupply.value`;
            await mitem.update({ [field]: itemVal - game.alienrpg.rollArr.r2One });
            await actor.update({ 'data.consumables.air.value': actor.data.data.consumables.air.value - game.alienrpg.rollArr.r2One });
            break;
          case 'food':
            field = `data.attributes.${consUme}.value`;
            await mitem.update({ [field]: itemVal - game.alienrpg.rollArr.r2One });
            await actor.update({ 'data.consumables.food.value': actor.data.data.consumables.food.value - game.alienrpg.rollArr.r2One });
            break;
          case 'power':
            field = `data.attributes.${consUme}.value`;
            await mitem.update({ [field]: itemVal - game.alienrpg.rollArr.r2One });
            await actor.update({ 'data.consumables.power.value': actor.data.data.consumables.power.value - game.alienrpg.rollArr.r2One });
            break;
          case 'water':
            field = `data.attributes.${consUme}.value`;
            await mitem.update({ [field]: itemVal - game.alienrpg.rollArr.r2One });
            await actor.update({ 'data.consumables.water.value': actor.data.data.consumables.water.value - game.alienrpg.rollArr.r2One });
            break;
        }
      }
    }

    function showme(consumables) {
      // console.warn('alienrpgActorSheet -> showme -> ', consumables[0][consUme] >= 1);
      return consumables[0][consUme] >= 1;
    }
  }

  async creatureAcidRoll(actor, dataset) {
    let template = 'systems/alienrpg-improved-ui/templates/dialog/roll-base-xeno-dialog.html';
    let label = dataset.label;
    let r1Data = parseInt(dataset.roll || 0);
    let r2Data = 0;
    let reRoll = true;
    let hostile = 'creature';
    let blind = false;
    if (dataset.roll != '-') {
      if (dataset.spbutt === 'armor' && r1Data < 1) {
        return;
      } else if (dataset.spbutt === 'armor') {
        label = 'Armor';
        r2Data = 0;
      }

      if (actor.data.token.disposition === -1) {
        // hostile = true;
        blind = true;
      }

      // callpop upbox here to get any mods then update r1Data or rData as appropriate.
      let confirmed = false;
      renderTemplate(template).then((dlg) => {
        new Dialog({
          title: game.i18n.localize('ALIENRPG.DialTitle1') + ' ' + label + ' ' + game.i18n.localize('ALIENRPG.DialTitle2'),
          content: dlg,
          buttons: {
            one: {
              icon: '<i class="fas fa-check"></i>',
              label: game.i18n.localize('ALIENRPG.DialRoll'),
              callback: () => (confirmed = true),
            },
            two: {
              icon: '<i class="fas fa-times"></i>',
              label: game.i18n.localize('ALIENRPG.DialCancel'),
              callback: () => (confirmed = false),
            },
          },
          default: 'one',
          close: (html) => {
            if (confirmed) {
              let modifier = parseInt(html.find('[name=damage]')[0].value);
              r1Data = r1Data + modifier;
              yze.yzeRoll(hostile, blind, reRoll, label, r1Data, 'Black', r2Data, 'Stress', actor.id);
            }
          },
        }).render(true);
      });
    } else {
      // Roll against the panic table and push the roll to the chat log.
      let chatMessage = '';
      chatMessage += '<h3>' + game.i18n.localize('ALIENRPG.AcidAttack') + '</h3>';
      chatMessage += `<h4><i>` + game.i18n.localize('ALIENRPG.AcidBlood') + `</i></h4>`;
      ChatMessage.create({
        user: game.user._id,
        speaker: {
          actor: actor.id,
        },
        content: chatMessage,
        whisper: game.users.entities.filter((u) => u.isGM).map((u) => u._id),
        blind: true,
      });
    }
  }

  async creatureAttackRoll(actor, dataset) {
    let chatMessage = '';
    const targetTable = dataset.atttype;
    const table = game.tables.entities.find((b) => b.name === targetTable);
    const roll = new Roll('1d6');

    const customResults = table.roll({ roll });
    chatMessage += '<h3>' + game.i18n.localize('ALIENRPG.AttackRoll') + '</h3>';
    chatMessage += `<h4><i>${table.data.description}</i></h4>`;
    chatMessage += `${customResults.results[0].text}`;
    ChatMessage.create({
      user: game.user._id,
      speaker: {
        actor: actor.id,
      },
	  roll:customResults.roll,
      content: chatMessage,
     // whisper: game.users.entities.filter((u) => u.isGM).map((u) => u._id),
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    });
  }

  morePanic(pCheck) {
    let con = '';
    switch (pCheck) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        con = game.i18n.localize('ALIENRPG.Panic1');
        break;
      case 7:
        con = game.i18n.localize('ALIENRPG.Panic7');
        break;
      case 8:
        con = game.i18n.localize('ALIENRPG.Panic8');
        break;
      case 9:
        con = game.i18n.localize('ALIENRPG.Panic9');
        break;
      case 10:
        con = game.i18n.localize('ALIENRPG.Panic10');
        break;
      case 11:
        con = game.i18n.localize('ALIENRPG.Panic11');
        break;
      case 12:
        con = game.i18n.localize('ALIENRPG.Panic12');
        break;
      case 13:
        con = game.i18n.localize('ALIENRPG.Panic13');
        break;
      case 14:
        con = game.i18n.localize('ALIENRPG.Panic14');
        break;
      default:
        con = game.i18n.localize('ALIENRPG.Panic15');
        break;
    }
    return con;
  }
}
export default alienrpgActor;
