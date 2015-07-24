(function(window,undefined){"use strict";var globalOptions={ignoreUndefined:!1,escape:"general",escapeSets:{xml:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},general:{'"':'\\"',"'":"\\'"}}},deepMergeJson=function(obja,objb){var prop;for(prop in objb)objb.hasOwnProperty(prop)&&(obja[prop]="object"==typeof obja[prop]&&"object"==typeof objb[prop]?deepMergeJson(obja[prop],objb[prop]):objb[prop]);return obja},setDeepProperty=function(ident,value,obj,makepath){var list,recurse=function(propList,value,obj){var id;if(propList.length>1){if(id=list.shift(),!obj.hasOwnProperty(id)){if(!makepath)throw new Error("No internal property "+id+" at depth N - "+list.length);obj[id]={}}recurse(propList,value,obj[id])}else obj[propList[0]]=value};return list=ident.push||ident.map?ident:ident.split(".").map(function(e){return e.trim()}),recurse(list,value,obj),obj},getDeepProperty=function(ident,obj){var list,ret=null,recurse=function(propList,obj){var curident;if(propList.length>1){if(!obj.hasOwnProperty(propList[0]))throw curident=propList.reduce(function(a,b,i){return a+(i>0?".":"")+b}),new Error('Invalid proprty, missing expected data "'+curident+'" (IDENT: '+ident+") from data "+JSON.stringify(obj));recurse(propList,obj[list.shift()])}else{if(!obj.hasOwnProperty(propList[0]))throw new Error('Invalid proprty, missing expected data "'+propList[0]+'" (IDENT: '+ident+") from data "+JSON.stringify(obj));ret=obj[propList[0]]}};return list=ident.push||ident.map?ident:ident.split(".").map(function(e){return e.trim()}),recurse(list,obj),ret},getDeepPropertyOrUndef=function(ident,obj){var res;try{res=getDeepProperty(ident,obj)}catch(e){res=void 0}return res},safeDeepMergeJson=function(obja,objb){if("object"!=typeof obja)throw new TypeError("Cannot deep merge with an "+typeof obja+": [Param 1]");if("object"!=typeof objb)throw new TypeError("Cannot deep merge with an "+typeof objb+": [Param 2]");return deepMergeJson(deepMergeJson({},obja),objb)},escapeRegex=function(reg){return reg.replace(/([.*+?^=!:${}()|\[\]\/\\])/g,"\\$1")},escapeData=function(datum,escapes){var prop;for(prop in escapes)escapes.hasOwnProperty(prop)&&(datum=String(datum).split(prop).join(escapes[prop]));return datum},captureTags=/(\[\[)(\#|\/)?\s*(?:([a-zA-Z]+[a-zA-Z0-9]*)\s*\:\s*([a-zA-Z]+[a-zA-Z0-9]*)|([\*\&\>\?]?)\s*((?:\!(?:\(([a-zA-Z]+[a-zA-Z0-9]*)\))?)?)\s*([a-zA-Z](?:[a-zA-Z0-9]*(?:\.(?=[a-zA-Z]))?)+))\s*(\]\])/,Node=function(type,val,content){return this.ident=type||"N_NULL",this.val=val||null,this.content=content||{},this},Token=function(ident,val,info){return this.ident=ident||"T_NULL",this.val=val||null,this.info=info||{},this},tokenise=function(src){var matcher,chunk,tok,tokens=[],i=0,match=null;for(matcher=function(){return null!==(match=captureTags.exec(chunk))};i<src.length;)if(chunk=src.substr(i),matcher()){if(match.index>0&&tokens.push(new Token("STRING",match.input.substr(0,match.index))),tok=new Token("T_NULL",null,{close:!1,escape:!1,escapeType:null}),"#"===match[2])tok.ident="T_DIRECTIVE",tok.val={key:match[3],value:match[4]};else{switch("/"===match[2]&&(tok.info.close=!0),match[5]){case"*":tok.ident="T_LOOP";break;case"&":tok.ident="T_BLOCK";break;case">":tok.ident="T_IMPORT";break;case"?":tok.ident="T_CONDITION";break;default:tok.ident="T_DATA"}"undefined"!=typeof match[6]&&"!"===match[6].charAt(0)&&(tok.info.escape=!0,"undefined"!=typeof match[7]&&(tok.info.escapeType=match[7])),tok.val=match[8]}tokens.push(tok),i+=match.index+match[0].length}else tokens.push(new Token("STRING",chunk)),i+=chunk.length;return tokens.push(new Token("EOD")),tokens},collapseParse=function(tokens){for(var tokenList,j,targetToken,targetNode,nodeName,i=0;i<tokens.length;)if(tokens[i].info&&tokens[i].info.close){for(tokenList=[],targetToken=tokens[i],j=i-1;tokens[j].ident!==targetToken.ident||tokens[j].val!==targetToken.val;)if(tokenList.push(tokens[j]),j-=1,0>j)throw new Error("Unmatched Closing Tag "+targetNode+" at index "+i);switch(targetToken.ident){case"T_LOOP":case"T_BLOCK":case"T_CONDITION":nodeName="N"+targetToken.ident.slice(1);break;default:throw new Error("Invalid block element "+targetToken.ident+" at index "+i)}targetNode=new Node(nodeName,targetToken.val,tokenList.slice().reverse()),tokens.splice(j,i-j+1,targetNode),i=0}else i+=1;return tokens},unwindNode=function(output,node,index,arr){var innerArr,dataArr,content,i,dataVal,datum,escapeType,ifresult,iff;switch(node.ident){case"STRING":return output+node.val;case"T_DIRECTIVE":return setDeepProperty(node.val.key,node.val.value,arr.opts,!0),output;case"T_DATA":return dataVal=node.val,arr.loopTag&&node.val===arr.loopTag.slice(0,-1)&&(dataVal=arr.loopTag+"."+arr.i.toString()),datum=getDeepProperty(dataVal,arr.data),node.info.escape&&(escapeType=node.info.escapeType?node.info.escapeType:arr.opts.escape,datum=escapeData(datum,arr.opts.escapeSets[escapeType])),output+datum;case"T_IMPORT":if(content=arr.includes[node.val],"undefined"!=typeof content&&null!==content)datum=content(arr.data,arr.opts);else{if(!arr.opts.ignoreUndefined)throw new Error("Cannot get include "+node.val);datum=""}return output+datum;case"N_LOOP":for(content="",innerArr=node.content,innerArr.data=arr.data,innerArr.loopTag=node.val,innerArr.includes=arr.includes,innerArr.opts=deepMergeJson({},arr.opts),dataArr=getDeepProperty(node.val,arr.data),i=0;i<dataArr.length;i+=1)innerArr.i=i,content+=innerArr.reduce(unwindNode,"");return output+content;case"N_BLOCK":return innerArr=node.content,innerArr.data=getDeepProperty(node.val,arr.data),innerArr.loopTag=null,innerArr.includes=arr.includes,innerArr.opts=deepMergeJson({},arr.opts),output+innerArr.reduce(unwindNode,"");case"N_CONDITION":return iff=getDeepPropertyOrUndef(node.val,arr.opts),iff?(innerArr=node.content,innerArr.data=arr.data,innerArr.loopTag=null,innerArr.includes=arr.includes,innerArr.opts=deepMergeJson({},arr.opts),ifresult=innerArr.reduce(unwindNode,"")):ifresult="",output+ifresult;default:return output}},render=function(src,data,options){var nodes=collapseParse(tokenise(src));return nodes.data=data,nodes.loopTag=null,nodes.i=null,nodes.includes=render.includes,nodes.opts=safeDeepMergeJson(globalOptions,options),nodes.reduce(unwindNode,"")};if(render.partial=function(src){return function(tokens,data,options){return tokens.data=data,tokens.loopTag=null,tokens.i=null,tokens.includes=render.includes,tokens.opts=safeDeepMergeJson(globalOptions,options),tokens.reduce(unwindNode,"")}.bind(null,collapseParse(tokenise(src)))},render.includes={},render.addInclude=function(name,template){this.includes[name]=template.split?render.partial(template):template},!window.mu)throw new Error("tinyDOM-Sideburns requires tinyDOM to be in use on the page");mu.render=function(path,data,options){return render.includes.hasOwnProperty(path)?render.includes[path](data,options):render(path,data,options)},mu.include=function(path,template){render.addInclude(path,template)},mu.partial=render.partial,mu.fn.render=function(path,data,options){var rendered=mu.render(path,data,options),opts=options||{useHtml:!0};"undefined"==typeof opts.useHtml&&(opts.useHtml=!0),this.each(function(i,e){opts.useHtml?e.innerHTML=rendered:e.textContent=rendered})},mu.ready(function(){mu("[type='x-template/sideburns']").each(function(i,e){var name=e.getAttribute("data-name");console.log(name),render.addInclude(name,e.textContent)})});})(window);