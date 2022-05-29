// ==UserScript==
// @name         </> Serplent Raid Mod
// @namespace    https://serplent-web.glitch.me/
// @version      vSerplentModAlpha2022
// @description  Good Raids :D
// @author       Serplent
// @match        zombs.io
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zombs.io
// @grant        none
// ==/UserScript==
let styles =`
#hud-menu-party {
    top: 51%;
    width: 610px;
    height: 550px;
}
::-webkit-scrollbar {
	width: 12px;
    height: 0px;
    border-radius: 10px;
	background-color: rgba(0, 0, 0, 0);
}
::-webkit-scrollbar-thumb {
	border-radius: 10px;
	background-image: url(https://cdn.discordapp.com/attachments/854376044522242059/924927754326142976/whiteslider.png);
}
`
let menu = document.querySelector("#hud-menu-settings");
menu.style.overflow = "auto";
menu.innerHTML = `
<h1>Serplent Mod - Raid Menu</h1>
<div style="text-align:center">
<hr>
<h3>Alts</h3>
<hr>
<button class="btn btn-green" style="width: 49%;" id="B_SendAlt">Send Alt</button>
<button class="btn btn-green" style="width: 49%;"id="B_AltMove">Stay</button>
<br>
<button class="btn btn-red" style="width: 49%;"id="B_DeleteAlts">Delete Alts</button>
<input  class="btn btn-white" style="width: 49%;"type="text" maxlength="20" placeHolder="Alt Hit Psk..." id="B_AltHitInput"></input>
<hr>
<h3>Attack</h3>
<hr>
<button class="btn btn-red" style="width: 49%;"id="B_AutoBuySpear">Auto Buy Spear</button>
<button class="btn btn-red" style="width: 49%;"id="B_AutoEquipSpear">Auto Equip Spear</button>
<br>
<button class="btn btn-red" style="width: 49%;"id="B_AutoBuyBomb">Auto Buy Bomb</button>
<button class="btn btn-red" style="width: 49%;"id="B_AutoEquipBomb">Auto Equip Bomb</button>
<br>
<button class="btn btn-red" style="width: 49%;"id="B_AutoRespawn">Auto Respawn</button>
<hr>
<h3>Healing<h3>
<hr>
<input class="btn btn-white"type="text" style="width: 49%;"id="I_AutoHeal" value="75"maxlength="3" >
<button class="btn btn-red" style="width: 49%;"id="B_AutoHeal">Auto Heal</button>
<br>
<input class="btn btn-white"type="text" style="width: 49%;"id="I_AutoHealPet" value="75"maxlength="3" >
<button class="btn btn-red" style="width: 49%;"id="B_AutoHealPet">Auto Heal Pet</button>
<hr>
<h3>Selling</h3>
<hr>
<input type="text" class="btn btn-white" value="150" id="sell-input" style="width: 24%" placeholder="100-250ms">
<button id="sellall" style="width: 24%;" class="btn btn-red">Sell All</button>
<button id="sellwall" style="width: 24%;" class="btn btn-red">Wall</button>
<button id="selldoor" style="width: 24%;" class="btn btn-red">Door</button>
<br>
<button id="selltrap" style="width: 24%;" class="btn btn-red">Slow Trap</button>
<button id="sellharvester" style="width: 24%;" class="btn btn-red">Harvester</button>
<button id="sellarrow" style="width: 24%;" class="btn btn-red">Arrow</button>
<button id="sellcannon" style="width: 24%;"class="btn btn-red">Cannon</button>
<br>
<button id="sellmelee" style="width: 24%;"class="btn btn-red">Melee</button>
<button id="sellbomb" style="width: 24%;"class="btn btn-red">Bomb</button>
<button id="sellmagic" style="width: 24%;"class="btn btn-red">Mage</button>
<button id="sellminer" style="width: 24%;"class="btn btn-red">Gold Miner</button>

<hr>
<h3>Chat Filter</h3>
<hr>
<button class="btn btn-green" style="width: 99%;" id="chatFilter" filter="all">All</button>
\n<input type="text" class="btn" id="nameToBlock" style="width: 99%; margin-top: 1%;" maxlength=35 placeholder="Name of person you want to block/unblock..."></input>
\n<button class="btn btn-red" id="blockName" style="width: 49%; margin-top: 1%;">Block</button>
<button class="btn btn-green" id="unblockName" style="margin-top: 1%; margin-left: 1%; width: 49%;">Unblock</button>
\n<button class="btn btn-green" id="showBlocked" style="width:99%; margin-top: 1%;">Show Blocked Names</button>
\n<div style="margin-top: 1%;" id="blockNamesList"></div>
</div>
`
let sellUid = []
function sellAllByType(type) {
    let buildings = Object.values(game.ui.buildings)
    for (let i = 0; i < buildings.length; i++){
        if (Object.values(Object.values(game.ui.buildings)[i])[2] == type){
            sellUid.push(Object.values(Object.values(game.ui.buildings)[i])[4])
        }
    }
    let sellInterval = setInterval(() => {
        if (sellUid.length > 0 && game.ui.playerPartyCanSell) {
            game.network.sendRpc({
                name: "DeleteBuilding",
                uid: parseInt(sellUid.shift())
            })
        } else {
            clearInterval(sellInterval)
        }
    },document.getElementById("sell-input").value);
}

document.getElementById("sellall").addEventListener('click', function() {
    Game.currentGame.ui.getComponent("PopupOverlay").showConfirmation("Are you sure you want to delete all towers?", 1e4, function() {
        let buildings = Object.values(game.ui.buildings)
        for (let i = 0; i < buildings.length; i++){
            if (Object.values(Object.values(game.ui.buildings)[i])[2] != "GoldStash"){
                sellUid.push(Object.values(Object.values(game.ui.buildings)[i])[4])
            }
        }
        let sellInterval = setInterval(() => {
            if (sellUid.length > 0 && game.ui.playerPartyCanSell) {
                game.network.sendRpc({
                    name: "DeleteBuilding",
                    uid: parseInt(sellUid.shift())
                })
            } else {
                clearInterval(sellInterval)
            }
        },document.getElementById("sell-input").value);
    })
})

/*------------------Auto Heal------------------*/
let V_AutoHeal = true;
let V_CanBuyHeal = true;
document.getElementById('B_AutoHeal').addEventListener('click', function(){
    V_AutoHeal = !V_AutoHeal;
    document.getElementById('B_AutoHeal').className = V_AutoHeal? "btn btn-green" : "btn btn-red";
})
game.network.addEntityUpdateHandler(() => {
    if(V_AutoHeal && V_LoggedIn){
        try{
            let HealthPercentage = game.ui.playerTick.health / game.ui.playerTick.maxHealth * 100
            if(HealthPercentage <= parseInt(document.getElementById('I_AutoHeal').value) && V_CanBuyHeal == false) {
                V_CanBuyHeal = null;
                game.network.sendRpc({"name": "EquipItem","itemName": "HealthPotion","tier": 1});
                setTimeout(function(){
                    V_CanBuyHeal = true;
                    console.log('ff');
                }, 10000)
            }
            if(document.getElementsByClassName('hud-toolbar-item')[5].classList[1] && V_CanBuyHeal && game.ui.playerTick.gold >= 100) {
                V_CanBuyHeal = false;
                game.network.sendRpc({"name": "BuyItem","itemName": "HealthPotion","tier": 1});
            }
        }catch{}
    }
})
/*------------------Auto Heal Pet------------------*/
let V_AutoHealPet = true;
let V_CanBuyHealPet = true;
let V_LoggedIn = true;
document.getElementById('B_AutoHealPet').addEventListener('click', function(){
    V_AutoHealPet = !V_AutoHealPet;
    document.getElementById('B_AutoHealPet').className = V_AutoHealPet? "btn btn-green" : "btn btn-red";
})
game.network.addEntityUpdateHandler(() => {
    if(V_AutoHealPet && V_LoggedIn){
        try{
            let PetHealthPercentage = game.ui.playerPetTick.health / game.ui.playerPetTick.maxHealth * 100
            if(PetHealthPercentage <= parseInt(document.getElementById('I_AutoHealPet').value)) {
                game.network.sendRpc({"name": "EquipItem","itemName": "PetHealthPotion","tier": 1});
                setTimeout(function(){
                    V_CanBuyHealPet = true;
                }, 15000)
            }
            if(document.getElementsByClassName('hud-toolbar-item')[5].classList[1] && V_CanBuyHealPet && game.ui.playerTick.gold >= 100) {
                V_CanBuyHealPet = false;
                game.network.sendRpc({"name": "BuyItem","itemName": "PetHealthPotion","tier": 1});
            }
        }catch{}
    }
})
let V_AutoBuySpear = false;
document.getElementById('B_AutoBuySpear').addEventListener('click', function(){
    V_AutoBuySpear = !V_AutoBuySpear;
    document.getElementById('B_AutoBuySpear').className = V_AutoBuySpear? "btn btn-green" : "btn btn-red";
})
game.network.addEntityUpdateHandler(() => {
    if(V_AutoBuySpear){
        if (game.ui.components.MenuShop.shopItems.Spear.nextTier === 1 && game.ui.playerTick.gold >= 1400) {
            game.ui.components.MenuShop.shopItems.Spear.componentElem.click();
        }
        if (game.ui.components.MenuShop.shopItems.Spear.nextTier === 2 && game.ui.playerTick.gold >= 2800) {
            game.ui.components.MenuShop.shopItems.Spear.componentElem.click();
        }
    }
})
/*------------------Auto Equip Spear------------------*/
let V_AutoEquipSpear = false;
document.getElementById('B_AutoEquipSpear').addEventListener('click', function(){
    V_AutoEquipSpear = !V_AutoEquipSpear;
    document.getElementById('B_AutoEquipSpear').className = V_AutoEquipSpear? "btn btn-green" : "btn btn-red";
})
game.network.addEntityUpdateHandler(() => {
    if(V_AutoEquipSpear){
        if (game.ui.playerWeaponName != "Spear") game.network.sendRpc({name: "EquipItem", itemName: "Spear", tier: game.ui.components.MenuShop.shopItems.Spear.itemTier});
    }
})
/*------------------Auto Buy Bomb------------------*/
let V_AutoBuyBomb = false;
document.getElementById('B_AutoBuyBomb').addEventListener('click', function(){
    V_AutoBuyBomb = !V_AutoBuyBomb;
    document.getElementById('B_AutoBuyBomb').className = V_AutoBuyBomb? "btn btn-green" : "btn btn-red";
})
game.network.addEntityUpdateHandler(() => {
    if(V_AutoBuyBomb){
        if (game.ui.components.MenuShop.shopItems.Bomb.nextTier === 1 && game.ui.playerTick.gold >= 100) {
            game.ui.components.MenuShop.shopItems.Bomb.componentElem.click();
        }
        if (game.ui.components.MenuShop.shopItems.Bomb.nextTier === 2 && game.ui.playerTick.gold >= 400) {
            game.ui.components.MenuShop.shopItems.Bomb.componentElem.click();
        }
    }
})
/*------------------Auto Equip Bomb------------------*/
let V_AutoEquipBomb = false;
document.getElementById('B_AutoEquipBomb').addEventListener('click', function(){
    V_AutoEquipBomb = !V_AutoEquipBomb;
    document.getElementById('B_AutoEquipBomb').className = V_AutoEquipBomb? "btn btn-green" : "btn btn-red";
})
game.network.addEntityUpdateHandler(() => {
    if(V_AutoEquipBomb){
        if (game.ui.playerWeaponName != "Bomb") game.network.sendRpc({name: "EquipItem", itemName: "Bomb", tier: game.ui.components.MenuShop.shopItems.Bomb.itemTier});
    }
})
/*------------------Auto Respawn------------------*/
let V_AutoRespawn = false;
document.getElementById('B_AutoRespawn').addEventListener('click', function(){
    V_AutoRespawn = !V_AutoRespawn;
    document.getElementById('B_AutoRespawn').className = V_AutoRespawn? "btn btn-green" : "btn btn-red";
})
game.network.addEntityUpdateHandler(() => {
    if(V_AutoRespawn){
        document.getElementsByClassName("hud-respawn-btn")[0].click();
    }
})
//#Chat Filter By Apex
const getId = ID => {
    return document.getElementById(ID);
}

const getElement = ELEMENT => {
    return document.getElementsByClassName(ELEMENT);
}
if (localStorage.getItem("blockedNames") == null) {
    localStorage.setItem("blockedNames", "[]");
}
let filterButton = getId("chatFilter");
filterButton.onclick = () => {
    let f = filterButton.getAttribute("filter");
    let newF = "all";
    if (f == "all") {
        newF = "party";
    } else if (f == "party") {
        newF = "none";
    } else if (f == "none") {
        newF = "all";
    }
    filterButton.setAttribute("filter", newF);
    switch (newF) {
        case "all":
            filterButton.setAttribute("class", "btn btn-green");
            filterButton.textContent = "All";
            break;
        case "party":
            filterButton.setAttribute("class", "btn btn-gold");
            filterButton.textContent = "Party";
            break;
        case "none":
            filterButton.setAttribute("class", "btn btn-red");
            filterButton.textContent = "None";
            break;
    }
}

let blockButton = getId("blockName");
blockButton.onclick = () => {
    let blocked = JSON.parse(localStorage.getItem("blockedNames"));
    let nameToBlock = getId("nameToBlock").value;
    if (blocked.includes(nameToBlock)) return;
    blocked.push(nameToBlock);
    localStorage.setItem("blockedNames", JSON.stringify(blocked));
}

let unblockButton = getId("unblockName");
unblockButton.onclick = () => {
    let blocked = JSON.parse(localStorage.getItem("blockedNames"));
    let nameToUnblock = getId("nameToBlock").value;
    if (blocked.indexOf(nameToUnblock) == -1) return;
    blocked.splice(blocked.indexOf(nameToUnblock), 1);
    localStorage.setItem("blockedNames", JSON.stringify(blocked));
}

let showBlockedButton = getId("showBlocked");
showBlockedButton.onclick = () => {
    let blocked = JSON.parse(localStorage.getItem("blockedNames"));
    let str = "<h3>";
    str += blocked.join(", ");
    str += "</h3>";
    getId("blockNamesList").innerHTML = str;
}

Game.currentGame.network.emitter.removeListener("PACKET_RPC", Game.currentGame.network.emitter._events.PACKET_RPC[1]);
let onMessageReceived = (msg => {
    let filter = filterButton.getAttribute("filter");
    switch (filter) {
        case "party":
            {
                let party = Game.currentGame.ui.playerPartyMembers;
                let uids = [];
                for (let member of party) {
                    uids.push(member.playerUid);
                }
                if (!uids.includes(msg.uid)) return;
            }
            break;
        case "none":
            return;
            break;
    }
    let blockedNames = JSON.parse(localStorage.getItem("blockedNames"));
    let a = Game.currentGame.ui.getComponent("Chat"),
        b = msg.displayName.replace(/<(?:.|\n)*?>/gm, ''),
        c = msg.message.replace(/<(?:.|\n)*?>/gm, ''),
        d = a.ui.createElement(`<div class="hud-chat-message"><strong>${b}</strong>: ${c}</div>`);
    if (blockedNames.includes(b)) return;
    a.messagesElem.appendChild(d);
    a.messagesElem.scrollTop = a.messagesElem.scrollHeight;
})
Game.currentGame.network.addRpcHandler("ReceiveChatMessage", onMessageReceived);

document.getElementsByClassName("hud-party-actions")[0].insertAdjacentHTML("afterend", `
<br>
  <button id="Spammer2" class="btn btn-red 9i" style="width: 99%;">Spam Party's</button>
  <button class="btn btn-green" style="width: 120px;margin: 10px 0 0 0;" onclick="game.network.sendRpc({ name: 'JoinPartyByShareKey', partyShareKey: document.getElementById('psk').value })">Join Party</button>
  <input id="psk" style="margin: 10px 15px 0 15px;width: 280px;" placeholder="Party share key... (not link!)" value="" class="btn" />
  <button class="btn btn-red" style="width: 120px;margin: 10px 0 0 0;box-shadow: none;" onclick="Game.currentGame.network.sendRpc({name: 'LeaveParty'});">Leave</button>
`);
let stylesMain = document.createElement("style");
stylesMain.appendChild(document.createTextNode(styles));
document.head.appendChild(stylesMain);
stylesMain.type = "text/css";
//#Party Script
function partydiv() {
  var newNode = document.createElement('div');
  newNode.className = 'tagzspam';
  newNode.style = 'text-align:center';
  document.getElementsByClassName('hud-party-actions')[0].appendChild(newNode);
}
//#Style Changes
document.getElementsByClassName("hud-menu-party")[0].setAttribute("style", "width: 610px; height: 510px;");
var Spammer = document.getElementById("Spammer2");
Spammer.addEventListener("click", spampartys);
Spammer.addEventListener("click", spampartys2);
//#Class Changes
//#Script
var partyspam = false;
function spampartys() {
  clearInterval(partyspam);
  if (partyspam !== null) {
    partyspam = null;
  } else {
    partyspam = setInterval(function() {
      let partys = document.getElementsByClassName('hud-party-link');
      for (var i = 0; i < partys.length; i++) {
        var link = partys[i];
        link.click();
      }
    }
)}}
function spampartys2() {
  var change6 = document.getElementById("sap");
}
document.getElementsByClassName("9i")[0].addEventListener('click', function() {
    spampartys2 = !spampartys2;
    document.getElementsByClassName("9i")[0].className = "btn btn-green 9i";
    document.getElementsByClassName("9i")[0].innerText = "Add Spammer";
    if (spampartys2) {
        document.getElementsByClassName("9i")[0].className = "btn btn-red 9i";
        document.getElementsByClassName("9i")[0].innerText = "Remove Spammer";
    }
})
//#Anti Error
//#Closed Parties and Keys
let script_1_1 = () => {
    game.ui.components.PlacementOverlay.oldStartPlacing = game.ui.components.PlacementOverlay.startPlacing;
    game.ui.components.PlacementOverlay.startPlacing = function(e) {
        game.ui.components.PlacementOverlay.oldStartPlacing(e);
        if (game.ui.components.PlacementOverlay.placeholderEntity) {
            game.ui.components.PlacementOverlay.direction = 2;
            game.ui.components.PlacementOverlay.placeholderEntity.setRotation(180);
        }
    }

    game.ui.components.PlacementOverlay.cycleDirection = function () {
        if (game.ui.components.PlacementOverlay.placeholderEntity) {
            game.ui.components.PlacementOverlay.direction = (game.ui.components.PlacementOverlay.direction + 1) % 4;
            game.ui.components.PlacementOverlay.placeholderEntity.setRotation(game.ui.components.PlacementOverlay.direction * 90);
        }
    };

    let getElement = (Element) => {
        return document.getElementsByClassName(Element);
    }
    let getId = (Element) => {
        return document.getElementById(Element);
    }
    getElement("hud-party-members")[0].style.display = "block";
    getElement("hud-party-grid")[0].style.display = "none";
    let privateTab = document.createElement("a");
    privateTab.className = "hud-party-tabs-link";
    privateTab.id = "privateTab";
    privateTab.innerHTML = "Closed Parties";
    let privateHud = document.createElement("div");
    privateHud.className = "hud-private hud-party-grid";
    privateHud.id = "privateHud";
    privateHud.style = "display: none;";
    getElement("hud-party-tabs")[0].appendChild(privateTab);
    getElement("hud-menu hud-menu-party")[0].insertBefore(privateHud, getElement("hud-party-actions")[0]);
    let keyTab = document.createElement("a");
    keyTab.className = "hud-party-tabs-link";
    keyTab.id = "keyTab";
    keyTab.innerHTML = "Keys";
    getElement("hud-party-tabs")[0].appendChild(keyTab);
    let keyHud = document.createElement("div");
    keyHud.className = "hud-keys hud-party-grid";
    keyHud.id = "keyHud";
    keyHud.style = "display: none;";
    getElement("hud-menu hud-menu-party")[0].insertBefore(keyHud, getElement("hud-party-actions")[0]);
    getId("privateTab").onclick = e => {
        for (let i = 0; i < getElement("hud-party-tabs-link").length; i++) {
            getElement("hud-party-tabs-link")[i].className = "hud-party-tabs-link";
        }
        getId("privateTab").className = "hud-party-tabs-link is-active";
        getId("privateHud").setAttribute("style", "display: block;");
        if (getElement("hud-party-members")[0].getAttribute("style") == "display: block;") {
            getElement("hud-party-members")[0].setAttribute("style", "display: none;");
        }
        if (getElement("hud-party-grid")[0].getAttribute("style") == "display: block;") {
            getElement("hud-party-grid")[0].setAttribute("style", "display: none;");
        }
        if (getId("privateHud").getAttribute("style") == "display: none;") {
            getId("privateHud").setAttribute("style", "display: block;");
        }
        if (getId("keyHud").getAttribute("style") == "display: block;") {
            getId("keyHud").setAttribute("style", "display: none;");
        }
    }
    getElement("hud-party-tabs-link")[0].onmouseup = e => {
        getId("privateHud").setAttribute("style", "display: none;");
        getId("keyHud").setAttribute("style", "display: none;");
        if (getId("privateTab").className == "hud-party-tabs-link is-active") {
            getId("privateTab").className = "hud-party-tabs-link"
        }
        if (getId("keyTab").className == "hud-party-tabs-link is-active") {
            getId("keyTab").className = "hud-party-tabs-link"
        }
    }
    getElement("hud-party-tabs-link")[1].onmouseup = e => {
        getId("privateHud").setAttribute("style", "display: none;");
        getId("keyHud").setAttribute("style", "display: none;");
        getId
        if (getId("privateTab").className == "hud-party-tabs-link is-active") {
            getId("privateTab").className = "hud-party-tabs-link"
        }
        if (getId("keyTab").className == "hud-party-tabs-link is-active") {
            getId("keyTab").className = "hud-party-tabs-link"
        }
    }
    getId("keyTab").onmouseup = e => {
        for (let i = 0; i < getElement("hud-party-tabs-link").length; i++) {
            getElement("hud-party-tabs-link")[i].className = "hud-party-tabs-link";
        }
        getId("keyTab").className = "hud-party-tabs-link is-active";
        getId("keyHud").setAttribute("style", "display: block;");
        if (getElement("hud-party-members")[0].getAttribute("style") == "display: block;") {
            getElement("hud-party-members")[0].setAttribute("style", "display: none;");
        }
        if (getElement("hud-party-grid")[0].getAttribute("style") == "display: block;") {
            getElement("hud-party-grid")[0].setAttribute("style", "display: none;");
        }
        if (getId("privateHud").getAttribute("style") == "display: block;") {
            getId("privateHud").setAttribute("style", "display: none;");
        }
        if (getId("keyHud").getAttribute("style") == "display: none;") {
            getId("keyHud").setAttribute("style", "display: block;");
        }
    }
    let num = 0;
    Game.currentGame.network.addRpcHandler("PartyShareKey", e => {
        let el = document.createElement('div');
        el.innerText = e.partyShareKey;
        el.className = `tag${num++}`;
        document.getElementsByClassName('hud-keys hud-party-grid')[0].appendChild(el);
        document.getElementsByClassName(el.className)[0].addEventListener('click', e => {
            game.network.sendRpc({name: "JoinPartyByShareKey", partyShareKey: el.innerText});
        })
    });
    let parties = "";
    Game.currentGame.network.addRpcHandler("SetPartyList", e => {
        parties = "";
        for (let i in e) {
            if (e[i].isOpen == 0) {
                parties += "<div style=\"width: relative; height: relative;\" class=\"hud-party-link is-disabled\"><strong>" + e[i].partyName + "</strong><span>" + e[i].memberCount + "/4<span></div>";
            }
        }
        getId("privateHud").innerHTML = parties;
    });
};
/*------------------Iframe Alts------------------*/
let sockets = [];
let V_IframesCount = 0;
let V_NearestToCursor;
document.getElementById('B_SendAlt').addEventListener('click', function(){
    let iframe = document.createElement('iframe');
    V_IframesCount++;
    iframe.id = "iframeId" + V_IframesCount;
    iframe.className = "iframeAlts";
    iframe.src = `http://zombs.io/#/${game.options.serverId}/${game.ui.playerPartyShareKey}/${iframe.id}`;
        iframe.addEventListener('load', function(e) {
        iframe.contentWindow.eval(`
          window.nearestToCursor = false;
          let iframeId = location.hash.substring(8);

          game.renderer.scene.setVisible(false);

          document.getElementsByClassName("hud-intro-play")[0].click();

          var joinedGameCheck = setTimeout(function(){
            if (document.getElementsByClassName('hud-intro-error')[0].innerHTML !== "" && !game.world.inWorld) {
              parent.game.ui.getComponent('PopupOverlay').showHint(document.getElementsByClassName('hud-intro-error')[0].innerHTML, 3000);
              parent.V_IframesCount--;
              parent.document.getElementById("iframeId" + iframeId).remove();
            }
          }, 20000)

          game.network.addEnterWorldHandler(function(e) {
                clearTimeout(joinedGameCheck);
          })

          function MoveAltTo(position){
            let x = Math.round(position.x);
            let y = Math.round(position.y);

            if (game.ui.playerTick.position.y-y > 100) {
              game.network.sendInput({down: 0})
            } else {
              game.network.sendInput({down: 1})
            }
            if (-game.ui.playerTick.position.y+y > 100) {
               game.network.sendInput({up: 0})
            } else {
               game.network.sendInput({up: 1})
            }
            if (-game.ui.playerTick.position.x+x > 100) {
               game.network.sendInput({left: 0})
            } else {
               game.network.sendInput({left: 1})
            }
            if (game.ui.playerTick.position.x-x > 100) {
               game.network.sendInput({right: 0})
            } else {
               game.network.sendInput({right: 1})
            }
          }

          game.network.addEntityUpdateHandler(() => {
            if (game.ui.playerTick){
              switch (parent.document.getElementById('B_AltMove').innerText){
                case "Follow Player":
                  MoveAltTo(parent.game.ui.playerTick.position);
                  break;
                case "Follow Cursor":
                  MoveAltTo(parent.game.renderer.screenToWorld(parent.game.ui.mousePosition.x, parent.game.ui.mousePosition.y));
                  break;
                case "Stay":
                  game.network.sendInput({left: 0});
                  game.network.sendInput({right: 0});
                  game.network.sendInput({up: 0});
                  game.network.sendInput({down: 0});
                  break;
                case "Move Exactly":
                  if(parent.document.getElementById('hud-chat').className.includes('is-focus')) break;
                  let xyVel = {x: 0, y: 0};
                  if (parent.game.inputManager.keysDown[87]) xyVel.y++; // w
                  if (parent.game.inputManager.keysDown[65]) xyVel.x--; // a
                  if (parent.game.inputManager.keysDown[83]) xyVel.y--; // s
                  if (parent.game.inputManager.keysDown[68]) xyVel.x++; // d
                  game.network.sendInput({up: xyVel.y > 0 ? 1 : 0});
                  game.network.sendInput({left: xyVel.x < 0 ? 1 : 0});
                  game.network.sendInput({down: xyVel.y < 0 ? 1 : 0});
                  game.network.sendInput({right: xyVel.x > 0 ? 1 : 0});
                  break;
              }

              //Aim
              let worldMousePos = parent.game.renderer.screenToWorld(parent.game.ui.mousePosition.x, parent.game.ui.mousePosition.y);
              if (parent.game.inputManager.mouseDown) {
                game.network.sendInput({mouseDown: 0});
                game.network.sendInput({mouseMoved: game.inputPacketCreator.screenToYaw((-game.ui.playerTick.position.x + worldMousePos.x)*100, (-game.ui.playerTick.position.y + worldMousePos.y)*100)});
              }
              if (!parent.game.inputManager.mouseDown) {
                if (!window.nearestToCursor && parent.game.inputManager.keysDown[73]) game.network.sendInput({mouseUp: 0});
                game.network.sendInput({mouseMoved: game.inputPacketCreator.screenToYaw((-game.ui.playerTick.position.x + worldMousePos.x)*100, (-game.ui.playerTick.position.y + worldMousePos.y)*100)});
              }

              if(!parent.game.inputManager.mouseDown){
                if (window.nearestToCursor && parent.game.inputManager.keysDown[73]) {
                  game.network.sendRpc({name: "JoinPartyByShareKey",partyShareKey: parent.document.getElementById('B_AltHitInput').value});
                  game.network.sendInput({mouseDown: 0});
                }
                if(parent.game.inputManager.keysDown[73] && game.ui.playerPartyShareKey === parent.document.getElementById('B_AltHitInput').value){
                  game.network.sendRpc({ name: "LeaveParty"})
                  game.network.sendInput({mouseUp: 0});
                }
                else{
                  game.network.sendInput({mouseUp: 0});
                }
              }
              //////////////////////////////////////////////////////////////////////////////////////////////////
              game.network.addRpcHandler("Dead", function(e) {
                game.network.sendPacket(3, { respawn: 1 })
              })
            }
          })
          function GetDistanceToCursor(cursorPos){
            let pos = game.ui.playerTick.position;
            let xDistance = Math.abs(pos.x - cursorPos.x);;
            let yDistance = Math.abs(pos.y - cursorPos.y);
            return Math.sqrt((xDistance * xDistance) + (yDistance * yDistance));
          }
                                              var nextWeapon = location.hostname == "zombs.io" ? 'Pickaxe' : "Crossbow";
                                var weaponOrder = location.hostname == "zombs.io" ? ['Pickaxe', 'Spear', 'Bow', 'Bomb'] : ["Crossbow", 'Pickaxe', 'Spear', 'Bow', 'Bomb'];
                                var foundCurrent = false;
                                for (let i in weaponOrder) {
                                    if (foundCurrent) {
                                        if (game.inventory[weaponOrder[i]]) {
                                            nextWeapon = weaponOrder[i];
                                            break;
                                        }
                                    }
                                    else if (weaponOrder[i] == game.myPlayer.weaponName) {
                                        foundCurrent = true;
                                    }
                                }
                                game.network.sendRpc({name: 'EquipItem', itemName: nextWeapon, tier: game.inventory[nextWeapon].tier});
        `);
        })
    iframe.style.display = 'none';
    document.body.append(iframe);
})

let V_AltMoveClicks = 0;
var V_AltMoveStyle = "Stay";
document.getElementById('B_AltMove').addEventListener('click', function(){
    let moveOrder = ["Stay", "Follow Cursor", "Follow Player", "Move Exactly"];
    V_AltMoveClicks++;
    V_AltMoveStyle = moveOrder[V_AltMoveClicks % 4]
    document.getElementById('B_AltMove').innerText = V_AltMoveStyle;
})

document.getElementById('B_DeleteAlts').addEventListener('click', function(){
    let deleteAltLoop = setInterval(function(){
        if (document.getElementsByClassName('iframeAlts').length > 0){
            for(let iframe of document.getElementsByClassName('iframeAlts')){
                iframe.remove();
            }
        }
        else{
            clearInterval(deleteAltLoop);
        }
    })
})

var nearestToCursorIframeId;
setInterval(() => {
    let nearestIframeDistance = 9999999999999999;
    for(let iframe of document.getElementsByClassName('iframeAlts')){
        if (typeof(iframe.contentWindow.nearestToCursor) === 'undefined') continue;
        iframe.contentWindow.nearestToCursor = false;
        let mousePosition = game.renderer.screenToWorld(game.ui.mousePosition.x, game.ui.mousePosition.y);
        let distance = iframe.contentWindow.GetDistanceToCursor(mousePosition);
        if(distance < nearestIframeDistance){
            nearestIframeDistance = distance;
            nearestToCursorIframeId = iframe.id;
        }
    }
    if (document.getElementById(nearestToCursorIframeId)) {
        let iframeWindow = document.getElementById(nearestToCursorIframeId).contentWindow;
        if (typeof(iframeWindow.nearestToCursor) === 'boolean'){
            iframeWindow.nearestToCursor = true;
        }
    }
},100)

document.getElementById("sellwall").addEventListener('click', () => { sellAllByType("Wall") });
document.getElementById("selldoor").addEventListener('click', () => { sellAllByType("Door") });
document.getElementById("selltrap").addEventListener('click', () => { sellAllByType("SlowTrap") });
document.getElementById("sellarrow").addEventListener('click', () => { sellAllByType("ArrowTower") });
document.getElementById("sellcannon").addEventListener('click', () => { sellAllByType("CannonTower") });
document.getElementById("sellmelee").addEventListener('click', () => { sellAllByType("MeleeTower") });
document.getElementById("sellbomb").addEventListener('click', () => { sellAllByType("BombTower") });
document.getElementById("sellmagic").addEventListener('click', () => { sellAllByType("MagicTower") });
document.getElementById("sellminer").addEventListener('click', () => { sellAllByType("GoldMine") });
document.getElementById("sellharvester").addEventListener('click', () => { sellAllByType("Harvester") });