/* ============================================================
   MSP SNAP DRAFT — CUSTOM PACK ENGINE
   Version 2.2 — Historical Popularity Pool

   FILTERS:
   - legacy tags[] (OR), Cost/Power, nameIncludes
   - filter.cost / filter.power
   - filter.tags.allOf / anyOf / noneOf
   - filter.relations
   - filter.tagCounts (dynamic categories from TAGS)
   - filter.nameIncludesAny / filter.nameTokensAny

   COMPOSITION:
   - mode: "cycle"
   - mode: "tag-rainbow"
   - mode: "weighted" / "ratio" with bucket weight/count

   SHORT POOL POLICIES:
   - strict              -> never contaminate the world; fail explicitly
   - duplicate           -> repeat cards from the pack's own legal pool
   - random              -> explicit legacy/global random fill
   - half                -> legacy 50/50 mode (explicit only)
   - secondaryPool       -> fill from a declared secondary filter/pack
   - compositionFallback -> reallocate inside the declared composition

   RANDOMIZE FOUNDATION:
   - deck-archetype
   - cost
   - mechanic-family
   - ability-type
   - custom-pack

   IMPORTANT:
   Canonical SnapDraft behavior: when the declared Custom Pack pool is too
   small, remaining slots are filled with random legal cards from the global
   database. Pack-specific policies remain supported for compatibility.
============================================================ */

function shuffleArray(arr){
    const copy=[...(Array.isArray(arr) ? arr : [])];
    for(let i=copy.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [copy[i],copy[j]]=[copy[j],copy[i]];
    }
    return copy;
}

function normalizeCustomPackName(value){
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .toLowerCase()
        .trim();
}

function normalizeCustomPackTag(value){
    return String(value || "").trim().toLowerCase();
}


class CustomPackPoolError extends Error{
    constructor(message,meta={}){
        super(message);
        this.name="CustomPackPoolError";
        this.code="CUSTOM_PACK_SHORT_POOL";
        this.meta=meta&&typeof meta==="object" ? meta : {};
    }
}

const CUSTOM_PACK_ENGINE_VERSION="2.2";
const CustomPackRuntimeState={lastGeneration:null};
if(typeof window!=="undefined"){
    window.CUSTOM_PACK_ENGINE_VERSION=CUSTOM_PACK_ENGINE_VERSION;
    window.CustomPackRuntimeState=CustomPackRuntimeState;
}

function setCustomPackGenerationMeta(meta){
    CustomPackRuntimeState.lastGeneration={
        timestamp:Date.now(),
        ...(meta&&typeof meta==="object" ? meta : {})
    };
    return CustomPackRuntimeState.lastGeneration;
}

function getLastCustomPackGenerationMeta(){
    return CustomPackRuntimeState.lastGeneration;
}

function normalizeCustomPackPolicyMode(value){
    const raw=String(value||"").trim().toLowerCase();
    const aliases={
        "composition-fallback":"compositionFallback",
        "compositionfallback":"compositionFallback",
        "secondary-pool":"secondaryPool",
        "secondarypool":"secondaryPool",
        "legacy-random":"random"
    };
    const mode=aliases[raw]||raw;
    const allowed=new Set([
        "strict","duplicate","random","half","secondaryPool","compositionFallback"
    ]);
    return allowed.has(mode) ? mode : null;
}

function normalizeCustomPackShortPoolPolicy(packConfig,legacyFillMode=null,options={}){
    const raw=packConfig?.shortPoolPolicy;
    if(typeof raw==="string"){
        return {mode:normalizeCustomPackPolicyMode(raw)||"random"};
    }
    if(raw&&typeof raw==="object"){
        return {
            ...raw,
            mode:normalizeCustomPackPolicyMode(raw.mode)||"random"
        };
    }

    // Legacy explicit modes remain supported, but the canonical default is
    // random fill from the global legal database.
    const legacy=normalizeCustomPackPolicyMode(legacyFillMode);
    if(legacy) return {mode:legacy};
    return {mode:"random"};
}

function getCustomPackRegistry(){
    try{
        return (typeof customPacks!=="undefined" && Array.isArray(customPacks))
            ? customPacks
            : [];
    }catch(error){
        return [];
    }
}

function isCustomPackRandomEligible(pack,sourcePack=null,allowMeta=false){
    if(!pack || pack.randomEligible===false) return false;
    if(sourcePack?.id && pack.id===sourcePack.id) return false;
    if(!allowMeta && pack.randomize) return false;
    return true;
}

function getCustomPackCategoryTagIds(category){
    try{
        if(typeof TAGS!=="object" || !TAGS) return [];
        const list=TAGS?.[category];
        if(!Array.isArray(list)) return [];
        return list
            .map(item=>normalizeCustomPackTag(item?.id))
            .filter(Boolean);
    }catch(error){
        return [];
    }
}

function getCustomPackUnavailableNames(){
    return new Set(
        (Array.isArray(bannedCards) ? bannedCards : [])
            .map(normalizeCustomPackName)
            .filter(Boolean)
    );
}

function isCustomPackCardAvailable(card, unavailableNames=getCustomPackUnavailableNames()){
    return !!(
        card &&
        !card.joker &&
        card.name &&
        !unavailableNames.has(normalizeCustomPackName(card.name))
    );
}

function getCustomPackCardCost(card){
    const value=Number(card?.cost);
    return Number.isFinite(value) ? value : null;
}

function getCustomPackCardPower(card){
    const value=Number(card?.power);
    return Number.isFinite(value) ? value : null;
}

function customPackCardHasTag(card,tag){
    const wanted=normalizeCustomPackTag(tag);
    return !!wanted && Array.isArray(card?.tags) &&
        card.tags.some(value=>normalizeCustomPackTag(value)===wanted);
}

function normalizeCustomPackStatRule(rule){
    if(rule===null || rule===undefined) return null;

    if(typeof rule==="number"){
        return {min:Number(rule),max:Number(rule)};
    }

    if(typeof rule!=="object") return null;

    const exact=Number(rule.exact);
    const min=Number(rule.min);
    const max=Number(rule.max);

    const normalized={
        min:Number.isFinite(exact) ? exact : (Number.isFinite(min) ? min : null),
        max:Number.isFinite(exact) ? exact : (Number.isFinite(max) ? max : null)
    };

    if(normalized.min===null && normalized.max===null) return null;
    return normalized;
}

function customPackPassesStat(value,rule){
    const normalized=normalizeCustomPackStatRule(rule);
    if(!normalized || !Number.isFinite(value)) return false;

    if(normalized.min!==null && value<normalized.min) return false;
    if(normalized.max!==null && value>normalized.max) return false;
    return true;
}

function normalizeCustomPackRelation(relation){
    if(!relation || typeof relation!=="object") return null;

    const fields=new Set(["cost","power"]);
    const aliases={"==":"=","===":"=","=>":">=","=<":"<="};
    const left=String(relation.left||"").toLowerCase();
    const right=String(relation.right||"").toLowerCase();
    const rawOperator=String(relation.operator||"=").trim();
    const operator=aliases[rawOperator]||rawOperator;
    const allowed=new Set([">",">=","<","<=","="]);

    if(!fields.has(left) || !fields.has(right) || !allowed.has(operator)){
        return null;
    }

    const offset=Number(relation.offset??0);
    const multiplier=Number(relation.rightMultiplier??1);

    return {
        left,
        right,
        operator,
        offset:Number.isFinite(offset) ? offset : 0,
        rightMultiplier:Number.isFinite(multiplier) ? multiplier : 1
    };
}

function customPackPassesRelation(card,relation){
    const normalized=normalizeCustomPackRelation(relation);
    if(!normalized) return false;

    const left=normalized.left==="cost"
        ? getCustomPackCardCost(card)
        : getCustomPackCardPower(card);

    const rightRaw=normalized.right==="cost"
        ? getCustomPackCardCost(card)
        : getCustomPackCardPower(card);

    if(!Number.isFinite(left) || !Number.isFinite(rightRaw)) return false;

    const right=(rightRaw*normalized.rightMultiplier)+normalized.offset;

    if(normalized.operator===">") return left>right;
    if(normalized.operator===">=") return left>=right;
    if(normalized.operator==="<") return left<right;
    if(normalized.operator==="<=") return left<=right;
    return left===right;
}

function normalizeCustomPackTagCount(rule){
    if(!rule || typeof rule!=="object") return null;

    let tags=[];
    if(Array.isArray(rule.tags)){
        tags=rule.tags;
    }else if(rule.category){
        tags=getCustomPackCategoryTagIds(rule.category);
    }

    tags=[...new Set(
        tags.map(normalizeCustomPackTag).filter(Boolean)
    )];

    if(!tags.length) return null;

    const exact=Number(rule.exact);
    const min=Number(rule.min);
    const max=Number(rule.max);

    return {
        tags,
        min:Number.isFinite(exact) ? exact : (Number.isFinite(min) ? min : null),
        max:Number.isFinite(exact) ? exact : (Number.isFinite(max) ? max : null)
    };
}

function customPackPassesTagCount(card,rule){
    const normalized=normalizeCustomPackTagCount(rule);
    if(!normalized) return false;

    const count=normalized.tags.reduce(
        (sum,tag)=>sum+(customPackCardHasTag(card,tag)?1:0),
        0
    );

    if(normalized.min!==null && count<normalized.min) return false;
    if(normalized.max!==null && count>normalized.max) return false;
    return true;
}

function getLegacyCustomPackFilter(packConfig){
    const filter={};

    if(Array.isArray(packConfig?.tags) && packConfig.tags.length){
        filter.tags={anyOf:[...packConfig.tags]};
    }

    if(packConfig?.minCost!=null || packConfig?.maxCost!=null){
        filter.cost={};
        if(packConfig.minCost!=null) filter.cost.min=packConfig.minCost;
        if(packConfig.maxCost!=null) filter.cost.max=packConfig.maxCost;
    }

    if(packConfig?.minPower!=null || packConfig?.maxPower!=null){
        filter.power={};
        if(packConfig.minPower!=null) filter.power.min=packConfig.minPower;
        if(packConfig.maxPower!=null) filter.power.max=packConfig.maxPower;
    }

    if(packConfig?.nameIncludes){
        filter.nameIncludes=String(packConfig.nameIncludes);
    }

    return filter;
}

function mergeCustomPackFilters(base,extra){
    const result={
        ...(base && typeof base==="object" ? base : {}),
        ...(extra && typeof extra==="object" ? extra : {})
    };

    if(base?.tags || extra?.tags){
        result.tags={
            ...(base?.tags||{}),
            ...(extra?.tags||{})
        };
    }

    if(base?.cost || extra?.cost){
        result.cost={
            ...(base?.cost||{}),
            ...(extra?.cost||{})
        };
    }

    if(base?.power || extra?.power){
        result.power={
            ...(base?.power||{}),
            ...(extra?.power||{})
        };
    }

    const baseRelations=Array.isArray(base?.relations) ? base.relations : [];
    const extraRelations=Array.isArray(extra?.relations) ? extra.relations : [];
    if(baseRelations.length || extraRelations.length){
        result.relations=[...baseRelations,...extraRelations];
    }

    const baseCounts=Array.isArray(base?.tagCounts) ? base.tagCounts : [];
    const extraCounts=Array.isArray(extra?.tagCounts) ? extra.tagCounts : [];
    if(baseCounts.length || extraCounts.length){
        result.tagCounts=[...baseCounts,...extraCounts];
    }

    return result;
}

function getCustomPackFilter(packConfig,extraFilter=null){
    const legacy=getLegacyCustomPackFilter(packConfig||{});
    const advanced=packConfig?.filter && typeof packConfig.filter==="object"
        ? packConfig.filter
        : {};
    return mergeCustomPackFilters(
        mergeCustomPackFilters(legacy,advanced),
        extraFilter||{}
    );
}

function getCustomPackNameTokens(value){
    return normalizeCustomPackName(value)
        .replace(/[^a-z0-9]+/g," ")
        .split(/\s+/)
        .filter(Boolean);
}

function cardPassesCustomPackFilter(card,filter){
    if(!filter || typeof filter!=="object") return true;

    const cost=getCustomPackCardCost(card);
    const power=getCustomPackCardPower(card);

    if(filter.cost && !customPackPassesStat(cost,filter.cost)) return false;
    if(filter.power && !customPackPassesStat(power,filter.power)) return false;

    const tags=filter.tags||{};
    const allOf=Array.isArray(tags.allOf) ? tags.allOf : [];
    const anyOf=Array.isArray(tags.anyOf) ? tags.anyOf : [];
    const noneOf=Array.isArray(tags.noneOf) ? tags.noneOf : [];

    if(allOf.length && !allOf.every(tag=>customPackCardHasTag(card,tag))) return false;
    if(anyOf.length && !anyOf.some(tag=>customPackCardHasTag(card,tag))) return false;
    if(noneOf.length && noneOf.some(tag=>customPackCardHasTag(card,tag))) return false;

    const relations=Array.isArray(filter.relations) ? filter.relations : [];
    if(relations.length && !relations.every(rel=>customPackPassesRelation(card,rel))){
        return false;
    }

    const tagCounts=Array.isArray(filter.tagCounts) ? filter.tagCounts : [];
    if(tagCounts.length && !tagCounts.every(rule=>customPackPassesTagCount(card,rule))){
        return false;
    }

    const normalizedName=normalizeCustomPackName(card?.name);
    const needle=normalizeCustomPackName(filter.nameIncludes||"");
    if(needle && !normalizedName.includes(needle)) return false;

    const includesAny=(Array.isArray(filter.nameIncludesAny) ? filter.nameIncludesAny : [])
        .map(normalizeCustomPackName)
        .filter(Boolean);
    if(includesAny.length && !includesAny.some(value=>normalizedName.includes(value))){
        return false;
    }

    const tokens=new Set(getCustomPackNameTokens(card?.name));
    const tokenRules=[
        ...(Array.isArray(filter.nameTokensAny) ? filter.nameTokensAny : []),
        ...(Array.isArray(filter.nameWordsAny) ? filter.nameWordsAny : [])
    ].map(normalizeCustomPackName).filter(Boolean);
    if(tokenRules.length && !tokenRules.some(value=>tokens.has(value))){
        return false;
    }

    return true;
}

function getLegendTopCustomPackPool(packConfig){
    const limit=Math.max(1,Math.floor(Number(packConfig?.poolSource?.limit)||30));
    if(typeof DraftStatsEngine!=="object" || !DraftStatsEngine ||
       typeof DraftStatsEngine.buildArchiveSnapshot!=="function"){
        console.warn("[CustomPack] Legendarna Trzydziestka: DraftStatsEngine unavailable.");
        return [];
    }
    if(typeof database!=="object" || !database || !Array.isArray(database.drafts)){
        console.warn("[CustomPack] Legendarna Trzydziestka: database.drafts unavailable.");
        return [];
    }

    try{
        const snapshot=DraftStatsEngine.buildArchiveSnapshot({
            drafts:database.drafts,
            cards:Array.isArray(cardDatabase) ? cardDatabase : [],
            tags:typeof TAGS==="object" && TAGS ? TAGS : {}
        });
        const ranked=(Array.isArray(snapshot?.cards) ? snapshot.cards : [])
            .slice()
            .sort((a,b)=>
                Number(b?.legendPoints||0)-Number(a?.legendPoints||0) ||
                Number(b?.draftWins||0)-Number(a?.draftWins||0) ||
                Number(b?.podiums||0)-Number(a?.podiums||0) ||
                String(a?.name||"").localeCompare(String(b?.name||""),"pl")
            );
        const byName=new Map(
            (Array.isArray(cardDatabase) ? cardDatabase : [])
                .filter(Boolean)
                .map(card=>[normalizeCustomPackName(card?.name),card])
        );
        const unavailable=getCustomPackUnavailableNames();
        const result=[];
        const used=new Set();
        for(const row of ranked){
            if(result.length>=limit) break;
            const key=normalizeCustomPackName(row?.name);
            if(!key || used.has(key)) continue;
            const card=byName.get(key);
            if(!isCustomPackCardAvailable(card,unavailable)) continue;
            used.add(key);
            result.push(card);
        }
        return result;
    }catch(error){
        console.warn("[CustomPack] Legendarna Trzydziestka: ranking build failed.",error);
        return [];
    }
}

// The archive's canonical card popularity metric is deck appearances in FINISHED
// drafts (Main Deck + Planetary Reserve). Do not use Legend Points here: that
// ranking is intentionally a separate Custom Pack, "LEGENDARNA TRZYDZIESTKA".
function getArchiveMostDraftedCustomPackPool(packConfig){
    const limit=Math.max(1,Math.floor(Number(packConfig?.poolSource?.limit)||30));
    if(typeof DraftStatsEngine!=="object" || !DraftStatsEngine ||
       typeof DraftStatsEngine.buildArchiveSnapshot!=="function" ||
       typeof database!=="object" || !database || !Array.isArray(database.drafts)){
        throw new CustomPackPoolError(
            "Archive popularity pack requires DraftStatsEngine and database.drafts.",
            {packId:packConfig?.id||null,sourceKind:"archive-most-drafted"}
        );
    }

    try{
        const archive=DraftStatsEngine.buildArchiveSnapshot({
            drafts:database.drafts,
            cards:Array.isArray(cardDatabase) ? cardDatabase : [],
            tags:typeof TAGS==="object" && TAGS ? TAGS : {}
        });
        const rows=Array.isArray(archive?.cards) ? archive.cards : [];
        const byName=new Map(
            (Array.isArray(cardDatabase) ? cardDatabase : [])
                .filter(Boolean)
                .map(card=>[normalizeCustomPackName(card.name),card])
        );
        const unavailable=getCustomPackUnavailableNames();
        const result=[];
        const used=new Set();
        const ranked=rows.slice().sort((a,b)=>
            Number(b?.appearances||0)-Number(a?.appearances||0) ||
            Number(b?.drafts||0)-Number(a?.drafts||0) ||
            String(a?.name||"").localeCompare(String(b?.name||""),"pl")
        );
        for(const row of ranked){
            if(result.length>=limit) break;
            if(Number(row?.appearances||0)<=0) continue;
            const key=normalizeCustomPackName(row?.name);
            if(!key || used.has(key)) continue;
            const card=byName.get(key);
            if(!isCustomPackCardAvailable(card,unavailable)) continue;
            used.add(key);
            result.push(card);
        }
        if(!result.length){
            throw new CustomPackPoolError(
                "No eligible cards with historical appearances were found.",
                {packId:packConfig?.id||null,sourceKind:"archive-most-drafted"}
            );
        }
        return result;
    }catch(error){
        if(error instanceof CustomPackPoolError) throw error;
        throw new CustomPackPoolError(
            `Cannot calculate archive popularity: ${error?.message||error}`,
            {packId:packConfig?.id||null,sourceKind:"archive-most-drafted"}
        );
    }
}

function getCustomPackSourcePool(packConfig){
    const kind=String(packConfig?.poolSource?.kind||"").trim();
    if(!kind) return null;
    if(kind==="legend-top-cards") return getLegendTopCustomPackPool(packConfig);
    if(kind==="archive-most-drafted") return getArchiveMostDraftedCustomPackPool(packConfig);
    console.warn(`[CustomPack] Unknown poolSource kind: ${kind}`);
    return [];
}

function getCustomPackPool(packConfig,extraFilter=null){
    const unavailable=getCustomPackUnavailableNames();
    const filter=getCustomPackFilter(packConfig,extraFilter);
    const sourcePool=getCustomPackSourcePool(packConfig);
    const basePool=Array.isArray(sourcePool)
        ? sourcePool
        : (Array.isArray(cardDatabase) ? cardDatabase : []);

    return basePool.filter(card=>
        isCustomPackCardAvailable(card,unavailable) &&
        cardPassesCustomPackFilter(card,filter)
    );
}

function getCustomPackCompositionBuckets(packConfig){
    const composition=packConfig?.composition;
    if(!composition || typeof composition!=="object") return [];

    if(composition.mode==="cycle" || composition.mode==="weighted" || composition.mode==="ratio"){
        return (Array.isArray(composition.buckets) ? composition.buckets : [])
            .map((bucket,index)=>({
                id:String(bucket?.id||`bucket_${index}`),
                label:String(bucket?.label||`BUCKET ${index+1}`),
                filter:bucket?.filter||{},
                weight:Number.isFinite(Number(bucket?.weight)) ? Math.max(0,Number(bucket.weight)) : null,
                count:Number.isFinite(Number(bucket?.count)) ? Math.max(0,Math.floor(Number(bucket.count))) : null
            }));
    }

    if(composition.mode==="tag-rainbow"){
        const category=String(composition.category||"");
        return getCustomPackCategoryTagIds(category).map(tag=>({
            id:tag,
            label:tag,
            filter:{tags:{allOf:[tag]}},
            weight:1,
            count:null
        }));
    }

    return [];
}

function allocateCustomPackWeightedSlots(buckets,requested){
    const allocations=new Array(buckets.length).fill(0);
    let remaining=requested;
    const weighted=[];

    buckets.forEach((bucket,index)=>{
        if(bucket.count!==null){
            const take=Math.min(remaining,Math.max(0,bucket.count));
            allocations[index]=take;
            remaining-=take;
        }else{
            weighted.push({index,weight:bucket.weight===null ? 1 : Math.max(0,bucket.weight)});
        }
    });

    if(remaining<=0 || !weighted.length) return allocations;
    let totalWeight=weighted.reduce((sum,row)=>sum+row.weight,0);
    if(totalWeight<=0){
        weighted.forEach(row=>row.weight=1);
        totalWeight=weighted.length;
    }

    const remainders=[];
    let assigned=0;
    weighted.forEach(row=>{
        const raw=(remaining*row.weight)/totalWeight;
        const base=Math.floor(raw);
        allocations[row.index]+=base;
        assigned+=base;
        remainders.push({index:row.index,fraction:raw-base});
    });

    let left=remaining-assigned;
    remainders
        .sort((a,b)=>b.fraction-a.fraction || a.index-b.index)
        .forEach(row=>{
            if(left<=0) return;
            allocations[row.index]++;
            left--;
        });

    return allocations;
}

function getCustomPackGlobalLegalPool(excludedNames=new Set()){
    const unavailable=getCustomPackUnavailableNames();
    return shuffleArray(
        (Array.isArray(cardDatabase) ? cardDatabase : []).filter(card=>{
            const key=normalizeCustomPackName(card?.name);
            return isCustomPackCardAvailable(card,unavailable) && key && !excludedNames.has(key);
        })
    );
}

function getCustomPackSecondaryPool(packConfig,policy,usedNames=new Set()){
    let pool=[];
    if(policy?.packId){
        const target=getCustomPackRegistry().find(pack=>pack?.id===policy.packId);
        if(target) pool=getCustomPackPool(target);
    }else if(policy?.filter || policy?.poolSource){
        const temp={
            filter:policy?.filter||{},
            poolSource:policy?.poolSource||null
        };
        pool=getCustomPackPool(temp);
    }
    return shuffleArray(pool).filter(card=>!usedNames.has(normalizeCustomPackName(card?.name)));
}

function throwCustomPackShortPool(packConfig,requested,available,policy,extra={}){
    const packId=String(packConfig?.id||"unknown");
    throw new CustomPackPoolError(
        `Custom Pack ${packId} needs ${requested} cards, but only ${available} legal cards are available under policy ${policy?.mode||"random"}.`,
        {packId,requested,available,policy:policy?.mode||"random",...extra}
    );
}

function fillCustomPackShortage(packConfig,pack,requested,policy,sourcePool=[]){
    if(pack.length>=requested) return pack.slice(0,requested);
    const mode=policy?.mode||"random";
    const usedNames=new Set(pack.map(card=>normalizeCustomPackName(card?.name)).filter(Boolean));
    const missing=()=>requested-pack.length;

    if(mode==="strict" || mode==="compositionFallback"){
        throwCustomPackShortPool(packConfig,requested,pack.length,policy);
    }

    if(mode==="duplicate"){
        const own=sourcePool.length ? sourcePool : getCustomPackPool(packConfig);
        if(!own.length) throwCustomPackShortPool(packConfig,requested,0,policy);
        const shuffled=shuffleArray(own);
        let cursor=0;
        while(pack.length<requested){
            pack.push(shuffled[cursor%shuffled.length]);
            cursor++;
        }
        return pack.slice(0,requested);
    }

    if(mode==="secondaryPool"){
        const secondary=getCustomPackSecondaryPool(packConfig,policy,usedNames);
        for(const card of secondary){
            if(pack.length>=requested) break;
            const key=normalizeCustomPackName(card?.name);
            if(!key || usedNames.has(key)) continue;
            usedNames.add(key);
            pack.push(card);
        }
        if(pack.length<requested){
            const fallback=normalizeCustomPackShortPoolPolicy(
                {shortPoolPolicy:policy?.fallback||"strict"},null
            );
            return fillCustomPackShortage(packConfig,pack,requested,fallback,sourcePool);
        }
        return pack.slice(0,requested);
    }

    if(mode==="random"){
        const remaining=getCustomPackGlobalLegalPool(usedNames);
        pack.push(...remaining.slice(0,missing()));
        if(pack.length<requested){
            throwCustomPackShortPool(packConfig,requested,pack.length,policy);
        }
        return pack.slice(0,requested);
    }

    // Legacy explicit 50/50: at most half the pack comes from the declared pool,
    // the rest is global random. Kept only for backwards compatibility.
    if(mode==="half"){
        const halfSize=Math.floor(requested/2);
        const declared=shuffleArray(sourcePool.length ? sourcePool : getCustomPackPool(packConfig));
        pack=declared.slice(0,Math.min(halfSize,declared.length));
        const names=new Set(pack.map(card=>normalizeCustomPackName(card?.name)).filter(Boolean));
        const remaining=getCustomPackGlobalLegalPool(names);
        pack.push(...remaining.slice(0,requested-pack.length));
        if(pack.length<requested){
            throwCustomPackShortPool(packConfig,requested,pack.length,policy);
        }
        return pack.slice(0,requested);
    }

    throwCustomPackShortPool(packConfig,requested,pack.length,{mode:"random"});
}

function generateCycleCustomPack(packConfig,packSize,legacyFillMode=null){
    const requested=Math.max(0,Number(packSize)||0);
    if(!requested) return [];
    const composition=packConfig?.composition||{};
    let buckets=getCustomPackCompositionBuckets(packConfig)
        .map(bucket=>({...bucket,pool:shuffleArray(getCustomPackPool(packConfig,bucket.filter))}))
        .filter(bucket=>bucket.pool.length>0);
    if(!buckets.length) return [];
    if(composition.shuffleBuckets) buckets=shuffleArray(buckets);

    const usedNames=new Set();
    const result=[];
    const takeFromBucket=bucket=>{
        for(const card of bucket?.pool||[]){
            const key=normalizeCustomPackName(card?.name);
            if(!key || usedNames.has(key)) continue;
            usedNames.add(key);
            return card;
        }
        return null;
    };

    for(let slot=0;slot<requested;slot++){
        const preferredIndex=slot%buckets.length;
        let picked=takeFromBucket(buckets[preferredIndex]);
        if(!picked){
            for(let offset=1;offset<buckets.length;offset++){
                picked=takeFromBucket(buckets[(preferredIndex+offset)%buckets.length]);
                if(picked) break;
            }
        }
        if(picked) result.push(picked);
    }

    if(result.length<requested){
        const policy=normalizeCustomPackShortPoolPolicy(packConfig,legacyFillMode,{composition:true});
        if(policy.mode==="compositionFallback"){
            throwCustomPackShortPool(packConfig,requested,result.length,policy,{compositionMode:"cycle"});
        }
        return fillCustomPackShortage(
            packConfig,result,requested,policy,
            buckets.flatMap(bucket=>bucket.pool)
        );
    }
    return result.slice(0,requested);
}

function generateWeightedCustomPack(packConfig,packSize,legacyFillMode=null){
    const requested=Math.max(0,Number(packSize)||0);
    if(!requested) return [];
    const composition=packConfig?.composition||{};
    let buckets=getCustomPackCompositionBuckets(packConfig)
        .map(bucket=>({...bucket,pool:shuffleArray(getCustomPackPool(packConfig,bucket.filter))}));
    if(!buckets.length) return [];
    if(composition.shuffleBuckets) buckets=shuffleArray(buckets);

    const targets=allocateCustomPackWeightedSlots(buckets,requested);
    const usedNames=new Set();
    const result=[];
    const shortages=[];

    buckets.forEach((bucket,index)=>{
        let taken=0;
        for(const card of bucket.pool){
            if(taken>=targets[index]) break;
            const key=normalizeCustomPackName(card?.name);
            if(!key || usedNames.has(key)) continue;
            usedNames.add(key);
            result.push(card);
            taken++;
        }
        if(taken<targets[index]) shortages.push({bucketId:bucket.id,missing:targets[index]-taken});
    });

    const policy=normalizeCustomPackShortPoolPolicy(packConfig,legacyFillMode,{composition:true});

    if(result.length<requested && policy.mode==="compositionFallback"){
        // Preserve the declared world: borrow unused unique cards from another
        // composition bucket instead of contaminating the pack globally.
        const fallback=shuffleArray(buckets.flatMap(bucket=>bucket.pool));
        for(const card of fallback){
            if(result.length>=requested) break;
            const key=normalizeCustomPackName(card?.name);
            if(!key || usedNames.has(key)) continue;
            usedNames.add(key);
            result.push(card);
        }
    }

    if(result.length<requested){
        if(policy.mode==="compositionFallback"){
            throwCustomPackShortPool(packConfig,requested,result.length,policy,{
                compositionMode:composition.mode,
                shortages
            });
        }
        return fillCustomPackShortage(
            packConfig,result,requested,policy,
            buckets.flatMap(bucket=>bucket.pool)
        );
    }

    return result.slice(0,requested);
}

function generateComposedCustomPack(packConfig,packSize,legacyFillMode=null){
    const mode=String(packConfig?.composition?.mode||"");
    if(mode==="weighted" || mode==="ratio"){
        return generateWeightedCustomPack(packConfig,packSize,legacyFillMode);
    }
    return generateCycleCustomPack(packConfig,packSize,legacyFillMode);
}

function generateFilteredCustomPack(packConfig,packSize,fillMode=null){
    const requested=Math.max(0,Number(packSize)||0);
    if(!requested) return [];
    const pool=shuffleArray(getCustomPackPool(packConfig));
    const policy=normalizeCustomPackShortPoolPolicy(packConfig,fillMode);

    if(policy.mode==="half"){
        return fillCustomPackShortage(packConfig,[],requested,policy,pool);
    }

    const pack=pool.slice(0,requested);
    if(pack.length>=requested) return pack;
    return fillCustomPackShortage(packConfig,pack,requested,policy,pool);
}

function getCustomPackTagDisplayName(category,tagId){
    try{
        const list=Array.isArray(TAGS?.[category]) ? TAGS[category] : [];
        const row=list.find(item=>normalizeCustomPackTag(item?.id)===normalizeCustomPackTag(tagId));
        return String(row?.name||tagId);
    }catch(error){
        return String(tagId||"");
    }
}

function getCustomPackRandomCostBuckets(randomize){
    if(Array.isArray(randomize?.buckets) && randomize.buckets.length){
        return randomize.buckets.map((bucket,index)=>({
            id:String(bucket?.id||`cost_${index}`),
            label:String(bucket?.label||bucket?.id||`COST ${index}`),
            filter:bucket?.filter||{}
        }));
    }
    return [
        {id:"cost_0",label:"COST 0",filter:{cost:{exact:0}}},
        {id:"cost_1",label:"COST 1",filter:{cost:{exact:1}}},
        {id:"cost_2",label:"COST 2",filter:{cost:{exact:2}}},
        {id:"cost_3",label:"COST 3",filter:{cost:{exact:3}}},
        {id:"cost_4",label:"COST 4",filter:{cost:{exact:4}}},
        {id:"cost_5",label:"COST 5",filter:{cost:{exact:5}}},
        {id:"cost_6_plus",label:"COST 6+",filter:{cost:{min:6}}}
    ];
}

function pickCustomPackRandomCandidate(candidates){
    if(!Array.isArray(candidates) || !candidates.length) return null;
    return candidates[Math.floor(Math.random()*candidates.length)]||null;
}

function generateRandomizedCustomPack(packConfig,packSize,fillMode=null,depth=0){
    if(depth>6){
        throw new CustomPackPoolError("Custom Pack randomizer recursion limit reached.",{packId:packConfig?.id,depth});
    }
    const requested=Math.max(0,Number(packSize)||0);
    const randomize=packConfig?.randomize||{};
    const kind=String(randomize.kind||"").trim().toLowerCase();
    const inheritedPolicy=randomize.shortPoolPolicy ?? packConfig?.shortPoolPolicy ?? fillMode ?? "random";

    const makeTagCandidates=(category)=>getCustomPackCategoryTagIds(category).map(tag=>({
        id:tag,
        label:getCustomPackTagDisplayName(category,tag),
        definition:{
            id:`${packConfig?.id||"random"}__${tag}`,
            name:getCustomPackTagDisplayName(category,tag),
            filter:{tags:{allOf:[tag]}},
            shortPoolPolicy:inheritedPolicy
        }
    }));

    let candidates=[];
    if(kind==="deck-archetype") candidates=makeTagCandidates("deckArchetypes");
    else if(kind==="mechanic-family") candidates=makeTagCandidates("mechanicFamilies");
    else if(kind==="ability-type") candidates=makeTagCandidates("abilityTypes");
    else if(kind==="cost"){
        candidates=getCustomPackRandomCostBuckets(randomize).map(bucket=>({
            id:bucket.id,
            label:bucket.label,
            definition:{
                id:`${packConfig?.id||"random"}__${bucket.id}`,
                name:bucket.label,
                filter:bucket.filter,
                shortPoolPolicy:inheritedPolicy
            }
        }));
    }else if(kind==="custom-pack"){
        const allowMeta=!!randomize.allowMeta;
        const excluded=new Set((Array.isArray(randomize.excludeIds)?randomize.excludeIds:[]).map(String));
        candidates=getCustomPackRegistry()
            .filter(pack=>isCustomPackRandomEligible(pack,packConfig,allowMeta) && !excluded.has(String(pack?.id||"")))
            .map(pack=>({id:pack.id,label:pack.name,definition:pack}));
    }else{
        throw new CustomPackPoolError(`Unknown Custom Pack randomizer kind: ${kind||"(empty)"}`,{
            packId:packConfig?.id,kind
        });
    }

    if(randomize.shuffle!==false) candidates=shuffleArray(candidates);
    const errors=[];
    for(const candidate of candidates){
        try{
            const generated=candidate.definition?.randomize
                ? generateRandomizedCustomPack(candidate.definition,requested,fillMode,depth+1)
                : generateCustomPackInternal(candidate.definition,requested,fillMode,depth+1);
            if(generated.length===requested){
                setCustomPackGenerationMeta({
                    requestedPackId:packConfig?.id||null,
                    requestedPackName:packConfig?.name||null,
                    randomizeKind:kind,
                    resolvedId:candidate.id,
                    resolvedName:candidate.label,
                    packSize:requested,
                    status:"ok"
                });
                return generated;
            }
        }catch(error){
            errors.push({id:candidate.id,code:error?.code||error?.name||"ERROR"});
        }
    }

    throw new CustomPackPoolError(
        `Randomizer ${packConfig?.id||kind} found no candidate able to generate ${requested} cards.`,
        {packId:packConfig?.id,kind,requested,errors}
    );
}

function generateCustomPackInternal(packConfig,packSize,fillMode=null,depth=0){
    if(packConfig?.randomize){
        return generateRandomizedCustomPack(packConfig,packSize,fillMode,depth);
    }
    if(packConfig?.composition){
        return generateComposedCustomPack(packConfig,packSize,fillMode);
    }
    return generateFilteredCustomPack(packConfig,packSize,fillMode);
}

function generateCustomPack(packConfig,packSize,fillMode=null){
    const requested=Math.max(0,Number(packSize)||0);
    const generated=generateCustomPackInternal(packConfig,requested,fillMode,0);
    if(!packConfig?.randomize){
        const policy=normalizeCustomPackShortPoolPolicy(packConfig,fillMode,{composition:!!packConfig?.composition});
        setCustomPackGenerationMeta({
            requestedPackId:packConfig?.id||null,
            requestedPackName:packConfig?.name||null,
            resolvedId:packConfig?.id||null,
            resolvedName:packConfig?.name||null,
            packSize:requested,
            generatedSize:generated.length,
            policy:policy.mode,
            compositionMode:packConfig?.composition?.mode||null,
            status:generated.length===requested ? "ok" : "partial"
        });
    }
    return generated;
}
