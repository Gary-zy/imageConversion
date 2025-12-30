'use strict';

const util = require('./util');

const convertToJson = function(node, options) {
  const jObj = {};

  //when no child node or attr is present
  if ((!node.child || util.isEmptyObject(node.child)) && (!node.attrsMap || util.isEmptyObject(node.attrsMap))) {
    return util.isExist(node.val) ? node.val : '';
  } else {
    //otherwise create a textnode if node has some text
    if (util.isExist(node.val)) {
      if (!(typeof node.val === 'string' && (node.val === '' || node.val === options.cdataPositionChar))) {
        if(options.arrayMode === "strict"){
          jObj[options.textNodeName] = [ node.val ];
        }else{
          jObj[options.textNodeName] = node.val;
        }
      }
    }
  }

  util.merge(jObj, node.attrsMap, options.arrayMode);

  const keys = Object.keys(node.child);
  for (let index = 0; index < keys.length; index++) {
    var tagname = keys[index];
    if (node.child[tagname] && node.child[tagname].length > 1) {
      jObj[tagname] = [];
      for (var tag in node.child[tagname]) {
        global.xmlParseFlag = global.xmlParseFlag + 1;
        jObj[tagname].push(convertToJson(node.child[tagname][tag], options));
      }
    } else {
      if(options.arrayMode === true){
        global.xmlParseFlag = global.xmlParseFlag + 1;//解析标识+1
        const result = convertToJson(node.child[tagname][0], options)
        if(typeof result === 'object')
          jObj[tagname] = [ result ];
        else
          jObj[tagname] = result;
      }else if(options.arrayMode === "strict"){
        global.xmlParseFlag = global.xmlParseFlag + 1;
        jObj[tagname] = [convertToJson(node.child[tagname][0], options) ];
      }else{
        global.xmlParseFlag = global.xmlParseFlag + 1;
        jObj[tagname] = convertToJson(node.child[tagname][0], options);
      }
    }
  }
  return jObj;
};

exports.convertToJson = convertToJson;
