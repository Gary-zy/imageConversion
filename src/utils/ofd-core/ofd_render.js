/*
 * ofd.js - A Javascript class for reading and rendering ofd files
 * <https://github.com/DLTech21/ofd.js>
 *
 * Copyright (c) 2020. DLTech21 All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import {
    calPathPoint,
    calTextPoint,
    converterDpi, convertPathAbbreviatedDatatoPoint,
    getFontFamily,
    parseColor,
    parseCtm,
    parseStBox,
    setPageScal,
    converterBox, setMaxPageScal,
} from "./ofd_util";

export const renderPageBox = function (screenWidth, pages, document) {
    let pageBoxs = [];
    for (const page of pages) {
        let boxObj = {};
        boxObj['id'] = Object.keys(page)[0];
        boxObj['box'] = calPageBox(screenWidth, document, page);
        pageBoxs.push(boxObj);
    }
    return pageBoxs;
}

export const calPageBox = function (screenWidth, document, page) {
    const area = page[Object.keys(page)[0]]['json']['ofd:Area'];
    let box;
    if (area) {
        const physicalBox = area['ofd:PhysicalBox']
        if (physicalBox) {
            box = (physicalBox);
        } else {
            const applicationBox = area['ofd:ApplicationBox']
            if (applicationBox) {
                box = (applicationBox);
            } else {
                const contentBox = area['ofd:ContentBox']
                if (contentBox) {
                    box = (contentBox);
                }
            }
        }
    } else {
        let documentArea = document['ofd:CommonData']['ofd:PageArea']
        const physicalBox = documentArea['ofd:PhysicalBox']
        if (physicalBox) {
            box = (physicalBox);
        } else {
            const applicationBox = documentArea['ofd:ApplicationBox']
            if (applicationBox) {
                box = (applicationBox);
            } else {
                const contentBox = documentArea['ofd:ContentBox']
                if (contentBox) {
                    box = (contentBox);
                }
            }
        }
    }
    let array = box.split(' ');
    const scale = ((screenWidth - 10) / parseFloat(array[2])).toFixed(1);
    setMaxPageScal(scale);
    setPageScal(scale);
    box = parseStBox( box);
    box = converterBox(box)
    return box;
}

export const calPageBoxScale = function (document, page) {
    const area = page[Object.keys(page)[0]]['json']['ofd:Area'];
    let box;
    if (area) {
        const physicalBox = area['ofd:PhysicalBox']
        if (physicalBox) {
            box = (physicalBox);
        } else {
            const applicationBox = area['ofd:ApplicationBox']
            if (applicationBox) {
                box = (applicationBox);
            } else {
                const contentBox = area['ofd:ContentBox']
                if (contentBox) {
                    box = (contentBox);
                }
            }
        }
    } else {
        let documentArea = document['ofd:CommonData']['ofd:PageArea']
        const physicalBox = documentArea['ofd:PhysicalBox']
        if (physicalBox) {
            box = (physicalBox);
        } else {
            const applicationBox = documentArea['ofd:ApplicationBox']
            if (applicationBox) {
                box = (applicationBox);
            } else {
                const contentBox = documentArea['ofd:ContentBox']
                if (contentBox) {
                    box = (contentBox);
                }
            }
        }
    }
    box = parseStBox( box);
    box = converterBox(box)
    return box;
}

// 根据模板来渲染层节点
const renderLayerFromTemplate = function (tpls, template, pageDiv, fontResObj, drawParamResObj, multiMediaResObj) {
    let array = [];
    const layers = tpls[template['@_TemplateID']]['json']['ofd:Content']['ofd:Layer'];
    array = array.concat(layers);
    for (let layer of array) {
        if (layer) {
            renderLayer(pageDiv, fontResObj, drawParamResObj, multiMediaResObj, layer, false);
        }
    }
}

export const renderPage = function (pageDiv, page, tpls, fontResObj, drawParamResObj, multiMediaResObj) {
    const pageId = Object.keys(page)[0];
    console.log('renderPage - 开始渲染页面:', pageId);
    console.log('  pageDiv:', pageDiv.id, pageDiv.style.width, pageDiv.style.height);
    console.log('  page 数据结构:', {
        hasJson: !!page[pageId]?.json,
        hasTemplate: !!page[pageId]?.json?.['ofd:Template'],
        hasContent: !!page[pageId]?.json?.['ofd:Content'],
        template: page[pageId]?.json?.['ofd:Template']
    });

    const template = page[pageId]['json']['ofd:Template'];
    if (Array.isArray(template)) { // 当使用多个模板时
        template.forEach(item => {
            /**
             * 此处只满足 ZOrder 相同的情况
             * 若 ZOrder 不同，可能需要根据 ZOrder 排序来渲染
             * 参考 http://www.dajs.gov.cn/attach/0/88a7620d9d3f4e13b2baa52ab3487854.pdf 第 18 页 ZOrder 的属性说明
             */
            if (item) {
                renderLayerFromTemplate(tpls, item, pageDiv, fontResObj, drawParamResObj, multiMediaResObj);
            }
        });
    } else if (template) { // 当使用单个模板时
        renderLayerFromTemplate(tpls, template, pageDiv, fontResObj, drawParamResObj, multiMediaResObj);
    } else {
        // 某些OFD文件不使用模板，只使用Content层，这是正常的
        // console.warn('ofd:Template not found, using Content layer only');
    }

    const contentLayers = page[pageId]?.json?.['ofd:Content']?.['ofd:Layer'];
    console.log('  contentLayers 原始值:', contentLayers);
    let array = [];
    array = array.concat(contentLayers);
    console.log('  contentLayers 转换为数组后:', array);
    for (let contentLayer of array) {
        if (contentLayer) {
            console.log('  渲染 contentLayer:', contentLayer['@_ID']);
            renderLayer(pageDiv, fontResObj, drawParamResObj, multiMediaResObj, contentLayer, false);
        }
    }
    console.log('  renderPage 完成, pageDiv.children.length:', pageDiv.children.length);
    if (page[pageId].stamp) {
        for (const stamp of page[pageId].stamp) {
          if (stamp.type === 'ofd') {
            renderSealPage(pageDiv, stamp.obj.pages, stamp.obj.tpls, true, stamp.stamp.stampAnnot, stamp.obj.fontResObj, stamp.obj.drawParamResObj, stamp.obj.multiMediaResObj, stamp.stamp.sealObj.SES_Signature, stamp.stamp.signedInfo);
          } else if (stamp.type === 'png') {
              let sealBoundary = converterBox(stamp.obj.boundary);
              const oid = Array.isArray(stamp.stamp.stampAnnot)?stamp.stamp.stampAnnot[0]['pfIndex']:stamp.stamp.stampAnnot['pfIndex'];
              let element = renderImageOnDiv(pageDiv.style.width, pageDiv.style.height, stamp.obj.img, sealBoundary, stamp.obj.clip, true, stamp.stamp.sealObj.SES_Signature, stamp.stamp.signedInfo,oid);
              pageDiv.appendChild(element);
          }
        }
    }
    if (page[pageId].annotation) {
        for (const annotation of page[pageId].annotation) {
            renderAnnotation(pageDiv, annotation, fontResObj, drawParamResObj, multiMediaResObj);
        }
    }
}

const renderAnnotation = function (pageDiv, annotation, fontResObj, drawParamResObj, multiMediaResObj) {
    let div = document.createElement('div');
    div.setAttribute('style', `overflow: hidden;z-index:${annotation['pfIndex']};position:relative;`)
    let boundary = annotation['appearance']?.['@_Boundary'];
    if (boundary) {
        let divBoundary = converterBox(parseStBox(boundary));
        div.setAttribute('style', `overflow: hidden;z-index:${annotation['pfIndex']};position:absolute; left: ${divBoundary.x}px; top: ${divBoundary.y}px; width: ${divBoundary.w}px; height: ${divBoundary.h}px`)
    }
    const contentLayer = annotation['appearance'];
    renderLayer(div, fontResObj, drawParamResObj, multiMediaResObj, contentLayer, false);
    pageDiv.appendChild(div);

}

const renderSealPage = function (pageDiv, pages, tpls, isStampAnnot, stampAnnot, fontResObj, drawParamResObj, multiMediaResObj, SES_Signature, signedInfo) {
    for (const page of pages) {
        const pageId = Object.keys(page)[0];
        let stampAnnotBoundary = {x: 0, y: 0, w: 0, h: 0};
        if (isStampAnnot && stampAnnot) {
            stampAnnotBoundary = stampAnnot.boundary;
        }
        let divBoundary = converterBox(stampAnnotBoundary);
        let div = document.createElement('div');
        div.setAttribute("name","seal_img_div");
        div.setAttribute('style', `cursor: pointer; position:relative; left: ${divBoundary.x}px; top: ${divBoundary.y}px; width: ${divBoundary.w}px; height: ${divBoundary.h}px`)
        div.setAttribute('data-ses-signature', `${JSON.stringify(SES_Signature)}`);
        div.setAttribute('data-signed-info', `${JSON.stringify(signedInfo)}`);
        const template = page[pageId]['json']['ofd:Template'];
        if (template) {
            const layers = tpls[template['@_TemplateID']]['json']['ofd:Content']['ofd:Layer'];
            let array = [];
            array = array.concat(layers);
            for (let layer of array) {
                if (layer) {
                    renderLayer(div, fontResObj, drawParamResObj, multiMediaResObj, layer,  isStampAnnot);
                }
            }
        }
        const contentLayers = page[pageId]['json']['ofd:Content']['ofd:Layer'];
        let array = [];
        array = array.concat(contentLayers);
        for (let contentLayer of array) {
            if (contentLayer) {
                renderLayer(div, fontResObj, drawParamResObj, multiMediaResObj, contentLayer, isStampAnnot);
            }
        }
        pageDiv.appendChild(div);
    }
}

const renderLayer = function (pageDiv, fontResObj, drawParamResObj, multiMediaResObj, layer, isStampAnnot) {
    console.log('renderLayer 开始, layer ID:', layer?.['@_ID']);

    let fillColor = null;
    let strokeColor = null;
    let lineWith = converterDpi(0.353);
    let drawParam = layer?.['@_DrawParam'];
    if (drawParam && Object.keys(drawParamResObj).length > 0 && drawParamResObj[drawParam]) {
        if (drawParamResObj[drawParam]['relative']) {
            drawParam = drawParamResObj[drawParam]['relative'];
            if (drawParamResObj[drawParam]['FillColor']) {
                fillColor = parseColor(drawParamResObj[drawParam]['FillColor']);
            }
            if (drawParamResObj[drawParam]['StrokeColor']) {
                strokeColor = parseColor(drawParamResObj[drawParam]['StrokeColor']);
            }
            if (drawParamResObj[drawParam]['LineWidth']) {
                lineWith = converterDpi(drawParamResObj[drawParam]['LineWidth']);
            }
        }
        if (drawParamResObj[drawParam]['FillColor']) {
            fillColor = parseColor(drawParamResObj[drawParam]['FillColor']);
        }
        if (drawParamResObj[drawParam]['StrokeColor']) {
            strokeColor = parseColor(drawParamResObj[drawParam]['StrokeColor']);
        }
        if (drawParamResObj[drawParam]['LineWidth']) {
            lineWith = converterDpi(drawParamResObj[drawParam]['LineWidth']);
        }
    }
    const imageObjects = layer?.['ofd:ImageObject'];
    console.log('  imageObjects:', imageObjects);
    let imageObjectArray = [];
    imageObjectArray = imageObjectArray.concat(imageObjects);
    console.log('  imageObjectArray.length:', imageObjectArray.length);
    for (const imageObject of imageObjectArray) {
        if (imageObject) {
            console.log('    渲染 imageObject:', imageObject['@_ID'], 'ResourceID:', imageObject['@_ResourceID']);
            let element = renderImageObject(pageDiv.style.width, pageDiv.style.height, multiMediaResObj, imageObject)
            console.log('    创建的元素:', element.tagName, element.className, element.style.cssText);
            pageDiv.appendChild(element);
        }
    }
    const pathObjects = layer?.['ofd:PathObject'];
    console.log('  pathObjects:', pathObjects);
    let pathObjectArray = [];
    pathObjectArray = pathObjectArray.concat(pathObjects);
    console.log('  pathObjectArray.length:', pathObjectArray.length);
    for (const pathObject of pathObjectArray) {
        if (pathObject) {
            console.log('    渲染 pathObject:', pathObject['@_ID']);
            let svg = renderPathObject(drawParamResObj, pathObject, fillColor, strokeColor, lineWith, isStampAnnot)
            console.log('    创建的 svg:', svg.tagName, svg.style.cssText);
            pageDiv.appendChild(svg);
        }
    }
    const textObjects = layer?.['ofd:TextObject'];
    console.log('  textObjects:', textObjects);
    let textObjectArray = [];
    textObjectArray = textObjectArray.concat(textObjects);
    console.log('  textObjectArray.length:', textObjectArray.length);
    for (const textObject of textObjectArray) {
        if (textObject) {
            console.log('    渲染 textObject:', textObject['@_ID'], 'Text:', textObject['ofd:TextCode']?.['#text'] || textObject['ofd:TextCode']);
            let svg = renderTextObject(fontResObj, textObject, fillColor, strokeColor);
            console.log('    创建的 svg:', svg.tagName, svg.style.cssText);
            pageDiv.appendChild(svg);
        }
    }
    console.log('renderLayer 完成, pageDiv.children.length:', pageDiv.children.length);
}

export const renderImageObject = function (pageWidth, pageHeight, multiMediaResObj, imageObject){
    const rawBoundary = imageObject['@_Boundary'];
    const rawCtm = imageObject['@_CTM'];
    
    let boundary = parseStBox(rawBoundary);
    
    // 如果有 CTM 变换矩阵，使用 CTM 来计算实际的位置和尺寸
    // CTM 格式: "a b c d e f" 表示变换矩阵
    // a = x方向缩放, d = y方向缩放, e = x平移, f = y平移
    if (rawCtm) {
        const ctmValues = rawCtm.split(' ').map(Number);
        if (ctmValues.length >= 6) {
            const [a, b, c, d, e, f] = ctmValues;
            // 使用 CTM 的缩放值作为图像的宽高，平移值作为位置
            boundary = {
                x: e,
                y: f,
                w: Math.abs(a),
                h: Math.abs(d)
            };
        }
    }
    
    boundary = converterBox(boundary);
    const resId = imageObject['@_ResourceID'];

    if (!multiMediaResObj[resId]) {
        console.error('renderImageObject - 资源不存在:', resId);
        let div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = boundary.x + 'px';
        div.style.top = boundary.y + 'px';
        div.style.width = boundary.w + 'px';
        div.style.height = boundary.h + 'px';
        div.style.backgroundColor = 'pink';
        div.style.border = '1px solid red';
        div.style.zIndex = imageObject['pfIndex'] || 0;
        div.textContent = 'Missing: ' + resId;
        return div;
    }

    if (multiMediaResObj[resId].format === 'gbig2') {
        const img = multiMediaResObj[resId].img;
        const width = multiMediaResObj[resId].width;
        const height = multiMediaResObj[resId].height;
        return renderImageOnCanvas(img, width, height, boundary, imageObject['pfIndex']);
    } else {
        const imgSrc = multiMediaResObj[resId].img;
        return renderImageOnDiv(pageWidth, pageHeight, imgSrc, boundary, false, false, null, null, imageObject['pfIndex']);
    }
}

const renderImageOnCanvas = function (img, imgWidth, imgHeight, boundary, oid){
    const arr = new Uint8ClampedArray(4 * imgWidth * imgHeight);
    for (var i = 0; i < img.length; i++) {
        arr[4 * i] = img[i];
        arr[4 * i + 1] = img[i];
        arr[4 * i + 2] = img[i];
        arr[4 * i + 3] = 255;
    }
    let imageData = new ImageData(arr, imgWidth, imgHeight);
    let canvas = document.createElement('canvas');
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    let context = canvas.getContext('2d');
    context.putImageData(imageData, 0, 0);
    canvas.setAttribute('style', `left: ${boundary.x}px; top: ${boundary.y}px; width: ${boundary.w}px; height: ${boundary.h}px;z-index: ${oid}`)
    canvas.style.position = 'absolute';
    return canvas;
}

export const renderImageOnDiv = function (pageWidth, pageHeight, imgSrc, boundary, clip, isStampAnnot, SES_Signature, signedInfo, oid) {
    let div = document.createElement('div');
    if(isStampAnnot)
    {
        div.setAttribute("name","seal_img_div");
        div.setAttribute('data-ses-signature', `${JSON.stringify(SES_Signature)}`);
        div.setAttribute('data-signed-info', `${JSON.stringify(signedInfo)}`);
    }
    let img = document.createElement('img');
    img.src = imgSrc;
    img.setAttribute('width', '100%');
    img.setAttribute('height', '100%');
    div.appendChild(img);
    const pw = parseFloat(pageWidth.replace('px', ''));
    const ph = parseFloat(pageHeight.replace('px', ''));
    const w = boundary.w > pw ? pw : boundary.w;
    const h = boundary.h > ph ? ph : boundary.h;
    let c = '';
    if (clip) {
        clip = converterBox(clip);
        c = `clip: rect(${clip.y}px, ${clip.w + clip.x}px, ${clip.h + clip.y}px, ${clip.x}px)`
    }
    div.setAttribute('style', `cursor: pointer; overflow: hidden; position: absolute; left: ${c ? boundary.x : boundary.x < 0 ? 0 : boundary.x}px; top: ${c ? boundary.y : boundary.y < 0 ? 0 : boundary.y}px; width: ${w}px; height: ${h}px; ${c};z-index: ${oid}`)
    return div;
}

export const renderTextObject = function (fontResObj, textObject, defaultFillColor, defaultStrokeColor) {
    let defaultFillOpacity = 1;
    let boundary = parseStBox(textObject['@_Boundary']);
    boundary = converterBox(boundary);
    const ctm = textObject['@_CTM'];
    const hScale = textObject['@_HScale'];
    const font = textObject['@_Font'];
    const weight = textObject['@_Weight'];
    const size = converterDpi(parseFloat(textObject['@_Size']));
    let array = [];
    array = array.concat(textObject['ofd:TextCode']);
    const textCodePointList = calTextPoint(array);
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('version', '1.1');

    // 设置默认颜色为黑色
    if (!defaultFillColor) {
        defaultFillColor = '#000000';
    }

    const fillColor = textObject['ofd:FillColor'];
    if (fillColor) {
        defaultFillColor = parseColor(fillColor['@_Value']);
        let alpha = fillColor['@_Alpha'];
        if (alpha) {
            defaultFillOpacity = alpha>1? alpha/255:alpha;
        }
    }
    for (const textCodePoint of textCodePointList) {
        if (textCodePoint && !isNaN(textCodePoint.x)) {
            let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', textCodePoint.x);
            text.setAttribute('y', textCodePoint.y);
            text.innerHTML = textCodePoint.text;
            if (ctm) {
                const ctms = parseCtm(ctm);
                text.setAttribute('transform', `matrix(${ctms[0]} ${ctms[1]} ${ctms[2]} ${ctms[3]} ${converterDpi(ctms[4])} ${converterDpi(ctms[5])})`)
            }
            if (hScale) {
                text.setAttribute('transform', `matrix(${hScale}, 0, 0, 1, ${(1-hScale)*textCodePoint.x}, 0)`)
                // text.setAttribute('transform-origin', `${textCodePoint.x}`);
            }
            text.setAttribute('fill', defaultStrokeColor);
            text.setAttribute('fill', defaultFillColor);
            text.setAttribute('fill-opacity', defaultFillOpacity);
            text.setAttribute('style', `font-weight: ${weight};font-size:${size}px;font-family: ${getFontFamily(fontResObj[font])};`)
            svg.appendChild(text);
        }

    }
    let width = boundary.w;
    let height = boundary.h;
    let left = boundary.x;
    let top = boundary.y;
    svg.setAttribute('style', `overflow:visible;position:absolute;width:${width}px;height:${height}px;left:${left}px;top:${top}px;z-index:${textObject['pfIndex']}`);
    return svg;
}

export const renderPathObject = function (drawParamResObj, pathObject, defaultFillColor, defaultStrokeColor, defaultLineWith, isStampAnnot) {
    let boundary = parseStBox(pathObject['@_Boundary']);
    boundary = converterBox(boundary);
    let lineWidth = pathObject['@_LineWidth'];
    const abbreviatedData = pathObject['ofd:AbbreviatedData'];
    const points = calPathPoint(convertPathAbbreviatedDatatoPoint(abbreviatedData));
    const ctm = pathObject['@_CTM'];
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('version', '1.1');
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // 设置默认颜色为黑色
    if (!defaultFillColor) {
        defaultFillColor = 'none';
    }
    if (!defaultStrokeColor) {
        defaultStrokeColor = '#000000';
    }

    if (lineWidth) {
        defaultLineWith = converterDpi(lineWidth);
    }
    const drawParam = pathObject['@_DrawParam'];
    if (drawParam) {
        lineWidth = drawParamResObj[drawParam].LineWidth;
        if (lineWidth) {
            defaultLineWith = converterDpi(lineWidth);
        }
    }
    if (ctm) {
        const ctms = parseCtm(ctm);
        path.setAttribute('transform', `matrix(${ctms[0]} ${ctms[1]} ${ctms[2]} ${ctms[3]} ${converterDpi(ctms[4])} ${converterDpi(ctms[5])})`)
    }
    let strokeStyle = '';
    const strokeColor = pathObject['ofd:StrokeColor'];
    if (strokeColor) {
        defaultStrokeColor = parseColor(strokeColor['@_Value'])
    }
    let fillStyle = 'fill: none;';
    const fillColor = pathObject['ofd:FillColor'];
    if (fillColor) {
        defaultFillColor = parseColor(fillColor['@_Value'])
    }
    if (defaultLineWith > 0 && !defaultStrokeColor) {
        defaultStrokeColor = defaultFillColor;
        if (!defaultStrokeColor) {
            defaultStrokeColor = 'rgb(0, 0, 0)';
        }
    }
    strokeStyle = `stroke:${defaultStrokeColor};stroke-width:${defaultLineWith}px;`;
    if (pathObject['@_Stroke'] == 'false') {
        strokeStyle = ``;
    }
    if (pathObject['@_Fill'] != 'false') {
        fillStyle = `fill:${isStampAnnot ? 'none' : defaultFillColor};`;
    }
    path.setAttribute('style', `${strokeStyle};${fillStyle}`)
    let d = '';
    for (const point of points) {
        if (point.type === 'M') {
            d += `M${point.x} ${point.y} `;
        } else if (point.type === 'L') {
            d += `L${point.x} ${point.y} `;
        } else if (point.type === 'B') {
            d += `C${point.x1} ${point.y1} ${point.x2} ${point.y2} ${point.x3} ${point.y3} `;
        } else if (point.type === 'C') {
            d += `Z`;
        }
    }
    path.setAttribute('d', d);
    svg.appendChild(path);
    let width = isStampAnnot ? boundary.w : Math.ceil(boundary.w);
    let height = isStampAnnot ? boundary.h : Math.ceil(boundary.h);
    let left = boundary.x;
    let top = boundary.y;
    svg.setAttribute('style', `overflow:visible;position:absolute;width:${width}px;height:${height}px;left:${left}px;top:${top}px;z-index:${pathObject['pfIndex']}`);
    return svg;
}
