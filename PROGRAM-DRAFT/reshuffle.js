// =====================================================
// MSP SnapDraft — ADMIN TECHNICAL REROLL v8.0
// Legacy player-facing Reshuffle button removed.
// Resolver remains available from Edit Deck as operator fallback.
// =====================================================

(function(global){
    "use strict";

    function resolveCardDiv(playerIndex,cardIndex,preferred){
        if(preferred?.dataset?.playerIndex === String(playerIndex) && preferred?.dataset?.cardIndex === String(cardIndex)){
            return preferred;
        }
        return Array.from(document.querySelectorAll(".card")).find(cardDiv =>
            cardDiv.dataset.playerIndex === String(playerIndex) &&
            cardDiv.dataset.cardIndex === String(cardIndex)
        ) || null;
    }

    function getLegalOptions(limit=3,playerIndex=null,cardIndex=null){
        const bansSource = typeof bannedCards !== "undefined" && Array.isArray(bannedCards)
            ? bannedCards
            : [];
        const databaseSource = typeof cardDatabase !== "undefined" && Array.isArray(cardDatabase)
            ? cardDatabase
            : [];
        const normalizedBans = new Set(
            bansSource.map(name => String(name || "").trim().toLowerCase())
        );
        const occupiedNames = new Set(
            (Number.isInteger(Number(playerIndex)) && Array.isArray(decks?.[Number(playerIndex)]))
                ? decks[Number(playerIndex)].filter(Boolean).map(card=>String(card?.name||"").trim().toLowerCase()).filter(Boolean)
                : []
        );
        const legalPool = databaseSource.filter(card =>{
            const normalizedName=String(card?.name||"").trim().toLowerCase();
            return Boolean(
                card && normalizedName && !card.joker &&
                !normalizedBans.has(normalizedName) &&
                !occupiedNames.has(normalizedName)
            );
        });
        for(let i=legalPool.length-1;i>0;i--){
            const j=Math.floor(Math.random()*(i+1));
            [legalPool[i],legalPool[j]]=[legalPool[j],legalPool[i]];
        }
        return legalPool.slice(0,Math.min(limit,legalPool.length));
    }

    function openAdminReshuffle(playerIndex,cardIndex,preferredCardDiv=null,options={}){
        const p=Number(playerIndex);
        const c=Number(cardIndex);
        if(!Number.isInteger(p)||!Number.isInteger(c)||!decks?.[p]?.[c]) return false;

        const selectedCardDiv=resolveCardDiv(p,c,preferredCardDiv);
        const sourceCard=decks[p][c];
        if(global.isWolverineRegeneratedProtectedCard?.(sourceCard)){
            global.SuperpowerFeedback?.warning?.(
                "wolverine",
                "CZYNNIK REGENERACYJNY ODRZUCA ZMIANĘ",
                "Ta karta jest chroniona przed przelosowaniem do końca draftu."
            );
            return false;
        }

        document.getElementById("reshuffleOverlay")?.remove();
        const replacementOptions=getLegalOptions(3,p,c);
        if(!replacementOptions.length){
            alert("Brak legalnych kart do technicznego rerolla.");
            return false;
        }

        const overlay=document.createElement("div");
        overlay.id="reshuffleOverlay";
        overlay.dataset.adminTechnical=options?.sourceEvent?"false":"true";
        if(options?.sourceEvent) overlay.dataset.sourceEvent=String(options.sourceEvent);
        const modal=document.createElement("div");
        modal.id="reshuffleModal";
        const kicker=String(options?.kicker||"NARZĘDZIE OPERATORA");
        const title=String(options?.title||"TECHNICZNY REROLL • 1 Z 3");
        const description=String(options?.description||`${sourceCard.name} → wybierz kartę zastępczą`);
        const allowCancel=options?.allowCancel!==false;
        modal.innerHTML=`
            ${allowCancel?`<button type="button" class="reshuffle-admin-close" aria-label="Zamknij">×</button>`:""}
            <div class="reshuffle-admin-kicker">${escapeText(kicker)}</div>
            <h2>${escapeText(title)}</h2>
            <p class="reshuffle-admin-source">${escapeText(description)}</p>
            <div class="reshuffle-options"></div>`;
        const optionsContainer=modal.querySelector(".reshuffle-options");

        replacementOptions.forEach(card=>{
            const btn=document.createElement("button");
            btn.className="reshuffle-card";
            btn.dataset.cardName=card.name;
            btn.innerHTML=`
                <div class="reshuffle-card-inner">
                    <div class="reshuffle-cost">${Number(card.cost ?? 0)}</div>
                    <div class="reshuffle-name">${escapeText(card.name)}</div>
                    ${window.SkillCardVisual?.isSkill?.(card) ? "" : `<div class="reshuffle-power">${Number(card.power ?? 0)}</div>`}
                </div>`;
            btn.addEventListener("click",()=>{
                const result=applyAdminReshuffle(card,p,c,options);
                if(result){
                    overlay.remove();
                    options?.onResolve?.(result,{playerIndex:p,cardIndex:c,selectedCard:card,sourceCard});
                }
            });
            optionsContainer.appendChild(btn);
        });

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        if(allowCancel){
            const close=()=>{overlay.remove();options?.onCancel?.();};
            overlay.addEventListener("mousedown",event=>{ if(event.target===overlay) close(); });
            modal.querySelector(".reshuffle-admin-close")?.addEventListener("click",close);
        }
        return true;
    }

    function applyAdminReshuffle(newCard,playerIndex,cardIndex,options={}){
        if(global.isWolverineRegeneratedProtectedCard?.(decks?.[playerIndex]?.[cardIndex])){
            global.SuperpowerFeedback?.warning?.(
                "wolverine",
                "CZYNNIK REGENERACYJNY ODRZUCA ZMIANĘ",
                "Ta karta jest chroniona przed przelosowaniem do końca draftu."
            );
            return null;
        }
        if(typeof global.replaceDeckCardWithHistory !== "function"){
            console.error("Brak helpera replaceDeckCardWithHistory.");
            return null;
        }

        const result=global.replaceDeckCardWithHistory(playerIndex,cardIndex,newCard,{
            eventType:options?.eventType||"deck_card_reshuffled",
            reason:options?.reason||"admin_technical_reshuffle",
            origin:options?.origin||"admin_edit_deck",
            sourceEvent:options?.sourceEvent||"admin_technical_reshuffle",
            graveyardCategory:options?.graveyardCategory||"rerolled",
            recoverable:options?.recoverable!==false,
            data:{method:options?.method||"edit_deck_1_of_3",adminTool:!options?.sourceEvent,...(options?.data||{})}
        });
        if(!result) return null;
        global.showDecks?.();
        global.refreshOpenDeckInspectors?.();
        global.updateInfoPanel?.();
        return result;
    }

    function escapeText(value){
        return String(value ?? "").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char]));
    }

    global.openAdminReshuffle=openAdminReshuffle;
})(window);
