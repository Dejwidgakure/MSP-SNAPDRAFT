(function(global){
    "use strict";

    function normalize(value){
        return String(value??"").trim().toLowerCase();
    }

    function database(){
        try{
            if(typeof cardDatabase!=="undefined" && Array.isArray(cardDatabase)) return cardDatabase;
        }catch(error){}
        return Array.isArray(global.cardDatabase) ? global.cardDatabase : [];
    }

    function canonicalCard(card){
        if(!card || typeof card!=="object") return null;
        if(normalize(card.cardType)) return card;
        const name=normalize(card.name || card.cardName);
        if(!name) return card;
        return database().find(entry=>normalize(entry?.name)===name) || card;
    }

    function isSkill(card){
        const resolved=canonicalCard(card);
        return normalize(resolved?.cardType)==="skill";
    }

    global.SkillCardVisual=Object.freeze({
        isSkill,
        shouldShowPower(card){ return !isSkill(card); },
        canonicalCard
    });
})(window);
