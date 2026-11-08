/* =========================================================
   MSP SNAPDRAFT — CUSTOM PACKS V2 UI HELPERS
   Patch C: shared presentation/criteria metadata.
   No generation logic lives here.
========================================================= */
(function(root){
"use strict";

const TYPE_META={
    mechanic:{label:"MECHANICZNA",icon:"⚙",accent:"#58ffcd",description:"Szeroki świat oparty na mechanice lub typie zdolności."},
    archetype:{label:"ARCHETYPOWA",icon:"◇",accent:"#9c7dff",description:"Paczka oparta na rodzinie deckowych archetypów."},
    thematic:{label:"TEMATYCZNA",icon:"✦",accent:"#58a9ff",description:"Drużyna, motyw lub część uniwersum Marvela."},
    statistics:{label:"STATYSTYKI KART",icon:"Σ",accent:"#ffd56a",description:"Świat oparty na Koszcie, Sile lub profilu statystyk kart."},
    world:{label:"ŚWIAT KONTRASTU",icon:"⇄",accent:"#ff8b63",description:"Dwa przeciwstawne ekosystemy w jednej paczce."},
    msp_history:{label:"HISTORIA I STATYSTYKI MSP",icon:"★",accent:"#73e6a4",description:"Jubileusze i dane z historii MSP SnapDraft."},
    special:{label:"SPECJALNA",icon:"🎲",accent:"#ff6ed7",description:"Nietypowy generator, mieszana konstrukcja lub losowa reguła."}
};

const POLICY_META={
    strict:{label:"STRICT",description:"Bez obcych kart."},
    duplicate:{label:"DUPLIKATY",description:"Braki uzupełnia własną pulą."},
    random:{label:"RANDOM",description:"Jawny fallback z globalnej puli."},
    half:{label:"50 / 50 LEGACY",description:"Połowa świata, połowa globalnego randomu."},
    secondaryPool:{label:"SECONDARY POOL",description:"Braki uzupełnia drugim zdefiniowanym światem."},
    compositionFallback:{label:"COMPOSITION",description:"Braki rozkłada wewnątrz własnych bucketów."}
};

const RANDOMIZE_META={
    "deck-archetype":"LOSOWY ARCHETYP",
    "cost":"LOSOWY KOSZT",
    "mechanic-family":"LOSOWA RODZINA MECHANIK",
    "ability-type":"LOSOWY TYP ZDOLNOŚCI",
    "custom-pack":"LOSOWY CUSTOM PACK"
};

const CATEGORY_LABEL_FALLBACK={
    series:"SERIE",
    abilityTypes:"TYPY ZDOLNOŚCI",
    mechanicFamilies:"RODZINY MECHANIK",
    subtypes:"MECHANIKI SZCZEGÓŁOWE",
    deckArchetypes:"ARCHETYPY DECKOWE",
    teams:"DRUŻYNY",
    themes:"MOTYWY",
    special:"SPECJALNE"
};

function normalize(value){
    return String(value??"").trim().toLowerCase();
}

function getTypeMeta(packOrType){
    const type=typeof packOrType==="string" ? packOrType : packOrType?.packType;
    return TYPE_META[type] || {label:String(type||"CUSTOM").replace(/-/g," ").toUpperCase(),icon:"✦",accent:"#7eeff4",description:"Custom Pack."};
}

function getPolicyMode(pack){
    const raw=pack?.shortPoolPolicy;
    if(typeof raw==="string") return raw;
    if(raw&&typeof raw==="object") return raw.mode||"random";
    return "random";
}

function getPolicyMeta(pack){
    const mode=getPolicyMode(pack);
    return {mode,...(POLICY_META[mode]||{label:String(mode||"random").toUpperCase(),description:"Polityka uzupełniania puli."})};
}

function getTagName(tagId){
    const wanted=normalize(tagId);
    if(typeof TAGS!=="undefined" && TAGS){
        for(const group of Object.values(TAGS)){
            if(!Array.isArray(group)) continue;
            const found=group.find(tag=>normalize(tag?.id)===wanted);
            if(found?.name) return found.name;
        }
    }
    return String(tagId||"").replace(/-/g," ");
}

function getTagCategoryName(categoryId){
    try{
        if(typeof TAG_CATEGORIES!=="undefined" && TAG_CATEGORIES?.[categoryId]?.name){
            return TAG_CATEGORIES[categoryId].name;
        }
    }catch(_error){}
    return CATEGORY_LABEL_FALLBACK[categoryId] || String(categoryId||"").replace(/-/g," ").toUpperCase();
}

function formatStat(label,rule){
    if(rule===null || rule===undefined) return null;
    if(typeof rule==="number") return `${label} ${rule}`;
    if(typeof rule!=="object") return null;
    const exact=Number(rule.exact);
    const min=Number(rule.min);
    const max=Number(rule.max);
    if(Number.isFinite(exact)) return `${label} ${exact}`;
    if(Number.isFinite(min)&&Number.isFinite(max)) return `${label} ${min}–${max}`;
    if(Number.isFinite(min)) return `${label} ${min}+`;
    if(Number.isFinite(max)) return `${label} DO ${max}`;
    return null;
}

function formatRelation(relation){
    if(!relation||typeof relation!=="object") return null;
    const fields={cost:"KOSZT",power:"SIŁA"};
    const left=fields[normalize(relation.left)]||String(relation.left||"").toUpperCase();
    const right=fields[normalize(relation.right)]||String(relation.right||"").toUpperCase();
    const operator=String(relation.operator||"=");
    const multiplier=Number(relation.rightMultiplier??1);
    const offset=Number(relation.offset??0);
    let rightText=right;
    if(Number.isFinite(multiplier)&&multiplier!==1) rightText=`${multiplier}× ${rightText}`;
    if(Number.isFinite(offset)&&offset!==0) rightText+=offset>0?` + ${offset}`:` − ${Math.abs(offset)}`;
    return `${left} ${operator} ${rightText}`;
}

function describeTagRule(tags){
    const out=[];
    if(!tags||typeof tags!=="object") return out;
    const allOf=Array.isArray(tags.allOf)?tags.allOf:[];
    const anyOf=Array.isArray(tags.anyOf)?tags.anyOf:[];
    const noneOf=Array.isArray(tags.noneOf)?tags.noneOf:[];
    if(allOf.length===1) out.push(`TAG · ${getTagName(allOf[0])}`);
    else if(allOf.length>1) out.push(`AND · ${allOf.map(getTagName).join(" + ")}`);
    if(anyOf.length) out.push(`OR · ${anyOf.map(getTagName).join(" / ")}`);
    if(noneOf.length) out.push(`BEZ · ${noneOf.map(getTagName).join(" / ")}`);
    return out;
}

function describeFilter(filter){
    const out=[];
    if(!filter||typeof filter!=="object") return out;
    out.push(...describeTagRule(filter.tags));
    const cost=formatStat("KOSZT",filter.cost);
    const power=formatStat("SIŁA",filter.power);
    if(cost) out.push(cost);
    if(power) out.push(power);
    if(filter.nameIncludes) out.push(`NAZWA · ${String(filter.nameIncludes).toUpperCase()}`);
    if(Array.isArray(filter.nameTokensAny)&&filter.nameTokensAny.length){
        out.push(`NAZWA · ${filter.nameTokensAny.map(token=>String(token).toUpperCase()).join(" / ")}`);
    }
    const relations=Array.isArray(filter.relations)?filter.relations:[];
    relations.map(formatRelation).filter(Boolean).forEach(label=>out.push(label));
    const counts=Array.isArray(filter.tagCounts)?filter.tagCounts:[];
    counts.forEach(rule=>{
        if(!rule||typeof rule!=="object") return;
        const category=rule.category?getTagCategoryName(rule.category):"TAGI";
        const exact=Number(rule.exact),min=Number(rule.min),max=Number(rule.max);
        if(Number.isFinite(exact)) out.push(`${exact}× · ${category}`);
        else if(Number.isFinite(min)&&Number.isFinite(max)) out.push(`${min}–${max}× · ${category}`);
        else if(Number.isFinite(min)) out.push(`${min}+ · ${category}`);
        else if(Number.isFinite(max)) out.push(`DO ${max}× · ${category}`);
    });
    return out;
}

function legacyFilter(pack){
    const filter={};
    if(Array.isArray(pack?.tags)&&pack.tags.length) filter.tags={anyOf:[...pack.tags]};
    if(pack?.minCost!=null||pack?.maxCost!=null){
        filter.cost={};
        if(pack.minCost!=null) filter.cost.min=pack.minCost;
        if(pack.maxCost!=null) filter.cost.max=pack.maxCost;
    }
    if(pack?.minPower!=null||pack?.maxPower!=null){
        filter.power={};
        if(pack.minPower!=null) filter.power.min=pack.minPower;
        if(pack.maxPower!=null) filter.power.max=pack.maxPower;
    }
    if(pack?.nameIncludes) filter.nameIncludes=pack.nameIncludes;
    return filter;
}

function bucketPercentages(buckets){
    const numeric=buckets.map(bucket=>Number(bucket?.count??bucket?.weight??1));
    const total=numeric.reduce((sum,value)=>sum+(Number.isFinite(value)&&value>0?value:0),0);
    if(!total) return buckets.map(()=>null);
    return numeric.map(value=>Math.round(((Number.isFinite(value)&&value>0?value:0)/total)*100));
}

function describeComposition(composition){
    if(!composition||typeof composition!=="object") return [];
    if(composition.mode==="tag-rainbow"){
        return [`RAINBOW · ${getTagCategoryName(composition.category)}`];
    }
    const buckets=Array.isArray(composition.buckets)?composition.buckets:[];
    if(!buckets.length) return [];
    if(composition.mode==="cycle"){
        return [`CYKL · ${buckets.map(bucket=>bucket?.label||"BUCKET").join(" → ")}`];
    }
    const percentages=bucketPercentages(buckets);
    const parts=buckets.map((bucket,index)=>{
        const label=String(bucket?.label||bucket?.id||`BUCKET ${index+1}`).toUpperCase();
        const percent=percentages[index];
        return percent===null?label:`${percent}% ${label}`;
    });
    return [`KOMPOZYCJA · ${parts.join(" / ")}`];
}

function describeRandomize(randomize){
    if(!randomize||typeof randomize!=="object") return [];
    const kind=String(randomize.kind||"");
    return [RANDOMIZE_META[kind]||`RANDOMIZE · ${kind.replace(/-/g," ").toUpperCase()}`];
}

function describePoolSource(poolSource){
    if(!poolSource||typeof poolSource!=="object") return [];
    if(poolSource.kind==="legend-top-cards"){
        const limit=Math.max(1,Math.floor(Number(poolSource.limit)||30));
        return [`TOP ${limit} · PUNKTY LEGEND`];
    }
    return [`ŹRÓDŁO · ${String(poolSource.kind||"dynamic").replace(/-/g," ").toUpperCase()}`];
}

function getCriteria(pack){
    const out=[];
    out.push(...describePoolSource(pack?.poolSource));
    out.push(...describeRandomize(pack?.randomize));
    out.push(...describeComposition(pack?.composition));
    const filter=pack?.filter&&typeof pack.filter==="object" ? pack.filter : legacyFilter(pack);
    out.push(...describeFilter(filter));
    return [...new Set(out.filter(Boolean))];
}

function getPresentation(pack){
    return {
        type:getTypeMeta(pack),
        policy:getPolicyMeta(pack),
        criteria:getCriteria(pack)
    };
}

root.CUSTOM_PACK_TYPE_META=TYPE_META;
root.CUSTOM_PACK_POLICY_META=POLICY_META;
root.getCustomPackTypeMeta=getTypeMeta;
root.getCustomPackPolicyMeta=getPolicyMeta;
root.getCustomPackUiTagName=getTagName;
root.getCustomPackCriteriaLabelsV2=getCriteria;
root.getCustomPackPresentation=getPresentation;
})(typeof window!=="undefined"?window:globalThis);
