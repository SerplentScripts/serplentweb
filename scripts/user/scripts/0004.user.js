// ==UserScript==
// @name         İframes With Commands
// @namespace    http://tampermonkey.net/
// @version      ALPHA
// @description  commands: !sendalt , !4ppl and !resetalt
// @author       Serplent
// @match        http://zombs.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zombs.io
// @grant        none
// ==/UserScript==
let sockets = [];
window.sendWs = () => {
    let hc = `
    <div class="pches" id="rmalt${window.nlt}">
        <br />
        <button class="btn btn-red" onclick="window.rmAlt(${window.nlt});" id="rmaltbtn${window.nlt}"><i class="fa fa-trash"></i> Remove Alt #${window.nlt}</button>
    </div>
    `;

    let iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `http://zombs.io/#/${game.options.serverId}/${game.ui.getPlayerPartyShareKey()}`;
    let ifd = `s${Math.floor(Math.random() * 100000)}`;
    iframe.id = ifd;
    document.body.append(iframe);

    let ifde = document.getElementById(ifd);
    ifde.addEventListener('load', function() {
        this.contentWindow.eval(`
document.querySelector(".hud-intro-play").click();
game.network.addEnterWorldHandler(() => {
    console.log("loaded alt");
    game.network.sendInput({ left: 1, up: 1 });
    game.stop();
});
`);
    });
    let si = sockets.length;
    ifde.rmh = hc;
    ifde.si = si;
    ifde.nli = window.nlt;
    sockets.push(ifde);

    window.getTabDataByType("alts").cache += hc;
    window.focusTab(window.focusedTab, { nlt: window.nlt, pche: window.getTabDataByType("alts").cache });
};

window.rmAlt = num => {
    let sck = sockets[num-1];
    window.nlt--;
    console.log(num);
    sck.remove();

    console.log(sck.nli);
};
    game.network.addRpcHandler("ReceiveChatMessage", e => {
    if (e.message == "!resetalt" && e.uid == game.world.myUid) {
    sockets.forEach(socket => { console.log(socket); socket.contentWindow.eval(`game.network.disconnect();`);});}
})

const kickAll = () => {
    sockets.forEach(socket => {
        console.log(socket);
        socket.contentWindow.eval(`
            game.network.sendRpc({
			    name: "LeaveParty"});
        `);
    });
};



const joinAll = () => {
    sockets.forEach(socket => {
        console.log(socket);
        socket.contentWindow.eval(`
            game.network.sendRpc({
			    name: "JoinPartyByShareKey",
			    partyShareKey: "${game.ui.getPlayerPartyShareKey()}"
		    });
        `);
    });
};

let isDay,
    tickStarted,
    tickToEnd,
    hasKicked = false,
    hasJoined = false;

game.network.addEntityUpdateHandler(tick => {
    if(window.playerTrickToggle) {
        if (!hasKicked) {
            if (tick.tick >= tickStarted + 18 * (1000 / game.world.replicator.msPerTick)) {
                kickAll();
                hasKicked = true;
            };
        };
        if (!hasJoined) {
            if (tick.tick >= tickStarted + 118 * (1000 / game.world.replicator.msPerTick)) {
                joinAll();
                hasJoined = true;
            };
        };
    };
});

game.network.addRpcHandler("DayCycle", e => {
    isDay = !!e.isDay;
    if (!isDay) {
        tickStarted = e.cycleStartTick;
        tickToEnd = e.nightEndTick;
        hasKicked = false;
        hasJoined = false;
    };
});

window.togglePlayerTrick = () => {
    window.playerTrickToggle = !window.playerTrickToggle;
};

game.network.addRpcHandler("ReceiveChatMessage", e => {
    if (e.message == "!sendalt" && e.uid == game.world.myUid) {
          window.sendWs();
    }
})
game.network.addRpcHandler("ReceiveChatMessage", e => {
    if (e.message == "!4ppl" && e.uid == game.world.myUid) {
          window.togglePlayerTrick();
    }
})
